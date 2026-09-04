/**
 * Turns a plain table description into a downloadable Excel workbook, PDF
 * document, or CSV file. Each report is declared once as a `ReportSpec` and
 * every format renders from that same declaration, so the three exports can't
 * drift apart.
 *
 * Money is passed around in paise (matching the database) and converted at the
 * point of rendering.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";

export type ReportCellType = "text" | "money" | "number" | "date" | "datetime";

export type ReportColumn<T> = {
  header: string;
  /** Relative weight for column width — shared by the sheet and the PDF grid. */
  width: number;
  type?: ReportCellType;
  value: (row: T) => string | number | Date | null | undefined;
  /** Sum this column into a totals row. Only meaningful for money/number. */
  total?: boolean;
  /** Keep out of the PDF, which is far narrower than a spreadsheet. */
  omitInPdf?: boolean;
};

export type ReportSpec<T> = {
  title: string;
  subtitle?: string;
  /** Base filename, no extension. */
  filename: string;
  columns: ReportColumn<T>[];
  rows: T[];
  /** Headline figures printed above the table. */
  summary?: { label: string; value: string }[];
};

/** India has a fixed +5:30 offset and no DST, so this needs no date maths. */
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const TIME_ZONE = "Asia/Kolkata";

const INK = "#121317";
const ACCENT = "#3d5b2a";
const LINE = "#e1e6ec";
const FAINT = "#7d818a";
const ROW_TINT = "#f6f8fa";

// ---------------------------------------------------------------- formatting

export function formatReportMoney(paise: number, symbol = true): string {
  const rupees = (paise ?? 0) / 100;
  const body = new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(rupees);
  return symbol ? `₹${body}` : `Rs. ${body}`;
}

export function formatReportDate(d: Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: TIME_ZONE,
  }).format(d);
}

export function formatReportDateTime(d: Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: TIME_ZONE,
  }).format(d);
}

function asText<T>(col: ReportColumn<T>, row: T, symbol: boolean): string {
  const raw = col.value(row);
  if (raw === null || raw === undefined || raw === "") return "—";
  switch (col.type) {
    case "money":
      return formatReportMoney(Number(raw), symbol);
    case "number":
      return new Intl.NumberFormat("en-IN").format(Number(raw));
    case "date":
      return formatReportDate(raw as Date);
    case "datetime":
      return formatReportDateTime(raw as Date);
    default:
      return String(raw);
  }
}

function columnTotal<T>(col: ReportColumn<T>, rows: T[]): number {
  return rows.reduce((sum, row) => sum + Number(col.value(row) ?? 0), 0);
}

// -------------------------------------------------------------------- Excel

const MONEY_FMT = '"₹"#,##0.00';
const DATE_FMT = "dd mmm yyyy";
const DATETIME_FMT = "dd mmm yyyy hh:mm";

/**
 * ExcelJS derives a sheet's serial date from the UTC instant, so a Date is
 * shifted into IST first — that way the cell displays Indian wall-clock time
 * while staying a real date Excel can sort and filter on.
 */
function toSheetDate(d: Date): Date {
  return new Date(d.getTime() + IST_OFFSET_MS);
}

export async function buildXlsx<T>(spec: ReportSpec<T>): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "OriginLife";
  wb.created = new Date();
  const sheet = wb.addWorksheet(spec.title.slice(0, 31), {
    views: [{ state: "frozen", ySplit: 0 }],
  });

  let cursor = 1;

  sheet.mergeCells(cursor, 1, cursor, Math.max(spec.columns.length, 2));
  const titleCell = sheet.getCell(cursor, 1);
  titleCell.value = spec.title;
  titleCell.font = { size: 15, bold: true, color: { argb: "FF121317" } };
  sheet.getRow(cursor).height = 22;
  cursor++;

  if (spec.subtitle) {
    sheet.mergeCells(cursor, 1, cursor, Math.max(spec.columns.length, 2));
    const sub = sheet.getCell(cursor, 1);
    sub.value = spec.subtitle;
    sub.font = { size: 10, color: { argb: "FF7D818A" } };
    cursor++;
  }

  if (spec.summary?.length) {
    cursor++;
    for (const item of spec.summary) {
      sheet.getCell(cursor, 1).value = item.label;
      sheet.getCell(cursor, 1).font = { size: 10, color: { argb: "FF45474D" } };
      sheet.getCell(cursor, 2).value = item.value;
      sheet.getCell(cursor, 2).font = { size: 10, bold: true };
      cursor++;
    }
  }

  cursor++;
  const headerRowIndex = cursor;
  const headerRow = sheet.getRow(headerRowIndex);
  spec.columns.forEach((col, i) => {
    const cell = headerRow.getCell(i + 1);
    cell.value = col.header;
    cell.font = { bold: true, size: 10, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF3D5B2A" } };
    cell.alignment = { vertical: "middle", horizontal: "left" };
  });
  headerRow.height = 20;
  cursor++;

  for (const row of spec.rows) {
    const sheetRow = sheet.getRow(cursor);
    spec.columns.forEach((col, i) => {
      const cell = sheetRow.getCell(i + 1);
      const raw = col.value(row);
      if (raw === null || raw === undefined) {
        cell.value = null;
      } else if (col.type === "money") {
        cell.value = Number(raw) / 100;
        cell.numFmt = MONEY_FMT;
      } else if (col.type === "number") {
        cell.value = Number(raw);
      } else if (col.type === "date" || col.type === "datetime") {
        cell.value = toSheetDate(raw as Date);
        cell.numFmt = col.type === "date" ? DATE_FMT : DATETIME_FMT;
      } else {
        cell.value = String(raw);
      }
      cell.font = { size: 10 };
      cell.alignment = { vertical: "middle" };
    });
    cursor++;
  }

  const totalCols = spec.columns.filter((c) => c.total);
  if (totalCols.length && spec.rows.length) {
    const totalRow = sheet.getRow(cursor);
    totalRow.getCell(1).value = "Total";
    totalRow.getCell(1).font = { bold: true, size: 10 };
    spec.columns.forEach((col, i) => {
      if (!col.total) return;
      const cell = totalRow.getCell(i + 1);
      const sum = columnTotal(col, spec.rows);
      cell.value = col.type === "money" ? sum / 100 : sum;
      if (col.type === "money") cell.numFmt = MONEY_FMT;
      cell.font = { bold: true, size: 10 };
    });
    totalRow.eachCell((cell) => {
      cell.border = { top: { style: "thin", color: { argb: "FFCDD4DC" } } };
    });
    cursor++;
  }

  spec.columns.forEach((col, i) => {
    sheet.getColumn(i + 1).width = col.width;
  });

  // Freeze everything above the data and let the merchant filter in place.
  sheet.views = [{ state: "frozen", ySplit: headerRowIndex }];
  if (spec.rows.length) {
    sheet.autoFilter = {
      from: { row: headerRowIndex, column: 1 },
      to: { row: headerRowIndex + spec.rows.length, column: spec.columns.length },
    };
  }

  const out = await wb.xlsx.writeBuffer();
  return Buffer.from(out);
}

// ---------------------------------------------------------------------- PDF

const FONT_PATH = path.join(process.cwd(), "src", "fonts", "NotoSans-Medium.ttf");
let cachedFont: Buffer | null | undefined;

/**
 * The bundled Noto Sans carries the ₹ glyph, which none of PDFKit's built-in
 * WinAnsi fonts do. If it can't be read we still produce a valid PDF and fall
 * back to writing "Rs." instead of shipping blank boxes.
 */
function reportFont(): Buffer | null {
  if (cachedFont === undefined) {
    try {
      cachedFont = readFileSync(FONT_PATH);
    } catch {
      cachedFont = null;
    }
  }
  return cachedFont;
}

export function buildPdf<T>(spec: ReportSpec<T>): Promise<Buffer> {
  const font = reportFont();
  const symbol = font !== null;
  const columns = spec.columns.filter((c) => !c.omitInPdf);

  const doc = new PDFDocument({
    size: "A4",
    layout: "landscape",
    margin: 30,
    bufferPages: true,
    info: { Title: spec.title, Author: "OriginLife" },
  });

  if (font) doc.registerFont("report", font);
  const FACE = font ? "report" : "Helvetica";

  const chunks: Buffer[] = [];
  doc.on("data", (c: Buffer) => chunks.push(c));
  const finished = new Promise<Buffer>((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });

  const left = doc.page.margins.left;
  const contentWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const bottomLimit = doc.page.height - doc.page.margins.bottom - 24;

  const weightTotal = columns.reduce((s, c) => s + c.width, 0);
  const widths = columns.map((c) => (c.width / weightTotal) * contentWidth);
  const offsets = widths.reduce<number[]>((acc, w, i) => {
    acc.push(i === 0 ? left : acc[i - 1] + widths[i - 1]);
    return acc;
  }, []);

  const ROW_H = 16;
  const PAD = 4;

  function drawHeaderRow(y: number): number {
    doc.rect(left, y, contentWidth, ROW_H + 3).fill(ACCENT);
    doc.font(FACE).fontSize(7.5).fillColor("#ffffff");
    columns.forEach((col, i) => {
      doc.text(col.header.toUpperCase(), offsets[i] + PAD, y + 5, {
        width: widths[i] - PAD * 2,
        lineBreak: false,
        ellipsis: true,
      });
    });
    return y + ROW_H + 3;
  }

  // Title block
  let y = doc.page.margins.top;
  doc.font(FACE).fontSize(16).fillColor(INK).text(spec.title, left, y);
  y = doc.y + 2;

  if (spec.subtitle) {
    doc.fontSize(8.5).fillColor(FAINT).text(spec.subtitle, left, y);
    y = doc.y + 2;
  }
  doc
    .fontSize(8.5)
    .fillColor(FAINT)
    .text(`Generated ${formatReportDateTime(new Date())} IST`, left, y);
  y = doc.y + 10;

  if (spec.summary?.length) {
    const chipW = contentWidth / spec.summary.length;
    doc.rect(left, y, contentWidth, 34).fill(ROW_TINT);
    spec.summary.forEach((item, i) => {
      const x = left + i * chipW;
      doc.font(FACE).fontSize(7).fillColor(FAINT);
      doc.text(item.label.toUpperCase(), x + 8, y + 7, {
        width: chipW - 16,
        lineBreak: false,
        ellipsis: true,
      });
      doc.fontSize(11).fillColor(INK);
      doc.text(item.value, x + 8, y + 17, {
        width: chipW - 16,
        lineBreak: false,
        ellipsis: true,
      });
    });
    y += 34 + 12;
  }

  y = drawHeaderRow(y);

  if (spec.rows.length === 0) {
    doc.font(FACE).fontSize(9).fillColor(FAINT).text("No records in this range.", left + PAD, y + 8);
  }

  spec.rows.forEach((row, index) => {
    if (y + ROW_H > bottomLimit) {
      doc.addPage();
      y = doc.page.margins.top;
      y = drawHeaderRow(y);
    }
    if (index % 2 === 1) {
      doc.rect(left, y, contentWidth, ROW_H).fill(ROW_TINT);
    }
    doc.font(FACE).fontSize(7.5).fillColor(INK);
    columns.forEach((col, i) => {
      doc.text(asText(col, row, symbol), offsets[i] + PAD, y + 4.5, {
        width: widths[i] - PAD * 2,
        lineBreak: false,
        ellipsis: true,
      });
    });
    doc
      .moveTo(left, y + ROW_H)
      .lineTo(left + contentWidth, y + ROW_H)
      .lineWidth(0.4)
      .strokeColor(LINE)
      .stroke();
    y += ROW_H;
  });

  const totalCols = columns.filter((c) => c.total);
  if (totalCols.length && spec.rows.length) {
    if (y + ROW_H > bottomLimit) {
      doc.addPage();
      y = doc.page.margins.top;
      y = drawHeaderRow(y);
    }
    doc.font(FACE).fontSize(8).fillColor(INK);
    columns.forEach((col, i) => {
      const text = col.total
        ? asText({ ...col, value: () => columnTotal(col, spec.rows) }, spec.rows[0], symbol)
        : i === 0
          ? "Total"
          : "";
      if (!text) return;
      doc.text(text, offsets[i] + PAD, y + 4.5, {
        width: widths[i] - PAD * 2,
        lineBreak: false,
        ellipsis: true,
      });
    });
    doc
      .moveTo(left, y - 0.5)
      .lineTo(left + contentWidth, y - 0.5)
      .lineWidth(1)
      .strokeColor(INK)
      .stroke();
  }

  // Page numbers, stamped once the total count is known.
  const range = doc.bufferedPageRange();
  for (let i = 0; i < range.count; i++) {
    doc.switchToPage(range.start + i);
    doc
      .font(FACE)
      .fontSize(7.5)
      .fillColor(FAINT)
      .text(
        `OriginLife · Page ${i + 1} of ${range.count}`,
        left,
        doc.page.height - doc.page.margins.bottom - 12,
        { width: contentWidth, align: "center", lineBreak: false }
      );
  }

  doc.end();
  return finished;
}

// ---------------------------------------------------------------------- CSV

function csvCell(value: string): string {
  return /[",\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export function buildCsv<T>(spec: ReportSpec<T>): Buffer {
  const lines = [spec.columns.map((c) => csvCell(c.header)).join(",")];
  for (const row of spec.rows) {
    lines.push(
      spec.columns
        .map((col) => {
          const raw = col.value(row);
          if (raw === null || raw === undefined) return "";
          // Numbers stay bare so spreadsheets and CRM importers read them as
          // numbers rather than as currency-formatted strings.
          if (col.type === "money") return String(Number(raw) / 100);
          if (col.type === "number") return String(Number(raw));
          if (col.type === "date" || col.type === "datetime") {
            return (raw as Date).toISOString();
          }
          return csvCell(String(raw));
        })
        .join(",")
    );
  }
  // BOM so Excel opens the file as UTF-8 and renders ₹ correctly.
  return Buffer.from("﻿" + lines.join("\r\n"), "utf8");
}

// ------------------------------------------------------------------ dispatch

export const REPORT_FORMATS = ["xlsx", "pdf", "csv"] as const;
export type ReportFormat = (typeof REPORT_FORMATS)[number];

export function isReportFormat(value: string | null): value is ReportFormat {
  return value !== null && (REPORT_FORMATS as readonly string[]).includes(value);
}

const CONTENT_TYPES: Record<ReportFormat, string> = {
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  pdf: "application/pdf",
  csv: "text/csv; charset=utf-8",
};

export async function renderReport<T>(
  spec: ReportSpec<T>,
  format: ReportFormat
): Promise<{ body: Buffer; contentType: string; filename: string }> {
  const body =
    format === "xlsx"
      ? await buildXlsx(spec)
      : format === "pdf"
        ? await buildPdf(spec)
        : buildCsv(spec);

  return {
    body,
    contentType: CONTENT_TYPES[format],
    filename: `${spec.filename}.${format}`,
  };
}

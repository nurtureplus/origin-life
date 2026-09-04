import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";
import { buildCustomersReport, buildSalesReport, parseReportRange } from "@/lib/report-data";
import { isReportFormat, renderReport, type ReportSpec } from "@/lib/report-export";

// PDF generation reads font files from disk, so this must not run on the edge.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const REPORTS = ["sales", "customers"] as const;
type ReportName = (typeof REPORTS)[number];

function isReportName(value: string): value is ReportName {
  return (REPORTS as readonly string[]).includes(value);
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ report: string }> }) {
  const session = await requireAdminSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { report } = await ctx.params;
  if (!isReportName(report)) {
    return NextResponse.json({ error: "Unknown report" }, { status: 404 });
  }

  const format = req.nextUrl.searchParams.get("format") ?? "xlsx";
  if (!isReportFormat(format)) {
    return NextResponse.json(
      { error: "Format must be one of xlsx, pdf, csv" },
      { status: 400 }
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const spec: ReportSpec<any> =
    report === "sales"
      ? await buildSalesReport(parseReportRange(req.nextUrl.searchParams))
      : await buildCustomersReport();

  const { body, contentType, filename } = await renderReport(spec, format);

  return new NextResponse(new Uint8Array(body), {
    headers: {
      "Content-Type": contentType,
      "Content-Length": String(body.byteLength),
      "Content-Disposition": `attachment; filename="${filename}"`,
      // Exports are a point-in-time snapshot of private data — never cache.
      "Cache-Control": "no-store, private",
    },
  });
}

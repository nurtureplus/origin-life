import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import sharp from "sharp";
import { requireAdminSession } from "@/lib/auth";

// sharp is a native module — keep it out of the bundle.
export const runtime = "nodejs";

/** Nothing on the site displays an image wider than this, hero included. */
const MAX_IMAGE_WIDTH = 1600;
const WEBP_QUALITY = 82;

const MAX_VIDEO_BYTES = 80 * 1024 * 1024; // 80MB
const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8MB

const ALLOWED_VIDEO_EXT = new Set(["mp4", "webm", "mov"]);
const ALLOWED_IMAGE_EXT = new Set(["jpg", "jpeg", "png", "webp", "gif"]);

export async function POST(req: NextRequest) {
  const session = await requireAdminSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const isVideo = file.type.startsWith("video/");
  const isImage = file.type.startsWith("image/");
  if (!isVideo && !isImage) {
    return NextResponse.json({ error: "Only video or image files are allowed" }, { status: 400 });
  }

  const maxBytes = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
  if (file.size > maxBytes) {
    return NextResponse.json(
      { error: `File too large. Max ${Math.round(maxBytes / (1024 * 1024))}MB.` },
      { status: 400 }
    );
  }

  const ext = (file.name.split(".").pop() || "").toLowerCase();
  const allowed = isVideo ? ALLOWED_VIDEO_EXT : ALLOWED_IMAGE_EXT;
  if (!allowed.has(ext)) {
    return NextResponse.json({ error: `Unsupported file extension: .${ext}` }, { status: 400 });
  }

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadsDir, { recursive: true });

  const original = Buffer.from(await file.arrayBuffer());

  // Videos are stored as uploaded; images are downscaled and re-encoded to WebP.
  // A straight-from-camera promo image was shipping 1.25MB to every homepage
  // visitor — larger than all three reel videos combined.
  if (isVideo) {
    const filename = `${crypto.randomUUID()}.${ext}`;
    await writeFile(path.join(uploadsDir, filename), original);
    return NextResponse.json({ url: `/uploads/${filename}`, bytes: original.byteLength });
  }

  try {
    const optimised = await sharp(original)
      .rotate() // honour EXIF orientation before we discard the metadata
      .resize({ width: MAX_IMAGE_WIDTH, withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer();

    const filename = `${crypto.randomUUID()}.webp`;
    await writeFile(path.join(uploadsDir, filename), optimised);
    return NextResponse.json({
      url: `/uploads/${filename}`,
      bytes: optimised.byteLength,
      originalBytes: original.byteLength,
    });
  } catch {
    // Corrupt or unsupported image data — reject rather than store a file the
    // site can't render.
    return NextResponse.json({ error: "That image could not be processed" }, { status: 400 });
  }
}

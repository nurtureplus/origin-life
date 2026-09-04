/**
 * Generates on-brand 9:16 sample reels.
 *
 * Renders SVG frames with sharp, then encodes them to MP4 with ffmpeg.
 * Output: public/reels/<slug>.mp4 plus a matching poster image.
 *
 * Run:  node scripts/gen-sample-reels.mjs
 */
import sharp from "sharp";
import { mkdirSync, rmSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";

const FFMPEG =
  process.env.FFMPEG_PATH ||
  "C:\\Users\\USER\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-8.1.2-full_build\\bin\\ffmpeg.exe";

const W = 540;
const H = 960;
const FPS = 24;
const SECONDS = 4;
const FRAMES = FPS * SECONDS;

const TMP = "scripts/.reel-frames";
const OUT = "public/reels";

// Brand palette
const PAPER = "#f8f9fc";
const INK = "#121317";
const INK_SOFT = "#45474d";

const reels = [
  {
    slug: "morning-stack",
    tint: "#e29225",
    tint2: "#3d5b2a",
    kicker: "MORNING",
    line1: "Rise",
    line2: "then Core",
    caption: "The 30-second morning stack",
  },
  {
    slug: "read-the-label",
    tint: "#6fc4c3",
    tint2: "#3d5b2a",
    kicker: "LABEL CHECK",
    line1: "No blends.",
    line2: "Just doses.",
    caption: "How to read a supplement label",
  },
  {
    slug: "wind-down",
    tint: "#8fa9ff",
    tint2: "#5c441c",
    kicker: "EVENING",
    line1: "Calm",
    line2: "before bed",
    caption: "Our 3-step wind-down routine",
  },
];

function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function frameSvg(reel, i) {
  const t = i / FRAMES; // 0..1 over the loop
  const loop = Math.sin(t * Math.PI * 2); // smooth -1..1, seamless at the wrap

  // Drifting colour blobs
  const x1 = 62 + loop * 10;
  const y1 = 24 + loop * 6;
  const x2 = 18 - loop * 8;
  const y2 = 78 - loop * 5;
  const r1 = 62 + loop * 6;

  // Text settles in over the first ~35% then holds
  const intro = easeInOut(Math.min(1, t / 0.35));
  const textY = 20 * (1 - intro);
  const textOpacity = intro;

  // Slow ring rotation for a sense of motion
  const ringRot = t * 360;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <radialGradient id="g1" cx="${x1}%" cy="${y1}%" r="${r1}%">
      <stop offset="0%" stop-color="${reel.tint}" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="${reel.tint}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="g2" cx="${x2}%" cy="${y2}%" r="58%">
      <stop offset="0%" stop-color="${reel.tint2}" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="${reel.tint2}" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="${PAPER}"/>
  <rect width="${W}" height="${H}" fill="url(#g1)"/>
  <rect width="${W}" height="${H}" fill="url(#g2)"/>

  <g transform="translate(${W / 2} 300) rotate(${ringRot})" opacity="0.16">
    <circle r="120" fill="none" stroke="${INK}" stroke-width="1"/>
    <circle r="150" fill="none" stroke="${INK}" stroke-width="1" stroke-dasharray="4 10"/>
  </g>

  <g transform="translate(0 ${textY})" opacity="${textOpacity.toFixed(3)}">
    <text x="${W / 2}" y="300" text-anchor="middle"
      font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="18"
      letter-spacing="6" fill="${INK_SOFT}">${reel.kicker}</text>

    <text x="${W / 2}" y="392" text-anchor="middle"
      font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="66"
      font-weight="500" fill="${INK}">${reel.line1}</text>
    <text x="${W / 2}" y="466" text-anchor="middle"
      font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="66"
      font-weight="500" fill="${INK}">${reel.line2}</text>

    <text x="${W / 2}" y="546" text-anchor="middle"
      font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="22"
      fill="${INK_SOFT}">${reel.caption}</text>
  </g>

  <text x="${W / 2}" y="${H - 70}" text-anchor="middle"
    font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="24"
    letter-spacing="2" font-weight="600" fill="${INK}">OriginLife</text>
  <text x="${W / 2}" y="${H - 44}" text-anchor="middle"
    font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="13"
    letter-spacing="3" fill="${INK_SOFT}">NURTURING BODY, MIND &amp; SOUL</text>
</svg>`;
}

if (!existsSync(FFMPEG)) {
  console.error(`ffmpeg not found at ${FFMPEG}. Set FFMPEG_PATH.`);
  process.exit(1);
}

mkdirSync(OUT, { recursive: true });

for (const reel of reels) {
  rmSync(TMP, { recursive: true, force: true });
  mkdirSync(TMP, { recursive: true });

  for (let i = 0; i < FRAMES; i++) {
    const svg = Buffer.from(frameSvg(reel, i));
    const name = `${TMP}/f${String(i).padStart(4, "0")}.png`;
    await sharp(svg).png().toFile(name);
  }

  const mp4 = `${OUT}/${reel.slug}.mp4`;
  rmSync(mp4, { force: true });

  execFileSync(
    FFMPEG,
    [
      "-y",
      "-framerate", String(FPS),
      "-i", `${TMP}/f%04d.png`,
      "-c:v", "libx264",
      "-pix_fmt", "yuv420p",
      // Web-friendly: moov atom up front so it streams without a full download.
      "-movflags", "+faststart",
      "-crf", "26",
      mp4,
    ],
    { stdio: "pipe" }
  );

  // Poster = the settled frame, so the card looks right before playback starts.
  await sharp(Buffer.from(frameSvg(reel, Math.floor(FRAMES * 0.5))))
    .jpeg({ quality: 82 })
    .toFile(`${OUT}/${reel.slug}.jpg`);

  console.log(`Built ${mp4}`);
}

rmSync(TMP, { recursive: true, force: true });
console.log(`Done — ${reels.length} reels in ${OUT}`);

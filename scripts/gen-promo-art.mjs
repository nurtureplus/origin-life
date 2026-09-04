import { writeFileSync, mkdirSync } from "node:fs";

mkdirSync("public/promos", { recursive: true });

const PAPER = "#f8f9fc";

const banners = [
  { slug: "promo-green", tint: "#3d5b2a", tint2: "#6fc4c3" },
  { slug: "promo-teal", tint: "#6fc4c3", tint2: "#3d5b2a" },
  { slug: "promo-orange", tint: "#e29225", tint2: "#3d5b2a" },
];

function svg({ tint, tint2 }) {
  return `<svg viewBox="0 0 1600 900" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="glowA" cx="80%" cy="22%" r="65%">
      <stop offset="0%" stop-color="${tint}" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="${tint}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glowB" cx="12%" cy="88%" r="60%">
      <stop offset="0%" stop-color="${tint2}" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="${tint2}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1600" height="900" fill="${PAPER}"/>
  <rect width="1600" height="900" fill="url(#glowA)"/>
  <rect width="1600" height="900" fill="url(#glowB)"/>
</svg>`;
}

for (const b of banners) {
  writeFileSync(`public/promos/${b.slug}.svg`, svg(b));
}

console.log(`Generated ${banners.length} promo banner backgrounds`);

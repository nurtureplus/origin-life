import { writeFileSync, mkdirSync } from "node:fs";

mkdirSync("public/blog", { recursive: true });

const PAPER = "#f8f9fc";

// One cover per seeded article, tinted to its subject.
const covers = [
  { slug: "clarity-launch", tint: "#6fc4c3", tint2: "#3d5b2a" },
  { slug: "magnesium", tint: "#8fa9ff", tint2: "#3d5b2a" },
  { slug: "proprietary-blends", tint: "#e29225", tint2: "#5c441c" },
  { slug: "adaptogens", tint: "#3d5b2a", tint2: "#e29225" },
  { slug: "collagen", tint: "#f3a6e0", tint2: "#6fc4c3" },
  { slug: "third-party-testing", tint: "#5c441c", tint2: "#3d5b2a" },
];

function svg({ tint, tint2 }) {
  return `<svg viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="a" cx="72%" cy="26%" r="68%">
      <stop offset="0%" stop-color="${tint}" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="${tint}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="b" cx="18%" cy="84%" r="62%">
      <stop offset="0%" stop-color="${tint2}" stop-opacity="0.42"/>
      <stop offset="100%" stop-color="${tint2}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="800" fill="${PAPER}"/>
  <rect width="1200" height="800" fill="url(#a)"/>
  <rect width="1200" height="800" fill="url(#b)"/>
</svg>`;
}

for (const c of covers) {
  writeFileSync(`public/blog/${c.slug}.svg`, svg(c));
}

console.log(`Generated ${covers.length} blog covers`);

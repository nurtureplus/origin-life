import { writeFileSync, mkdirSync } from "node:fs";

mkdirSync("public/products", { recursive: true });

const products = [
  { slug: "rise", c1: "#F4E24B", c2: "#CFF33B", bg: "#171604" },
  { slug: "calm", c1: "#8FA9FF", c2: "#3A4CC2", bg: "#0A0E1F" },
  { slug: "clarity", c1: "#6FE6D6", c2: "#1F9E8E", bg: "#041613" },
  { slug: "flow", c1: "#FF9E7A", c2: "#E85B3E", bg: "#1A0A05" },
  { slug: "glow", c1: "#F3A6E0", c2: "#B15CD8", bg: "#160A1A" },
  { slug: "core", c1: "#D8F35B", c2: "#8FBF2A", bg: "#0F1404" },
];

function svg({ c1, c2, bg }) {
  return `<svg viewBox="0 0 640 640" xmlns="http://www.w3.org/2000/svg" role="img">
  <defs>
    <radialGradient id="glow" cx="50%" cy="42%" r="60%">
      <stop offset="0%" stop-color="${c1}" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="${c1}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="cap" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${c1}"/>
      <stop offset="100%" stop-color="${c2}"/>
    </linearGradient>
    <linearGradient id="capDark" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${c2}"/>
      <stop offset="100%" stop-color="${bg}"/>
    </linearGradient>
  </defs>
  <rect width="640" height="640" fill="${bg}"/>
  <circle cx="320" cy="270" r="230" fill="url(#glow)"/>
  <g transform="translate(320 320) rotate(-32)">
    <rect x="-190" y="-72" width="380" height="144" rx="72" fill="url(#capDark)"/>
    <path d="M 0 -72 A 72 72 0 0 1 0 72 L -190 72 A 72 72 0 0 1 -190 -72 Z" fill="url(#cap)"/>
    <ellipse cx="-95" cy="-30" rx="46" ry="14" fill="#ffffff" opacity="0.35"/>
  </g>
  <circle cx="150" cy="470" r="5" fill="${c1}" opacity="0.8"/>
  <circle cx="500" cy="160" r="4" fill="${c1}" opacity="0.6"/>
  <circle cx="470" cy="500" r="3" fill="${c1}" opacity="0.5"/>
</svg>`;
}

for (const p of products) {
  writeFileSync(`public/products/${p.slug}.svg`, svg(p));
}

console.log(`Generated ${products.length} product SVGs`);

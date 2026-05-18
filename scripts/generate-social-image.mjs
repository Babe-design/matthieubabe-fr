import fs from "node:fs/promises";
import sharp from "sharp";

const tape = await fs.readFile("public/images/name-tape.png");
const tapeHref = `data:image/png;base64,${tape.toString("base64")}`;
const tapeWidth = 880;
const tapeHeight = Math.round((tapeWidth / 1500) * 339);

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <pattern id="dots" width="42" height="42" patternUnits="userSpaceOnUse">
      <circle cx="4" cy="4" r="1.7" fill="rgba(28,26,23,0.2)"/>
    </pattern>
    <filter id="shadow" x="-20%" y="-80%" width="140%" height="260%">
      <feDropShadow dx="0" dy="16" stdDeviation="12" flood-color="#4b3823" flood-opacity="0.16"/>
    </filter>
  </defs>
  <rect width="1200" height="630" fill="#ffffff"/>
  <rect width="1200" height="630" fill="url(#dots)"/>
  <image
    href="${tapeHref}"
    x="${(1200 - tapeWidth) / 2}"
    y="${(630 - tapeHeight) / 2}"
    width="${tapeWidth}"
    height="${tapeHeight}"
    preserveAspectRatio="xMidYMid meet"
    filter="url(#shadow)"
    transform="rotate(-3 600 315)"
  />
</svg>`;

await sharp(Buffer.from(svg)).png().toFile("public/social/og-image.png");

console.log("Generated public/social/og-image.png");

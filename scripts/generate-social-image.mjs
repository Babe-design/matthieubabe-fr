import fs from "node:fs/promises";
import sharp from "sharp";

const magnets = await fs.readFile("public/images/babe-magnets.webp");
const imageHref = `data:image/webp;base64,${magnets.toString("base64")}`;
const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#fff" />
  <g fill="#242424" font-family="Arial, sans-serif" font-size="48" font-weight="500" letter-spacing="-1.4">
    <text x="156" y="136" font-size="36" font-weight="400">I’m Matthieu</text>
    <image href="${imageHref}" x="104" y="154" width="720" height="320" />
    <text x="156" y="530" font-weight="600">Design leader at Datadog.</text>
  </g>
</svg>`;
await sharp(Buffer.from(svg)).png().toFile("public/social/og-image.png");
console.log("Generated public/social/og-image.png");

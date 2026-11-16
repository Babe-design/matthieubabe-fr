import fs from "node:fs/promises";
import sharp from "sharp";
import opentype from "opentype.js";

const source = await fs.readFile("scripts/assets/identity/bona-nova-bold.ttf");
const font = opentype.parse(source.buffer.slice(source.byteOffset, source.byteOffset + source.byteLength));
// This plain Latin word needs no contextual substitutions. Build from the
// actual glyph outlines and kerning to avoid unsupported CCMP tables in Node.
const outline = new opentype.Path();
const size = 264;
const scale = size / font.unitsPerEm;
let x = 152;
let previous;
for (const letter of "Babe") {
  const glyph = font.charToGlyph(letter);
  if (previous) x += font.getKerningValue(previous, glyph) * scale;
  outline.extend(glyph.getPath(x, 426, size).commands);
  x += glyph.advanceWidth * scale - size * .01;
  previous = glyph;
}
const word = outline.toPathData(3);
const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#fff" />
  <g fill="#242424" font-family="Arial, sans-serif" font-size="48" letter-spacing="-1.4">
    <text x="156" y="136" font-size="36" font-weight="400">I’m Matthieu</text>
    <path d="${word}" />
    <text x="156" y="530" font-weight="600">Design leader at Datadog.</text>
  </g>
</svg>`;
await sharp(Buffer.from(svg)).png().toFile("public/social/og-image.png");
console.log("Generated public/social/og-image.png with the typographic identity.");

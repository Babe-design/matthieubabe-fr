import fs from "node:fs/promises";
import sharp from "sharp";

const source = "scripts/assets/babe-favicon-source.png";
const metadata = await sharp(source).metadata();
if (metadata.width !== metadata.height) throw new Error("The favicon source must be square.");

const icons = new Map();
for (const size of [16, 32, 48, 180]) {
  const png = await sharp(source).resize(size, size).ensureAlpha().png({ compressionLevel: 9 }).toBuffer();
  icons.set(size, png);
  if (size === 16 || size === 32) await fs.writeFile(`public/favicon-${size}.png`, png);
  if (size === 180) await fs.writeFile("public/apple-touch-icon.png", png);
}

// ICO supports embedded PNGs; include native sizes for browsers and desktop shortcuts.
const sizes = [16, 32, 48];
const header = Buffer.alloc(6 + sizes.length * 16);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(sizes.length, 4);
let offset = header.length;
for (const [index, size] of sizes.entries()) {
  const entry = 6 + index * 16;
  const png = icons.get(size);
  header[entry] = size;
  header[entry + 1] = size;
  header.writeUInt16LE(1, entry + 4);
  header.writeUInt16LE(32, entry + 6);
  header.writeUInt32LE(png.length, entry + 8);
  header.writeUInt32LE(offset, entry + 12);
  offset += png.length;
}
await fs.writeFile("public/favicon.ico", Buffer.concat([header, ...sizes.map(size => icons.get(size))]));
console.log("Generated favicon PNGs, multi-size ICO and Apple touch icon.");

import fs from "node:fs/promises";
import sharp from "sharp";

const sourcePath = "scripts/assets/post-it-ai-source.png";
const outputPath = "public/images/post-it-reworking.png";
const transparentMatte = [255, 214, 49];

const source = sharp(sourcePath).ensureAlpha();
const { data, info } = await source.raw().toBuffer({ resolveWithObject: true });
const output = Buffer.alloc(data.length);

let minX = info.width;
let minY = info.height;
let maxX = 0;
let maxY = 0;

const isGreenScreen = (r, g, b) => {
  const greenDominance = g - Math.max(r, b);
  return g > 120 && greenDominance > 22 && g > r * 1.1 && g > b * 1.1;
};

for (let y = 0; y < info.height; y += 1) {
  for (let x = 0; x < info.width; x += 1) {
    const index = (y * info.width + x) * info.channels;
    const r = data[index];
    const g = data[index + 1];
    const b = data[index + 2];
    const alpha = isGreenScreen(r, g, b) ? 0 : 255;

    output[index] = alpha === 255 ? r : transparentMatte[0];
    output[index + 1] = alpha === 255 ? g : transparentMatte[1];
    output[index + 2] = alpha === 255 ? b : transparentMatte[2];
    output[index + 3] = alpha;

    if (alpha > 0) {
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }
}

if (maxX < minX || maxY < minY) {
  throw new Error(`No post-it pixels found in ${sourcePath}`);
}

const margin = 78;
const left = Math.max(0, minX - margin);
const top = Math.max(0, minY - margin);
const right = Math.min(info.width - 1, maxX + margin);
const bottom = Math.min(info.height - 1, maxY + margin);

const resized = await sharp(output, {
  raw: {
    width: info.width,
    height: info.height,
    channels: 4
  }
})
  .extract({
    left,
    top,
    width: right - left + 1,
    height: bottom - top + 1
  })
  .resize(1000, 1000, {
    fit: "contain",
    background: { r: transparentMatte[0], g: transparentMatte[1], b: transparentMatte[2], alpha: 0 }
  })
  .raw()
  .toBuffer({ resolveWithObject: true });

const cleaned = Buffer.from(resized.data);

for (let y = 0; y < resized.info.height; y += 1) {
  for (let x = 0; x < resized.info.width; x += 1) {
    const index = (y * resized.info.width + x) * 4;
    const r = cleaned[index];
    const g = cleaned[index + 1];
    const b = cleaned[index + 2];
    const a = cleaned[index + 3];

    if (a < 28 || isGreenScreen(r, g, b)) {
      cleaned[index] = transparentMatte[0];
      cleaned[index + 1] = transparentMatte[1];
      cleaned[index + 2] = transparentMatte[2];
      cleaned[index + 3] = 0;
      continue;
    }

    const greenDominance = g - Math.max(r, b);
    if (greenDominance > 10) {
      cleaned[index + 1] = Math.min(g, Math.max(r, b) + 4);
    }
  }
}

await fs.mkdir("public/images", { recursive: true });

await sharp(cleaned, {
  raw: {
    width: resized.info.width,
    height: resized.info.height,
    channels: 4
  }
})
  .png({ compressionLevel: 9 })
  .toFile(outputPath);

console.log(`Generated ${outputPath}`);

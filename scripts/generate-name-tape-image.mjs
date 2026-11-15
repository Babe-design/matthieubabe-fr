import fs from "node:fs/promises";
import sharp from "sharp";

const sourcePath = "scripts/assets/name-tape-ai-source.png";
const outputPath = "public/images/name-tape.png";

const source = sharp(sourcePath).ensureAlpha();
const { data, info } = await source.raw().toBuffer({ resolveWithObject: true });
const output = Buffer.alloc(data.length);
const transparentMatte = [236, 220, 174];

let minX = info.width;
let minY = info.height;
let maxX = 0;
let maxY = 0;

const alphaForPixel = (r, g, b) => {
  const greenDominance = g - Math.max(r, b);
  const isGreenScreen = g > 112 && greenDominance > 18 && g > r * 1.08 && g > b * 1.08;

  if (isGreenScreen) {
    return 0;
  }

  return 255;
};

for (let y = 0; y < info.height; y += 1) {
  for (let x = 0; x < info.width; x += 1) {
    const index = (y * info.width + x) * info.channels;
    const r = data[index];
    const g = data[index + 1];
    const b = data[index + 2];
    const alpha = alphaForPixel(r, g, b);

    output[index] = alpha === 255 ? r : transparentMatte[0];
    output[index + 1] = alpha === 255 ? Math.min(g, Math.max(r, b) + 8) : transparentMatte[1];
    output[index + 2] = alpha === 255 ? b : transparentMatte[2];
    output[index + 3] = alpha;

    if (alpha > 12) {
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }
}

const marginX = 36;
const marginY = 28;
const left = Math.max(0, minX - marginX);
const top = Math.max(0, minY - marginY);
const right = Math.min(info.width - 1, maxX + marginX);
const bottom = Math.min(info.height - 1, maxY + marginY);

await fs.mkdir("public/images", { recursive: true });

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
  .resize(1500, null, {
    withoutEnlargement: true
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

    if (a < 32) {
      cleaned[index] = transparentMatte[0];
      cleaned[index + 1] = transparentMatte[1];
      cleaned[index + 2] = transparentMatte[2];
      cleaned[index + 3] = 0;
      continue;
    }

    const greenDominance = g - Math.max(r, b);
    if (greenDominance > 16) {
      cleaned[index + 1] = Math.min(g, Math.max(r, b) + 8);
    }
  }
}

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

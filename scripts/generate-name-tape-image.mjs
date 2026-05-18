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
const inkMask = new Uint8ClampedArray(resized.info.width * resized.info.height);

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

    const blueInk =
      a > 96 &&
      b > 72 &&
      b > r * 1.12 &&
      b > g * 1.04 &&
      g < 190;

    if (blueInk) {
      const blueStrength = Math.min(1, (b - Math.max(r, g) + 42) / 92);
      inkMask[y * resized.info.width + x] = Math.round(blueStrength * 255);
    }
  }
}

const markerInk = [18, 18, 16];
const inkened = Buffer.from(cleaned);

for (let y = 0; y < resized.info.height; y += 1) {
  for (let x = 0; x < resized.info.width; x += 1) {
    const index = (y * resized.info.width + x) * 4;
    const a = cleaned[index + 3];

    if (a === 0) {
      continue;
    }

    let strength = inkMask[y * resized.info.width + x] / 255;

    for (let oy = -2; oy <= 2; oy += 1) {
      for (let ox = -2; ox <= 2; ox += 1) {
        const nx = x + ox;
        const ny = y + oy;

        if (nx < 0 || ny < 0 || nx >= resized.info.width || ny >= resized.info.height) {
          continue;
        }

        const distance = Math.hypot(ox, oy);
        if (distance > 2.2) {
          continue;
        }

        const neighbor = inkMask[ny * resized.info.width + nx] / 255;
        const falloff = Math.max(0, 1 - distance / 2.35);
        strength = Math.max(strength, neighbor * falloff * 0.82);
      }
    }

    if (strength <= 0.04) {
      continue;
    }

    const markerOpacity = Math.min(0.94, 0.3 + strength * 0.72);
    inkened[index] = Math.round(cleaned[index] * (1 - markerOpacity) + markerInk[0] * markerOpacity);
    inkened[index + 1] = Math.round(cleaned[index + 1] * (1 - markerOpacity) + markerInk[1] * markerOpacity);
    inkened[index + 2] = Math.round(cleaned[index + 2] * (1 - markerOpacity) + markerInk[2] * markerOpacity);
  }
}

await sharp(inkened, {
  raw: {
    width: resized.info.width,
    height: resized.info.height,
    channels: 4
  }
})
  .png({ compressionLevel: 9 })
  .toFile(outputPath);

console.log(`Generated ${outputPath}`);

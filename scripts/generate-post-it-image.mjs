import fs from "node:fs/promises";
import sharp from "sharp";

const sourcePath = "scripts/assets/post-it-ai-source.png";
const outputPath = "public/images/post-it-reworking.png";

const source = sharp(sourcePath).ensureAlpha();
const { data, info } = await source.raw().toBuffer({ resolveWithObject: true });
const output = Buffer.alloc(data.length);
const rowMin = new Array(info.height).fill(info.width);
const rowMax = new Array(info.height).fill(-1);
const columnMin = new Array(info.width).fill(info.height);
const columnMax = new Array(info.width).fill(-1);

let minX = info.width;
let minY = info.height;
let maxX = 0;
let maxY = 0;

const pixelSignals = (r, g, b) => {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const chroma = max - min;
  const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;

  const isYellowPaper = r > 150 && g > 125 && b < 190 && chroma > 32 && luma > 150;
  const isBlackInk = luma < 92;
  const isPaperEdge = r > 195 && g > 160 && b < 215 && chroma > 18 && luma > 170;

  return { isBlackInk, isPaper: isYellowPaper || isPaperEdge };
};

for (let y = 0; y < info.height; y += 1) {
  for (let x = 0; x < info.width; x += 1) {
    const index = (y * info.width + x) * info.channels;
    const { isPaper } = pixelSignals(data[index], data[index + 1], data[index + 2]);

    if (isPaper) {
      rowMin[y] = Math.min(rowMin[y], x);
      rowMax[y] = Math.max(rowMax[y], x);
      columnMin[x] = Math.min(columnMin[x], y);
      columnMax[x] = Math.max(columnMax[x], y);
    }
  }
}

const alphaForPixel = (r, g, b, x, y) => {
  const { isBlackInk, isPaper } = pixelSignals(r, g, b);
  const rowHasPaper = rowMax[y] >= rowMin[y];
  const columnHasPaper = columnMax[x] >= columnMin[x];
  const insidePaperRow = rowHasPaper && x >= rowMin[y] + 2 && x <= rowMax[y] - 2;
  const insidePaperColumn = columnHasPaper && y >= columnMin[x] + 2 && y <= columnMax[x] - 2;
  const insideInkSafeArea =
    rowHasPaper &&
    columnHasPaper &&
    x >= rowMin[y] + 44 &&
    x <= rowMax[y] - 44 &&
    y >= columnMin[x] + 44 &&
    y <= columnMax[x] - 44;

  if (isPaper || (isBlackInk && insidePaperRow && insidePaperColumn && insideInkSafeArea)) {
    return 255;
  }

  return 0;
};

for (let y = 0; y < info.height; y += 1) {
  for (let x = 0; x < info.width; x += 1) {
    const index = (y * info.width + x) * info.channels;
    const r = data[index];
    const g = data[index + 1];
    const b = data[index + 2];
    const alpha = alphaForPixel(r, g, b, x, y);

    output[index] = r;
    output[index + 1] = g;
    output[index + 2] = b;
    output[index + 3] = alpha;

    if (alpha > 8) {
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }
}

const margin = 68;
const left = Math.max(0, minX - margin);
const top = Math.max(0, minY - margin);
const right = Math.min(info.width - 1, maxX + margin);
const bottom = Math.min(info.height - 1, maxY + margin);

await fs.mkdir("public/images", { recursive: true });

await sharp(output, {
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
    background: { r: 0, g: 0, b: 0, alpha: 0 }
  })
  .png({ compressionLevel: 9 })
  .toFile(outputPath);

console.log(`Generated ${outputPath}`);

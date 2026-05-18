import sharp from "sharp";

const sourcePath = "scripts/assets/post-it-options-source.png";
const outputPath = "public/images/post-it-reworking.png";
const crop = { left: 1220, top: 130, width: 580, height: 640 };
const canvasSize = 1200;
const subjectWidth = 1040;
const subjectLeft = 80;
const subjectTop = 42;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const source = sharp(sourcePath).extract(crop).ensureAlpha();
const { data, info } = await source.raw().toBuffer({ resolveWithObject: true });
const noteSpans = Array.from({ length: info.height }, () => ({
  min: info.width,
  max: -1
}));

for (let y = 0; y < info.height; y += 1) {
  for (let x = 0; x < info.width; x += 1) {
    const index = (y * info.width + x) * info.channels;
    const r = data[index];
    const g = data[index + 1];
    const b = data[index + 2];
    const maxChannel = Math.max(r, g, b);
    const minChannel = Math.min(r, g, b);
    const isPostItYellow =
      r > 150 &&
      g > 105 &&
      b < 170 &&
      maxChannel - minChannel > 38 &&
      r > g * 0.92 &&
      g > b * 1.35;

    if (isPostItYellow) {
      noteSpans[y].min = Math.min(noteSpans[y].min, x);
      noteSpans[y].max = Math.max(noteSpans[y].max, x);
    }
  }
}

for (let y = 1; y < info.height - 1; y += 1) {
  if (noteSpans[y].max - noteSpans[y].min >= 80) {
    continue;
  }

  const previous = noteSpans[y - 1];
  const next = noteSpans[y + 1];

  if (previous.max - previous.min > 120 && next.max - next.min > 120) {
    noteSpans[y].min = Math.round((previous.min + next.min) / 2);
    noteSpans[y].max = Math.round((previous.max + next.max) / 2);
  }
}

const rgba = Buffer.alloc(data.length);

for (let y = 0; y < info.height; y += 1) {
  const span = noteSpans[y];
  const hasPostIt = span.max - span.min > 120;

  for (let x = 0; x < info.width; x += 1) {
    const index = (y * info.width + x) * 4;
    const r = data[index];
    const g = data[index + 1];
    const b = data[index + 2];
    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    const insidePostIt = hasPostIt && x >= span.min - 1 && x <= span.max + 1;

    if (insidePostIt) {
      rgba[index] = r;
      rgba[index + 1] = g;
      rgba[index + 2] = b;
      rgba[index + 3] = 255;
      continue;
    }

    // Recreate the generated contact shadow as alpha so the dotted page
    // background can remain visible around the note.
    const shadowAlpha = clamp(Math.round((255 - luma) * 1.05), 0, 70);

    if (shadowAlpha > 3) {
      rgba[index] = 28;
      rgba[index + 1] = 24;
      rgba[index + 2] = 20;
      rgba[index + 3] = shadowAlpha;
    }
  }
}

const subject = await sharp(rgba, {
  raw: {
    width: info.width,
    height: info.height,
    channels: 4
  }
})
  .resize({ width: subjectWidth, kernel: "lanczos3" })
  .png()
  .toBuffer();

await sharp({
  create: {
    width: canvasSize,
    height: canvasSize,
    channels: 4,
    background: { r: 255, g: 255, b: 255, alpha: 0 }
  }
})
  .composite([{ input: subject, left: subjectLeft, top: subjectTop }])
  .png({ compressionLevel: 9 })
  .toFile(outputPath);

console.log(`Generated ${outputPath}`);

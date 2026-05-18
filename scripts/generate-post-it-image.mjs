import sharp from "sharp";

const sourcePath = "scripts/assets/post-it-ai-source.png";
const outputPath = "public/images/post-it-reworking.png";
const size = 1000;
const noteWidth = 620;
const noteHeight = 595;
const noteX = (size - noteWidth) / 2;
const noteY = (size - noteHeight) / 2 + 10;

const source = sharp(sourcePath).ensureAlpha();
const { data, info } = await source.raw().toBuffer({ resolveWithObject: true });
const textMask = Buffer.alloc(data.length);

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
    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    const ink = !isGreenScreen(r, g, b) && luma < 92;
    const alpha = ink ? Math.min(255, Math.round((110 - luma) * 3.2)) : 0;

    textMask[index] = 16;
    textMask[index + 1] = 15;
    textMask[index + 2] = 13;
    textMask[index + 3] = alpha;

    if (alpha > 8) {
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }
}

if (maxX < minX || maxY < minY) {
  throw new Error(`No marker text found in ${sourcePath}`);
}

const textMargin = 18;
const textLeft = Math.max(0, minX - textMargin);
const textTop = Math.max(0, minY - textMargin);
const textWidth = Math.min(info.width - textLeft, maxX - minX + textMargin * 2);
const textHeight = Math.min(info.height - textTop, maxY - minY + textMargin * 2);

const textPng = await sharp(textMask, {
  raw: {
    width: info.width,
    height: info.height,
    channels: 4
  }
})
  .extract({
    left: textLeft,
    top: textTop,
    width: textWidth,
    height: textHeight
  })
  .resize({ width: 450, withoutEnlargement: false })
  .png()
  .toBuffer({ resolveWithObject: true });

const textLeftOnNote = Math.round(noteX + (noteWidth - textPng.info.width) / 2 + 2);
const textTopOnNote = Math.round(noteY + noteHeight * 0.29);

const wrinklePaths = [
  "M198 236 C294 212 354 246 438 224 S608 206 802 230",
  "M216 354 C310 340 408 367 498 349 S652 336 792 358",
  "M226 506 C310 492 384 525 474 503 S622 492 782 512",
  "M250 650 C360 632 478 660 590 638 S718 626 802 646",
  "M288 250 C282 332 302 388 288 472 S274 592 300 710",
  "M688 236 C716 350 682 424 710 526 S706 638 734 720",
  "M420 224 C398 318 432 392 414 496 S424 624 390 724",
  "M552 230 C578 330 538 398 560 510 S556 626 594 714",
  "M250 302 C354 360 478 326 574 384 S676 428 784 402",
  "M230 720 C380 690 504 728 646 690 S760 704 812 680"
];

const notePath = `M${noteX + 15},${noteY + 18}
  C${noteX + 130},${noteY + 5} ${noteX + 322},${noteY + 16} ${noteX + noteWidth - 18},${noteY + 12}
  C${noteX + noteWidth - 3},${noteY + 164} ${noteX + noteWidth - 10},${noteY + 352} ${noteX + noteWidth - 10},${noteY + noteHeight - 20}
  C${noteX + 468},${noteY + noteHeight - 3} ${noteX + 280},${noteY + noteHeight - 12} ${noteX + 18},${noteY + noteHeight - 3}
  C${noteX + 2},${noteY + 430} ${noteX + 12},${noteY + 214} ${noteX + 15},${noteY + 18}Z`;

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="paperGradient" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ffe45e"/>
      <stop offset="0.46" stop-color="#ffd51e"/>
      <stop offset="1" stop-color="#ffc517"/>
    </linearGradient>
    <clipPath id="noteClip">
      <path d="${notePath}"/>
    </clipPath>
  </defs>
  <g>
    <path d="${notePath}" fill="url(#paperGradient)" />
    <g clip-path="url(#noteClip)" opacity="0.46">
      ${wrinklePaths
        .map(
          (path, index) =>
            `<path d="${path}" fill="none" stroke="${index % 2 ? "#c09208" : "#fff09a"}" stroke-width="${index % 2 ? 1.05 : 1.45}" stroke-linecap="round" opacity="${index % 2 ? 0.13 : 0.18}"/>`
        )
        .join("")}
      <path d="M168 172 C330 146 496 160 832 132" fill="none" stroke="#fff5ae" stroke-width="2.2" opacity="0.13"/>
      <path d="M176 800 C350 762 500 804 650 766 S758 782 834 750" fill="none" stroke="#ba8e07" stroke-width="1.8" opacity="0.08"/>
      <path d="${notePath}" fill="none" stroke="#efbe08" stroke-width="1.4" opacity="0.18"/>
    </g>
  </g>
</svg>`;

const note = await sharp(Buffer.from(svg))
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const textured = Buffer.from(note.data);
const hash = (x, y, seed = 0) => {
  const value = Math.sin(x * 12.9898 + y * 78.233 + seed * 37.719) * 43758.5453;
  return value - Math.floor(value);
};

for (let y = 0; y < note.info.height; y += 1) {
  for (let x = 0; x < note.info.width; x += 1) {
    const index = (y * note.info.width + x) * 4;
    const alpha = textured[index + 3];

    if (alpha === 0) {
      continue;
    }

    const grain = (hash(x, y, 2) - 0.5) * 12;
    const fiber = (hash(Math.floor(x / 2), Math.floor(y / 6), 7) - 0.5) * 5;
    const low = Math.sin(x * 0.015 + y * 0.012) * 2.5;
    const delta = grain + fiber + low;

    textured[index] = Math.max(0, Math.min(255, textured[index] + delta + 2));
    textured[index + 1] = Math.max(0, Math.min(255, textured[index + 1] + delta * 0.62 + 1));
    textured[index + 2] = Math.max(0, Math.min(255, textured[index + 2] + delta * 0.18));

    if (hash(x, y, 13) > 0.992) {
      textured[index] = Math.max(0, textured[index] - 14);
      textured[index + 1] = Math.max(0, textured[index + 1] - 10);
      textured[index + 2] = Math.max(0, textured[index + 2] - 2);
    }
  }
}

await sharp(textured, {
  raw: {
    width: note.info.width,
    height: note.info.height,
    channels: 4
  }
})
  .composite([
    {
      input: textPng.data,
      left: textLeftOnNote,
      top: textTopOnNote
    }
  ])
  .png({ compressionLevel: 9 })
  .toFile(outputPath);

console.log(`Generated ${outputPath}`);

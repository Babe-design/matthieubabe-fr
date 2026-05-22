import sharp from "sharp";

const sourcePath = "scripts/assets/post-it-final-source.png";
const outputPath = "public/images/post-it-reworking.png";
const canvasSize = 1200;
const crop = { left: 102, top: 74, width: 820, height: 790 };
const subjectWidth = 1100;

const polygon = [
  [172, 181],
  [819, 141],
  [888, 732],
  [234, 812]
].map(([x, y]) => [x - crop.left, y - crop.top]);

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const smoothstep = (edge0, edge1, value) => {
  const t = clamp((value - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
};

const pixelIndex = (x, y, width, channels = 4) => (y * width + x) * channels;

const distanceToSegment = (px, py, ax, ay, bx, by) => {
  const abx = bx - ax;
  const aby = by - ay;
  const apx = px - ax;
  const apy = py - ay;
  const abLengthSquared = abx * abx + aby * aby;
  const t = abLengthSquared === 0 ? 0 : clamp((apx * abx + apy * aby) / abLengthSquared, 0, 1);
  const closestX = ax + abx * t;
  const closestY = ay + aby * t;

  return Math.hypot(px - closestX, py - closestY);
};

const pointInPolygon = (px, py, points) => {
  let inside = false;

  for (let i = 0, j = points.length - 1; i < points.length; j = i, i += 1) {
    const [xi, yi] = points[i];
    const [xj, yj] = points[j];
    const intersects = yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi;

    if (intersects) {
      inside = !inside;
    }
  }

  return inside;
};

const signedDistanceToPolygon = (px, py, points) => {
  let distance = Number.POSITIVE_INFINITY;

  for (let i = 0; i < points.length; i += 1) {
    const [ax, ay] = points[i];
    const [bx, by] = points[(i + 1) % points.length];
    distance = Math.min(distance, distanceToSegment(px, py, ax, ay, bx, by));
  }

  return pointInPolygon(px, py, points) ? distance : -distance;
};

const makeTransparentSubject = async () => {
  const source = sharp(sourcePath).extract(crop).ensureAlpha();
  const { data, info } = await source.raw().toBuffer({ resolveWithObject: true });
  const output = Buffer.alloc(info.width * info.height * 4);
  const feather = 2.2;

  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      const sourceIndex = pixelIndex(x, y, info.width, info.channels);
      const outputIndex = pixelIndex(x, y, info.width, 4);
      const distance = signedDistanceToPolygon(x + 0.5, y + 0.5, polygon);
      const alpha = Math.round(255 * smoothstep(-feather, feather, distance));

      if (alpha <= 2) {
        continue;
      }

      output[outputIndex] = data[sourceIndex];
      output[outputIndex + 1] = data[sourceIndex + 1];
      output[outputIndex + 2] = data[sourceIndex + 2];
      output[outputIndex + 3] = alpha;
    }
  }

  return sharp(output, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4
    }
  })
    .resize({ width: subjectWidth, kernel: "lanczos3" })
    .raw()
    .toBuffer({ resolveWithObject: true });
};

const shadowFromSubject = async ({ subject, left, top, blur, offsetX, offsetY, opacity, contactOnly }) => {
  const shadow = Buffer.alloc(canvasSize * canvasSize * 4);
  const width = subject.info.width;
  const height = subject.info.height;

  for (let y = 0; y < height; y += 1) {
    const yProgress = y / Math.max(1, height - 1);
    const verticalFalloff = contactOnly
      ? smoothstep(0.62, 1, yProgress)
      : 0.28 + smoothstep(0.15, 1, yProgress) * 0.72;

    for (let x = 0; x < width; x += 1) {
      const sourceIndex = pixelIndex(x, y, width, 4);
      const alpha = subject.data[sourceIndex + 3];

      if (alpha <= 3) {
        continue;
      }

      const targetX = left + offsetX + x;
      const targetY = top + offsetY + y;

      if (targetX < 0 || targetY < 0 || targetX >= canvasSize || targetY >= canvasSize) {
        continue;
      }

      const targetIndex = pixelIndex(targetX, targetY, canvasSize, 4);
      shadow[targetIndex] = 36;
      shadow[targetIndex + 1] = 28;
      shadow[targetIndex + 2] = 14;
      shadow[targetIndex + 3] = clamp(
        shadow[targetIndex + 3] + Math.round(alpha * opacity * verticalFalloff),
        0,
        255
      );
    }
  }

  return sharp(shadow, {
    raw: {
      width: canvasSize,
      height: canvasSize,
      channels: 4
    }
  })
    .blur(blur)
    .png()
    .toBuffer();
};

const subject = await makeTransparentSubject();
const subjectPng = await sharp(subject.data, {
  raw: {
    width: subject.info.width,
    height: subject.info.height,
    channels: 4
  }
})
  .png()
  .toBuffer();

const left = Math.round((canvasSize - subject.info.width) / 2);
const top = 58;
const broadShadow = await shadowFromSubject({
  subject,
  left,
  top,
  blur: 26,
  offsetX: 22,
  offsetY: 34,
  opacity: 0.07,
  contactOnly: false
});
const contactShadow = await shadowFromSubject({
  subject,
  left,
  top,
  blur: 9,
  offsetX: 8,
  offsetY: 13,
  opacity: 0.025,
  contactOnly: true
});

await sharp({
  create: {
    width: canvasSize,
    height: canvasSize,
    channels: 4,
    background: { r: 255, g: 255, b: 255, alpha: 0 }
  }
})
  .composite([
    { input: broadShadow, left: 0, top: 0 },
    { input: contactShadow, left: 0, top: 0 },
    { input: subjectPng, left, top }
  ])
  .png({ compressionLevel: 9 })
  .toFile(outputPath);

console.log(`Generated ${outputPath}`);

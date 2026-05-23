import fs from "node:fs/promises";
import sharp from "sharp";

const sourcePath = "scripts/assets/post-it-final-source.png";
const outputPath = "public/images/post-it-reworking.png";

const metadata = await sharp(sourcePath).metadata();

if (metadata.width !== 1200 || metadata.height !== 1200 || !metadata.hasAlpha) {
  throw new Error(
    `${sourcePath} must be a 1200x1200 PNG with a real alpha channel. ` +
      `Got ${metadata.width}x${metadata.height}, alpha=${metadata.hasAlpha}.`
  );
}

await fs.copyFile(sourcePath, outputPath);

console.log(`Copied ${sourcePath} to ${outputPath}`);

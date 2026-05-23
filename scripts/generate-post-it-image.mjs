import fs from "node:fs/promises";
import sharp from "sharp";

const sourcePath = "scripts/assets/post-it-final-source.png";
const output1200Path = "public/images/post-it-reworking-1200.png";
const output2000Path = "public/images/post-it-reworking-2000.png";
const legacyOutputPath = "public/images/post-it-reworking.png";

const metadata = await sharp(sourcePath).metadata();

if (metadata.width !== 2000 || metadata.height !== 2000 || !metadata.hasAlpha) {
  throw new Error(
    `${sourcePath} must be a 2000x2000 PNG with a real alpha channel. ` +
      `Got ${metadata.width}x${metadata.height}, alpha=${metadata.hasAlpha}.`
  );
}

await sharp(sourcePath)
  .resize(1200, 1200, { kernel: "lanczos3" })
  .png({ compressionLevel: 9 })
  .toFile(output1200Path);
await fs.copyFile(sourcePath, output2000Path);
await fs.copyFile(output1200Path, legacyOutputPath);

console.log(`Generated ${output1200Path}`);
console.log(`Copied ${sourcePath} to ${output2000Path}`);
console.log(`Copied ${output1200Path} to ${legacyOutputPath}`);

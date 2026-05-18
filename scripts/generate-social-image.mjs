import fs from "node:fs/promises";
import sharp from "sharp";
import TextToSVG from "text-to-svg";

const textToSvg = TextToSVG.loadSync("public/fonts/caveat-700.ttf");
const textPath = textToSvg.getPath("Matthieu Babe", {
  x: 0,
  y: 0,
  fontSize: 132,
  anchor: "center middle",
  attributes: {
    fill: "#1c1a17"
  }
});

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <pattern id="dots" width="42" height="42" patternUnits="userSpaceOnUse">
      <circle cx="4" cy="4" r="1.7" fill="rgba(28,26,23,0.2)"/>
    </pattern>
    <filter id="shadow" x="-20%" y="-80%" width="140%" height="260%">
      <feDropShadow dx="0" dy="20" stdDeviation="18" flood-color="#4b3823" flood-opacity="0.18"/>
    </filter>
  </defs>
  <rect width="1200" height="630" fill="#ffffff"/>
  <rect width="1200" height="630" fill="url(#dots)"/>
  <g filter="url(#shadow)" transform="translate(600 315) rotate(-4)">
    <path d="M-410,-76 L-368,-91 L-323,-72 L-276,-89 L-228,-72 L-178,-90 L-130,-73 L-82,-91 L-36,-74 L12,-89 L60,-72 L110,-91 L158,-73 L206,-88 L252,-70 L302,-89 L350,-72 L412,-82 L402,72 L350,88 L302,70 L254,87 L206,72 L158,89 L110,71 L62,90 L14,72 L-36,88 L-84,71 L-132,89 L-180,70 L-228,87 L-278,70 L-324,86 L-368,69 L-414,82 Z" fill="rgba(255,252,241,0.9)" stroke="rgba(92,78,54,0.22)" stroke-width="2"/>
    <g transform="rotate(1.5) translate(0 14)">${textPath}</g>
  </g>
</svg>`;

await fs.writeFile("public/social/og-image.svg", svg);
await sharp(Buffer.from(svg)).png().toFile("public/social/og-image.png");

console.log("Generated public/social/og-image.png");

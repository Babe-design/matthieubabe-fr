import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import sharp from "sharp";
import TextToSVG from "text-to-svg";

const handwritingFontPath = [
  "/System/Library/Fonts/Supplemental/Bradley Hand Bold.ttf",
  "public/fonts/caveat-700.ttf"
].find((fontPath) => existsSync(fontPath));

const textToSvg = TextToSVG.loadSync(handwritingFontPath);

const textLines = [
  { text: "I'm", x: -8, y: -78, size: 120, rotate: -4.4 },
  { text: "reworking", x: 2, y: 38, size: 92, rotate: -1.4 },
  { text: "this place", x: 14, y: 132, size: 90, rotate: -2.8 }
];

const textPaths = textLines
  .map(({ text, x, y, size, rotate }) => {
    const path = textToSvg.getPath(text, {
      x,
      y,
      fontSize: size,
      anchor: "center middle",
      attributes: {
        fill: "#0b3c98"
      }
    });

    return `<g transform="rotate(${rotate} ${x} ${y})">${path}</g>`;
  })
  .join("\n");

const maskTextPaths = textLines
  .map(({ text, x, y, size, rotate }) => {
    const path = textToSvg.getPath(text, {
      x,
      y,
      fontSize: size,
      anchor: "center middle",
      attributes: {
        fill: "#ffffff"
      }
    });

    return `<g transform="rotate(${rotate} ${x} ${y})">${path}</g>`;
  })
  .join("\n");

let randomSeed = 29;
const random = () => {
  randomSeed = (randomSeed * 1664525 + 1013904223) % 4294967296;
  return randomSeed / 4294967296;
};

const inkTextureStrokes = Array.from({ length: 118 }, (_, index) => {
  const x = -220 + random() * 450;
  const y = -126 + random() * 308;
  const length = 12 + random() * 58;
  const rotate = -7 + random() * 14;
  const opacity = index % 5 === 0 ? 0.3 : 0.13 + random() * 0.16;
  const width = 0.45 + random() * 0.75;

  return `<path d="M${x.toFixed(1)},${y.toFixed(1)} c${(length * 0.34).toFixed(1)},${(-1 + random() * 2).toFixed(1)} ${(length * 0.66).toFixed(1)},${(-1 + random() * 2).toFixed(1)} ${length.toFixed(1)},${(-1 + random() * 2).toFixed(1)}" transform="rotate(${rotate.toFixed(2)} ${x.toFixed(1)} ${y.toFixed(1)})" fill="none" stroke="#001f75" stroke-width="${width.toFixed(2)}" stroke-linecap="round" opacity="${opacity.toFixed(2)}"/>`;
}).join("\n");

const dryInkBreaks = Array.from({ length: 54 }, () => {
  const x = -210 + random() * 430;
  const y = -120 + random() * 300;
  const length = 8 + random() * 30;
  const rotate = -14 + random() * 28;
  const opacity = 0.08 + random() * 0.08;

  return `<path d="M${x.toFixed(1)},${y.toFixed(1)} l${length.toFixed(1)},${(-0.8 + random() * 1.6).toFixed(1)}" transform="rotate(${rotate.toFixed(2)} ${x.toFixed(1)} ${y.toFixed(1)})" fill="none" stroke="#ffdc46" stroke-width="${(0.55 + random() * 0.7).toFixed(2)}" stroke-linecap="round" opacity="${opacity.toFixed(2)}"/>`;
}).join("\n");

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="860" viewBox="0 0 1000 860">
  <defs>
    <filter id="paperShadow" x="-26%" y="-24%" width="152%" height="152%">
      <feDropShadow dx="0" dy="28" stdDeviation="24" flood-color="#4a3515" flood-opacity="0.22"/>
      <feDropShadow dx="10" dy="12" stdDeviation="9" flood-color="#5a4218" flood-opacity="0.12"/>
    </filter>

    <linearGradient id="noteFill" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffe977"/>
      <stop offset="54%" stop-color="#ffda3e"/>
      <stop offset="100%" stop-color="#ffc928"/>
    </linearGradient>

    <linearGradient id="cornerFront" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fff0a2"/>
      <stop offset="58%" stop-color="#ffd640"/>
      <stop offset="100%" stop-color="#e2a916"/>
    </linearGradient>

    <radialGradient id="cornerShade" cx="18%" cy="12%" r="92%">
      <stop offset="0%" stop-color="#fff3a9" stop-opacity="0.9"/>
      <stop offset="62%" stop-color="#d39a10" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#8c650e" stop-opacity="0"/>
    </radialGradient>

    <clipPath id="noteClip">
      <path d="M-323,-289 C-214,-304 -101,-301 5,-308 C111,-315 214,-303 326,-294 C346,-177 345,-70 337,57 C333,119 330,177 323,236 C219,264 101,276 -2,279 C-111,282 -211,270 -319,253 C-336,135 -337,17 -335,-92 C-333,-164 -331,-227 -323,-289 Z"/>
    </clipPath>

    <mask id="inkMask" maskUnits="userSpaceOnUse" x="-260" y="-160" width="540" height="350">
      <rect x="-260" y="-160" width="540" height="350" fill="#000000"/>
      ${maskTextPaths}
    </mask>

    <filter id="ballpointWobble" x="-8%" y="-10%" width="116%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.018 0.08" numOctaves="2" seed="11" result="noise"/>
      <feMorphology in="SourceGraphic" operator="erode" radius="0.65" result="thinnerInk"/>
      <feDisplacementMap in="thinnerInk" in2="noise" scale="0.75" xChannelSelector="R" yChannelSelector="G"/>
    </filter>
  </defs>

  <rect width="1000" height="860" fill="none"/>

  <g transform="translate(502 423) rotate(2.4)">
    <g filter="url(#paperShadow)">
      <path d="M-323,-289 C-214,-304 -101,-301 5,-308 C111,-315 214,-303 326,-294 C346,-177 345,-70 337,57 C333,119 330,177 323,236 C219,264 101,276 -2,279 C-111,282 -211,270 -319,253 C-336,135 -337,17 -335,-92 C-333,-164 -331,-227 -323,-289 Z" fill="url(#noteFill)"/>
      <path d="M-314,-275 C-209,-287 -102,-285 4,-291 C110,-297 208,-287 311,-279" fill="none" stroke="#fff3a6" stroke-opacity="0.42" stroke-width="2"/>
      <path d="M-310,238 C-211,253 -108,264 0,260 C105,256 208,247 305,221" fill="none" stroke="#d09a12" stroke-opacity="0.18" stroke-width="2"/>

      <g clip-path="url(#noteClip)" opacity="0.18">
        <path d="M-292,-244 C-192,-264 -94,-251 5,-264 C105,-277 210,-259 300,-272" fill="none" stroke="#fff6af" stroke-width="1.5"/>
        <path d="M-306,-188 C-176,-204 -71,-186 64,-200 C161,-210 250,-193 312,-206" fill="none" stroke="#e7b719" stroke-width="1"/>
        <path d="M-300,-32 C-205,-41 -83,-23 10,-41 C114,-61 212,-38 316,-50" fill="none" stroke="#bd8610" stroke-width="0.9"/>
        <path d="M-298,84 C-166,67 -67,91 49,74 C158,58 244,80 315,70" fill="none" stroke="#fff1a2" stroke-width="1.2"/>
        <path d="M-284,192 C-170,178 -64,199 39,183 C143,167 234,192 300,176" fill="none" stroke="#b97c09" stroke-width="0.8"/>
      </g>

      <path d="M244,149 C283,158 312,177 326,220 C291,220 259,208 238,184 C232,172 235,158 244,149 Z" fill="#c88f0a" opacity="0.16"/>
      <path d="M244,149 C282,157 310,178 326,220 C290,216 259,205 239,181 C233,170 235,157 244,149 Z" fill="url(#cornerFront)"/>
      <path d="M244,149 C279,158 307,178 326,220" fill="none" stroke="#d1960d" stroke-opacity="0.32" stroke-width="2"/>
      <path d="M244,149 C278,158 305,178 326,220 L236,221 C237,194 239,170 244,149 Z" fill="url(#cornerShade)" opacity="0.62"/>
    </g>

    <g transform="translate(0 6)" filter="url(#ballpointWobble)">
      <g opacity="0.9">
        ${textPaths}
      </g>
      <g transform="translate(0.55 -0.35)" opacity="0.11">
        ${textPaths}
      </g>
      <g mask="url(#inkMask)" opacity="1">
        ${inkTextureStrokes}
        ${dryInkBreaks}
      </g>
    </g>
  </g>
</svg>`;

await fs.mkdir("public/images", { recursive: true });
await fs.writeFile("public/images/post-it-reworking.svg", svg);
await sharp(Buffer.from(svg)).png().toFile("public/images/post-it-reworking.png");

console.log("Generated public/images/post-it-reworking.png");

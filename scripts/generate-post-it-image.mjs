import fs from "node:fs/promises";
import sharp from "sharp";
import TextToSVG from "text-to-svg";

const textToSvg = TextToSVG.loadSync("public/fonts/caveat-700.ttf");

const textLines = [
  { text: "I'm", x: 0, y: -82, size: 112, rotate: -2 },
  { text: "reworking", x: 4, y: 30, size: 100, rotate: -1 },
  { text: "this place", x: 8, y: 130, size: 98, rotate: -1.5 }
];

const textPaths = textLines
  .map(({ text, x, y, size, rotate }) => {
    const path = textToSvg.getPath(text, {
      x,
      y,
      fontSize: size,
      anchor: "center middle",
      attributes: {
        fill: "#15130f"
      }
    });

    return `<g transform="rotate(${rotate} ${x} ${y})">${path}</g>`;
  })
  .join("\n");

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

    <g transform="translate(0 6)">
      ${textPaths}
    </g>
  </g>
</svg>`;

await fs.mkdir("public/images", { recursive: true });
await fs.writeFile("public/images/post-it-reworking.svg", svg);
await sharp(Buffer.from(svg)).png().toFile("public/images/post-it-reworking.png");

console.log("Generated public/images/post-it-reworking.png");

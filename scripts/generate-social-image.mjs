import fs from "node:fs/promises";
import { chromium } from "playwright";

const font = await fs.readFile("public/fonts/allo-variable.woff2");
const css = (await fs.readFile("src/styles/site.css", "utf8"))
  .replace('url("/fonts/allo-variable.woff2")', `url("data:font/woff2;base64,${font.toString("base64")}")`);
const executablePath = process.env.CHROMIUM_PATH || await fs.access("/usr/bin/chromium").then(() => "/usr/bin/chromium", () => undefined);
const browser = await chromium.launch({ executablePath, args: ["--no-sandbox", "--disable-dev-shm-usage"] });
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await page.setContent(`<!doctype html><html lang="en"><head><meta charset="UTF-8"><style>
    ${css}
    .site-header { position: absolute; top: 130px; left: 152px; width: 608px; transform: scale(1.85); transform-origin: top left; }
  </style></head><body>
    <header class="site-header">
      <p class="identity-eyebrow">I’m Matthieu</p>
      <a class="identity-name"><span class="identity-letter">B</span><span class="identity-letter">a</span><span class="identity-letter">b</span><span class="identity-letter">e</span></a>
      <p class="intro-line">Design leader at Datadog.</p>
    </header>
  </body></html>`);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: "public/social/og-image.png" });
  console.log("Generated public/social/og-image.png with Allo and the current intro styles.");
} finally {
  await browser.close();
}

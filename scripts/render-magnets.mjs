import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import { chromium } from "playwright";
import sharp from "sharp";

// Render the actual Three.js scene, so the immediate/no-JS image stays identical.
const address = "http://127.0.0.1:4327";
const server = spawn(process.execPath, ["node_modules/astro/astro.js", "dev", "--host", "127.0.0.1", "--port", "4327"], {
  stdio: "ignore", env: { ...process.env, ASTRO_TELEMETRY_DISABLED: "1" }
});
let browser;
try {
  let ready = false;
  for (let attempt = 0; attempt < 80; attempt++) {
    if (server.exitCode !== null) throw new Error("The local rendering server could not start.");
    try { ready = (await fetch(address)).ok; } catch { /* Wait for Astro. */ }
    if (ready) break;
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  if (!ready) throw new Error("The local rendering server did not become ready.");
  const executablePath = process.env.CHROMIUM_PATH || await fs.access("/usr/bin/chromium").then(() => "/usr/bin/chromium", () => undefined);
  browser = await chromium.launch({ executablePath, args: ["--no-sandbox", "--disable-dev-shm-usage", "--enable-unsafe-swiftshader"] });
  const page = await browser.newPage({ viewport: { width: 360, height: 160 }, deviceScaleFactor: 4 });
  await page.route("https://**/*", route => route.abort());
  await page.goto(address, { waitUntil: "domcontentloaded" });
  await page.evaluate(async () => {
    const { createMagnetScene } = await import("/src/scripts/magnet-scene.ts");
    document.documentElement.style.background = "transparent";
    document.body.innerHTML = "";
    document.body.style.cssText = "margin:0;background:transparent";
    const canvas = document.createElement("canvas");
    canvas.style.cssText = "display:block;width:360px;height:160px";
    document.body.append(canvas);
    const scene = createMagnetScene(canvas, 4);
    scene.resize(360, 160);
    window.magnetExport = scene;
  });
  const png = await page.locator("canvas").screenshot({ omitBackground: true });
  await sharp(png).webp({ quality: 96, effort: 6 }).toFile("public/images/babe-magnets.webp");
  await page.evaluate(() => {
    window.magnetExport.poseEntrance([0, 0, 0, 0]);
    window.magnetExport.render();
  });
  const scattered = await page.locator("canvas").screenshot({ omitBackground: true });
  await sharp(scattered).webp({ quality: 96, effort: 6 }).toFile("public/images/babe-magnets-scattered.webp");
  await page.setViewportSize({ width: 256, height: 256 });
  await page.evaluate(async () => {
    window.magnetExport.dispose();
    const { createMagnetScene } = await import("/src/scripts/magnet-scene.ts");
    const canvas = document.querySelector("canvas");
    canvas.style.cssText = "display:block;width:256px;height:256px";
    const icon = createMagnetScene(canvas, 4, { icon: true });
    icon.resize(256, 256);
  });
  await page.locator("canvas").screenshot({ path: "scripts/assets/magnets/magnet-b.png", omitBackground: true });
  console.log("Rendered both 1440 × 640 magnet arrangements and the 1024 × 1024 B icon.");
} finally {
  await browser?.close();
  server.kill();
}

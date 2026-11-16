// The site's CSS ease-out: cubic-bezier(.23, 1, .32, 1).
function easeOut(progress: number) {
  const x = Math.max(0, Math.min(1, progress));
  let t = x;
  for (let i = 0; i < 6; i++) {
    const u = 1 - t;
    const value = 3 * u * u * t * .23 + 3 * u * t * t * .32 + t * t * t;
    const derivative = 3 * u * u * .23 + 6 * u * t * (.32 - .23) + 3 * t * t * (1 - .32);
    t = Math.max(0, Math.min(1, t - (value - x) / Math.max(derivative, .001)));
  }
  return 1 - (1 - t) ** 3;
}
function revealText() {
  const root = document.documentElement;
  if (root.dataset.entrance) root.dataset.entrance = "ready";
}
async function initMagnets() {
  const element = document.querySelector<HTMLAnchorElement>("[data-magnets]");
  if (!element || element.dataset.initialized) return;
  element.dataset.initialized = "true";
  const canvas = element.querySelector<HTMLCanvasElement>("canvas")!;
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  let createScene: typeof import("./magnet-scene")["createMagnetScene"];
  let view: ReturnType<typeof import("./magnet-scene")["createMagnetScene"]>;
  let entering = false;
  let frame = 0;
  let entryStart = 0;
  try {
    createScene = (await import("./magnet-scene")).createMagnetScene;
    if (!document.contains(element)) return;
    entering = !motion.matches && document.documentElement.dataset.entrance === "pending";
    view = createScene(canvas);
    if (entering) view.poseEntrance([0, 0, 0, 0]);
    view.resize(element.clientWidth, element.clientHeight);
    element.dataset.rendered = "true";
    if (entering) document.documentElement.dataset.entrance = "magnets";
    else element.dataset.settled = "true";
  } catch {
    revealText();
    return;
  }
  const finishEntrance = () => {
    entering = false;
    element.dataset.settled = "true";
    revealText();
  };
  const delays = [0, 90, 170, 240];
  const entryDuration = 680;
  const tick = (time: number) => {
    if (entering) {
      const elapsed = time - entryStart;
      view.poseEntrance(delays.map(delay => easeOut((elapsed - delay) / entryDuration)));
      view.render();
      if (elapsed < entryDuration + delays[3]) {
        frame = requestAnimationFrame(tick);
        return;
      }
      finishEntrance();
      frame = 0;
      return;
    }
    frame = 0;
  };
  if (entering) {
    entryStart = performance.now() + 150;
    frame = requestAnimationFrame(tick);
  }
  const resize = new ResizeObserver(() => view.resize(element.clientWidth, element.clientHeight));
  resize.observe(element);
  const reset = () => {
    if (!motion.matches || !entering) return;
    cancelAnimationFrame(frame);
    frame = 0;
    view.poseEntrance([1, 1, 1, 1]);
    view.render();
    finishEntrance();
  };
  motion.addEventListener("change", reset);
  canvas.addEventListener("webglcontextlost", event => {
    event.preventDefault();
    cancelAnimationFrame(frame);
    frame = 0;
    delete element.dataset.rendered;
    if (entering) finishEntrance();
  });
  canvas.addEventListener("webglcontextrestored", () => {
    view.dispose();
    try {
      view = createScene(canvas);
      view.resize(element.clientWidth, element.clientHeight);
      element.dataset.rendered = "true";
    } catch { /* The still image remains visible if recovery fails. */ }
  });
  const cleanup = () => {
    if (document.contains(element)) return;
    cancelAnimationFrame(frame);
    resize.disconnect();
    view.dispose();
    motion.removeEventListener("change", reset);
    document.removeEventListener("astro:after-swap", cleanup);
  };
  document.addEventListener("astro:after-swap", cleanup);
}
document.addEventListener("astro:page-load", () => void initMagnets());

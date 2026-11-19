type MagnetView = ReturnType<typeof import("./magnet-scene")["createMagnetScene"]>;

function initExperiment() {
  const root = document.querySelector<HTMLElement>("[data-magnet-experiment]");
  if (!root || root.dataset.initialized) return;
  root.dataset.initialized = "true";
  const stage = root.querySelector<HTMLElement>("[data-magnet-stage]")!;
  const canvas = root.querySelector<HTMLCanvasElement>("canvas")!;
  const handles = [...root.querySelectorAll<HTMLButtonElement>("[data-letter]")];
  const resetButton = root.querySelector<HTMLButtonElement>("[data-magnet-reset]")!;
  const status = root.querySelector<HTMLElement>("[data-magnet-status]")!;
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  const controller = new AbortController();
  const { signal } = controller;
  let view: MagnetView | undefined;
  let createScene: typeof import("./magnet-scene")["createMagnetScene"];
  let resizeObserver: ResizeObserver | undefined;
  let visibilityObserver: IntersectionObserver | undefined;
  let animationFrame = 0;
  let previousFrame = 0;
  let drag: { index: number; pointerId: number; offsetX: number; offsetY: number } | undefined;
  let layerOrder = [0, 1, 2, 3];
  const names = ["Capital B", "a", "Lowercase b", "e"];
  const pixelRatio = () => Math.min(devicePixelRatio, 3, Math.sqrt(1_200_000 / (stage.clientWidth * stage.clientHeight)));
  const padding = () => view ? (view.camera.right - view.camera.left) * 16 / stage.clientWidth : 0;
  const promote = (index: number) => {
    layerOrder = layerOrder.filter(item => item !== index).concat(index);
    layerOrder.forEach((letter, rank) => { handles[letter].style.zIndex = String(rank + 1); });
  };
  const dirty = () => view?.letters.some(({ mesh, position }) => Math.abs(mesh.position.x - position.x) + Math.abs(mesh.position.y - position.y) > .001) ?? false;
  const updateHandles = () => {
    const current = view;
    if (!current) return;
    handles.forEach((handle, index) => {
      const rect = current.letterRect(index);
      const width = Math.max(44, rect.width * stage.clientWidth);
      const height = Math.max(44, rect.height * stage.clientHeight);
      const x = (rect.x + rect.width / 2) * stage.clientWidth - width / 2;
      const y = (rect.y + rect.height / 2) * stage.clientHeight - height / 2;
      handle.style.width = `${width}px`;
      handle.style.height = `${height}px`;
      handle.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    });
    resetButton.disabled = !dirty();
  };
  const paint = (time: number) => {
    animationFrame = 0;
    if (!view || signal.aborted || !root.dataset.rendered) return;
    const elapsed = previousFrame ? Math.max(0, time - previousFrame) : 16;
    const settling = view.updateLift(drag?.index, elapsed, motion.matches);
    view.render();
    updateHandles();
    previousFrame = settling ? time : 0;
    if (settling) invalidate();
  };
  function invalidate() {
    if (!animationFrame) animationFrame = requestAnimationFrame(paint);
  }
  const stopAnimation = () => {
    cancelAnimationFrame(animationFrame);
    animationFrame = 0;
    previousFrame = 0;
  };
  const point = (event: PointerEvent) => {
    const rect = stage.getBoundingClientRect();
    return view!.pointerPosition((event.clientX - rect.left) / rect.width, (event.clientY - rect.top) / rect.height);
  };
  const finishDrag = (event?: PointerEvent) => {
    if (!drag || (event && event.pointerId !== drag.pointerId)) return;
    const pointerId = drag.pointerId;
    drag = undefined;
    delete stage.dataset.dragging;
    if (stage.hasPointerCapture(pointerId)) stage.releasePointerCapture(pointerId);
    invalidate();
  };
  const reset = (index?: number) => {
    const current = view;
    if (!current || !root.dataset.rendered) return;
    finishDrag();
    const placed = current.resetLetters(index);
    invalidate();
    if (index === undefined) status.textContent = "All four letters are back in place.";
    else status.textContent = placed ? `${names[index]} is back in place.` : `${names[index]}’s starting spot is blocked. Use Reset to move all the letters back.`;
  };
  const resize = () => {
    const current = view;
    if (!current || !stage.clientWidth || !stage.clientHeight) return;
    current.renderer.setPixelRatio(pixelRatio());
    current.resize(stage.clientWidth, stage.clientHeight);
    current.fitLetters(padding());
    invalidate();
  };
  const reveal = () => {
    root.dataset.rendered = "true";
    updateHandles();
    root.querySelectorAll<HTMLElement>("[data-magnet-controls]").forEach(element => { element.hidden = false; });
  };
  const conceal = () => {
    delete root.dataset.rendered;
    root.querySelectorAll<HTMLElement>("[data-magnet-controls]").forEach(element => { element.hidden = true; });
  };
  const start = async () => {
    visibilityObserver?.disconnect();
    if (signal.aborted) return;
    try {
      createScene = (await import("./magnet-scene")).createMagnetScene;
      if (signal.aborted || !root.isConnected) return;
      view = createScene(canvas, pixelRatio(), { opaque: true });
      view.resize(stage.clientWidth, stage.clientHeight);
      reveal();
      resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(stage);
    } catch { conceal(); }
  };

  stage.addEventListener("pointerdown", event => {
    const current = view;
    const targetHandle = (event.target as HTMLElement).closest<HTMLButtonElement>("[data-letter]");
    if (!current || event.button !== 0 || drag || !root.dataset.rendered) return;
    const rect = stage.getBoundingClientRect();
    const hit = current.pickLetter((event.clientX - rect.left) / rect.width, (event.clientY - rect.top) / rect.height);
    // Keep hollow letters easy to grab even when the pointer lands in a counter.
    const index = hit ?? (targetHandle ? Number(targetHandle.dataset.letter) : undefined);
    if (index === undefined) return;
    const handle = handles[index];
    event.preventDefault();
    handle.dataset.pointerFocus = "true";
    handle.focus({ preventScroll: true });
    const position = point(event);
    const mesh = current.letters[index].mesh;
    drag = { index, pointerId: event.pointerId, offsetX: position.x - mesh.position.x, offsetY: position.y - mesh.position.y };
    promote(index);
    stage.dataset.dragging = "true";
    stage.setPointerCapture(event.pointerId);
    invalidate();
  }, { signal });
  stage.addEventListener("pointermove", event => {
    if (!view || !drag || event.pointerId !== drag.pointerId) return;
    event.preventDefault();
    const position = point(event);
    view.moveLetter(drag.index, position.x - drag.offsetX, position.y - drag.offsetY, padding());
    invalidate();
  }, { signal });
  stage.addEventListener("pointerup", finishDrag, { signal });
  stage.addEventListener("pointercancel", finishDrag, { signal });
  stage.addEventListener("lostpointercapture", finishDrag, { signal });
  handles.forEach(handle => handle.addEventListener("blur", () => { delete handle.dataset.pointerFocus; }, { signal }));
  root.addEventListener("keydown", event => {
    const current = view;
    const handle = (event.target as HTMLElement).closest<HTMLButtonElement>("[data-letter]");
    if (!current || !handle) return;
    const index = Number(handle.dataset.letter);
    delete handle.dataset.pointerFocus;
    if (event.key === "Home") { event.preventDefault(); reset(index); return; }
    const directions: Record<string, [number, number, string]> = {
      ArrowLeft: [-1, 0, "left"], ArrowRight: [1, 0, "right"], ArrowUp: [0, 1, "up"], ArrowDown: [0, -1, "down"]
    };
    const direction = directions[event.key];
    if (!direction) return;
    event.preventDefault();
    finishDrag();
    promote(index);
    const step = (current.camera.right - current.camera.left) / stage.clientWidth * (event.shiftKey ? 30 : 10);
    const mesh = current.letters[index].mesh;
    const moved = current.moveLetter(index, mesh.position.x + direction[0] * step, mesh.position.y + direction[1] * step, padding());
    invalidate();
    status.textContent = moved ? `${names[index]} moved ${direction[2]}.` : `${names[index]} is blocked ${direction[2]}.`;
  }, { signal });
  resetButton.addEventListener("click", () => reset(), { signal });
  motion.addEventListener("change", invalidate, { signal });
  canvas.addEventListener("webglcontextlost", event => {
    event.preventDefault();
    conceal();
    finishDrag();
    stopAnimation();
  }, { signal });
  canvas.addEventListener("webglcontextrestored", () => {
    if (signal.aborted) return;
    view?.dispose();
    try {
      view = createScene(canvas, pixelRatio(), { opaque: true });
      layerOrder = [0, 1, 2, 3];
      view.resize(stage.clientWidth, stage.clientHeight);
      reveal();
    } catch { conceal(); }
  }, { signal });
  const cleanup = () => {
    if (root.isConnected) return;
    controller.abort();
    finishDrag();
    stopAnimation();
    visibilityObserver?.disconnect();
    resizeObserver?.disconnect();
    view?.dispose();
    view?.renderer.forceContextLoss();
    document.removeEventListener("astro:after-swap", cleanup);
  };
  document.addEventListener("astro:after-swap", cleanup);
  if ("IntersectionObserver" in window) {
    visibilityObserver = new IntersectionObserver(entries => { if (entries.some(entry => entry.isIntersecting)) void start(); }, { rootMargin: "180px 0px" });
    visibilityObserver.observe(stage);
  } else void start();
}
document.addEventListener("astro:page-load", initExperiment);

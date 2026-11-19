export {};

type GummySurface = ReturnType<typeof import("./gummy-surface")["createGummySurface"]>;

type Spring = { value: number; velocity: number; target: number };
type Grab = {
  pointerId: number;
  startX: number;
  startY: number;
  offsetX: number;
  offsetY: number;
  moved: boolean;
};

const directions = new Map<string, [number, number]>([
  ["ArrowLeft", [-1, 0]],
  ["ArrowRight", [1, 0]],
  ["ArrowUp", [0, -1]],
  ["ArrowDown", [0, 1]]
]);

function advance(spring: Spring, seconds: number, stiffness: number, damping: number) {
  spring.velocity += ((spring.target - spring.value) * stiffness - spring.velocity * damping) * seconds;
  spring.value += spring.velocity * seconds;
  if (Math.abs(spring.target - spring.value) < .015 && Math.abs(spring.velocity) < .12) {
    spring.value = spring.target;
    spring.velocity = 0;
  }
}

function mountGummy(stage: HTMLElement) {
  const object = stage.querySelector<HTMLElement>("[data-gummy-object]");
  const material = stage.querySelector<HTMLElement>("[data-gummy-material]");
  const image = stage.querySelector<HTMLImageElement>("[data-gummy-art]");
  const canvas = stage.querySelector("canvas");
  const handle = stage.querySelector<HTMLButtonElement>("[data-gummy-handle]");
  if (!object || !material || !image || !canvas || !handle) return;

  const controller = new AbortController();
  const { signal } = controller;
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  const x: Spring = { value: 0, velocity: 0, target: 0 };
  const y: Spring = { value: 0, velocity: 0, target: 0 };
  const press: Spring = { value: 0, velocity: 0, target: 0 };
  const springs = [x, y, press];
  let reachX = 1;
  let reachY = 1;
  let anchorX = .5;
  let anchorY = .52;
  let grab: Grab | undefined;
  let surface: GummySurface | undefined;
  let deferMesh = false;
  let contextLost = false;
  let requestingSurface = false;
  let frame = 0;
  let lastFrame = 0;

  function render() {
    object!.style.transform = `translate3d(${x.value}px, ${y.value}px, 0)`;
    const pullX = x.value / reachX;
    const pullY = y.value / reachY;
    const pressure = Math.max(0, Math.min(1, press.value));
    const tension = Math.min(1, Math.hypot(pullX, pullY));
    const moving = tension > .002 || pressure > .002;
    if (!moving && !grab) deferMesh = false;
    const mesh = !deferMesh && !contextLost && !motion.matches && moving ? surface : undefined;

    if (motion.matches) {
      material!.style.transform = "";
    } else {
      const direction = Math.atan2(pullY, pullX);
      const stretch = 1 + tension * (mesh ? .075 : .19);
      const tilt = pullX * 7 - pullY * .85;
      const squeeze = mesh ? 0 : .055 * pressure;
      material!.style.transform =
        `rotate(${tilt}deg) rotate(${direction}rad) scale(${stretch}, ${1 / stretch}) rotate(${-direction}rad) scale(${1 + squeeze}, ${1 - squeeze})`;
    }
    mesh?.render(pullX, pullY, anchorX, anchorY, pressure);
    stage.toggleAttribute("data-deforming", !!mesh);
  }

  function update() {
    if (signal.aborted || frame) return;
    if (motion.matches) {
      for (const spring of springs) {
        spring.value = spring.target;
        spring.velocity = 0;
      }
      render();
    } else {
      frame = requestAnimationFrame(tick);
    }
  }

  function tick(time: number) {
    frame = 0;
    if (signal.aborted) return;
    const seconds = lastFrame ? Math.min((time - lastFrame) / 1000, .032) : 1 / 60;
    if (motion.matches) {
      lastFrame = 0;
      update();
      return;
    }
    for (const spring of [x, y]) advance(spring, seconds, grab ? 480 : 185, grab ? 34 : 14);
    advance(press, seconds, grab ? 460 : 240, grab ? 34 : 19);
    render();
    if (springs.some(spring => spring.value !== spring.target || spring.velocity)) {
      lastFrame = time;
      update();
    } else {
      lastFrame = 0;
    }
  }

  function measure() {
    const width = object!.offsetWidth;
    const height = object!.offsetHeight;
    if (!width || !height) return;
    // The artwork has a transparent border. Leave extra room for its elastic edge.
    reachX = Math.max(12, Math.min(width * .41, (stage.clientWidth - width * .81) / 2 - 9));
    reachY = Math.max(12, Math.min(height * .31, (stage.clientHeight - height * .9) / 2 - 12));
    if (!contextLost) surface?.resize(width, height);
    update();
  }

  const release = (event?: PointerEvent) => {
    if (!grab || (event && grab.pointerId !== event.pointerId)) return;
    const { pointerId, moved } = grab;
    grab = undefined;
    delete stage.dataset.dragging;
    if (handle.hasPointerCapture(pointerId)) handle.releasePointerCapture(pointerId);
    x.target = y.target = press.target = 0;
    x.velocity *= .64;
    y.velocity *= .64;
    if (!moved && event?.type === "pointerup" && !motion.matches) {
      press.value = Math.max(.37, press.value);
      y.velocity -= 68;
    }
    update();
  };

  const reset = () => {
    release();
    for (const spring of springs) spring.value = spring.target = spring.velocity = 0;
    render();
  };

  const imageReady = image.decode().then(() => {
    if (signal.aborted) return false;
    handle.hidden = false;
    image.setAttribute("aria-hidden", "true");
    return true;
  }, () => false);

  async function prepareSurface() {
    if (motion.matches || requestingSurface || surface || signal.aborted) return;
    requestingSurface = true;
    try {
      if (!await imageReady || signal.aborted) return;
      const { createGummySurface } = await import("./gummy-surface");
      if (signal.aborted || motion.matches) return;
      surface = createGummySurface(canvas!, image!);
      deferMesh = Boolean(grab || springs.some(spring => spring.value || spring.velocity));
      measure();
      surface.render(0, 0, .5, .52, 0);
    } catch {
      // The original image uses the same spring when a WebGL context is unavailable.
    } finally {
      requestingSurface = false;
    }
  }

  handle.addEventListener("pointerdown", event => {
    if (event.button !== 0 || grab) return;
    event.preventDefault();
    handle.dataset.pointerFocus = "";
    handle.focus({ preventScroll: true });
    const bounds = object.getBoundingClientRect();
    anchorX = (event.clientX - bounds.left) / bounds.width;
    anchorY = (event.clientY - bounds.top) / bounds.height;
    grab = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      offsetX: x.value,
      offsetY: y.value,
      moved: false
    };
    x.target = x.value;
    y.target = y.value;
    x.velocity = y.velocity = 0;
    press.target = 1;
    stage.dataset.dragging = "";
    handle.setPointerCapture(event.pointerId);
    update();
  }, { signal });

  handle.addEventListener("pointermove", event => {
    if (!grab || grab.pointerId !== event.pointerId) return;
    const dx = event.clientX - grab.startX;
    const dy = event.clientY - grab.startY;
    if (Math.hypot(dx, dy) > 4) grab.moved = true;
    x.target = reachX * Math.tanh((grab.offsetX + dx) / reachX);
    y.target = reachY * Math.tanh((grab.offsetY + dy) / reachY);
    update();
  }, { signal });

  for (const event of ["pointerup", "pointercancel", "lostpointercapture"] as const) {
    handle.addEventListener(event, release, { signal });
  }
  handle.addEventListener("blur", () => {
    delete handle.dataset.pointerFocus;
    if (motion.matches && !grab) reset();
  }, { signal });

  const pulse = (dx: number, dy: number) => {
    anchorX = .5;
    anchorY = .52;
    x.velocity += dx * 270;
    y.velocity += dy * 270;
    press.value = Math.max(.58, press.value);
    update();
  };
  handle.addEventListener("click", event => {
    if (event.detail === 0 && !motion.matches && !grab) pulse(0, -1);
  }, { signal });
  handle.addEventListener("keydown", event => {
    delete handle.dataset.pointerFocus;
    if (event.key === "Escape") {
      event.preventDefault();
      reset();
      return;
    }
    const direction = directions.get(event.key);
    if (!direction) return;
    event.preventDefault();
    if (event.repeat || grab) return;
    if (motion.matches) {
      x.target = direction[0] * Math.min(14, reachX * .42);
      y.target = direction[1] * Math.min(14, reachY * .42);
      update();
    } else {
      pulse(...direction);
    }
  }, { signal });
  handle.addEventListener("keyup", event => {
    if (motion.matches && directions.has(event.key) && !grab) reset();
  }, { signal });

  canvas.addEventListener("webglcontextlost", event => {
    event.preventDefault();
    contextLost = true;
    render();
  }, { signal });
  canvas.addEventListener("webglcontextrestored", () => {
    contextLost = false;
    measure();
  }, { signal });
  window.addEventListener("blur", () => { release(); }, { signal });
  window.addEventListener("pagehide", reset, { signal });
  motion.addEventListener("change", () => {
    if (!grab) reset();
    if (!motion.matches) void prepareSurface();
    update();
  }, { signal });

  const resizeObserver = new ResizeObserver(measure);
  resizeObserver.observe(stage);
  measure();
  const visibilityObserver = new IntersectionObserver(entries => {
    if (!entries.some(entry => entry.isIntersecting)) return;
    visibilityObserver.disconnect();
    void prepareSurface();
  }, { rootMargin: "130px 0px" });
  visibilityObserver.observe(stage);

  return () => {
    controller.abort();
    release();
    cancelAnimationFrame(frame);
    resizeObserver.disconnect();
    visibilityObserver.disconnect();
    surface?.dispose();
    reset();
    handle.hidden = true;
    image.removeAttribute("aria-hidden");
  };
}

class GummyPlayground extends HTMLElement {
  private teardown?: () => void;

  connectedCallback() {
    this.teardown ??= mountGummy(this);
  }

  disconnectedCallback() {
    this.teardown?.();
    this.teardown = undefined;
  }
}

if (!customElements.get("gummy-playground")) customElements.define("gummy-playground", GummyPlayground);

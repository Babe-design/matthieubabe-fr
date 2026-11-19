type Point = { x: number; y: number };
type Stroke = { points: Point[]; endedAt: number | null };

const holdMs = 3000;
const fadeMs = 800;
const ink = "#353a3c";
const clamp = (value: number) => Math.max(0, Math.min(1, value));
const directions = new Map<string, Point>([
  ["ArrowLeft", { x: -1, y: 0 }],
  ["ArrowRight", { x: 1, y: 0 }],
  ["ArrowUp", { x: 0, y: -1 }],
  ["ArrowDown", { x: 0, y: 1 }]
]);

function mountPad(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
  const controller = new AbortController();
  const { signal } = controller;
  let strokes: Stroke[] = [];
  let activeStroke: Stroke | null = null;
  let pointerId: number | null = null;
  let pen: Point = { x: .5, y: .5 };
  let frame: number | undefined;
  let timer: number | undefined;
  let width = 1;
  let height = 1;

  function render(now: number) {
    frame = undefined;
    context.clearRect(0, 0, width, height);
    context.strokeStyle = context.fillStyle = ink;
    context.lineWidth = 1.7;
    context.lineCap = context.lineJoin = "round";

    strokes = strokes.filter(({ endedAt }) => endedAt === null || now - endedAt < holdMs + fadeMs);
    let nextFade = Infinity;
    for (const { points, endedAt } of strokes) {
      const fadeAt = endedAt === null ? Infinity : endedAt + holdMs;
      nextFade = Math.min(nextFade, fadeAt);
      context.globalAlpha = 1 - clamp((now - fadeAt) / fadeMs);

      const first = points[0];
      context.beginPath();
      if (points.length === 1) {
        context.arc(first.x * width, first.y * height, .85, 0, Math.PI * 2);
        context.fill();
      } else {
        context.moveTo(first.x * width, first.y * height);
        for (let i = 1; i < points.length; i++) context.lineTo(points[i].x * width, points[i].y * height);
        context.stroke();
      }
    }

    context.globalAlpha = 1;
    if (canvas.matches(":focus") && !canvas.hasAttribute("data-pointer-focus")) {
      context.beginPath();
      context.arc(pen.x * width, pen.y * height, 4, 0, Math.PI * 2);
      context.lineWidth = 1;
      context.stroke();
    }

    // A stationary stroke doesn't need a render loop until it starts fading.
    if (nextFade <= now) schedule();
    else if (nextFade < Infinity) timer = window.setTimeout(schedule, nextFade - now);
  }

  function schedule() {
    window.clearTimeout(timer);
    frame ??= requestAnimationFrame(render);
  }

  function finishStroke() {
    if (activeStroke) activeStroke.endedAt = performance.now();
    activeStroke = null;
    const captured = pointerId;
    pointerId = null;
    if (captured !== null && canvas.hasPointerCapture(captured)) canvas.releasePointerCapture(captured);
    schedule();
  }

  function beginStroke(point: Point) {
    activeStroke = { points: [point], endedAt: null };
    strokes.push(activeStroke);
    schedule();
  }

  function addPoint(point: Point) {
    if (!activeStroke) return;
    const points = activeStroke.points;
    const last = points[points.length - 1];
    if (last.x === point.x && last.y === point.y) return;
    points.push(point);
    schedule();
  }

  function pointerPosition(event: PointerEvent) {
    const rect = canvas.getBoundingClientRect();
    return { x: clamp((event.clientX - rect.left) / rect.width), y: clamp((event.clientY - rect.top) / rect.height) };
  }

  function resize() {
    width = Math.max(1, canvas.clientWidth);
    height = Math.max(1, canvas.clientHeight);
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(canvas.width / width, 0, 0, canvas.height / height, 0, 0);
    schedule();
  }

  canvas.addEventListener("pointerdown", event => {
    if (pointerId !== null || !event.isPrimary || event.button !== 0) return;
    finishStroke();
    pointerId = event.pointerId;
    canvas.setPointerCapture(pointerId);
    canvas.dataset.pointerFocus = "true";
    canvas.focus({ preventScroll: true });
    beginStroke(pointerPosition(event));
  }, { signal });

  canvas.addEventListener("pointermove", event => {
    if (event.pointerId === pointerId) addPoint(pointerPosition(event));
  }, { signal });

  canvas.addEventListener("pointerup", event => {
    if (event.pointerId !== pointerId) return;
    addPoint(pointerPosition(event));
    finishStroke();
  }, { signal });

  for (const type of ["pointercancel", "lostpointercapture"] as const) {
    canvas.addEventListener(type, event => {
      if (event.pointerId === pointerId) finishStroke();
    }, { signal });
  }

  canvas.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      event.preventDefault();
      delete canvas.dataset.pointerFocus;
      finishStroke();
      strokes = [];
      return;
    }
    if (pointerId !== null) return;

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (event.repeat) return;
      delete canvas.dataset.pointerFocus;
      if (activeStroke) finishStroke();
      else beginStroke(pen);
      return;
    }

    const direction = directions.get(event.key);
    if (!direction) return;
    event.preventDefault();
    delete canvas.dataset.pointerFocus;
    const step = event.shiftKey ? 18 : 6;
    pen = { x: clamp(pen.x + direction.x * step / width), y: clamp(pen.y + direction.y * step / height) };
    addPoint(pen);
    schedule();
  }, { signal });

  canvas.addEventListener("focus", schedule, { signal });
  canvas.addEventListener("blur", () => {
    delete canvas.dataset.pointerFocus;
    finishStroke();
  }, { signal });

  canvas.hidden = false;
  canvas.tabIndex = 0;
  canvas.setAttribute("role", "application");
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  resize();

  return () => {
    controller.abort();
    observer.disconnect();
    window.clearTimeout(timer);
    if (frame !== undefined) cancelAnimationFrame(frame);
    delete canvas.dataset.pointerFocus;
  };
}

class TemporaryDrawingPad extends HTMLElement {
  private dispose?: () => void;

  connectedCallback() {
    const canvas = this.querySelector("canvas");
    const context = canvas?.getContext("2d");
    if (canvas && context) this.dispose = mountPad(canvas, context);
  }

  disconnectedCallback() {
    this.dispose?.();
    this.dispose = undefined;
  }
}

customElements.define("temporary-drawing-pad", TemporaryDrawingPad);

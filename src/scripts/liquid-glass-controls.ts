type LiquidCore = typeof import("@liquid-dom/core");
type LiquidRenderer = InstanceType<LiquidCore["Renderer"]>;
type LiquidScene = InstanceType<LiquidCore["Scene"]>;
type LiquidHtml = InstanceType<LiquidCore["Html"]>;
type LiquidContainer = InstanceType<LiquidCore["Container"]>;
type LiquidGlass = InstanceType<LiquidCore["Glass"]>;

type ControlKind = "background-switcher" | "socials";

type LiquidControlOptions = {
  kind: ControlKind;
  selector: string;
  padding: number;
  selectedSelector?: string;
};

type GlassPreset = {
  outerTint: LiquidColor;
  selectedTint: LiquidColor;
  shadow: LiquidColor;
  specularOpacity: number;
  reflectionOffset: number;
  dispersion: number;
};

type LiquidColor = {
  r: number;
  g: number;
  b: number;
  a: number;
};

type LiquidState = "active" | "fallback" | "unsupported";

declare global {
  interface Window {
    __matthieuLiquidGlass?: {
      state: LiquidState;
      reason?: string;
      refresh?: () => void;
      destroy?: () => void;
    };
  }
}

const controlOptions: LiquidControlOptions[] = [
  {
    kind: "background-switcher",
    selector: ".background-switcher",
    padding: 18,
    selectedSelector: ".background-button[aria-pressed='true']"
  },
  {
    kind: "socials",
    selector: ".socials",
    padding: 18
  }
];

const glassPresets: Record<string, GlassPreset> = {
  paper: {
    outerTint: { r: 0.09, g: 0.09, b: 0.1, a: 0.54 },
    selectedTint: { r: 1, g: 1, b: 1, a: 0.62 },
    shadow: { r: 0, g: 0, b: 0, a: 0.18 },
    specularOpacity: 0.56,
    reflectionOffset: 18,
    dispersion: 0.012
  },
  cutting: {
    outerTint: { r: 0.78, g: 0.9, b: 0.82, a: 0.44 },
    selectedTint: { r: 0.96, g: 1, b: 0.98, a: 0.72 },
    shadow: { r: 0, g: 0.04, b: 0.02, a: 0.24 },
    specularOpacity: 0.62,
    reflectionOffset: 22,
    dispersion: 0.016
  },
  blueprint: {
    outerTint: { r: 0.8, g: 0.87, b: 0.98, a: 0.44 },
    selectedTint: { r: 0.96, g: 0.98, b: 1, a: 0.72 },
    shadow: { r: 0, g: 0.03, b: 0.08, a: 0.24 },
    specularOpacity: 0.62,
    reflectionOffset: 22,
    dispersion: 0.018
  }
};

const setDebugState = (state: LiquidState, reason?: string) => {
  document.documentElement.dataset.liquidGlass = state;

  if (reason) {
    document.documentElement.dataset.liquidGlassReason = reason;
  } else {
    delete document.documentElement.dataset.liquidGlassReason;
  }

  window.__matthieuLiquidGlass = {
    ...window.__matthieuLiquidGlass,
    state,
    reason
  };
};

const getFeatureSupport = () => {
  const win = window as Window & typeof globalThis & {
    CanvasRenderingContext2D?: { prototype?: Record<string, unknown> };
    GPUQueue?: { prototype?: Record<string, unknown> };
    HTMLCanvasElement?: { prototype?: Record<string, unknown> };
  };
  const navigatorWithGpu = win.navigator as Navigator & { gpu?: unknown };
  const canvasPrototype = win.HTMLCanvasElement?.prototype;
  const contextPrototype = win.CanvasRenderingContext2D?.prototype;
  const queuePrototype = win.GPUQueue?.prototype;
  const hasWebGpu = Boolean(navigatorWithGpu?.gpu);
  const hasLayoutSubtree = Boolean(canvasPrototype && "layoutSubtree" in canvasPrototype);
  const hasCanvasPaint = Boolean(
    canvasPrototype && ("onpaint" in canvasPrototype || "requestPaint" in canvasPrototype)
  );
  const hasElementCopy =
    Boolean(contextPrototype && "drawElementImage" in contextPrototype) ||
    Boolean(queuePrototype && "copyElementImageToTexture" in queuePrototype);

  if (!hasWebGpu) {
    return { supported: false, reason: "missing WebGPU" };
  }

  if (!hasLayoutSubtree || !hasCanvasPaint || !hasElementCopy) {
    return { supported: false, reason: "missing HTML-in-Canvas" };
  }

  return { supported: true };
};

const currentBackground = () => document.documentElement.dataset.background || "paper";

const currentPreset = () => glassPresets[currentBackground()] || glassPresets.paper;

const cssNumber = (value: number) => `${Math.round(value * 1000) / 1000}px`;

const setElementStyles = (element: HTMLElement, styles: Partial<CSSStyleDeclaration>) => {
  Object.assign(element.style, styles);
};

class LiquidGlassControl {
  private readonly core: LiquidCore;
  private readonly element: HTMLElement;
  private readonly options: LiquidControlOptions;
  private readonly scene: LiquidScene;
  private readonly renderer: LiquidRenderer;
  private readonly backdrop: LiquidHtml;
  private readonly backdropElement: HTMLDivElement;
  private readonly outerContainer: LiquidContainer;
  private readonly outerGlass: LiquidGlass;
  private readonly selectedContainer: LiquidContainer | null;
  private readonly selectedGlass: LiquidGlass | null;
  private readonly layer: HTMLDivElement;
  private readonly resizeObserver: ResizeObserver;
  private readonly mutationObserver: MutationObserver;
  private layoutFrame = 0;
  private renderFrame = 0;
  private destroyed = false;

  constructor(core: LiquidCore, element: HTMLElement, options: LiquidControlOptions) {
    this.core = core;
    this.element = element;
    this.options = options;
    this.scene = new core.Scene();
    this.backdropElement = document.createElement("div");
    this.backdrop = new core.Html({
      element: this.backdropElement,
      zIndex: -10
    });
    this.outerContainer = this.createContainer(0);
    this.outerGlass = new core.Glass({
      cornerRadius: 32,
      cornerSmoothing: 0.6
    });
    this.selectedContainer = options.selectedSelector ? this.createContainer(1, true) : null;
    this.selectedGlass = this.selectedContainer
      ? new core.Glass({
          cornerRadius: 28,
          cornerSmoothing: 0.6
        })
      : null;
    this.layer = document.createElement("div");
    this.renderer = new core.Renderer({
      scene: this.scene,
      maxDpr: 2
    });
    this.resizeObserver = new ResizeObserver(() => this.scheduleLayout());
    this.mutationObserver = new MutationObserver(() => this.scheduleLayout());

    this.setupScene();
    this.setupDom();
    this.scheduleLayout();
  }

  refresh() {
    this.scheduleLayout();
  }

  start() {
    this.startRenderLoop();
  }

  destroy() {
    this.destroyed = true;
    cancelAnimationFrame(this.layoutFrame);
    cancelAnimationFrame(this.renderFrame);
    this.resizeObserver.disconnect();
    this.mutationObserver.disconnect();
    this.renderer.destroy();
    this.layer.remove();
  }

  private createContainer(zIndex: number, selected = false) {
    const preset = currentPreset();

    return new this.core.Container({
      zIndex,
      blur: selected ? 10 : 18,
      bezelWidth: selected ? 18 : 22,
      thickness: selected ? 110 : 140,
      displacementFactor: selected ? 1.35 : 1.65,
      displacementBlur: selected ? 5 : 7,
      ior: 1.5,
      contentIor: 1.08,
      contentDepth: selected ? 8 : 12,
      dispersion: preset.dispersion,
      surfaceProfile: "convex",
      lightDirection: -Math.PI / 4,
      specularStrength: selected ? 1.25 : 1.15,
      specularWidth: selected ? 2 : 2.5,
      specularFalloff: 1.2,
      specularSharpness: 2.4,
      specularOpacity: preset.specularOpacity,
      reflectionOffset: preset.reflectionOffset,
      tint: selected ? preset.selectedTint : preset.outerTint,
      shadowColor: selected ? { r: 0, g: 0, b: 0, a: 0.08 } : preset.shadow,
      shadowOffsetY: selected ? 4 : 12,
      shadowBlur: selected ? 14 : 28,
      shadowSpread: selected ? -2 : 0
    });
  }

  private setupScene() {
    this.scene.add(this.backdrop);
    this.outerContainer.add(this.outerGlass);
    this.scene.add(this.outerContainer);

    if (this.selectedContainer && this.selectedGlass) {
      this.selectedContainer.add(this.selectedGlass);
      this.scene.add(this.selectedContainer);
    }
  }

  private setupDom() {
    this.layer.className = "liquid-glass-layer";
    this.layer.setAttribute("aria-hidden", "true");
    this.layer.style.inset = cssNumber(-this.options.padding);

    this.renderer.canvas.classList.add("liquid-glass-canvas");
    this.renderer.canvas.setAttribute("aria-hidden", "true");
    this.renderer.canvas.tabIndex = -1;

    setElementStyles(this.backdropElement, {
      position: "absolute",
      inset: "0",
      pointerEvents: "none"
    });

    this.layer.append(this.renderer.canvas);
    this.element.prepend(this.layer);
    this.resizeObserver.observe(this.element);
    this.resizeObserver.observe(this.layer);
    this.mutationObserver.observe(this.element, {
      attributes: true,
      subtree: true,
      attributeFilter: ["aria-pressed", "style"]
    });
  }

  private scheduleLayout() {
    if (this.destroyed) {
      return;
    }

    cancelAnimationFrame(this.layoutFrame);
    this.layoutFrame = requestAnimationFrame(() => this.layout());
  }

  private layout() {
    if (this.destroyed || !this.element.isConnected) {
      return;
    }

    const controlRect = this.element.getBoundingClientRect();
    const layerRect = this.layer.getBoundingClientRect();
    const relativeX = controlRect.left - layerRect.left;
    const relativeY = controlRect.top - layerRect.top;
    const radius = Math.min(controlRect.width, controlRect.height) / 2;

    this.syncBackdrop(layerRect);
    this.syncPreset();

    this.outerGlass.x = relativeX;
    this.outerGlass.y = relativeY;
    this.outerGlass.width = controlRect.width;
    this.outerGlass.height = controlRect.height;
    this.outerGlass.cornerRadius = radius;

    if (this.selectedGlass && this.options.selectedSelector) {
      const selected = this.element.querySelector<HTMLElement>(this.options.selectedSelector);

      if (selected) {
        const selectedRect = selected.getBoundingClientRect();
        this.selectedGlass.x = selectedRect.left - layerRect.left;
        this.selectedGlass.y = selectedRect.top - layerRect.top;
        this.selectedGlass.width = selectedRect.width;
        this.selectedGlass.height = selectedRect.height;
        this.selectedGlass.cornerRadius = Math.min(selectedRect.width, selectedRect.height) / 2;
        this.selectedContainer!.opacity = 1;
      } else {
        this.selectedContainer!.opacity = 0;
      }
    }
  }

  private syncBackdrop(layerRect: DOMRect) {
    const rootStyles = getComputedStyle(document.documentElement);
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    this.backdrop.x = -layerRect.left;
    this.backdrop.y = -layerRect.top;
    this.backdrop.width = viewportWidth;
    this.backdrop.height = viewportHeight;

    setElementStyles(this.backdropElement, {
      width: cssNumber(viewportWidth),
      height: cssNumber(viewportHeight),
      backgroundColor: rootStyles.backgroundColor,
      backgroundImage: rootStyles.backgroundImage,
      backgroundPosition: rootStyles.backgroundPosition,
      backgroundRepeat: rootStyles.backgroundRepeat,
      backgroundSize: rootStyles.backgroundSize
    });
  }

  private syncPreset() {
    const preset = currentPreset();

    this.outerContainer.tint = preset.outerTint;
    this.outerContainer.shadowColor = preset.shadow;
    this.outerContainer.specularOpacity = preset.specularOpacity;
    this.outerContainer.reflectionOffset = preset.reflectionOffset;
    this.outerContainer.dispersion = preset.dispersion;

    if (this.selectedContainer) {
      this.selectedContainer.tint = preset.selectedTint;
      this.selectedContainer.specularOpacity = Math.min(0.78, preset.specularOpacity + 0.1);
      this.selectedContainer.reflectionOffset = preset.reflectionOffset * 0.75;
      this.selectedContainer.dispersion = preset.dispersion * 0.8;
    }
  }

  private startRenderLoop() {
    const render = () => {
      if (this.destroyed) {
        return;
      }

      try {
        this.renderer.render();
      } catch {
        destroyLiquidGlass("renderer error");
        return;
      }

      this.renderFrame = requestAnimationFrame(render);
    };

    render();
  }
}

let controls: LiquidGlassControl[] = [];
let hasStarted = false;

const refreshLiquidGlass = () => controls.forEach((control) => control.refresh());

const destroyLiquidGlass = (reason?: string) => {
  controls.forEach((control) => control.destroy());
  controls = [];
  document.documentElement.removeAttribute("data-liquid-glass");
  setDebugState(reason ? "fallback" : "unsupported", reason);
};

const initLiquidGlass = async () => {
  setDebugState("unsupported", "checking support");

  const featureSupport = getFeatureSupport();

  if (!featureSupport.supported) {
    setDebugState("unsupported", featureSupport.reason);
    return;
  }

  const targets = controlOptions
    .map((options) => ({
      options,
      element: document.querySelector<HTMLElement>(options.selector)
    }))
    .filter((target): target is { options: LiquidControlOptions; element: HTMLElement } =>
      Boolean(target.element)
    );

  if (targets.length !== controlOptions.length) {
    setDebugState("fallback", "missing controls");
    return;
  }

  const nextControls: LiquidGlassControl[] = [];

  try {
    const core = await import("@liquid-dom/core");

    targets.forEach((target) => {
      nextControls.push(new LiquidGlassControl(core, target.element, target.options));
    });

    controls = nextControls;
    controls.forEach((control) => control.start());

    if (controls.length !== targets.length) {
      return;
    }

    document.documentElement.dataset.liquidGlass = "active";
    setDebugState("active");
  } catch {
    nextControls.forEach((control) => control.destroy());
    destroyLiquidGlass("initialization error");
    return;
  }

  window.__matthieuLiquidGlass = {
    ...window.__matthieuLiquidGlass,
    state: "active",
    refresh: refreshLiquidGlass,
    destroy: () => destroyLiquidGlass("manual destroy")
  };

  const rootObserver = new MutationObserver(() => refreshLiquidGlass());
  rootObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-background"]
  });

  window.addEventListener("resize", refreshLiquidGlass, { passive: true });
  window.addEventListener("orientationchange", refreshLiquidGlass, { passive: true });
  document.addEventListener("visibilitychange", refreshLiquidGlass);
  window.addEventListener("pagehide", () => {
    rootObserver.disconnect();
    destroyLiquidGlass("page hide");
  });
};

const start = () => {
  const run = () => {
    if (hasStarted) {
      return;
    }

    hasStarted = true;
    void initLiquidGlass();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run, { once: true });
    window.addEventListener("load", run, { once: true });
    return;
  }

  run();
};

start();

export {};

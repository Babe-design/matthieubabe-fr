import {
  DynamicDrawUsage,
  Mesh,
  MeshBasicMaterial,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  SRGBColorSpace,
  Texture,
  WebGLRenderer,
  type BufferAttribute
} from "three";

// The canvas extends 16% past each edge of the still image.
const canvasScale = 1.32;
const halfCanvas = canvasScale / 2;
const gridSteps = 24;

export function createGummySurface(canvas: HTMLCanvasElement, image: HTMLImageElement) {
  if (!image.complete || !image.naturalWidth) throw new Error("The gummy image is unavailable");

  const context = canvas.getContext("webgl2", { alpha: true, depth: false, powerPreference: "low-power" });
  if (!context) throw new Error("The gummy renderer needs WebGL 2");

  const renderer = new WebGLRenderer({ canvas, context });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = SRGBColorSpace;

  const texture = new Texture(image);
  texture.colorSpace = SRGBColorSpace;
  texture.needsUpdate = true;

  const geometry = new PlaneGeometry(1, 1, gridSteps, gridSteps);
  const positions = geometry.attributes.position as BufferAttribute;
  const rest = positions.clone();
  positions.setUsage(DynamicDrawUsage);

  const material = new MeshBasicMaterial({ map: texture, transparent: true, toneMapped: false, depthTest: false, depthWrite: false });
  const gummy = new Mesh(geometry, material);
  gummy.frustumCulled = false;
  const scene = new Scene();
  scene.add(gummy);

  const camera = new OrthographicCamera(-halfCanvas, halfCanvas, halfCanvas, -halfCanvas, .1, 5);
  camera.position.z = 2;
  let disposed = false;

  return {
    resize(width: number, height: number) {
      if (disposed || width <= 0 || height <= 0) return;
      const resolution = canvasScale * Math.min(window.devicePixelRatio || 1, 2.5);
      renderer.setSize(Math.round(width * resolution), Math.round(height * resolution), false);
    },

    render(pullX: number, pullY: number, anchorX: number, anchorY: number, pressure: number) {
      if (disposed) return;
      const stretchX = .13 * pullX;
      const stretchY = .13 * pullY;
      const pinch = .085 * pressure;

      for (let index = 0; index < positions.count; index++) {
        const x = rest.getX(index);
        const y = rest.getY(index);
        const dx = x + .5 - anchorX;
        const dy = .5 - y - anchorY;
        const weight = Math.exp(-10 * (dx * dx + dy * dy));

        // Pull and pinch locally while the opposite side of the candy trails behind.
        positions.setXY(index, x + (stretchX - pinch * dx) * weight, y - (stretchY - pinch * dy) * weight);
      }

      positions.needsUpdate = true;
      renderer.render(scene, camera);
    },

    dispose() {
      if (disposed) return;
      disposed = true;
      geometry.dispose();
      material.dispose();
      texture.dispose();
      renderer.dispose();
    }
  };
}

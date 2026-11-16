import {
  NeutralToneMapping, Box3, Color, DataTexture, DirectionalLight, ExtrudeGeometry,
  Group, HemisphereLight, Mesh, MeshPhysicalMaterial, OrthographicCamera,
  PCFShadowMap, PlaneGeometry, PMREMGenerator, Scene, ShadowMaterial,
  ShapePath, SRGBColorSpace, Vector2, Vector3, Raycaster, WebGLRenderer, RGBAFormat, RepeatWrapping, LinearMipmapLinearFilter, LinearFilter
} from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import outlines from "../assets/magnet-outlines.json";

type Letter = keyof typeof outlines;
type OutlineCommand = { type: string; x?: number; y?: number; x1?: number; y1?: number; x2?: number; y2?: number };

function makePlasticGrain() {
  const size = 256;
  const pixels = new Uint8Array(size * size * 4);
  const hash = (x: number, y: number) => {
    const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
    return n - Math.floor(n);
  };
  const noise = (x: number, y: number, frequency: number) => {
    const ix = Math.floor(x), iy = Math.floor(y);
    const ux = x - ix, uy = y - iy;
    const sx = ux * ux * (3 - 2 * ux), sy = uy * uy * (3 - 2 * uy);
    const a = hash(ix % frequency, iy % frequency);
    const b = hash((ix + 1) % frequency, iy % frequency);
    const c = hash(ix % frequency, (iy + 1) % frequency);
    const d = hash((ix + 1) % frequency, (iy + 1) % frequency);
    return (a + (b - a) * sx) * (1 - sy) + (c + (d - c) * sx) * sy;
  };
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const value = noise(x / size * 6, y / size * 6, 6) * .2
      + noise(x / size * 28, y / size * 28, 28) * .3
      + noise(x / size * 96, y / size * 96, 96) * .5;
    const i = (y * size + x) * 4;
    pixels[i] = Math.round(value * 255);
    pixels[i + 1] = Math.round(180 + value * 75);
    pixels[i + 2] = pixels[i];
    pixels[i + 3] = 255;
  }
  const texture = new DataTexture(pixels, size, size, RGBAFormat);
  texture.wrapS = texture.wrapT = RepeatWrapping;
  texture.repeat.set(1.6, 1.6);
  texture.generateMipmaps = true;
  texture.minFilter = LinearMipmapLinearFilter;
  texture.magFilter = LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

export function createMagnetScene(canvas: HTMLCanvasElement, pixelRatio = Math.min(devicePixelRatio, 3), options: { icon?: boolean; opaque?: boolean } = {}) {
  // Request the context explicitly: Three creates an alpha-capable drawing
  // buffer internally even when its renderer-level `alpha` option is false.
  const context = canvas.getContext("webgl2", { alpha: !options.opaque, antialias: true, powerPreference: "low-power" });
  if (!context) throw new Error("WebGL is unavailable; use the rendered magnet image.");
  const renderer = new WebGLRenderer({ canvas, context, antialias: true, alpha: !options.opaque, powerPreference: "low-power" });
  renderer.setPixelRatio(pixelRatio);
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = NeutralToneMapping;
  renderer.toneMappingExposure = .85;
  renderer.setClearColor(0xffffff, options.opaque ? 1 : 0);
  renderer.shadowMap.enabled = true;
  // PCF excludes the receiving plane from the shadow pass. VSM can make that
  // plane shadow itself, producing a hatched rectangle on some graphics drivers.
  renderer.shadowMap.type = PCFShadowMap;
  const scene = new Scene();
  const camera = new OrthographicCamera(-3, 3, 1.2, -1.2, .1, 30);
  camera.position.set(0, 0, 10);

  // Broad studio panels create the soft white reflections of molded plastic.
  const studio = new RoomEnvironment();
  const pmrem = new PMREMGenerator(renderer);
  const environment = pmrem.fromScene(studio, .06);
  scene.environment = environment.texture;
  studio.dispose();
  pmrem.dispose();
  scene.add(new HemisphereLight(0xffffff, 0xd5d4d0, .15));
  const light = new DirectionalLight(0xfffaf1, .9);
  light.position.set(-3, 4, 18);
  light.castShadow = true;
  light.shadow.mapSize.set(1024, 1024);
  light.shadow.camera.left = -4;
  light.shadow.camera.right = 4;
  light.shadow.camera.top = 2.5;
  light.shadow.camera.bottom = -2.5;
  light.shadow.camera.near = .1;
  light.shadow.camera.far = 20;
  light.shadow.bias = -.00015;
  light.shadow.normalBias = .0005;
  light.shadow.radius = 2;
  scene.add(light);

  const surface = new Mesh(new PlaneGeometry(30, 20), new ShadowMaterial({ color: 0x38342f, opacity: .1 }));
  surface.position.z = 0;
  surface.receiveShadow = true;
  scene.add(surface);

  const word = new Group();
  const specs: { letter: Letter; color: string; height: number; angle: number; y: number }[] = [
    { letter: "B", color: "#ca1015", height: 1.58, angle: -.055, y: .035 },
    { letter: "a", color: "#edb600", height: 1.17, angle: .085, y: -.09 },
    { letter: "b", color: "#007fad", height: 1.55, angle: -.065, y: .055 },
    { letter: "e", color: "#5ea91f", height: 1.15, angle: .10, y: -.05 }
  ];
  let nextX = 0;
  const geometries: ExtrudeGeometry[] = [];
  const materials: MeshPhysicalMaterial[] = [];
  const grain = makePlasticGrain();
  const letters: { mesh: Mesh; position: Vector3; rotation: Vector3 }[] = [];
  for (const spec of options.icon ? specs.slice(0, 1) : specs) {
    const path = new ShapePath();
    for (const command of outlines[spec.letter] as OutlineCommand[]) {
      if (command.type === "M") path.moveTo(command.x!, command.y!);
      else if (command.type === "L") path.lineTo(command.x!, command.y!);
      else if (command.type === "C") path.bezierCurveTo(command.x1!, command.y1!, command.x2!, command.y2!, command.x!, command.y!);
      else if (command.type === "Q") path.quadraticCurveTo(command.x1!, command.y1!, command.x!, command.y!);
      else if (command.type === "Z") path.currentPath?.closePath();
    }
    const geometry = new ExtrudeGeometry(path.toShapes(), {
      depth: .045,
      bevelEnabled: true,
      bevelThickness: .012,
      bevelSize: .018,
      bevelSegments: 12,
      curveSegments: 32,
      steps: 1
    });
    geometry.computeBoundingBox();
    const size = geometry.boundingBox!.getSize(new Vector3());
    const scale = spec.height / size.y;
    geometry.scale(scale, scale, 1);
    geometry.center();
    const width = size.x * scale;
    const material = new MeshPhysicalMaterial({
      color: new Color(spec.color), metalness: 0, roughness: .38,
      roughnessMap: grain, bumpMap: grain, bumpScale: .0012,
      clearcoat: .22, clearcoatRoughness: .35, envMapIntensity: .24,
      ior: 1.47
    });
    const letter = new Mesh(geometry, material);
    // Every back face is flush with the fridge; only the in-plane angle varies.
    letter.position.set(nextX + width / 2, (spec.height - 1.58) / 2 + spec.y, .0346);
    letter.rotation.set(0, 0, spec.angle);
    letter.castShadow = true;
    letter.receiveShadow = true;
    word.add(letter);
    letters.push({ mesh: letter, position: letter.position.clone(), rotation: new Vector3(letter.rotation.x, letter.rotation.y, letter.rotation.z) });
    geometries.push(geometry);
    materials.push(material);
    nextX += width + .12;
  }
  const bounds = new Box3().setFromObject(word);
  const center = bounds.getCenter(new Vector3());
  word.position.x = -center.x;
  word.position.y = -center.y;
  scene.add(word);

  const width = options.icon ? 2.05 : bounds.max.x - bounds.min.x + .8;
  const offsets = [
    { x: -.14, y: .12, angle: -.21 },
    { x: -.03, y: -.12, angle: .22 },
    { x: .06, y: .16, angle: .12 },
    { x: .16, y: -.06, angle: -.17 }
  ];
  const poseEntrance = (progress: number[]) => {
    letters.forEach(({ mesh, position, rotation }, index) => {
      const remaining = 1 - (progress[index] ?? 1);
      const offset = offsets[index];
      mesh.position.set(position.x + offset.x * remaining, position.y + offset.y * remaining, position.z);
      mesh.rotation.set(rotation.x, rotation.y, rotation.z + offset.angle * remaining);
    });
  };
  const render = () => renderer.render(scene, camera);
  const raycaster = new Raycaster();
  const pickLetter = (x: number, y: number) => {
    raycaster.setFromCamera(new Vector2(x * 2 - 1, 1 - y * 2), camera);
    word.updateWorldMatrix(true, true);
    const hit = raycaster.intersectObjects(letters.map(letter => letter.mesh), false)[0];
    return hit ? letters.findIndex(letter => letter.mesh === hit.object) : undefined;
  };
  const pointerPosition = (x: number, y: number) => {
    const point = new Vector3(camera.left + x * (camera.right - camera.left), camera.top - y * (camera.top - camera.bottom), 0);
    word.updateWorldMatrix(true, false);
    return word.worldToLocal(point);
  };
  const letterRect = (index: number) => {
    const mesh = letters[index].mesh;
    mesh.updateWorldMatrix(true, false);
    const box = new Box3().setFromObject(mesh);
    const min = box.min.clone().project(camera);
    const max = box.max.clone().project(camera);
    return { x: (min.x + 1) / 2, y: (1 - max.y) / 2, width: (max.x - min.x) / 2, height: (max.y - min.y) / 2 };
  };
  const moveLetter = (index: number, x: number, y: number, padding: number) => {
    const mesh = letters[index].mesh;
    mesh.position.x = x;
    mesh.position.y = y;
    mesh.updateWorldMatrix(true, false);
    const box = new Box3().setFromObject(mesh);
    mesh.position.x += Math.max(0, camera.left + padding - box.min.x) + Math.min(0, camera.right - padding - box.max.x);
    mesh.position.y += Math.max(0, camera.bottom + padding - box.min.y) + Math.min(0, camera.top - padding - box.max.y);
  };
  const resize = (cssWidth: number, cssHeight: number) => {
    renderer.setSize(cssWidth, cssHeight, false);
    const height = width / (cssWidth / cssHeight);
    camera.left = -width / 2;
    camera.right = width / 2;
    camera.top = height / 2;
    camera.bottom = -height / 2;
    camera.updateProjectionMatrix();
    render();
  };
  const dispose = () => {
    geometries.forEach(geometry => geometry.dispose());
    materials.forEach(material => material.dispose());
    surface.geometry.dispose();
    (surface.material as ShadowMaterial).dispose();
    light.shadow.dispose();
    environment.dispose();
    grain.dispose();
    renderer.dispose();
  };
  return { renderer, scene, camera, word, letters, poseEntrance, pickLetter, pointerPosition, letterRect, moveLetter, resize, render, dispose };
}

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from "vue";
import NotchSection from "../../../components/NotchSection.vue";
import Banner from "../../../components/Banner.vue";
import { t } from "../../../i18n/utils/translate";
import { locale } from "../../../i18n/store";
import { lenis } from "../../../composables/useScroll";
import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  AmbientLight,
  DirectionalLight,
  PointLight,
  Group,
  Mesh,
  MeshBasicMaterial,
  LineSegments,
  LineBasicMaterial,
  EdgesGeometry,
  Color,
  Box3,
  Vector3,
  GridHelper,
  RingGeometry,
  CylinderGeometry,
  DoubleSide,
  LoadingManager,
  SRGBColorSpace,
  TextureLoader,
  CanvasTexture,
  Texture,
  Vector2,
  MeshStandardMaterial,
  NoColorSpace,
  PMREMGenerator,
} from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import gsap from "gsap";
import { createConceptDiorama } from "./environmentDioramas";

const sectionRef = ref<HTMLElement | null>(null);
const canvasContainerRef = ref<HTMLElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);
const fileInputRef = ref<HTMLInputElement | null>(null);

// Three.js State
let scene: Scene | null = null;
let camera: PerspectiveCamera | null = null;
let renderer: WebGLRenderer | null = null;
let controls: OrbitControls | null = null;
let animFrameId: number | null = null;
let resizeObserver: ResizeObserver | null = null;
let gridHelper: GridHelper | null = null;
let ringMesh: Mesh | null = null;
let customPedestalMesh: Mesh | null = null;
let stopWheelHandler: ((e: WheelEvent) => void) | null = null;
const currentModelGroup = new Group();
let realisticEnvTexture: Texture | null = null;

// UI State - View Modes (Base Color / Quads 4 lưới / Overlay)
type ViewMode = "shaded" | "quads" | "overlay";
const viewMode = ref<ViewMode>("shaded");
const isWireframe = computed(() => viewMode.value !== "shaded");
const isAutoRotate = ref(true);
const isInteracting = ref(false);
const hasInteracted = ref(false);
const isDragOver = ref(false);
const isLoading = ref(false);
const loadingMessage = ref(locale.value === "vi" ? "Đang nạp mô hình 3D..." : "Loading 3D model...");
const showBlenderGuide = ref(false);
const isNavGuideCollapsed = ref(false);

// Blender 5.2 Scale & Dimensions State
type ScaleMode = "autofit" | "1x" | "3x" | "0.01x" | "100x";
const currentScaleMode = ref<ScaleMode>("autofit");

const stats = ref({
  quads: 0,
  polygons: 0,
  vertices: 0,
  dimensions: "--",
  rawDimensions: { x: 0, y: 0, z: 0, maxDim: 0 },
  fileSize: "",
});

interface EnvironmentConcept {
  id: string;
  name: string;
  nameVi: string;
  nameEn: string;
  category: string;
  icon: string;
  mood: string;
  lighting: string;
  polyTarget: string;
  defaultModelFile?: string;
  defaultModelName?: string;
  project?: "night-shippers" | "gambling-gnomes";
  textureType?: "stylized" | "realistic";
}

// 10 Environment Concepts from Night Shipper
const concepts: EnvironmentConcept[] = [
  {
    id: "old-school",
    name: "Old School",
    nameVi: "Trường học Ma ám",
    nameEn: "Truong hoc Ma am",
    category: "Interior & Props",
    icon: "🏫",
    mood: "Haunted & Mysterious",
    lighting: "Eerie Candlelight & Mist",
    polyTarget: "12,400 Δ",
    project: "night-shippers",
    defaultModelFile: "/models/concepts/old-school/School.fbx",
    defaultModelName: "School.fbx",
  },
  {
    id: "shore",
    name: "Shore",
    nameVi: "Bờ Biển",
    nameEn: "Bo Bien",
    category: "Exterior Diorama",
    icon: "🌊",
    mood: "Coastal & Sea Breeze",
    lighting: "Beacon Glow & Sun Rim",
    polyTarget: "18,200 Δ",
    project: "night-shippers",
    defaultModelFile: "/models/concepts/shore/LangChai.fbx",
    defaultModelName: "LangChai.fbx",
  },
  {
    id: "forest",
    name: "Forest",
    nameVi: "Bản Đôn",
    nameEn: "Ban Don",
    category: "Foliage & Nature",
    icon: "🌲",
    mood: "Lush & Atmospheric",
    lighting: "Dappled Forest Mist",
    polyTarget: "24,500 Δ",
    project: "night-shippers",
    defaultModelFile: "/models/concepts/forest/NhaSan.fbx",
    defaultModelName: "NhaSan.fbx",
  },
  {
    id: "village",
    name: "Village",
    nameVi: "Làng Tây Bắc",
    nameEn: "Lang Tay Bac",
    category: "Heritage Architecture",
    icon: "🏡",
    mood: "Peaceful Countryside",
    lighting: "Golden Hour Warmth",
    polyTarget: "16,800 Δ",
    project: "night-shippers",
    defaultModelFile: "/models/concepts/village/TayBac.fbx",
    defaultModelName: "TayBac.fbx",
  },
  {
    id: "overgrow",
    name: "Overgrow",
    nameVi: "Thành phố xanh",
    nameEn: "Thanh pho xanh",
    category: "Green Architecture",
    icon: "🌿",
    mood: "Nature Reclaiming City",
    lighting: "Sunbeam Canopy & Moss",
    polyTarget: "21,000 Δ",
    project: "night-shippers",
    defaultModelFile: "/models/concepts/overgrow/CayCo.fbx",
    defaultModelName: "CayCo.fbx",
  },
  {
    id: "hanoi-train-street",
    name: "Ha Noi Train Street",
    nameVi: "Phố Đường Tàu Hà Nội",
    nameEn: "Pho Duong Tau Ha Noi",
    category: "Urban Heritage",
    icon: "🚂",
    mood: "Iconic Railway & Café Life",
    lighting: "Train Signal & Amber Glow",
    polyTarget: "28,600 Δ",
    project: "night-shippers",
    defaultModelFile: "/models/concepts/hanoi-train-street/HaNoi.fbx",
    defaultModelName: "HaNoi.fbx",
  },
  {
    id: "hoian-ancient-town",
    name: "Hoi An Ancient Town",
    nameVi: "Phố Cổ Hội An",
    nameEn: "Pho Co Hoi An",
    category: "Heritage Street",
    icon: "🏮",
    mood: "Silk Lanterns & River Town",
    lighting: "Warm Silk Lantern Glow",
    polyTarget: "22,300 Δ",
    project: "night-shippers",
    defaultModelFile: "/models/concepts/hoian-ancient-town/HoiAn.fbx",
    defaultModelName: "HoiAn.fbx",
  },
  {
    id: "kowloon-walled-city",
    name: "KowLoon Walled City",
    nameVi: "Cửu Long Thành Trại",
    nameEn: "Cuu Long Thanh Trai",
    category: "Retro-Cyberpunk",
    icon: "🏙️",
    mood: "Dense Monolithic Complex",
    lighting: "Cyan & Magenta Neon",
    polyTarget: "34,800 Δ",
    project: "night-shippers",
    defaultModelFile: "/models/concepts/kowloon-walled-city/Cho.fbx",
    defaultModelName: "Cho.fbx",
  },
  {
    id: "factory",
    name: "Factory",
    nameVi: "Khu công nghiệp",
    nameEn: "Khu cong nghiep",
    category: "Industrial Interior",
    icon: "🏭",
    mood: "Heavy Machinery & Steampunk",
    lighting: "Furnace Flame & Iron Rim",
    polyTarget: "19,700 Δ",
    project: "night-shippers",
    defaultModelFile: "/models/concepts/factory/Factory.fbx",
    defaultModelName: "Factory.fbx",
  },
  {
    id: "ancient-lake",
    name: "Ancient Lake",
    nameVi: "Hồ Cổ Tĩnh Lặng",
    nameEn: "Ho Co Tinh Lang",
    category: "Aquatic Pavilion",
    icon: "⛩️",
    mood: "Zen Water Pavilion",
    lighting: "Lotus Candle Reflections",
    polyTarget: "15,600 Δ",
    project: "night-shippers",
    defaultModelFile: "/models/concepts/ancient-lake/Cho.fbx",
    defaultModelName: "Cho.fbx",
  },
];

// Concepts for Gambling Gnomes
const gamblingGnomesConcepts: EnvironmentConcept[] = [
  {
    id: "mushroom-house",
    name: "Mushroom House",
    nameVi: "Nhà nấm cổ tích",
    nameEn: "Nha nam co tich",
    category: "Stylized Fantasy",
    icon: "🍄",
    mood: "Whimsical & Fairy Tale",
    lighting: "Warm Mushroom Spore Glow",
    polyTarget: "14,200 Δ",
    project: "gambling-gnomes",
    defaultModelFile: "/models/concepts/mushroom-house/MushroomHouse.fbx",
    defaultModelName: "MushroomHouse.fbx",
  },
  {
    id: "water-lotus-pond",
    name: "Water Lotus Pond",
    nameVi: "Đầm sen tươi tốt",
    nameEn: "Dam sen tuoi tot",
    category: "Stylized Nature",
    icon: "🪷",
    mood: "Serene & Vibrant Water",
    lighting: "Sunlit Water Reflections",
    polyTarget: "16,800 Δ",
    project: "gambling-gnomes",
    defaultModelFile: "/models/concepts/water-lotus-pond/WaterLotusPond.fbx",
    defaultModelName: "WaterLotusPond.fbx",
  },
  {
    id: "realistic",
    name: "Realistic Props",
    nameVi: "Đạo cụ Quán Rượu Realistic",
    nameEn: "Realistic Tavern Props",
    category: "Realistic Props",
    icon: "🕯️",
    mood: "Medieval Tavern Props",
    lighting: "Candlelight & Aged Wood",
    polyTarget: "1,340 Δ",
    project: "gambling-gnomes",
    defaultModelFile: "/models/concepts/realistic/Realistic.fbx",
    defaultModelName: "Realistic.fbx",
  },
];

const allConcepts = [
  ...concepts,
  ...gamblingGnomesConcepts,
  {
    id: "mushroom-house-realistic",
    name: "Mushroom House",
    nameVi: "Nhà nấm cổ tích",
    nameEn: "Nha nam co tich",
    category: "Realistic Fantasy",
    icon: "🍄",
    mood: "Weathered & Atmospheric",
    lighting: "Dusk Forest Light & Candle",
    polyTarget: "18,600 Δ",
    project: "gambling-gnomes" as const,
    defaultModelFile: "/models/concepts/mushroom-house-realistic/MushroomHouse.fbx",
    defaultModelName: "MushroomHouse.fbx",
  },
  {
    id: "water-lotus-pond-realistic",
    name: "Water Lotus Pond",
    nameVi: "Đầm sen tươi tốt",
    nameEn: "Dam sen tuoi tot",
    category: "Realistic Nature",
    icon: "🪷",
    mood: "Deep Waters & Zen Garden",
    lighting: "Moonlit Reflections & Beacon",
    polyTarget: "21,400 Δ",
    project: "gambling-gnomes" as const,
    defaultModelFile: "/models/concepts/water-lotus-pond-realistic/WaterLotusPond.fbx",
    defaultModelName: "WaterLotusPond.fbx",
  },
];

const selectedConceptId = ref<string>("factory");
const customModelMap = new Map<string, Group>();
const customModelNames = new Map<string, string>();

// IndexedDB Persistence for 3D Portfolio models
const DB_NAME = "portfolio_3d_assets_db";
const DB_VERSION = 1;
const STORE_NAME = "custom_models";

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "conceptId" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const saveModelToDB = async (conceptId: string, fileName: string, arrayBuffer: ArrayBuffer) => {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.put({
      conceptId,
      fileName,
      data: arrayBuffer,
      updatedAt: Date.now(),
    });
  } catch (err) {
    console.warn("IndexedDB save error:", err);
  }
};

const getModelFromDB = async (conceptId: string): Promise<{ fileName: string; data: ArrayBuffer } | null> => {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(conceptId);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
};

const getAllSavedModels = async (): Promise<Array<{ conceptId: string; fileName: string }>> => {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => {
        const results = (req.result || []) as Array<{ conceptId: string; fileName: string }>;
        resolve(results.map((r) => ({ conceptId: r.conceptId, fileName: r.fileName })));
      };
      req.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
};

// Materials storage for Base Color & 4-lưới (Quads) wireframe
const originalMaterials = new Map<Mesh, any>();
const quadLinesMap = new Map<Mesh, LineSegments>();
const realisticMaterialsMap = new Map<Mesh, MeshStandardMaterial>();
const isCurrentRealisticModel = ref(false);

// Invisible material for hollow see-through wireframe mode
const wireframeInvisibleMat = new MeshBasicMaterial({
  visible: false,
});

const initThree = () => {
  if (!canvasRef.value || !canvasContainerRef.value) return;

  const width = canvasContainerRef.value.clientWidth;
  const height = canvasContainerRef.value.clientHeight;

  // Scene
  scene = new Scene();

  // Camera with large dynamic range suitable for any Blender 5.2 object scale
  camera = new PerspectiveCamera(42, width / height, 0.05, 5000);
  camera.position.set(6.0, 4.8, 7.2);

  // Renderer
  renderer = new WebGLRenderer({
    canvas: canvasRef.value,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = SRGBColorSpace;

  // Blender-accurate LookDev studio reflection map for realistic PBR shading
  try {
    const pmremGenerator = new PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    const roomEnv = new RoomEnvironment();
    realisticEnvTexture = pmremGenerator.fromScene(roomEnv, 0.04).texture;
    pmremGenerator.dispose();
  } catch (envErr) {
    console.warn("Could not generate RoomEnvironment:", envErr);
  }

  // Orbit Controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.autoRotate = isAutoRotate.value;
  controls.autoRotateSpeed = 1.4;
  controls.maxPolarAngle = Math.PI / 2 + 0.08;
  controls.minDistance = 0.2;
  controls.maxDistance = 500;

  controls.addEventListener("start", () => {
    isInteracting.value = true;
    hasInteracted.value = true;
  });
  controls.addEventListener("end", () => {
    isInteracting.value = false;
  });

  // Lighting
  const ambientLight = new AmbientLight(0xffffff, 2.0);
  scene.add(ambientLight);

  const mainLight = new DirectionalLight(0xfffaee, 2.4);
  mainLight.position.set(8, 12, 9);
  scene.add(mainLight);

  const fillLight = new DirectionalLight(0x8bc4ff, 1.4);
  fillLight.position.set(-9, 5, -7);
  scene.add(fillLight);

  const rimLight = new PointLight(0xff9400, 2.0, 30);
  rimLight.position.set(0, 7, -6);
  scene.add(rimLight);

  // Dynamic Pedestal Grid
  gridHelper = new GridHelper(12, 24, 0xff8400, 0xffffff);
  gridHelper.position.y = -0.01;
  const gridMat = gridHelper.material as LineBasicMaterial;
  gridMat.transparent = true;
  gridMat.opacity = 0.95;
  scene.add(gridHelper);

  const ringGeo = new RingGeometry(3.1, 3.16, 64);
  const ringMat = new MeshBasicMaterial({
    color: 0xff8400,
    side: DoubleSide,
    transparent: true,
    opacity: 0.45,
  });
  ringMesh = new Mesh(ringGeo, ringMat);
  ringMesh.rotation.x = -Math.PI / 2;
  ringMesh.position.y = 0.002;
  scene.add(ringMesh);

  // Showroom Base Pedestal for uploaded models (matching sample model in Hình 1)
  const pedestalGeo = new CylinderGeometry(3.2, 3.328, 0.25, 64);
  const pedestalMat = new MeshBasicMaterial({ color: 0x8a857b });
  customPedestalMesh = new Mesh(pedestalGeo, pedestalMat);
  customPedestalMesh.position.y = 0.125;
  customPedestalMesh.receiveShadow = true;
  customPedestalMesh.visible = false;
  scene.add(customPedestalMesh);

  // Add Model Group
  scene.add(currentModelGroup);

  // Animation Loop
  const animate = () => {
    animFrameId = requestAnimationFrame(animate);
    if (controls) {
      controls.autoRotate = isAutoRotate.value;
      controls.update();
    }
    if (renderer && scene && camera) {
      renderer.render(scene, camera);
    }
  };
  animate();

  // Resize handling
  resizeObserver = new ResizeObserver(handleResize);
  resizeObserver.observe(canvasContainerRef.value);

  // Prevent mouse wheel interaction in 3D viewport from affecting page scrolling
  stopWheelHandler = (e: WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };
  canvasRef.value?.addEventListener("wheel", stopWheelHandler, { passive: false });
  canvasContainerRef.value?.addEventListener("wheel", stopWheelHandler, { passive: false });

  // Pre-populate customModelNames with default bundled models
  allConcepts.forEach((c) => {
    if (c.defaultModelName) {
      customModelNames.set(c.id, c.defaultModelName);
    }
  });

  // Check IndexedDB for any previously imported models and update badges
  getAllSavedModels().then((savedList) => {
    savedList.forEach((item) => {
      customModelNames.set(item.conceptId, item.fileName);
    });
  });

  // Load Initial Concept
  loadConcept(selectedConceptId.value);
};

const handleResize = () => {
  if (!canvasContainerRef.value || !camera || !renderer) return;
  const width = canvasContainerRef.value.clientWidth;
  const height = canvasContainerRef.value.clientHeight;
  if (width === 0 || height === 0) return;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
};

// Process textures with black backgrounds (such as TanLieu.png on CayLieu) to generate transparent alpha
const processTextureBlackAlpha = (texture: any) => {
  if (!texture || texture.__blackAlphaProcessed) return;
  texture.__blackAlphaProcessed = true;

  const runCanvasKey = (imgElement: any) => {
    try {
      if (!imgElement || !imgElement.width || !imgElement.height) return;
      const canvas = document.createElement("canvas");
      canvas.width = imgElement.width;
      canvas.height = imgElement.height;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;
      ctx.drawImage(imgElement, 0, 0);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const d = imgData.data;

      let hasModification = false;
      for (let i = 0; i < d.length; i += 4) {
        const r = d[i] ?? 0;
        const g = d[i + 1] ?? 0;
        const b = d[i + 2] ?? 0;
        const maxVal = Math.max(r, g, b);

        // Only pure black background is transparent (<= 10)
        if (maxVal <= 10) {
          d[i + 3] = 0;
          hasModification = true;
        } else {
          // Green leaves are 100% solid opaque (255) - clear and vibrant!
          d[i + 3] = 255;
          hasModification = true;
        }
      }

      if (hasModification) {
        ctx.putImageData(imgData, 0, 0);
        texture.image = canvas;
        texture.needsUpdate = true;
      }
    } catch (err) {
      console.warn("Could not key out black texture background:", err);
    }
  };

  const img = texture.image;
  if (img) {
    if (img instanceof HTMLImageElement && !img.complete) {
      img.addEventListener("load", () => runCanvasKey(img), { once: true });
    } else {
      runCanvasKey(img);
    }
  }
};

// Convert any mesh material to Base Color (MeshBasicMaterial) with true Alpha cutout support (matching Blender Principled BSDF Alpha node)
const convertMeshToBaseColor = (mesh: Mesh) => {
  // Hide accidental floating reference card left high up in Blender file
  if (/tanthong006/i.test(mesh.name || "")) {
    mesh.visible = false;
    return;
  }

  const toBasic = (mat: any): MeshBasicMaterial => {
    const hasMap = !!mat.map;
    let basicMat: MeshBasicMaterial;

    if (mat instanceof MeshBasicMaterial) {
      basicMat = mat;
      basicMat.wireframe = false;
    } else {
      basicMat = new MeshBasicMaterial({
        map: mat.map || null,
        wireframe: false,
      });
    }

    const isCayLieuFoliage =
      /lieu|tanlieu/i.test(mat.name || "") ||
      /lieu|tanlieu/i.test(mesh.name || "") ||
      (mat.map && mat.map.name && /lieu|tanlieu/i.test(mat.map.name)) ||
      (mat.map && mat.map.image && typeof mat.map.image.src === "string" && /lieu|tanlieu/i.test(mat.map.image.src));

    if (hasMap) {
      // 1. Color: pure white so the texture's original colors (green leaves, brown branches, etc.)
      // are rendered with 100% fidelity without being tinted/greyed out by FBX default #cccccc diffuse color!
      basicMat.color = new Color(0xffffff);

      // 2. Opacity: always 1.0 for foliage cutout cards so leaves are never ghost-like or faint!
      basicMat.opacity = 1.0;

      // 3. Side: DoubleSide is essential so 2D leaf planes/cards are visible from both sides.
      basicMat.side = DoubleSide;

      // 4. AlphaMap: remove any alphaMap pointing to the diffuse texture (Three.js alphaMap reads green channel and corrupts alpha!)
      basicMat.alphaMap = null;

      // 5. Alpha cutout (matching Blender Image Texture Alpha -> Principled BSDF Alpha):
      if (isCayLieuFoliage) {
        // Cây Liễu (Willow Tree) Shader: 100% solid, opaque, vibrant green foliage
        // Discard only the pure black background, keep all green leaves completely opaque
        basicMat.transparent = true;
        basicMat.alphaTest = 0.5;
        basicMat.depthWrite = true;
        basicMat.depthTest = true;

        basicMat.customProgramCacheKey = () => "cay_lieu_solid_green_foliage";
        basicMat.onBeforeCompile = (shader) => {
          shader.fragmentShader = shader.fragmentShader.replace(
            "#include <map_fragment>",
            `
            #include <map_fragment>
            #ifdef USE_MAP
            // Solid Alpha Clip for Cay Lieu foliage:
            // Background pure black -> discard (alpha = 0.0)
            // Green leaves -> 100% SOLID OPAQUE (alpha = 1.0)
            float maxChan = max(sampledDiffuseColor.r, max(sampledDiffuseColor.g, sampledDiffuseColor.b));
            if (maxChan <= 0.04) {
              diffuseColor.a = 0.0;
            } else {
              diffuseColor.a = 1.0;
              // Enhance green foliage clarity and vibrancy so it stands out clearly
              if (sampledDiffuseColor.g > sampledDiffuseColor.r * 0.7) {
                diffuseColor.rgb = min(vec3(1.0), sampledDiffuseColor.rgb * vec3(1.15, 1.45, 1.15));
              }
            }
            #endif
            `
          );
        };

        if (basicMat.map) {
          processTextureBlackAlpha(basicMat.map);
        }
      } else {
        // Standard alpha cutout for regular textured meshes
        basicMat.transparent = true;
        basicMat.alphaTest = 0.5;
        basicMat.depthWrite = true;
        basicMat.depthTest = true;
      }

      // 6. Ensure texture color space is sRGB for correct color gamma
      if (basicMat.map) {
        basicMat.map.colorSpace = SRGBColorSpace;
        basicMat.map.needsUpdate = true;
      }
    } else {
      // Plain geometry without texture: preserve original color & opacity
      basicMat.color = mat.color ? mat.color.clone() : new Color(0xffffff);
      basicMat.opacity = mat.opacity !== undefined ? mat.opacity : 1.0;
      basicMat.transparent = mat.transparent || false;
      basicMat.side = mat.side || DoubleSide;
      basicMat.alphaTest = mat.alphaTest || 0;
      basicMat.depthWrite = true;
      basicMat.depthTest = true;
    }

    basicMat.name = mat.name || basicMat.name;
    basicMat.needsUpdate = true;
    return basicMat;
  };

  if (Array.isArray(mesh.material)) {
    mesh.material = mesh.material.map(toBasic);
  } else if (mesh.material) {
    mesh.material = toBasic(mesh.material);
  }
};

// Create or retrieve clean 4-Lưới (Quads) wireframe using EdgesGeometry
const getOrCreateQuadWireframe = (mesh: Mesh): LineSegments => {
  let lines = quadLinesMap.get(mesh);
  if (lines) return lines;

  // thresholdAngle = 6 degrees:
  // - Eliminates coplanar diagonal edges (0 deg) -> turns 3-lưới into 4-lưới quads!
  // - Preserves quad boundaries on cylinders (360/32 = 11.25 deg > 6 deg) and boxes (90 deg)
  const edges = new EdgesGeometry(mesh.geometry, 6);
  const lineMat = new LineBasicMaterial({
    color: 0x00d2ff,
    linewidth: 1.5,
  });
  lines = new LineSegments(edges, lineMat);
  lines.name = "__quad_wireframe_lines__";
  lines.renderOrder = 999;
  mesh.add(lines);
  quadLinesMap.set(mesh, lines);
  return lines;
};

const clearCurrentModel = () => {
  if (customPedestalMesh) {
    customPedestalMesh.visible = false;
  }
  quadLinesMap.forEach((lines) => {
    lines.geometry.dispose();
    if (Array.isArray(lines.material)) {
      lines.material.forEach((m) => m.dispose());
    } else {
      lines.material.dispose();
    }
  });
  quadLinesMap.clear();
  originalMaterials.clear();
  realisticMaterialsMap.clear();
  isCurrentRealisticModel.value = false;
  currentModelGroup.clear();
  currentModelGroup.scale.set(1, 1, 1);
  currentModelGroup.position.set(0, 0, 0);
};

const applyWireframeState = () => {
  if (scene) {
    if (isCurrentRealisticModel.value && realisticEnvTexture) {
      scene.environment = realisticEnvTexture;
    } else {
      scene.environment = null;
    }
  }

  currentModelGroup.traverse((child) => {
    if (child instanceof Mesh && child.name !== "__quad_wireframe_lines__") {
      if (isCurrentRealisticModel.value && realisticMaterialsMap.has(child)) {
        const realMat = realisticMaterialsMap.get(child)!;
        const quadLines = getOrCreateQuadWireframe(child);

        if (viewMode.value === "quads") {
          child.material = wireframeInvisibleMat;
          quadLines.visible = true;
        } else if (viewMode.value === "overlay") {
          child.material = realMat;
          quadLines.visible = true;
        } else {
          child.material = realMat;
          quadLines.visible = false;
        }
        return;
      }

      // 1. Ensure material is pure Base Color (MeshBasicMaterial)
      convertMeshToBaseColor(child);

      if (!originalMaterials.has(child)) {
        originalMaterials.set(child, child.material);
      }

      const baseMat = originalMaterials.get(child);
      const quadLines = getOrCreateQuadWireframe(child);

      if (viewMode.value === "quads") {
        // Mode 1: Pure 4-Lưới (Quads) Wireframe - transparent hollow mesh, clean cyan quads!
        child.material = wireframeInvisibleMat;
        quadLines.visible = true;
      } else if (viewMode.value === "overlay") {
        // Mode 2: Base Color + 4-Lưới (Quads) Wireframe Overlay (Blender Viewport style)
        child.material = baseMat;
        quadLines.visible = true;
      } else {
        // Mode 3: Shaded Base Color only (no roughness, no metallic, no shader)
        child.material = baseMat;
        quadLines.visible = false;
      }
    }
  });
};

// Blender 5.2 Scale & Framing Logic
const fitCameraToModel = (model: Group, scaleMode: ScaleMode = currentScaleMode.value) => {
  if (!camera || !controls) return;

  // Reset local scale to 1 to measure exact Blender unscaled dimensions
  model.scale.set(1, 1, 1);
  model.updateMatrixWorld(true);

  const rawBox = new Box3().setFromObject(model);
  const rawSize = rawBox.getSize(new Vector3());
  const rawMaxDim = Math.max(rawSize.x, rawSize.y, rawSize.z, 0.001);

  stats.value.rawDimensions = {
    x: rawSize.x,
    y: rawSize.y,
    z: rawSize.z,
    maxDim: rawMaxDim,
  };

  const isCustomModel = customModelMap.has(selectedConceptId.value);

  // Determine scaling based on user selected scale mode
  let targetScale = 1.0;
  if (scaleMode === "autofit") {
    if (isCustomModel) {
      // Model scale 2x larger (gấp 2 lần theo yêu cầu của user)
      const sampleHeight = 5.2; // doubled from 2.6

      // If the uploaded model is an elongated environment/map layout (height is much smaller than length/width):
      if (rawSize.y > 0 && rawSize.y < Math.max(rawSize.x, rawSize.z) * 0.45) {
        // Scale so the buildings/stalls reach ~4.6m - 5.2m (gấp 2 lần), capping max length at 21m:
        const scaleForHumanHeight = sampleHeight / rawSize.y;
        const scaleForLength = 21.0 / Math.max(rawSize.x, rawSize.z);
        targetScale = Math.min(scaleForHumanHeight, Math.max(scaleForLength, scaleForHumanHeight * 0.7));
      } else {
        // Compact diorama or building (doubled from 3.6 -> 7.2):
        targetScale = 7.2 / rawMaxDim;
      }
    } else {
      // Preset concept diorama:
      targetScale = 3.5 / rawMaxDim;
    }
  } else if (scaleMode === "3x") {
    targetScale = 6.0;
  } else if (scaleMode === "1x") {
    // Exact 1:1 Blender metric scale (1 Blender unit = 1 meter)
    targetScale = 1.0;
  } else if (scaleMode === "0.01x") {
    // Fixes Blender FBX exported in centimeters (100x -> 1x)
    targetScale = 0.01;
  } else if (scaleMode === "100x") {
    // Fixes Blender FBX exported in millimeters or scaled down
    targetScale = 100.0;
  }

  model.scale.set(targetScale, targetScale, targetScale);
  model.updateMatrixWorld(true);

  // Compute final scaled bounds
  const scaledBox = new Box3().setFromObject(model);
  const scaledSize = scaledBox.getSize(new Vector3());
  const scaledCenter = scaledBox.getCenter(new Vector3());
  const scaledMaxDim = Math.max(scaledSize.x, scaledSize.y, scaledSize.z, 0.001);

  // Center horizontally
  model.position.x = -scaledCenter.x;
  model.position.z = -scaledCenter.z;

  // Showroom Pedestal logic: provide the exact gray circular pedestal disk as Hình 1
  if (customPedestalMesh) {
    if (isCustomModel) {
      customPedestalMesh.visible = true;
      const pRadius = Math.max(3.8, Math.min(scaledSize.x, scaledSize.z) * 0.65, Math.max(scaledSize.x, scaledSize.z) * 0.35);
      const pScale = pRadius / 3.2;
      customPedestalMesh.scale.set(pScale, 1, pScale);
      customPedestalMesh.position.set(0, 0.125, 0);
      // Place model base flat on top of pedestal (0.25m elevation)
      model.position.y = -scaledBox.min.y + 0.25;
    } else {
      customPedestalMesh.visible = false;
      model.position.y = -scaledBox.min.y;
    }
  } else {
    model.position.y = -scaledBox.min.y;
  }

  // Ground grid and ring scale matching showroom
  const ringRadius = isCustomModel
    ? Math.max(4.0, Math.min(scaledMaxDim * 0.42, 10.0))
    : Math.max(3.1, scaledMaxDim * 0.35);

  if (ringMesh) {
    const ringScale = ringRadius / 3.1;
    ringMesh.scale.set(ringScale, ringScale, 1);
  }
  if (gridHelper) {
    const gridScale = Math.max(1.0, ringRadius * 0.28);
    gridHelper.scale.set(gridScale, 1, gridScale);
  }

  // Adjust camera distance and clipping planes so custom model appears truly 2x larger on screen (gấp đôi)
  const fov = camera.fov * (Math.PI / 180);
  let cameraDistance: number;
  if (isCustomModel) {
    // Bring camera 2x closer (distance reduced from ~6.0m to ~3.0m) to double visual magnification on screen
    cameraDistance = Math.max(Math.min(scaledSize.y * 0.58, scaledMaxDim * 0.21), 2.9);
  } else {
    cameraDistance = Math.max(Math.abs(scaledMaxDim / 1.5 / Math.tan(fov / 2)) * 1.25, 3.8);
  }

  camera.near = Math.max(0.01, cameraDistance * 0.002);
  camera.far = Math.max(5000, cameraDistance * 40);
  camera.updateProjectionMatrix();

  const targetY = isCustomModel
    ? Math.max(scaledSize.y * 0.38 + 0.25, 1.8)
    : scaledSize.y * 0.45;
  controls.target.set(0, targetY, 0);

  gsap.to(camera.position, {
    x: cameraDistance * 0.85,
    y: targetY + cameraDistance * 0.35,
    z: cameraDistance * 1.05,
    duration: 0.75,
    ease: "power2.out",
    onUpdate: () => {
      controls?.update();
    },
  });

  controls.maxDistance = Math.max(cameraDistance * 6.0, 35);
  controls.minDistance = 0.5;

  // Calculate Geometry Polycount & Vertices (ignore helper lines)
  let polys = 0;
  let verts = 0;
  model.traverse((child) => {
    if (child instanceof Mesh && child.name !== "__quad_wireframe_lines__" && child.geometry) {
      if (child.geometry.index) {
        polys += child.geometry.index.count / 3;
      } else if (child.geometry.attributes.position) {
        polys += child.geometry.attributes.position.count / 3;
      }
      if (child.geometry.attributes.position) {
        verts += child.geometry.attributes.position.count;
      }
    }
  });

  stats.value.quads = Math.round(polys / 2);
  stats.value.polygons = Math.round(polys);
  stats.value.vertices = Math.round(verts);
  stats.value.dimensions = `${rawSize.x.toFixed(2)}m × ${rawSize.y.toFixed(2)}m × ${rawSize.z.toFixed(2)}m`;
};

const setScaleMode = (mode: ScaleMode) => {
  currentScaleMode.value = mode;
  fitCameraToModel(currentModelGroup, mode);
};

// =========================================================================
// REALISTIC FBX BLENDER SHADING ENGINE
// Exclusively for Realistic.fbx (all other FBX files remain 100% untouched)
// Recreates Blender Shader Editor node setup:
// 1. Base Color = MixRGB (Multiply Factor 1.0) of Base_color.png * Mixed_AO.png
// 2. Metallic = Metallic.png
// 3. Roughness = Math Add(Roughness.png, Multiply(Metallic.png, 0.3))
// 4. Normal = Normal_OpenGL.png (Tangent Space) + Bump Height.png (Distance 0.001)
// =========================================================================

const isRealisticTarget = (fileName?: string, conceptId?: string, object?: Group): boolean => {
  const fName = (fileName || "").toLowerCase();
  const cId = (conceptId || "").toLowerCase();

  // 1. If fileName is Realistic.fbx or contains "realistic" (and not mushroom/lotus):
  if (fName.includes("realistic") && !fName.includes("mushroom") && !fName.includes("lotus") && !fName.includes("pond")) {
    return true;
  }

  // 2. If conceptId is explicitly the realistic props concept:
  if (cId === "realistic" || cId === "realistic-props") {
    return true;
  }

  // 3. Strictly preserve all other models (e.g. Mushroom House, Water Lotus Pond)
  if (
    fName.includes("mushroom") ||
    fName.includes("lotus") ||
    fName.includes("pond") ||
    cId.includes("mushroom") ||
    cId.includes("lotus") ||
    cId.includes("pond")
  ) {
    return false;
  }

  // 4. Check if meshes in object match the 5 realistic props
  if (object) {
    let hasRealisticProp = false;
    object.traverse((child) => {
      if (child instanceof Mesh) {
        const mName = (child.name || "").toLowerCase();
        const mat = child.material;
        const matName = (Array.isArray(mat) ? mat[0]?.name : (mat as any)?.name || "").toLowerCase();
        if (
          matName === "candle2" ||
          matName === "winebarrel" ||
          matName === "barrel" ||
          matName === "box" ||
          matName === "stool" ||
          mName.includes("candle") ||
          mName.includes("winebarrel") ||
          mName.includes("cylinder008") ||
          (mName === "box" && matName === "box") ||
          (mName === "stool" && matName === "stool")
        ) {
          hasRealisticProp = true;
        }
      }
    });
    if (hasRealisticProp) return true;
  }

  return false;
};

const getRealisticPropKey = (mesh: Mesh): "Candle" | "Box" | "Barrel" | "Stool" | "WineBarrel" | null => {
  const meshName = (mesh.name || "").toLowerCase();
  const mat = mesh.material;
  const matName = (Array.isArray(mat) ? mat[0]?.name : (mat as any)?.name || "").toLowerCase();

  if (matName.includes("candle")) return "Candle";
  if (matName.includes("winebarrel")) return "WineBarrel";
  if (matName.includes("barrel")) return "Barrel";
  if (matName.includes("box")) return "Box";
  if (matName.includes("stool")) return "Stool";

  if (meshName.includes("candle")) return "Candle";
  if (meshName.includes("winebarrel")) return "WineBarrel";
  if (meshName.includes("cylinder") || meshName.includes("barrel")) return "Barrel";
  if (meshName.includes("box")) return "Box";
  if (meshName.includes("stool")) return "Stool";

  return null;
};

const loadImageAsync = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (e) => {
      console.warn(`[Assets3D] Failed to load image at: ${url}`, e);
      reject(new Error(`Failed to load texture image from ${url}`));
    };
    img.src = url;
    if (img.complete && img.naturalWidth !== 0) {
      resolve(img);
    }
  });
};

const createMultiplyAOTexture = async (baseColorUrl: string, aoUrl: string): Promise<CanvasTexture | Texture> => {
  try {
    const [baseImg, aoImg] = await Promise.all([loadImageAsync(baseColorUrl), loadImageAsync(aoUrl)]);
    const canvas = document.createElement("canvas");
    canvas.width = baseImg.naturalWidth || baseImg.width || 512;
    canvas.height = baseImg.naturalHeight || baseImg.height || 512;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas context unavailable");

    ctx.drawImage(baseImg, 0, 0, canvas.width, canvas.height);
    // Blender MixRGB Multiply Node (Factor 1.0)
    ctx.globalCompositeOperation = "multiply";
    ctx.drawImage(aoImg, 0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = "source-over";

    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
  } catch (err) {
    console.warn("Falling back to plain Base Color texture:", err);
    const texLoader = new TextureLoader();
    const tex = texLoader.load(baseColorUrl);
    tex.colorSpace = SRGBColorSpace;
    return tex;
  }
};

const createRoughnessTexture = async (roughnessUrl: string, metallicUrl: string): Promise<CanvasTexture | Texture> => {
  try {
    const [rImg, mImg] = await Promise.all([loadImageAsync(roughnessUrl), loadImageAsync(metallicUrl)]);
    const canvas = document.createElement("canvas");
    canvas.width = rImg.naturalWidth || rImg.width || 512;
    canvas.height = rImg.naturalHeight || rImg.height || 512;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas context unavailable");

    ctx.drawImage(rImg, 0, 0, canvas.width, canvas.height);
    // Blender Math Node: Add(Roughness, Multiply(Metallic, 0.3))
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = 0.3;
    ctx.drawImage(mImg, 0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1.0;
    ctx.globalCompositeOperation = "source-over";

    const texture = new CanvasTexture(canvas);
    texture.colorSpace = NoColorSpace;
    texture.needsUpdate = true;
    return texture;
  } catch (err) {
    console.warn("Falling back to plain Roughness texture:", err);
    const texLoader = new TextureLoader();
    const tex = texLoader.load(roughnessUrl);
    tex.colorSpace = NoColorSpace;
    return tex;
  }
};

const getAbsoluteAssetUrl = (path: string): string => {
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("blob:")) return path;
  const base = import.meta.env.BASE_URL ? import.meta.env.BASE_URL.replace(/\/$/, "") : "";
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${cleanPath}`;
};

const resolvePropTextureUrl = (prop: string, suffix: string, fileUrlMap?: Map<string, string>): string => {
  const fileName = `${prop}_${suffix}.png`;
  const lowerFileName = fileName.toLowerCase();
  if (fileUrlMap && fileUrlMap.has(lowerFileName)) {
    return fileUrlMap.get(lowerFileName)!;
  }
  return getAbsoluteAssetUrl(`/models/concepts/realistic/textures/${fileName}`);
};

const buildRealisticPropMaterial = async (
  prop: "Candle" | "Box" | "Barrel" | "Stool" | "WineBarrel",
  fileUrlMap?: Map<string, string>
): Promise<MeshStandardMaterial> => {
  const texLoader = new TextureLoader();

  const baseColorUrl = resolvePropTextureUrl(prop, "Base_color", fileUrlMap);
  const aoUrl = resolvePropTextureUrl(prop, "Mixed_AO", fileUrlMap);
  const metallicUrl = resolvePropTextureUrl(prop, "Metallic", fileUrlMap);
  const roughnessUrl = resolvePropTextureUrl(prop, "Roughness", fileUrlMap);
  const normalUrl = resolvePropTextureUrl(prop, "Normal_OpenGL", fileUrlMap);
  const heightUrl = resolvePropTextureUrl(prop, "Height", fileUrlMap);

  const [map, roughnessMap] = await Promise.all([
    createMultiplyAOTexture(baseColorUrl, aoUrl),
    createRoughnessTexture(roughnessUrl, metallicUrl),
  ]);

  const normalMap = texLoader.load(normalUrl);
  normalMap.colorSpace = NoColorSpace;

  const bumpMap = texLoader.load(heightUrl);
  bumpMap.colorSpace = NoColorSpace;

  const metalnessMap = texLoader.load(metallicUrl);
  metalnessMap.colorSpace = NoColorSpace;

  const mat = new MeshStandardMaterial({
    color: new Color(0xffffff),
    map,
    roughnessMap,
    roughness: 1.0,
    metalnessMap,
    metalness: 1.0,
    normalMap,
    normalScale: new Vector2(1, 1),
    bumpMap,
    bumpScale: 0.002, // Matches Blender Distance = 0.001
    side: DoubleSide,
  });
  mat.name = `${prop}_BlenderPBR`;
  return mat;
};

const applyRealisticBlenderShading = async (object: Group, fileUrlMap?: Map<string, string>) => {
  const propCache = new Map<string, MeshStandardMaterial>();
  const meshesToApply: { mesh: Mesh; propKey: "Candle" | "Box" | "Barrel" | "Stool" | "WineBarrel" }[] = [];

  object.traverse((child) => {
    if (child instanceof Mesh || (child as any).isMesh) {
      const propKey = getRealisticPropKey(child as Mesh);
      if (propKey) {
        meshesToApply.push({ mesh: child as Mesh, propKey });
      }
    }
  });

  for (const { propKey } of meshesToApply) {
    if (!propCache.has(propKey)) {
      const mat = await buildRealisticPropMaterial(propKey, fileUrlMap);
      propCache.set(propKey, mat);
    }
  }

  for (const { mesh, propKey } of meshesToApply) {
    const mat = propCache.get(propKey);
    if (mat) {
      mesh.material = mat;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mat.needsUpdate = true;
      realisticMaterialsMap.set(mesh, mat);
    }
  }
};

const processLoadedModel = async (
  object: Group,
  fileName: string,
  conceptId: string,
  fileUrlMap?: Map<string, string>
) => {
  clearCurrentModel();

  if (isRealisticTarget(fileName, conceptId, object)) {
    isCurrentRealisticModel.value = true;
    loadingMessage.value =
      locale.value === "vi"
        ? "Đang thiết lập texture PBR chuẩn node Blender (Base Color + AO, Normal, Roughness, Metallic)..."
        : "Applying Blender PBR shader nodes (Base Color + AO, Normal, Roughness, Metallic)...";
    await applyRealisticBlenderShading(object, fileUrlMap);
  } else {
    isCurrentRealisticModel.value = false;
    object.traverse((child) => {
      if (child instanceof Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        convertMeshToBaseColor(child);
      }
    });
  }

  customModelMap.set(conceptId, object);
  customModelNames.set(conceptId, fileName);

  currentModelGroup.add(object);
  applyWireframeState();

  currentScaleMode.value = "autofit";
  fitCameraToModel(currentModelGroup, "autofit");
  isLoading.value = false;
};

const loadModelFromUrl = async (url: string, fileName: string, conceptId: string) => {
  isLoading.value = true;
  loadingMessage.value =
    locale.value === "vi"
      ? `Đang nạp ${fileName} • Blender 5.2...`
      : `Loading ${fileName} • Blender 5.2...`;

  try {
    const fullUrl = getAbsoluteAssetUrl(url);
    const response = await fetch(fullUrl);
    if (!response.ok) throw new Error("File not found: " + response.statusText);
    const arrayBuffer = await response.arrayBuffer();
    const fileSizeMb = (arrayBuffer.byteLength / (1024 * 1024)).toFixed(1);
    stats.value.fileSize = `${fileSizeMb} MB`;
    const ext = fileName.split(".").pop()?.toLowerCase();
    const manager = new LoadingManager();
    const basePath = fullUrl.includes("/") ? fullUrl.substring(0, fullUrl.lastIndexOf("/") + 1) : "";

    if (ext === "fbx") {
      const fbxLoader = new FBXLoader(manager);
      const group = fbxLoader.parse(arrayBuffer, basePath);
      await processLoadedModel(group, fileName, conceptId);
    } else if (ext === "glb" || ext === "gltf") {
      const gltfLoader = new GLTFLoader(manager);
      gltfLoader.parse(arrayBuffer, basePath, async (gltf) => {
        await processLoadedModel(gltf.scene, fileName, conceptId);
      });
    }
  } catch (err) {
    console.warn("Could not load default model:", err);
    const diorama = createConceptDiorama(conceptId);
    currentModelGroup.add(diorama);
    applyWireframeState();
    fitCameraToModel(currentModelGroup);
    isLoading.value = false;
  }
};

const loadConcept = async (conceptId: string) => {
  clearCurrentModel();
  selectedConceptId.value = conceptId;

  // 1. Check in-memory customModelMap
  if (customModelMap.has(conceptId)) {
    const customModel = customModelMap.get(conceptId)!;
    const fileName = customModelNames.get(conceptId) || "";
    isCurrentRealisticModel.value = isRealisticTarget(fileName, conceptId, customModel);
    if (isCurrentRealisticModel.value) {
      customModel.traverse((child) => {
        if (child instanceof Mesh && (child.material as any)?.name?.endsWith("_BlenderPBR")) {
          realisticMaterialsMap.set(child, child.material as MeshStandardMaterial);
        }
      });
      if (realisticMaterialsMap.size === 0) {
        await applyRealisticBlenderShading(customModel);
      }
    }
    currentModelGroup.add(customModel);
    applyWireframeState();
    fitCameraToModel(currentModelGroup);
    return;
  }

  // 2. Check IndexedDB persistent storage
  const saved = await getModelFromDB(conceptId);
  if (saved) {
    const ext = saved.fileName.split(".").pop()?.toLowerCase();
    const manager = new LoadingManager();
    try {
      if (ext === "fbx") {
        const fbxLoader = new FBXLoader(manager);
        const group = fbxLoader.parse(saved.data, "");
        await processLoadedModel(group, saved.fileName, conceptId);
        return;
      } else if (ext === "glb" || ext === "gltf") {
        const gltfLoader = new GLTFLoader(manager);
        gltfLoader.parse(saved.data, "", async (gltf) => {
          await processLoadedModel(gltf.scene, saved.fileName, conceptId);
        });
        return;
      }
    } catch (e) {
      console.warn("Error parsing IndexedDB model:", e);
    }
  }

  // 3. Check defaultModelFile in concept definitions
  const concept = allConcepts.find((c) => c.id === conceptId);
  if (concept?.defaultModelFile && concept.defaultModelName) {
    await loadModelFromUrl(concept.defaultModelFile, concept.defaultModelName, conceptId);
    return;
  }

  // 4. Procedural 3D diorama fallback
  const diorama = createConceptDiorama(conceptId);
  currentModelGroup.add(diorama);
  applyWireframeState();
  fitCameraToModel(currentModelGroup);
};

// Handle Multi-file Upload (supports large files, Blender 5.2 scale, FBX with textures, GLB, GLTF, OBJ)
const handle3DFiles = async (fileList: FileList | File[]) => {
  const files = Array.from(fileList);
  if (files.length === 0) return;

  const modelFile = files.find((f) => {
    const ext = f.name.split(".").pop()?.toLowerCase();
    return ext === "fbx" || ext === "glb" || ext === "gltf" || ext === "obj";
  });

  if (!modelFile) {
    alert(
      locale.value === "vi"
        ? "Vui lòng chọn file 3D (.fbx, .glb, .gltf hoặc .obj). Bạn có thể chọn kèm các file ảnh texture (.png, .jpg) cùng lúc."
        : "Please select a 3D file (.fbx, .glb, .gltf, or .obj). You can also select texture images (.png, .jpg) together."
    );
    return;
  }

  const fileSizeMb = (modelFile.size / (1024 * 1024)).toFixed(1);
  stats.value.fileSize = `${fileSizeMb} MB`;
  isLoading.value = true;
  loadingMessage.value =
    locale.value === "vi"
      ? `Đang nạp ${modelFile.name} (${fileSizeMb} MB) • Blender 5.2...`
      : `Loading ${modelFile.name} (${fileSizeMb} MB) • Blender 5.2...`;

  const manager = new LoadingManager();
  const fileUrlMap = new Map<string, string>();

  files.forEach((f) => {
    const url = URL.createObjectURL(f);
    fileUrlMap.set(f.name.toLowerCase(), url);
  });

  // Redirect texture requests to local blob URLs
  manager.setURLModifier((url) => {
    const cleanName = url.replace(/^.*[\\/]/, "").toLowerCase();
    if (fileUrlMap.has(cleanName)) {
      return fileUrlMap.get(cleanName)!;
    }
    return url;
  });

  const ext = modelFile.name.split(".").pop()?.toLowerCase();

  try {
    const arrayBuffer = await modelFile.arrayBuffer();

    // Persist to IndexedDB so the model is permanently saved for this concept slot
    saveModelToDB(selectedConceptId.value, modelFile.name, arrayBuffer);

    if (ext === "glb" || ext === "gltf") {
      const gltfLoader = new GLTFLoader(manager);
      gltfLoader.parse(
        arrayBuffer,
        "",
        async (gltf) => {
          await processLoadedModel(gltf.scene, modelFile.name, selectedConceptId.value, fileUrlMap);
        },
        (error) => {
          console.error("GLTF Error:", error);
          isLoading.value = false;
          alert("GLB loading error: " + error.message);
        }
      );
    } else if (ext === "fbx") {
      const fbxLoader = new FBXLoader(manager);
      try {
        const fbxGroup = fbxLoader.parse(arrayBuffer, "");
        await processLoadedModel(fbxGroup, modelFile.name, selectedConceptId.value, fileUrlMap);
      } catch (err: any) {
        console.error("FBX Error:", err);
        isLoading.value = false;
        alert("FBX parsing error: " + err.message + "\nBlender 5.2 Tip: When exporting FBX, set 'Path Mode: Copy' and enable 'Embed Textures'.");
      }
    } else if (ext === "obj") {
      const objLoader = new OBJLoader(manager);
      const text = new TextDecoder().decode(arrayBuffer);
      const objGroup = objLoader.parse(text);
      await processLoadedModel(objGroup, modelFile.name, selectedConceptId.value, fileUrlMap);
    }
  } catch (err: any) {
    console.error("Load Error:", err);
    isLoading.value = false;
    alert("Could not read file: " + err.message);
  }
};

const onFileInputChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    handle3DFiles(target.files);
  }
};

const onDrop = (e: DragEvent) => {
  isDragOver.value = false;
  if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
    handle3DFiles(e.dataTransfer.files);
  }
};

const toggleWireframe = () => {
  if (viewMode.value === "shaded") {
    viewMode.value = "quads";
  } else if (viewMode.value === "quads") {
    viewMode.value = "overlay";
  } else {
    viewMode.value = "shaded";
  }
  applyWireframeState();
};

const toggleAutoRotate = () => {
  isAutoRotate.value = !isAutoRotate.value;
  if (controls) {
    controls.autoRotate = isAutoRotate.value;
  }
};

const resetCamera = () => {
  fitCameraToModel(currentModelGroup, currentScaleMode.value);
};

let gsapCtx: gsap.Context | null = null;

onMounted(() => {
  nextTick(() => {
    initThree();
  });

  if (sectionRef.value) {
    gsapCtx = gsap.context(() => {
      gsap.from(".assets-header, .assets-viewer-card, .assets-shelf", {
        opacity: 0,
        y: 40,
        duration: 0.8,
        stagger: 0.15,
        ease: "power2.out",
        scrollTrigger: {
          trigger: sectionRef.value,
          start: "top 80%",
          once: true,
        },
      });
    }, sectionRef.value);
  }
});

const onViewerMouseEnter = () => {
  lenis.value?.stop();
};

const onViewerMouseLeave = () => {
  lenis.value?.start();
};

onUnmounted(() => {
  lenis.value?.start();
  if (stopWheelHandler) {
    canvasRef.value?.removeEventListener("wheel", stopWheelHandler);
    canvasContainerRef.value?.removeEventListener("wheel", stopWheelHandler);
  }
  gsapCtx?.revert();
  if (animFrameId) cancelAnimationFrame(animFrameId);
  if (resizeObserver) resizeObserver.disconnect();
  if (controls) controls.dispose();
  if (renderer) renderer.dispose();
  if (customPedestalMesh) {
    customPedestalMesh.geometry.dispose();
    if (Array.isArray(customPedestalMesh.material)) {
      customPedestalMesh.material.forEach((m) => m.dispose());
    } else {
      customPedestalMesh.material.dispose();
    }
  }
  clearCurrentModel();
});
</script>

<template>
  <section class="assets" ref="sectionRef" id="assets">
    <NotchSection class="assets-notch-start" />
    <NotchSection class="assets-notch-end" />

    <!-- Section Header -->
    <div class="grid">
      <div class="assets-header">
        <div class="assets-title">
          <h2 class="assets-title-copy">{{ t("assets-3d") }}</h2>
          <Banner class="assets-title-banner" :copy="locale === 'vi' ? 'NGHỆ THUẬT MÔI TRƯỜNG 3D' : '3D ENVIRONMENT ART'" size="sm" animated />
        </div>
        <p class="assets-description">
          {{ t("assets-desc") }}
        </p>
      </div>
    </div>

    <!-- Main 3D Viewport Showcase -->
    <div class="grid">
      <div
        class="assets-viewer-card"
        :class="{ 'is-drag-over': isDragOver }"
        @dragover.prevent="isDragOver = true"
        @dragleave.prevent="isDragOver = false"
        @drop.prevent="onDrop"
        @mouseenter="onViewerMouseEnter"
        @mouseleave="onViewerMouseLeave"
        @wheel.prevent.stop
      >
        <!-- Canvas Container -->
        <div class="assets-canvas-container" ref="canvasContainerRef" @wheel.stop>
          <canvas ref="canvasRef" class="assets-canvas" @wheel.stop></canvas>

          <!-- Interaction Hint Overlay -->
          <transition name="fade">
            <div v-if="!hasInteracted" class="assets-interaction-hint">
              <span class="hint-icon">🔄</span>
              <span>{{ locale === 'vi' ? 'Kéo để xoay 360° • Cuộn để phóng to' : 'Drag to rotate 360° • Scroll to zoom' }}</span>
            </div>
          </transition>

          <!-- Top HUD Overlay -->
          <div class="assets-hud-top">
            <div class="hud-badge hud-model-name">
              <span class="badge-dot"></span>
              <span class="model-name-text">
                {{ customModelNames.get(selectedConceptId) || (locale === 'vi' ? allConcepts.find((c) => c.id === selectedConceptId)?.nameVi : allConcepts.find((c) => c.id === selectedConceptId)?.name) }}
              </span>
              <span v-if="customModelNames.has(selectedConceptId)" class="custom-badge">
                Blender 5.2 ({{ stats.fileSize }})
              </span>
            </div>

            <div class="hud-specs">
              <span class="spec-item" :title="locale === 'vi' ? 'Số lượng mặt lưới (Quads)' : 'Blender-standard 4-sided Quad faces'">
                <strong>{{ stats.quads.toLocaleString() }}</strong> {{ locale === 'vi' ? 'Mặt' : 'Quads' }}
              </span>
              <span class="spec-divider">•</span>
              <span class="spec-item" :title="locale === 'vi' ? 'Số lượng cạnh (Edges / Triangles)' : 'Triangle count'">
                <strong>{{ stats.polygons.toLocaleString() }}</strong> {{ locale === 'vi' ? 'cạnh' : 'Δ' }}
              </span>
              <span class="spec-divider">•</span>
              <span class="spec-item" :title="locale === 'vi' ? 'Số lượng điểm (Vertices)' : 'Vertex count'">
                <strong>{{ stats.vertices.toLocaleString() }}</strong> {{ locale === 'vi' ? 'điểm' : 'verts' }}
              </span>
              <span class="spec-divider">•</span>
              <span class="spec-item" :title="locale === 'vi' ? 'Kích thước thực tế từ Blender (Dài × Rộng × Cao)' : 'Real-world dimensions from Blender (Length × Width × Height)'">
                📏 {{ stats.dimensions }}
              </span>
            </div>
          </div>

          <!-- Blender 5.2 Scale Selector Bar -->
          <div class="assets-hud-scale-bar">
            <span class="scale-label">{{ locale === 'vi' ? 'Tỉ lệ Blender 5.2:' : 'Blender 5.2 Scale:' }}</span>
            <button
              class="scale-pill-btn"
              :class="{ active: currentScaleMode === 'autofit' }"
              @click="setScaleMode('autofit')"
              :title="locale === 'vi' ? 'Tự động vừa khung nhìn (Khuyên dùng)' : 'Auto-fit model to viewport (Recommended)'"
            >
              Auto-Fit
            </button>
            <button
              class="scale-pill-btn"
              :class="{ active: currentScaleMode === '1x' }"
              @click="setScaleMode('1x')"
              :title="locale === 'vi' ? 'Giữ nguyên tỉ lệ thực 1:1 từ Blender (1 unit = 1 mét)' : 'Keep 1:1 real-world scale from Blender (1 unit = 1 meter)'"
            >
              {{ locale === 'vi' ? '1:1 (Thực tế)' : '1:1 (Real)' }}
            </button>
            <button
              class="scale-pill-btn"
              :class="{ active: currentScaleMode === '0.01x' }"
              @click="setScaleMode('0.01x')"
              :title="locale === 'vi' ? 'Sửa lỗi tỉ lệ 100x của FBX (Centimet sang Mét)' : 'Fix FBX 100x scale issue (Centimeter to Meter)'"
            >
              0.01x (FBX cm)
            </button>
            <button
              class="scale-pill-btn"
              :class="{ active: currentScaleMode === '100x' }"
              @click="setScaleMode('100x')"
              :title="locale === 'vi' ? 'Phóng to 100x (nếu mô hình xuất quá nhỏ)' : 'Scale up 100x (if exported model is too small)'"
            >
              100x
            </button>
          </div>

          <!-- Left Side 3D Navigation Guide Panel (Bảng hướng dẫn thao tác bên tay trái) -->
          <div
            class="assets-hud-guide-panel"
            :class="{ 'is-collapsed': isNavGuideCollapsed }"
            @mousedown.stop
            @wheel.stop
            @touchstart.stop
          >
            <div
              class="guide-panel-header"
              @click="isNavGuideCollapsed = !isNavGuideCollapsed"
              :title="locale === 'vi' ? 'Bấm để thu gọn/mở rộng bảng hướng dẫn' : 'Click to collapse/expand guide panel'"
            >
              <div class="header-left">
                <svg class="header-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
                <span class="guide-panel-title">{{ locale === 'vi' ? 'Hướng dẫn thao tác 3D' : '3D Controls Guide' }}</span>
              </div>
              <button class="toggle-btn" :aria-label="isNavGuideCollapsed ? 'Expand' : 'Collapse'">
                <svg v-if="!isNavGuideCollapsed" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="18 15 12 9 6 15"></polyline>
                </svg>
                <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
            </div>

            <div v-show="!isNavGuideCollapsed" class="guide-panel-body">
              <!-- Item 1: Orbit / Rotate -->
              <div class="guide-row">
                <div class="mouse-icon-wrap" :title="locale === 'vi' ? 'Chuột trái: Xoay 360°' : 'Left Click: Rotate'">
                  <svg width="20" height="24" viewBox="0 0 24 28" fill="none" stroke="currentColor" stroke-width="1.8">
                    <rect x="2" y="2" width="20" height="24" rx="10"/>
                    <line x1="12" y1="2" x2="12" y2="12"/>
                    <line x1="2" y1="12" x2="22" y2="12"/>
                    <path d="M2 12C2 6.477 6.477 2 12 2V12H2Z" fill="var(--color-orange-400)" stroke="none"/>
                  </svg>
                </div>
                <div class="guide-info">
                  <div class="guide-action">{{ locale === 'vi' ? 'Xoay 360° tự do' : 'Rotate & Orbit 360°' }}</div>
                  <div class="guide-key">{{ locale === 'vi' ? 'Kéo chuột trái • 1 ngón' : 'Left click drag • 1 finger' }}</div>
                </div>
              </div>

              <!-- Item 2: Zoom -->
              <div class="guide-row">
                <div class="mouse-icon-wrap" :title="locale === 'vi' ? 'Cuộn chuột: Phóng to / Thu nhỏ' : 'Scroll Wheel: Zoom'">
                  <svg width="20" height="24" viewBox="0 0 24 28" fill="none" stroke="currentColor" stroke-width="1.8">
                    <rect x="2" y="2" width="20" height="24" rx="10"/>
                    <line x1="12" y1="2" x2="12" y2="12"/>
                    <line x1="2" y1="12" x2="22" y2="12"/>
                    <rect x="10" y="4" width="4" height="6" rx="2" fill="var(--color-orange-400)" stroke="none"/>
                  </svg>
                </div>
                <div class="guide-info">
                  <div class="guide-action">{{ locale === 'vi' ? 'Phóng to • Thu nhỏ' : 'Zoom In & Out' }}</div>
                  <div class="guide-key">{{ locale === 'vi' ? 'Cuộn chuột giữa • Chụm 2 ngón' : 'Scroll wheel • Pinch zoom' }}</div>
                </div>
              </div>

              <!-- Item 3: Pan -->
              <div class="guide-row">
                <div class="mouse-icon-wrap" :title="locale === 'vi' ? 'Chuột phải / Shift: Di chuyển Pan' : 'Right Click / Shift: Pan'">
                  <svg width="20" height="24" viewBox="0 0 24 28" fill="none" stroke="currentColor" stroke-width="1.8">
                    <rect x="2" y="2" width="20" height="24" rx="10"/>
                    <line x1="12" y1="2" x2="12" y2="12"/>
                    <line x1="2" y1="12" x2="22" y2="12"/>
                    <path d="M12 2C17.523 2 22 6.477 22 12H12V2Z" fill="var(--color-orange-400)" stroke="none"/>
                  </svg>
                </div>
                <div class="guide-info">
                  <div class="guide-action">{{ locale === 'vi' ? 'Di chuyển góc nhìn (Pan)' : 'Pan & Move Camera' }}</div>
                  <div class="guide-key">{{ locale === 'vi' ? 'Chuột phải • Shift + Kéo chuột' : 'Right click drag • Shift + Drag' }}</div>
                </div>
              </div>

              <!-- Item 4: Reset View -->
              <div class="guide-row">
                <div class="mouse-icon-wrap" :title="locale === 'vi' ? 'Nút Đặt lại: Khôi phục góc nhìn' : 'Reset View'">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                    <path d="M3 3v5h5"/>
                  </svg>
                </div>
                <div class="guide-info">
                  <div class="guide-action">{{ locale === 'vi' ? 'Góc nhìn chuẩn ban đầu' : 'Reset to Default View' }}</div>
                  <div class="guide-key">{{ locale === 'vi' ? 'Bấm nút "Đặt lại" ở dưới' : 'Click "Reset" at bottom' }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Bottom HUD Toolbar -->
          <div class="assets-hud-bottom">
            <div class="toolbar-group">
              <!-- Auto Rotate Toggle -->
              <button
                class="toolbar-btn"
                :class="{ active: isAutoRotate }"
                @click="toggleAutoRotate"
                :title="locale === 'vi' ? 'Tự động xoay 360°' : 'Auto Rotate 360°'"
                data-sound="click"
                data-hoversound="hover"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
                </svg>
                <span>{{ locale === 'vi' ? 'Xoay 360°' : 'Rotate 360°' }}</span>
              </button>

              <!-- Wireframe / Base Color Toggle -->
              <button
                class="toolbar-btn"
                :class="{ active: isWireframe }"
                @click="toggleWireframe"
                :title="locale === 'vi' ? 'Chuyển chế độ: Màu gốc / Khung dây Quads / Màu gốc + Quads' : 'Switch mode: Base Color / Quad Wireframe / Base Color + Quads'"
                data-sound="click"
                data-hoversound="hover"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                  <polyline points="2 17 12 22 22 17"></polyline>
                  <polyline points="2 12 12 17 22 12"></polyline>
                </svg>
                <span v-if="viewMode === 'shaded'">{{ locale === 'vi' ? 'Màu gốc' : 'Base Color' }}</span>
                <span v-else-if="viewMode === 'quads'">{{ locale === 'vi' ? 'Khung dây Quads' : 'Quad Wireframe' }}</span>
                <span v-else>{{ locale === 'vi' ? 'Màu gốc + Quads' : 'Base Color + Quads' }}</span>
              </button>

              <!-- Reset Camera -->
              <button
                class="toolbar-btn"
                @click="resetCamera"
                :title="locale === 'vi' ? 'Đặt lại góc nhìn' : 'Reset View'"
                data-sound="click"
                data-hoversound="hover"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                  <path d="M3 3v5h5"/>
                </svg>
                <span>{{ locale === 'vi' ? 'Đặt lại' : 'Reset' }}</span>
              </button>
            </div>

            <!-- Upload & Blender Compatibility Actions -->
            <div class="toolbar-upload-group">
              <button
                class="toolbar-btn guide-btn"
                @click="showBlenderGuide = true"
                :title="locale === 'vi' ? 'Xem hướng dẫn xuất file từ Blender 5.2' : 'View Blender 5.2 export guide'"
                data-sound="click"
                data-hoversound="hover"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
                <span>{{ locale === 'vi' ? 'Hướng dẫn Blender' : 'Blender Guide' }}</span>
              </button>

              <input
                ref="fileInputRef"
                type="file"
                accept=".glb,.gltf,.fbx,.obj,.png,.jpg,.jpeg,.tga"
                multiple
                class="hidden-file-input"
                @change="onFileInputChange"
              />
              <button
                class="toolbar-btn upload-btn"
                @click="fileInputRef?.click()"
                :title="locale === 'vi' ? 'Hỗ trợ tệp FBX kèm texture hoặc GLB xuất từ Blender 5.2' : 'Supports textured FBX or GLB exported from Blender 5.2'"
                data-sound="click"
                data-hoversound="hover"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                <div class="upload-btn-text">
                  <span>{{ locale === 'vi' ? 'Tải lên 3D (FBX / GLB)' : 'Upload 3D (FBX / GLB)' }}</span>
                  <small>{{ locale === 'vi' ? 'Blender 5.2 • FBX kèm texture / GLB' : 'Blender 5.2 • Textured FBX / GLB' }}</small>
                </div>
              </button>
            </div>
          </div>

          <!-- Drag & Drop Overlay -->
          <div v-if="isDragOver" class="drag-drop-modal">
            <div class="drag-drop-content">
              <span class="upload-icon">📥</span>
              <p v-if="locale === 'vi'">Thả tệp <strong>.FBX (kèm textures)</strong> hoặc <strong>.GLB</strong> từ Blender 5.2 vào đây</p>
              <p v-else>Drop <strong>.FBX (with textures)</strong> or <strong>.GLB</strong> files from Blender 5.2 here</p>
            </div>
          </div>

          <!-- Loading Spinner -->
          <div v-if="isLoading" class="loading-overlay">
            <div class="spinner"></div>
            <span>{{ loadingMessage }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Concept Selector Shelves -->
    <div class="grid">
      <!-- Shelf 1: NIGHT SHIPPER (10 Concepts) -->
      <div class="assets-shelf">
        <div class="shelf-header-bar">
          <div class="shelf-label">
            <span class="label-badge">{{ locale === 'vi' ? 'CHỌN' : 'SELECT' }}</span>
            <span>NIGHT SHIPPER:</span>
          </div>
          <div class="shelf-compat-badge">
            <span v-if="locale === 'vi'">Tương thích Blender 5.2 &bull; Unreal Engine 5 &bull; FBX kèm texture &bull; GLB</span>
            <span v-else>Compatible with Blender 5.2 &bull; Unreal Engine 5 &bull; Textured FBX &bull; GLB</span>
          </div>
        </div>

        <div class="shelf-cards">
          <button
            v-for="concept in concepts"
            :key="concept.id"
            class="concept-card"
            :class="{ active: selectedConceptId === concept.id }"
            @click="loadConcept(concept.id)"
            data-sound="click"
            data-hoversound="hover"
          >
            <div class="concept-info">
              <span class="concept-name">{{ concept.name }}</span>
              <span class="concept-vi">{{ locale === 'vi' ? concept.nameVi : concept.nameEn }}</span>
            </div>
            <span v-if="customModelNames.has(concept.id)" class="concept-custom-badge">Blender 📁</span>
          </button>
        </div>
      </div>

      <!-- Shelf 2: Gambling Gnomes -->
      <div class="assets-shelf gnome-shelf">
        <div class="shelf-header-bar gnome-header-bar">
          <div class="shelf-label">
            <span class="label-badge">{{ locale === 'vi' ? 'CHỌN' : 'SELECT' }}</span>
            <span class="gnome-title">Gambling Gnomes :</span>
          </div>
        </div>

        <div class="shelf-cards">
          <button
            v-for="concept in gamblingGnomesConcepts"
            :key="concept.id"
            class="concept-card"
            :class="{ active: selectedConceptId === concept.id }"
            @click="loadConcept(concept.id)"
            data-sound="click"
            data-hoversound="hover"
          >
            <div class="concept-info">
              <span class="concept-name">{{ concept.name }}</span>
              <span class="concept-vi">{{ locale === 'vi' ? concept.nameVi : concept.nameEn }}</span>
            </div>
            <span v-if="customModelNames.has(concept.id)" class="concept-custom-badge">Blender 📁</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Blender Export Guide Modal -->
    <div v-if="showBlenderGuide" class="guide-modal-backdrop" @click.self="showBlenderGuide = false">
      <div class="guide-modal">
        <div class="guide-modal-header">
          <h3>{{ locale === 'vi' ? '📦 Hướng dẫn xuất file từ Blender 5.2 sang Web3D' : '📦 Blender 5.2 to Web3D Export Guide' }}</h3>
          <button class="close-modal-btn" @click="showBlenderGuide = false">✕</button>
        </div>
        <div class="guide-modal-body">
          <div class="guide-section">
            <div class="guide-badge">{{ locale === 'vi' ? 'Cách 1: Khuyên dùng (Hiệu năng tốt nhất)' : 'Method 1: Recommended (Best Performance)' }}</div>
            <h4>{{ locale === 'vi' ? 'Xuất định dạng .GLB (Nhúng sẵn PBR Texture & Tỉ lệ 1:1)' : 'Export as .GLB (Embedded PBR Textures & 1:1 Real Scale)' }}</h4>
            <p v-if="locale === 'vi'">1. Trong Blender: Chọn <strong>File &gt; Export &gt; glTF 2.0 (.glb)</strong>.</p>
            <p v-else>1. In Blender: Select <strong>File &gt; Export &gt; glTF 2.0 (.glb)</strong>.</p>
            <p v-if="locale === 'vi'">2. Định dạng: Chọn <strong>glTF Binary (.glb)</strong>.</p>
            <p v-else>2. Format: Select <strong>glTF Binary (.glb)</strong>.</p>
            <p v-if="locale === 'vi'">3. Bảng bên phải: Mục <strong>Transform</strong> tick <em>+Y Up</em>; mục <strong>Materials</strong> tick <em>Export Materials</em>.</p>
            <p v-else>3. In the right panel: Under <strong>Transform</strong> check <em>+Y Up</em>; under <strong>Materials</strong> check <em>Export Materials</em>.</p>
            <p v-if="locale === 'vi'" class="guide-highlight">Toàn bộ Base Color, Roughness, Normal Map và tỉ lệ thực 1:1 đều được đóng gói vào một file duy nhất tối ưu!</p>
            <p v-else class="guide-highlight">All Base Color, Roughness, Normal Maps, and true real-world scale are packed into a single optimized file!</p>
          </div>

          <div class="guide-section">
            <div class="guide-badge">{{ locale === 'vi' ? 'Cách 2: Tệp .FBX' : 'Method 2: .FBX File' }}</div>
            <h4>{{ locale === 'vi' ? 'Xuất .FBX nhúng kèm Textures & Đúng tỉ lệ Blender 5.2' : 'Export .FBX with Embedded Textures & Blender 5.2 Scale' }}</h4>
            <p v-if="locale === 'vi'">1. Trong Blender: Chọn <strong>File &gt; Export &gt; FBX (.fbx)</strong>.</p>
            <p v-else>1. In Blender: Select <strong>File &gt; Export &gt; FBX (.fbx)</strong>.</p>
            <p v-if="locale === 'vi'">2. Bảng cài đặt xuất bên phải (Export Settings):
               <br>&bull; <strong>Path Mode</strong>: Chuyển từ <em>Auto</em> sang <strong>Copy</strong>.
               <br>&bull; Bấm icon ô hộp bên cạnh: <strong>Embed Textures</strong>.
               <br>&bull; <strong>Apply Scalings</strong>: Chọn <strong>FBX All</strong> để giữ đúng tỉ lệ thực tế.
            </p>
            <p v-else>2. In the right panel (Export Settings):
               <br>&bull; <strong>Path Mode</strong>: Change from <em>Auto</em> to <strong>Copy</strong>.
               <br>&bull; Click the box icon next to it: <strong>Embed Textures</strong>.
               <br>&bull; <strong>Apply Scalings</strong>: Select <strong>FBX All</strong> to maintain correct scale.
            </p>
            <p v-if="locale === 'vi'" class="guide-highlight">Mẹo: Bạn có thể chọn đồng thời cả file .fbx và các file ảnh texture (.png / .jpg) cùng lúc khi bấm Tải lên.</p>
            <p v-else class="guide-highlight">Tip: You can select both the .fbx file and texture images (.png / .jpg) simultaneously when clicking Upload.</p>
          </div>
        </div>
        <div class="guide-modal-footer">
          <button class="modal-primary-btn" @click="showBlenderGuide = false">{{ locale === 'vi' ? 'Đã hiểu' : 'Got It' }}</button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.assets {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  width: 100%;
  gap: var(--space-xl);
  padding-left: var(--space-outer);
  padding-right: var(--space-outer);
  background-color: var(--color-beige-600);
  padding-top: 112px;
  padding-bottom: 96px;
  font-family: "Times New Roman", Times, serif !important;

  * {
    font-family: "Times New Roman", Times, serif !important;
  }

  @include mixins.mq("md") {
    padding-top: 160px;
    padding-bottom: 144px;
    gap: var(--space-xxl);
  }

  &-notch {
    &-start {
      position: absolute;
      top: 0;
      left: 0;
      transform: translateY(-100%);
      color: var(--color-beige-600);
      --icon-color: var(--color-beige-600);
    }

    &-end {
      position: absolute;
      bottom: 0;
      left: 0;
      color: var(--color-beige-600);
      --icon-color: var(--color-beige-600);
    }
  }

  &-header {
    grid-column: 1 / span 12;
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
    width: 100%;

    @include mixins.mq("lg") {
      grid-column: 2 / span 10;
    }
  }

  &-title {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-xs);
    padding-top: 0;

    &-copy {
      font-weight: 900;
      letter-spacing: 0.02em;
      font-size: var(--font-size-title-md);

      @include mixins.mq("sm") {
        font-size: var(--font-size-title-lg);
      }

      @include mixins.mq("xl") {
        font-size: var(--font-size-title-xl);
      }
    }

    &-banner {
      position: relative;
      margin-top: 2px;
      transform: rotate(-2deg);
      transform-origin: left center;

      @include mixins.mq("lg") {
        transform: rotate(-2.5deg);
      }
    }
  }

  &-description {
    font-size: var(--font-size-sm);
    color: var(--color-text-300);
    line-height: 1.6;
    max-width: 760px;

    @include mixins.mq("md") {
      font-size: var(--font-size-md);
    }
  }

  &-viewer-card {
    grid-column: 1 / span 12;
    position: relative;
    width: 100%;
    background: var(--color-beige-500);
    border: 2px solid rgba(0, 0, 0, 0.06);
    border-radius: var(--radius-xl, 24px);
    overflow: hidden;
    box-shadow:
      0 12px 32px -4px rgba(0, 0, 0, 0.06),
      0 4px 12px -2px rgba(0, 0, 0, 0.03);
    transition: border-color 0.2s ease, box-shadow 0.2s ease;

    @include mixins.mq("lg") {
      grid-column: 2 / span 10;
    }

    &.is-drag-over {
      border-color: var(--color-orange-400);
      box-shadow: 0 0 28px rgba(255, 132, 0, 0.35);
    }
  }

  &-canvas-container {
    position: relative;
    width: 100%;
    height: 480px;
    background: radial-gradient(circle at center, var(--color-beige-400) 0%, var(--color-beige-500) 100%);
    cursor: grab;

    &:active {
      cursor: grabbing;
    }

    @include mixins.mq("md") {
      height: 560px;
    }

    @include mixins.mq("xl") {
      height: 620px;
    }
  }

  &-canvas {
    width: 100%;
    height: 100%;
    display: block;
    outline: none;
  }

  &-interaction-hint {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(45, 42, 36, 0.75);
    backdrop-filter: blur(8px);
    color: #ffffff;
    padding: 10px 20px;
    border-radius: 100px;
    font-size: 13px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
    pointer-events: none;
    z-index: 10;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);

    .hint-icon {
      font-size: 16px;
      animation: spin 3s linear infinite;
    }
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  &-hud-top {
    position: absolute;
    top: 16px;
    left: 16px;
    right: 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px;
    pointer-events: none;
    z-index: 5;

    .hud-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(10px);
      padding: 6px 14px;
      border-radius: 100px;
      border: 1px solid rgba(0, 0, 0, 0.08);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
      color: #2d2a24;
      font-weight: 700;
      font-size: 13px;

      .badge-dot {
        width: 8px;
        height: 8px;
        background: #10b981;
        border-radius: 50%;
        box-shadow: 0 0 8px #10b981;
      }

      .custom-badge {
        font-size: 11px;
        background: var(--color-orange-400);
        color: #ffffff;
        padding: 2px 8px;
        border-radius: 100px;
      }
    }

    .hud-specs {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(45, 42, 36, 0.72);
      backdrop-filter: blur(8px);
      padding: 6px 14px;
      border-radius: 100px;
      color: rgba(255, 255, 255, 0.95);
      font-size: 12px;
      letter-spacing: 0.02em;

      strong {
        color: var(--color-orange-400);
      }

      .spec-divider {
        opacity: 0.4;
      }
    }
  }

  /* Blender 5.2 Scale Selector Bar */
  &-hud-scale-bar {
    position: absolute;
    top: 56px;
    left: 16px;
    display: flex;
    align-items: center;
    gap: 6px;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    padding: 4px 8px;
    border-radius: 100px;
    border: 1px solid rgba(0, 0, 0, 0.08);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
    z-index: 5;

    .scale-label {
      font-size: 11px;
      font-weight: 800;
      color: #5f5646;
      padding-left: 6px;
      padding-right: 4px;
    }

    .scale-pill-btn {
      background: transparent;
      border: none;
      border-radius: 100px;
      padding: 4px 10px;
      font-size: 11px;
      font-weight: 700;
      color: #2d2a24;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        background: rgba(0, 0, 0, 0.05);
        color: #1a1a1a;
      }

      &.active {
        background: var(--color-orange-400);
        color: #ffffff;
      }
    }
  }

  /* Left Side 3D Navigation Guide Panel */
  &-hud-guide-panel {
    position: absolute;
    top: 98px;
    left: 16px;
    width: 236px;
    background: rgba(255, 255, 255, 0.92);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(0, 0, 0, 0.08);
    border-radius: 16px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
    z-index: 6;
    overflow: hidden;
    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    user-select: none;

    &.is-collapsed {
      width: auto;
      border-radius: 100px;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.04);

      .guide-panel-header {
        padding: 6px 12px;
      }
    }

    .guide-panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 12px;
      cursor: pointer;
      gap: 8px;
      transition: background 0.15s ease;

      &:hover {
        background: rgba(0, 0, 0, 0.03);
      }

      .header-left {
        display: flex;
        align-items: center;
        gap: 6px;
        color: #2d2a24;

        .header-icon {
          color: var(--color-orange-400);
          flex-shrink: 0;
        }

        .guide-panel-title {
          font-size: 11.5px;
          font-weight: 800;
          letter-spacing: 0.01em;
          white-space: nowrap;
        }
      }

      .toggle-btn {
        background: transparent;
        border: none;
        padding: 0;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #71695b;
        transition: color 0.15s ease;

        &:hover {
          color: #1a1a1a;
        }
      }
    }

    .guide-panel-body {
      padding: 4px 10px 10px 10px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      border-top: 1px solid rgba(0, 0, 0, 0.05);

      .guide-row {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 5px 8px;
        border-radius: 10px;
        background: rgba(0, 0, 0, 0.02);
        transition: all 0.15s ease;

        &:hover {
          background: rgba(255, 148, 0, 0.09);
        }

        .mouse-icon-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          color: #5c5548;
          flex-shrink: 0;
        }

        .guide-info {
          display: flex;
          flex-direction: column;
          line-height: 1.25;

          .guide-action {
            font-size: 11px;
            font-weight: 800;
            color: #26231d;
          }

          .guide-key {
            font-size: 9.5px;
            font-weight: 600;
            color: #786f60;
          }
        }
      }
    }

    @media (max-width: 768px) {
      top: 96px;
      left: 10px;
      width: 210px;
    }
  }

  &-hud-bottom {
    position: absolute;
    bottom: 16px;
    left: 16px;
    right: 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px;
    z-index: 5;

    .toolbar-group {
      display: flex;
      align-items: center;
      gap: 6px;
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(10px);
      padding: 5px;
      border-radius: 100px;
      border: 1px solid rgba(0, 0, 0, 0.08);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
    }

    .toolbar-upload-group {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .toolbar-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      background: transparent;
      border: none;
      border-radius: 100px;
      padding: 8px 14px;
      color: #2d2a24;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background: rgba(0, 0, 0, 0.05);
        color: #1a1a1a;
      }

      &.active {
        background: var(--color-orange-400);
        color: #ffffff;
        box-shadow: 0 2px 8px rgba(255, 132, 0, 0.35);
      }

      &.guide-btn {
        background: rgba(255, 255, 255, 0.9);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(0, 0, 0, 0.08);
        padding: 9px 14px;
        color: #2d2a24;

        &:hover {
          background: #ffffff;
          color: var(--color-orange-400);
        }
      }

      &.upload-btn {
        background: var(--color-cyan-500);
        color: #ffffff;
        padding: 8px 16px;
        box-shadow: 0 4px 14px rgba(0, 134, 187, 0.3);

        .upload-btn-text {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          line-height: 1.2;

          span {
            font-size: 13px;
            font-weight: 800;
          }

          small {
            font-size: 10px;
            opacity: 0.9;
            font-weight: 500;
          }
        }

        &:hover {
          background: var(--color-cyan-400);
          color: #000;
        }
      }
    }
  }

  &-shelf {
    grid-column: 1 / span 12;
    display: flex;
    flex-direction: column;
    gap: 14px;
    width: 100%;

    @include mixins.mq("lg") {
      grid-column: 2 / span 10;
    }

    .shelf-header-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 8px;
    }

    &.gnome-shelf {
      margin-top: 12px;

      .gnome-header-bar {
        justify-content: flex-start;
        align-items: center;
        gap: 16px;
      }

      .gnome-title {
        font-size: 15px;
        font-weight: 800;
        color: var(--color-text-400);
      }
    }

    .shelf-label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      font-weight: 800;
      letter-spacing: 0.06em;
      color: var(--color-text-400);

      .label-badge {
        background: var(--color-orange-400);
        color: #ffffff;
        padding: 2px 8px;
        border-radius: 6px;
        font-size: 11px;
        letter-spacing: 0.08em;
      }
    }

    .shelf-compat-badge {
      font-size: 12px;
      font-weight: 600;
      color: var(--color-text-300);
      background: rgba(0, 0, 0, 0.04);
      padding: 4px 12px;
      border-radius: 100px;
    }

    .shelf-cards {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;

      @include mixins.mq("sm") {
        grid-template-columns: repeat(3, 1fr);
      }

      @include mixins.mq("lg") {
        grid-template-columns: repeat(5, 1fr);
      }
    }

    .concept-card {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      gap: 4px;
      background: var(--color-beige-500);
      border: 2px solid transparent;
      border-radius: var(--radius-lg, 16px);
      padding: 16px 12px;
      min-height: 68px;
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);

      &:hover {
        transform: translateY(-2px);
        background: var(--color-beige-400);
        box-shadow: 0 6px 14px rgba(0, 0, 0, 0.06);
      }

      &.active {
        border-color: var(--color-orange-400);
        background: var(--color-beige-400);
        box-shadow: 0 4px 16px rgba(255, 132, 0, 0.22);

        .concept-name {
          color: var(--color-orange-400);
        }
      }

      .concept-info {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 3px;
      }

      .concept-name {
        font-size: 13.5px;
        font-weight: 700;
        color: var(--color-text-400);
        line-height: 1.25;
      }

      .concept-vi {
        font-size: 12px;
        font-weight: 600;
        color: var(--color-text-300);
      }

      .concept-custom-badge {
        position: absolute;
        top: 6px;
        right: 6px;
        font-size: 9px;
        font-weight: 700;
        background: var(--color-cyan-500);
        color: #ffffff;
        padding: 1px 5px;
        border-radius: 4px;
      }
    }
  }
}

.hidden-file-input {
  display: none;
}

.drag-drop-modal {
  position: absolute;
  inset: 0;
  background: rgba(255, 132, 0, 0.9);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;
  color: #ffffff;

  .drag-drop-content {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;

    .upload-icon {
      font-size: 48px;
    }

    p {
      font-size: 18px;
      font-weight: 700;
    }
  }
}

.loading-overlay {
  position: absolute;
  inset: 0;
  background: rgba(245, 239, 230, 0.88);
  backdrop-filter: blur(4px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  z-index: 15;
  color: var(--color-text-400);
  font-weight: 700;

  .spinner {
    width: 38px;
    height: 38px;
    border: 3px solid rgba(255, 132, 0, 0.2);
    border-top-color: var(--color-orange-400);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
}

/* Blender Guide Modal */
.guide-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.guide-modal {
  background: var(--color-beige-400);
  border-radius: 20px;
  max-width: 580px;
  width: 100%;
  padding: 24px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(0, 0, 0, 0.1);
  color: var(--color-text-400);

  &-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
    padding-bottom: 14px;
    margin-bottom: 16px;

    h3 {
      font-size: 17px;
      font-weight: 800;
      color: var(--color-text-400);
    }

    .close-modal-btn {
      background: none;
      border: none;
      font-size: 18px;
      cursor: pointer;
      color: var(--color-text-300);
      padding: 4px 8px;
      border-radius: 6px;

      &:hover {
        background: rgba(0, 0, 0, 0.06);
      }
    }
  }

  &-body {
    display: flex;
    flex-direction: column;
    gap: 16px;
    font-size: 13.5px;
    line-height: 1.55;
  }

  .guide-section {
    background: var(--color-beige-500);
    padding: 16px;
    border-radius: 12px;
    border: 1px solid rgba(0, 0, 0, 0.05);

    .guide-badge {
      display: inline-block;
      font-size: 11px;
      font-weight: 800;
      background: var(--color-cyan-500);
      color: #ffffff;
      padding: 2px 8px;
      border-radius: 4px;
      margin-bottom: 6px;
    }

    h4 {
      font-size: 14.5px;
      font-weight: 700;
      margin-bottom: 6px;
    }

    .guide-highlight {
      margin-top: 8px;
      font-weight: 600;
      color: var(--color-orange-400);
    }
  }

  &-footer {
    display: flex;
    justify-content: flex-end;
    margin-top: 18px;

    .modal-primary-btn {
      background: var(--color-orange-400);
      color: #ffffff;
      border: none;
      padding: 10px 24px;
      border-radius: 100px;
      font-weight: 700;
      cursor: pointer;
      transition: opacity 0.2s;

      &:hover {
        opacity: 0.9;
      }
    }
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

import {
  Group,
  Mesh,
  MeshBasicMaterial,
  BoxGeometry,
  CylinderGeometry,
  SphereGeometry,
  ConeGeometry,
  TorusGeometry,
  PointLight,
} from "three";

// Shared Base Color materials (pure unlit, no roughness, no metallic, no complex shaders)
const mats = {
  // Woods
  darkWood: new MeshBasicMaterial({ color: 0x4a3525 }),
  warmWood: new MeshBasicMaterial({ color: 0x8b5a2b }),
  bamboo: new MeshBasicMaterial({ color: 0xc4a35a }),

  // Architecture
  hoiAnYellow: new MeshBasicMaterial({ color: 0xe5a823 }),
  vietnamRedTile: new MeshBasicMaterial({ color: 0xb23b23 }),
  darkTile: new MeshBasicMaterial({ color: 0x2b2b2b }),
  colonialGreen: new MeshBasicMaterial({ color: 0x1d4d38 }),
  concreteOld: new MeshBasicMaterial({ color: 0x8a857b }),
  brickWall: new MeshBasicMaterial({ color: 0x9e4b38 }),

  // Nature
  grass: new MeshBasicMaterial({ color: 0x4f7d3a }),
  moss: new MeshBasicMaterial({ color: 0x3b6329 }),
  darkStone: new MeshBasicMaterial({ color: 0x5a5855 }),
  redBasalt: new MeshBasicMaterial({ color: 0x8b3a2b }),
  waterTurquoise: new MeshBasicMaterial({
    color: 0x1fa3a3,
    transparent: true,
    opacity: 0.85,
  }),
  waterLake: new MeshBasicMaterial({
    color: 0x1b4d4f,
    transparent: true,
    opacity: 0.88,
  }),
  pineFoliage: new MeshBasicMaterial({ color: 0x25522c }),
  lightFoliage: new MeshBasicMaterial({ color: 0x5b8a3c }),

  // Industrial & Cyber
  ironSteel: new MeshBasicMaterial({ color: 0x43484f }),
  rustyMetal: new MeshBasicMaterial({ color: 0x8b4513 }),
  brightRed: new MeshBasicMaterial({ color: 0xd92626 }),
  cyberNeonCyan: new MeshBasicMaterial({ color: 0x00f0ff }),
  cyberNeonPink: new MeshBasicMaterial({ color: 0xff007f }),
  lanternAmber: new MeshBasicMaterial({ color: 0xffaa22 }),
  lanternRed: new MeshBasicMaterial({ color: 0xff2222 }),
  chalkboard: new MeshBasicMaterial({ color: 0x1b382b }),

  // Fantasy & Gambling Gnomes
  mushroomStem: new MeshBasicMaterial({ color: 0xf5eedc }),
  mushroomCap: new MeshBasicMaterial({ color: 0xe53935 }),
  mushroomDots: new MeshBasicMaterial({ color: 0xffffff }),
  lotusPetalPink: new MeshBasicMaterial({ color: 0xf48fb1 }),
  lotusCenterYellow: new MeshBasicMaterial({ color: 0xffd54f }),
  lilyPad: new MeshBasicMaterial({ color: 0x2e7d32 }),
  tavernDungeonStone: new MeshBasicMaterial({ color: 0x424242 }),
  tableFeltGreen: new MeshBasicMaterial({ color: 0x1b5e20 }),
  goldCoin: new MeshBasicMaterial({ color: 0xffb300 }),

  // Realistic Texture Variations
  mushroomStemRealistic: new MeshBasicMaterial({ color: 0xd4cabb }),
  mushroomCapRealistic: new MeshBasicMaterial({ color: 0x821f1f }),
  mushroomDotsRealistic: new MeshBasicMaterial({ color: 0xd6cbb0 }),
  waterMurkyRealistic: new MeshBasicMaterial({ color: 0x133d3d, transparent: true, opacity: 0.9 }),
  lilyPadRealistic: new MeshBasicMaterial({ color: 0x1e4522 }),
  lotusRealisticPink: new MeshBasicMaterial({ color: 0xf3dce5 }),
  driftwoodTimber: new MeshBasicMaterial({ color: 0x5a4a3a }),
};

// Pedestal Base
function createBasePedestal(radius: number, mat: MeshBasicMaterial): Mesh {
  const geo = new CylinderGeometry(radius, radius * 1.04, 0.25, 48);
  const mesh = new Mesh(geo, mat);
  mesh.position.y = 0.125;
  mesh.receiveShadow = true;
  return mesh;
}

// 1. Ha Noi Train Street (Phố đường tàu Hà Nội)
function createHanoiTrainStreet(): Group {
  const g = new Group();
  g.add(createBasePedestal(3.2, mats.concreteOld));

  // Ballast Gravel Bed
  const ballast = new Mesh(new BoxGeometry(1.6, 0.1, 5.8), mats.darkStone);
  ballast.position.set(0, 0.3, 0);
  g.add(ballast);

  // Railroad Ties (Sleepers)
  for (let z = -2.6; z <= 2.6; z += 0.35) {
    const tie = new Mesh(new BoxGeometry(1.3, 0.08, 0.15), mats.darkWood);
    tie.position.set(0, 0.38, z);
    g.add(tie);
  }

  // Steel Rails
  [-0.45, 0.45].forEach((x) => {
    const rail = new Mesh(new BoxGeometry(0.06, 0.1, 5.8), mats.ironSteel);
    rail.position.set(x, 0.46, 0);
    g.add(rail);
  });

  // Vintage Shophouse on Left Side
  const house = new Mesh(new BoxGeometry(1.2, 3.2, 3.8), mats.hoiAnYellow);
  house.position.set(-1.8, 1.85, 0);
  g.add(house);

  // Green Window Shutters
  [-1.0, 1.0].forEach((z) => {
    const windowFrame = new Mesh(new BoxGeometry(0.08, 0.9, 0.7), mats.colonialGreen);
    windowFrame.position.set(-1.18, 2.3, z);
    g.add(windowFrame);
  });

  // Overhanging Balcony & Metal Roof
  const balcony = new Mesh(new BoxGeometry(0.5, 0.1, 3.4), mats.concreteOld);
  balcony.position.set(-1.4, 1.6, 0);
  g.add(balcony);

  const eave = new Mesh(new BoxGeometry(0.8, 0.08, 3.6), mats.vietnamRedTile);
  eave.position.set(-1.3, 3.45, 0);
  eave.rotation.z = -0.15;
  g.add(eave);

  // Train Signal Post with Glowing Amber Light
  const pole = new Mesh(new CylinderGeometry(0.04, 0.04, 2.4, 16), mats.ironSteel);
  pole.position.set(1.4, 1.45, 1.8);
  g.add(pole);

  const signalBox = new Mesh(new BoxGeometry(0.2, 0.35, 0.2), mats.darkTile);
  signalBox.position.set(1.4, 2.4, 1.8);
  g.add(signalBox);

  const amberLight = new Mesh(new SphereGeometry(0.08, 16, 16), mats.lanternAmber);
  amberLight.position.set(1.3, 2.4, 1.8);
  g.add(amberLight);

  const light = new PointLight(0xffaa22, 1.2, 4);
  light.position.set(1.2, 2.4, 1.8);
  g.add(light);

  // Roadside Café Stool & Table
  const stool1 = new Mesh(new CylinderGeometry(0.14, 0.14, 0.25, 16), mats.brightRed);
  stool1.position.set(1.1, 0.38, -0.6);
  const stool2 = new Mesh(new CylinderGeometry(0.14, 0.14, 0.25, 16), mats.cyberNeonCyan);
  stool2.position.set(1.1, 0.38, 0.2);
  const table = new Mesh(new CylinderGeometry(0.25, 0.25, 0.4, 16), mats.darkTile);
  table.position.set(1.5, 0.45, -0.2);
  g.add(stool1, stool2, table);

  return g;
}

// 2. Hoi An Ancient Town (Phố cổ Hội An)
function createHoianAncientTown(): Group {
  const g = new Group();
  g.add(createBasePedestal(3.2, mats.darkStone));

  // Heritage Townhouse Facade
  const wall = new Mesh(new BoxGeometry(3.6, 2.8, 1.4), mats.hoiAnYellow);
  wall.position.set(0, 1.65, -0.8);
  g.add(wall);

  // Yin-Yang Tiled Curved Roof
  const roof = new Mesh(new CylinderGeometry(2.3, 2.3, 4.0, 16, 1, false, 0, Math.PI), mats.vietnamRedTile);
  roof.rotation.z = Math.PI / 2;
  roof.rotation.y = -Math.PI / 2;
  roof.position.set(0, 3.05, -0.7);
  roof.scale.set(0.6, 1.0, 1.0);
  g.add(roof);

  // Traditional Dark Timber Entrance
  const door = new Mesh(new BoxGeometry(1.2, 1.9, 0.1), mats.darkWood);
  door.position.set(0, 1.2, -0.08);
  g.add(door);

  // Hanging Silk Lanterns with Glow
  const lanternConfigs = [
    { x: -1.2, y: 2.3, z: 0.1, mat: mats.lanternAmber, color: 0xffaa22 },
    { x: -0.4, y: 2.4, z: 0.1, mat: mats.lanternRed, color: 0xff2222 },
    { x: 0.4, y: 2.4, z: 0.1, mat: mats.lanternAmber, color: 0xffaa22 },
    { x: 1.2, y: 2.3, z: 0.1, mat: mats.lanternRed, color: 0xff2222 },
  ];

  lanternConfigs.forEach((c) => {
    const lantern = new Mesh(new SphereGeometry(0.18, 16, 16), c.mat);
    lantern.scale.set(0.85, 1.2, 0.85);
    lantern.position.set(c.x, c.y, c.z);
    g.add(lantern);

    const ptLight = new PointLight(c.color, 0.9, 3);
    ptLight.position.set(c.x, c.y, c.z);
    g.add(ptLight);
  });

  // Wooden Balcony Railing in Front
  const railing = new Mesh(new BoxGeometry(3.2, 0.45, 0.1), mats.darkWood);
  railing.position.set(0, 0.5, 1.5);
  g.add(railing);

  // Ceramic Planters
  [-1.2, 1.2].forEach((x) => {
    const pot = new Mesh(new CylinderGeometry(0.2, 0.14, 0.35, 16), mats.brickWall);
    pot.position.set(x, 0.425, 0.6);
    const plantFoliage = new Mesh(new SphereGeometry(0.25, 12, 12), mats.lightFoliage);
    plantFoliage.position.set(x, 0.7, 0.6);
    g.add(pot, plantFoliage);
  });

  return g;
}

// 3. KowLoon Walled City (Cửu Long Thành Trại)
function createKowloonWalledCity(): Group {
  const g = new Group();
  g.add(createBasePedestal(3.2, mats.darkStone));

  // Dense Monolithic Modular Buildings (Stacked)
  const block1 = new Mesh(new BoxGeometry(1.6, 4.4, 1.6), mats.concreteOld);
  block1.position.set(-0.6, 2.45, -0.4);

  const block2 = new Mesh(new BoxGeometry(1.4, 3.6, 1.5), mats.brickWall);
  block2.position.set(0.7, 2.05, -0.3);

  const block3 = new Mesh(new BoxGeometry(1.8, 2.6, 1.4), mats.concreteOld);
  block3.position.set(-0.2, 1.55, 0.8);

  g.add(block1, block2, block3);

  // Rooftop Water Cisterns & Antennas
  const tank1 = new Mesh(new CylinderGeometry(0.35, 0.35, 0.6, 16), mats.rustyMetal);
  tank1.position.set(-0.6, 4.95, -0.4);
  const antenna = new Mesh(new CylinderGeometry(0.02, 0.02, 1.2, 8), mats.ironSteel);
  antenna.position.set(0.6, 4.4, -0.3);
  g.add(tank1, antenna);

  // AC Units on Walls
  const acPositions = [
    { x: -0.6, y: 3.2, z: 0.42 },
    { x: 0.6, y: 2.8, z: 0.48 },
    { x: -1.42, y: 2.4, z: -0.4 },
  ];
  acPositions.forEach((p) => {
    const ac = new Mesh(new BoxGeometry(0.3, 0.2, 0.18), mats.darkTile);
    ac.position.set(p.x, p.y, p.z);
    g.add(ac);
  });

  // Glowing Cyber Neon Signs (Cyan & Pink)
  const neonCyan = new Mesh(new BoxGeometry(0.1, 1.4, 0.4), mats.cyberNeonCyan);
  neonCyan.position.set(0.72, 2.6, 0.9);
  const cyanLight = new PointLight(0x00f0ff, 1.8, 4);
  cyanLight.position.set(0.9, 2.6, 1.1);

  const neonPink = new Mesh(new BoxGeometry(0.4, 0.8, 0.1), mats.cyberNeonPink);
  neonPink.position.set(-0.6, 2.8, 0.92);
  const pinkLight = new PointLight(0xff007f, 1.6, 4);
  pinkLight.position.set(-0.6, 2.8, 1.2);

  g.add(neonCyan, cyanLight, neonPink, pinkLight);

  return g;
}

// 4. Forest (Rừng Đại Ngàn)
function createForest(): Group {
  const g = new Group();
  g.add(createBasePedestal(3.2, mats.grass));

  // Mossy Rock Boulders
  const rock1 = new Mesh(new SphereGeometry(0.5, 12, 12), mats.darkStone);
  rock1.scale.set(1.4, 0.7, 1.0);
  rock1.position.set(1.2, 0.45, 0.6);

  const rock2 = new Mesh(new SphereGeometry(0.35, 12, 12), mats.moss);
  rock2.scale.set(1.1, 0.8, 1.3);
  rock2.position.set(-1.3, 0.38, 0.8);

  g.add(rock1, rock2);

  // Stylized Pine Trees
  const treeConfigs = [
    { x: -0.6, z: -0.5, h: 3.2, r: 0.95 },
    { x: 0.8, z: -0.7, h: 2.8, r: 0.8 },
    { x: 0.2, z: 0.6, h: 2.2, r: 0.65 },
  ];

  treeConfigs.forEach((tc) => {
    const trunk = new Mesh(new CylinderGeometry(0.12, 0.16, tc.h * 0.4, 12), mats.darkWood);
    trunk.position.set(tc.x, tc.h * 0.2 + 0.25, tc.z);
    g.add(trunk);

    // 3 Foliage Cones
    for (let i = 0; i < 3; i++) {
      const cone = new Mesh(new ConeGeometry(tc.r * (1 - i * 0.2), tc.h * 0.35, 12), mats.pineFoliage);
      cone.position.set(tc.x, tc.h * (0.35 + i * 0.22) + 0.25, tc.z);
      g.add(cone);
    }
  });

  // Forest Mushrooms
  [-0.3, 0.6].forEach((x, i) => {
    const stem = new Mesh(new CylinderGeometry(0.03, 0.04, 0.15, 8), mats.bamboo);
    stem.position.set(x, 0.32, 1.1 + i * 0.2);
    const cap = new Mesh(new SphereGeometry(0.09, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2), mats.brightRed);
    cap.position.set(x, 0.4, 1.1 + i * 0.2);
    g.add(stem, cap);
  });

  // Firefly Lights
  const firefly = new PointLight(0x99ff66, 1.0, 3);
  firefly.position.set(0, 1.5, 0.4);
  g.add(firefly);

  return g;
}

// 5. Central Highlands (Tây Nguyên Đại Ngàn)
function createCentralHighlands(): Group {
  const g = new Group();
  g.add(createBasePedestal(3.2, mats.redBasalt));

  // Stilt Pillars
  const deck = new Mesh(new BoxGeometry(2.4, 0.1, 1.8), mats.darkWood);
  deck.position.set(0, 1.0, 0);
  g.add(deck);

  const pillarCoords = [
    { x: -1.0, z: -0.7 },
    { x: 1.0, z: -0.7 },
    { x: -1.0, z: 0.7 },
    { x: 1.0, z: 0.7 },
  ];
  pillarCoords.forEach((p) => {
    const pil = new Mesh(new CylinderGeometry(0.06, 0.07, 0.9, 12), mats.darkWood);
    pil.position.set(p.x, 0.55, p.z);
    g.add(pil);
  });

  // Towering Curved High-Roof (Nhà Rông)
  const roofHigh = new Mesh(new ConeGeometry(1.6, 3.4, 4), mats.bamboo);
  roofHigh.scale.set(0.9, 1.0, 0.5);
  roofHigh.position.set(0, 2.7, 0);
  g.add(roofHigh);

  // Tribal Totem Pole
  const totem = new Mesh(new CylinderGeometry(0.08, 0.1, 2.2, 12), mats.warmWood);
  totem.position.set(1.8, 1.25, 0.8);
  g.add(totem);

  // Campfire with Glowing Embers
  for (let i = 0; i < 4; i++) {
    const log = new Mesh(new CylinderGeometry(0.05, 0.05, 0.45, 8), mats.darkWood);
    log.rotation.z = Math.PI / 3;
    log.rotation.y = (i * Math.PI) / 2;
    log.position.set(-1.2, 0.32, 1.0);
    g.add(log);
  }

  const fireEmber = new Mesh(new SphereGeometry(0.12, 12, 12), mats.lanternAmber);
  fireEmber.position.set(-1.2, 0.36, 1.0);
  const fireLight = new PointLight(0xff6600, 1.8, 4);
  fireLight.position.set(-1.2, 0.55, 1.0);
  g.add(fireEmber, fireLight);

  return g;
}

// 6. Old School (Trường học Ma ám)
function createOldSchool(): Group {
  const g = new Group();
  g.add(createBasePedestal(3.2, mats.darkWood));

  // Classroom Chalkboard
  const boardFrame = new Mesh(new BoxGeometry(2.6, 1.6, 0.1), mats.warmWood);
  boardFrame.position.set(0, 1.9, -1.2);
  const boardFace = new Mesh(new BoxGeometry(2.4, 1.4, 0.12), mats.chalkboard);
  boardFace.position.set(0, 1.9, -1.18);
  g.add(boardFrame, boardFace);

  // Teacher / Student Wooden Desk
  const deskTop = new Mesh(new BoxGeometry(1.8, 0.08, 0.9), mats.warmWood);
  deskTop.position.set(0, 1.0, 0.1);

  [-0.8, 0.8].forEach((x) => {
    [-0.35, 0.35].forEach((z) => {
      const leg = new Mesh(new CylinderGeometry(0.04, 0.04, 0.85, 12), mats.darkWood);
      leg.position.set(x, 0.58, 0.1 + z);
      g.add(leg);
    });
  });
  g.add(deskTop);

  // Bench Seat behind desk
  const bench = new Mesh(new BoxGeometry(1.6, 0.08, 0.35), mats.warmWood);
  bench.position.set(0, 0.65, 0.9);
  [-0.65, 0.65].forEach((x) => {
    const leg = new Mesh(new CylinderGeometry(0.035, 0.035, 0.5, 12), mats.darkWood);
    leg.position.set(x, 0.4, 0.9);
    g.add(leg);
  });
  g.add(bench);

  // Desk Props: Old Grimoire Book & Mystery Relic
  const book = new Mesh(new BoxGeometry(0.35, 0.05, 0.25), mats.brickWall);
  book.position.set(-0.4, 1.07, 0.1);
  const candleBase = new Mesh(new CylinderGeometry(0.04, 0.06, 0.15, 12), mats.ironSteel);
  candleBase.position.set(0.5, 1.12, 0.1);
  const candleFlame = new Mesh(new SphereGeometry(0.06, 12, 12), mats.lanternAmber);
  candleFlame.position.set(0.5, 1.24, 0.1);
  const candleLight = new PointLight(0xff9933, 1.4, 3.5);
  candleLight.position.set(0.5, 1.35, 0.1);

  // Eerie Haunted Orb
  const eerieOrb = new Mesh(new SphereGeometry(0.1, 16, 16), mats.cyberNeonCyan);
  eerieOrb.position.set(-0.8, 1.8, -0.6);
  const eerieGlow = new PointLight(0x00f0ff, 1.1, 3);
  eerieGlow.position.set(-0.8, 1.8, -0.6);

  g.add(book, candleBase, candleFlame, candleLight, eerieOrb, eerieGlow);

  return g;
}

// Overgrow (Thành phố xanh - Overgrown City Ruins)
function createOvergrow(): Group {
  const g = new Group();
  g.add(createBasePedestal(3.2, mats.moss));

  // Overgrown Concrete Monoliths / City Ruins
  const tower1 = new Mesh(new BoxGeometry(0.9, 2.8, 0.9), mats.concreteOld);
  tower1.position.set(-0.6, 1.55, -0.4);
  const tower2 = new Mesh(new BoxGeometry(0.8, 1.9, 0.8), mats.concreteOld);
  tower2.position.set(0.7, 1.1, -0.3);
  const tower3 = new Mesh(new BoxGeometry(0.7, 1.2, 0.7), mats.concreteOld);
  tower3.position.set(0.4, 0.75, 0.7);
  g.add(tower1, tower2, tower3);

  // Overgrown Roof Foliage & Tree Canopies
  const foliage1 = new Mesh(new SphereGeometry(0.65, 8, 8), mats.lightFoliage);
  foliage1.scale.set(1.2, 0.7, 1.1);
  foliage1.position.set(-0.6, 3.1, -0.4);

  const foliage2 = new Mesh(new SphereGeometry(0.55, 8, 8), mats.pineFoliage);
  foliage2.scale.set(1.1, 0.6, 1.0);
  foliage2.position.set(0.7, 2.2, -0.3);

  const bush1 = new Mesh(new SphereGeometry(0.4, 8, 8), mats.lightFoliage);
  bush1.position.set(-1.1, 0.45, 0.8);
  const bush2 = new Mesh(new SphereGeometry(0.35, 8, 8), mats.moss);
  bush2.position.set(1.0, 0.4, 0.6);
  g.add(foliage1, foliage2, bush1, bush2);

  // Hanging Ivy / Vines across structures
  const vine1 = new Mesh(new BoxGeometry(0.12, 1.6, 0.94), mats.moss);
  vine1.position.set(-0.15, 1.6, -0.4);
  const vine2 = new Mesh(new BoxGeometry(0.84, 1.2, 0.12), mats.lightFoliage);
  vine2.position.set(0.7, 1.2, 0.12);
  g.add(vine1, vine2);

  // High bridge connecting the concrete ruins
  const bridge = new Mesh(new BoxGeometry(0.7, 0.1, 0.35), mats.moss);
  bridge.position.set(0.05, 1.7, -0.35);
  g.add(bridge);

  // Lush Green Canopy Light
  const glow = new PointLight(0x76e05e, 1.4, 4.5);
  glow.position.set(0, 2.3, 0.2);
  g.add(glow);

  return g;
}

// 7. Shore (Bờ Biển)
function createShore(): Group {
  const g = new Group();

  // Turquoise Water Base
  g.add(createBasePedestal(3.2, mats.waterTurquoise));

  // Rocky Shore Cliff
  const cliff = new Mesh(new CylinderGeometry(1.6, 2.0, 0.9, 16), mats.darkStone);
  cliff.position.set(-0.6, 0.6, -0.4);
  cliff.scale.set(1.2, 1.0, 0.9);
  g.add(cliff);

  // Lighthouse Tower
  const lighthouse = new Mesh(new CylinderGeometry(0.35, 0.5, 2.4, 16), mats.concreteOld);
  lighthouse.position.set(-0.6, 2.1, -0.4);

  const lanternRoom = new Mesh(new CylinderGeometry(0.32, 0.32, 0.45, 16), mats.darkTile);
  lanternRoom.position.set(-0.6, 3.4, -0.4);

  const beaconDome = new Mesh(new SphereGeometry(0.32, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2), mats.brightRed);
  beaconDome.position.set(-0.6, 3.65, -0.4);

  const beaconLight = new PointLight(0xffea77, 2.0, 8);
  beaconLight.position.set(-0.6, 3.4, -0.4);

  g.add(lighthouse, lanternRoom, beaconDome, beaconLight);

  // Wooden Pier Dock
  const pier = new Mesh(new BoxGeometry(0.7, 0.1, 2.2), mats.darkWood);
  pier.position.set(1.1, 0.45, 0.5);
  g.add(pier);

  // Pier Posts
  [0.85, 1.35].forEach((x) => {
    [0.0, 1.2].forEach((z) => {
      const post = new Mesh(new CylinderGeometry(0.04, 0.04, 0.6, 12), mats.darkWood);
      post.position.set(x, 0.3, z);
      g.add(post);
    });
  });

  return g;
}

// 8. Village (Làng Quê)
function createVillage(): Group {
  const g = new Group();
  g.add(createBasePedestal(3.2, mats.grass));

  // Countryside Cottage House
  const cottage = new Mesh(new BoxGeometry(2.4, 1.6, 1.8), mats.hoiAnYellow);
  cottage.position.set(-0.4, 1.05, -0.4);
  g.add(cottage);

  // Terracotta Tile Roof
  const roof = new Mesh(new ConeGeometry(2.1, 1.1, 4), mats.vietnamRedTile);
  roof.rotation.y = Math.PI / 4;
  roof.scale.set(1.1, 1.0, 0.9);
  roof.position.set(-0.4, 2.3, -0.4);
  g.add(roof);

  // Stone Water Well with Bucket
  const wellCurb = new Mesh(new TorusGeometry(0.35, 0.1, 12, 24), mats.darkStone);
  wellCurb.rotation.x = Math.PI / 2;
  wellCurb.position.set(1.4, 0.4, 0.7);

  const wellRoof = new Mesh(new ConeGeometry(0.45, 0.4, 4), mats.vietnamRedTile);
  wellRoof.position.set(1.4, 1.3, 0.7);

  [-0.3, 0.3].forEach((x) => {
    const post = new Mesh(new CylinderGeometry(0.03, 0.03, 0.8, 8), mats.darkWood);
    post.position.set(1.4 + x, 0.8, 0.7);
    g.add(post);
  });
  g.add(wellCurb, wellRoof);

  // Clay Water Urn Jars
  [1.0, 1.3].forEach((x, i) => {
    const jar = new Mesh(new SphereGeometry(0.2, 12, 12), mats.brickWall);
    jar.position.set(x, 0.4, -0.2 + i * 0.3);
    g.add(jar);
  });

  return g;
}

// 9. Factory (Nhà Máy Công Nghiệp)
function createFactory(): Group {
  const g = new Group();
  g.add(createBasePedestal(3.2, mats.concreteOld));

  // Brick Boiler Furnace & Smokestack
  const furnace = new Mesh(new BoxGeometry(1.6, 2.2, 1.6), mats.brickWall);
  furnace.position.set(-0.7, 1.35, -0.4);

  const chimney = new Mesh(new CylinderGeometry(0.28, 0.36, 2.6, 16), mats.darkTile);
  chimney.position.set(-0.7, 3.4, -0.4);
  g.add(furnace, chimney);

  // Industrial Steel Framework / Girders
  [-1.6, 1.6].forEach((x) => {
    const beam = new Mesh(new BoxGeometry(0.12, 3.6, 0.12), mats.ironSteel);
    beam.position.set(x, 1.95, 0.6);
    g.add(beam);
  });
  const topCross = new Mesh(new BoxGeometry(3.3, 0.12, 0.12), mats.ironSteel);
  topCross.position.set(0, 3.7, 0.6);
  g.add(topCross);

  // Pressure Steam Pipes with Valves
  const pipe = new Mesh(new CylinderGeometry(0.08, 0.08, 2.8, 16), mats.ironSteel);
  pipe.rotation.z = Math.PI / 2;
  pipe.position.set(0.4, 2.0, -0.2);

  const valve = new Mesh(new TorusGeometry(0.14, 0.03, 8, 16), mats.brightRed);
  valve.position.set(0.6, 2.0, -0.1);
  g.add(pipe, valve);

  // Industrial Warning Stripe Barrier
  const barrier = new Mesh(new BoxGeometry(2.0, 0.5, 0.15), mats.lanternAmber);
  barrier.position.set(0.4, 0.5, 1.3);
  g.add(barrier);

  return g;
}

// 10. Ancient Market (Chợ Âm)
function createAncientLake(): Group {
  const g = new Group();
  g.add(createBasePedestal(3.2, mats.waterLake));

  // Ancient Water Pavilion (Thủy Đình)
  const platform = new Mesh(new BoxGeometry(1.8, 0.25, 1.8), mats.darkStone);
  platform.position.set(0, 0.35, -0.2);
  g.add(platform);

  // 4 Stone Pillars
  [-0.65, 0.65].forEach((x) => {
    [-0.65, 0.65].forEach((z) => {
      const col = new Mesh(new CylinderGeometry(0.06, 0.07, 1.4, 12), mats.darkStone);
      col.position.set(x, 1.05, -0.2 + z);
      g.add(col);
    });
  });

  // Curved Multi-Tier Roof
  const roofLower = new Mesh(new ConeGeometry(1.7, 0.8, 4), mats.vietnamRedTile);
  roofLower.rotation.y = Math.PI / 4;
  roofLower.position.set(0, 2.05, -0.2);

  const roofUpper = new Mesh(new ConeGeometry(1.2, 0.7, 4), mats.vietnamRedTile);
  roofUpper.rotation.y = Math.PI / 4;
  roofUpper.position.set(0, 2.65, -0.2);
  g.add(roofLower, roofUpper);

  // Stone Stepping Bridge
  for (let z = 0.9; z <= 2.1; z += 0.45) {
    const step = new Mesh(new CylinderGeometry(0.3, 0.3, 0.1, 16), mats.darkStone);
    step.position.set(0, 0.3, z);
    g.add(step);
  }

  // Floating Lotus Lantern with Gentle Light
  const lotus = new Mesh(new SphereGeometry(0.14, 12, 12), mats.lanternRed);
  lotus.position.set(1.4, 0.35, 0.8);
  const lakeGlow = new PointLight(0xff4488, 1.2, 3);
  lakeGlow.position.set(1.4, 0.5, 0.8);
  g.add(lotus, lakeGlow);

  return g;
}

// 11. Mushroom House (Nhà nấm cổ tích) - Stylized Texture
function createMushroomHouse(): Group {
  const g = new Group();
  g.add(createBasePedestal(3.2, mats.grass));

  // Moss mounds on base
  const mound1 = new Mesh(new SphereGeometry(0.8, 16, 12), mats.moss);
  mound1.scale.set(1.2, 0.35, 1.0);
  mound1.position.set(-1.1, 0.25, -0.6);
  const mound2 = new Mesh(new SphereGeometry(0.6, 16, 12), mats.moss);
  mound2.scale.set(1.0, 0.3, 0.9);
  mound2.position.set(1.2, 0.25, 0.8);
  g.add(mound1, mound2);

  // Stepping stones
  const stonePositions = [
    { x: 0, z: 1.8, r: 0.35 },
    { x: 0.1, z: 1.25, r: 0.38 },
    { x: -0.05, z: 0.7, r: 0.36 },
  ];
  stonePositions.forEach((st) => {
    const stone = new Mesh(new CylinderGeometry(st.r, st.r * 1.1, 0.08, 16), mats.darkStone);
    stone.position.set(st.x, 0.26, st.z);
    g.add(stone);
  });

  // Mushroom Stem (Cream / Ivory, tapered)
  const stem = new Mesh(new CylinderGeometry(0.95, 1.35, 2.2, 24), mats.mushroomStem);
  stem.position.set(0, 1.25, 0);
  g.add(stem);

  // Wooden Arch Door
  const door = new Mesh(new CylinderGeometry(0.42, 0.42, 0.95, 16, 1, false, 0, Math.PI), mats.darkWood);
  door.rotation.y = -Math.PI / 2;
  door.position.set(0, 0.75, 1.18);
  door.scale.set(1.0, 1.0, 0.3);
  const doorPanel = new Mesh(new BoxGeometry(0.8, 0.7, 0.1), mats.darkWood);
  doorPanel.position.set(0, 0.55, 1.18);
  const doorknob = new Mesh(new SphereGeometry(0.05, 8, 8), mats.lanternAmber);
  doorknob.position.set(0.25, 0.65, 1.25);
  g.add(door, doorPanel, doorknob);

  // Lantern above door
  const lamp = new Mesh(new SphereGeometry(0.12, 12, 12), mats.lanternAmber);
  lamp.position.set(0, 1.45, 1.15);
  const lampLight = new PointLight(0xffaa22, 1.2, 3);
  lampLight.position.set(0, 1.45, 1.2);
  g.add(lamp, lampLight);

  // Circular Windows with warm light
  [-0.95, 0.95].forEach((x) => {
    const winFrame = new Mesh(new TorusGeometry(0.24, 0.04, 12, 24), mats.warmWood);
    winFrame.rotation.y = x < 0 ? Math.PI / 2 : -Math.PI / 2;
    winFrame.position.set(x, 1.4, 0);
    const winGlass = new Mesh(new CylinderGeometry(0.22, 0.22, 0.04, 16), mats.lanternAmber);
    winGlass.rotation.z = Math.PI / 2;
    winGlass.position.set(x, 1.4, 0);
    g.add(winFrame, winGlass);
  });

  // Mushroom Red Cap (Hemisphere / Dome)
  const cap = new Mesh(
    new SphereGeometry(2.1, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.58),
    mats.mushroomCap
  );
  cap.position.set(0, 2.05, 0);
  g.add(cap);

  // Underside of cap (gills)
  const capBottom = new Mesh(new CylinderGeometry(2.05, 1.2, 0.2, 32), mats.mushroomStem);
  capBottom.position.set(0, 2.1, 0);
  g.add(capBottom);

  // White Polka Dots on Cap
  const dotConfigs = [
    { x: 0, y: 3.8, z: 0, r: 0.32, rotX: 0, rotZ: 0 },
    { x: 1.1, y: 3.3, z: 0.6, r: 0.26, rotX: -0.4, rotZ: -0.6 },
    { x: -1.2, y: 3.2, z: 0.5, r: 0.28, rotX: -0.3, rotZ: 0.6 },
    { x: 0.5, y: 3.4, z: -1.1, r: 0.25, rotX: 0.6, rotZ: -0.3 },
    { x: -0.6, y: 3.3, z: -1.0, r: 0.27, rotX: 0.6, rotZ: 0.3 },
    { x: 1.5, y: 2.6, z: -0.3, r: 0.22, rotX: 0.2, rotZ: -0.9 },
    { x: -1.4, y: 2.5, z: -0.4, r: 0.23, rotX: 0.2, rotZ: 0.9 },
    { x: 0.0, y: 2.9, z: 1.5, r: 0.24, rotX: -0.8, rotZ: 0 },
  ];
  dotConfigs.forEach((d) => {
    const dot = new Mesh(new CylinderGeometry(d.r, d.r, 0.06, 16), mats.mushroomDots);
    dot.rotation.x = d.rotX;
    dot.rotation.z = d.rotZ;
    dot.position.set(d.x, d.y, d.z);
    g.add(dot);
  });

  // Stone Chimney on Cap
  const chimney = new Mesh(new CylinderGeometry(0.18, 0.2, 0.8, 12), mats.darkStone);
  chimney.position.set(0.7, 3.55, -0.6);
  const chimneyCap = new Mesh(new CylinderGeometry(0.24, 0.24, 0.08, 12), mats.darkTile);
  chimneyCap.position.set(0.7, 3.98, -0.6);
  g.add(chimney, chimneyCap);

  // Tiny companion mushrooms on grass
  const tinyMushroomSpots = [
    { x: -1.6, z: 1.0, r: 0.22, h: 0.35, color: mats.brightRed },
    { x: -1.9, z: 0.8, r: 0.16, h: 0.25, color: mats.hoiAnYellow },
    { x: 1.6, z: -1.1, r: 0.2, h: 0.3, color: mats.brightRed },
  ];
  tinyMushroomSpots.forEach((m) => {
    const s = new Mesh(new CylinderGeometry(0.04, 0.06, m.h, 8), mats.mushroomStem);
    s.position.set(m.x, 0.25 + m.h / 2, m.z);
    const c = new Mesh(new ConeGeometry(m.r, m.r * 1.1, 12), m.color);
    c.position.set(m.x, 0.25 + m.h + m.r * 0.4, m.z);
    g.add(s, c);
  });

  return g;
}

// 12. Water Lotus Pond (Đầm sen tươi tốt) - Stylized Texture
function createWaterLotusPond(): Group {
  const g = new Group();
  g.add(createBasePedestal(3.2, mats.darkStone));

  // Recessed Pond Basin Rim
  const pondRim = new Mesh(new TorusGeometry(2.7, 0.25, 12, 32), mats.darkStone);
  pondRim.rotation.x = Math.PI / 2;
  pondRim.position.y = 0.26;
  g.add(pondRim);

  // Water Surface
  const water = new Mesh(new CylinderGeometry(2.65, 2.65, 0.06, 36), mats.waterTurquoise);
  water.position.y = 0.22;
  g.add(water);

  // River Bank with Moss
  const mossBank = new Mesh(new CylinderGeometry(2.7, 2.7, 0.1, 32, 1, false, 0, Math.PI * 0.7), mats.moss);
  mossBank.position.set(0, 0.26, 0);
  g.add(mossBank);

  // Floating Lily Pads
  const padConfigs = [
    { x: -1.0, z: -0.6, r: 0.55, rot: 0.4 },
    { x: -1.5, z: 0.2, r: 0.45, rot: 1.2 },
    { x: -0.4, z: -1.4, r: 0.5, rot: -0.6 },
    { x: 1.1, z: 0.7, r: 0.6, rot: 2.1 },
    { x: 1.6, z: -0.4, r: 0.48, rot: -1.5 },
    { x: 0.6, z: 1.4, r: 0.42, rot: 0.8 },
    { x: -0.8, z: 1.2, r: 0.52, rot: 2.7 },
  ];
  padConfigs.forEach((p) => {
    const pad = new Mesh(new CylinderGeometry(p.r, p.r, 0.02, 24, 1, false, 0, Math.PI * 1.85), mats.lilyPad);
    pad.rotation.y = p.rot;
    pad.position.set(p.x, 0.26, p.z);
    g.add(pad);
  });

  // Blooming Lotus Blossoms
  const flowerConfigs = [
    { x: -0.95, z: -0.55, scale: 1.0 },
    { x: 1.15, z: 0.65, scale: 0.85 },
    { x: -0.75, z: 1.25, scale: 0.75 },
  ];
  flowerConfigs.forEach((f) => {
    const lotusGroup = new Group();
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const petal = new Mesh(new ConeGeometry(0.12, 0.32, 5), mats.lotusPetalPink);
      petal.rotation.x = Math.PI / 4;
      petal.rotation.y = angle;
      petal.position.set(Math.cos(angle) * 0.12, 0.14, Math.sin(angle) * 0.12);
      lotusGroup.add(petal);
    }
    const center = new Mesh(new CylinderGeometry(0.09, 0.09, 0.14, 12), mats.lotusCenterYellow);
    center.position.y = 0.12;
    lotusGroup.add(center);

    lotusGroup.scale.set(f.scale, f.scale, f.scale);
    lotusGroup.position.set(f.x, 0.27, f.z);
    g.add(lotusGroup);
  });

  // Arched Bamboo Wooden Footbridge
  const bridge = new Group();
  for (let step = -4; step <= 4; step++) {
    const t = step / 4;
    const yArch = (1 - t * t) * 0.45 + 0.35;
    const plank = new Mesh(new BoxGeometry(0.65, 0.06, 0.22), mats.warmWood);
    plank.position.set(0, yArch, step * 0.26);
    bridge.add(plank);
  }
  [-0.34, 0.34].forEach((x) => {
    for (let post = -3; post <= 3; post += 2) {
      const t = post / 4;
      const yArch = (1 - t * t) * 0.45 + 0.35;
      const pole = new Mesh(new CylinderGeometry(0.03, 0.03, 0.5, 8), mats.bamboo);
      pole.position.set(x, yArch + 0.25, post * 0.26);
      bridge.add(pole);
    }
  });
  bridge.position.set(0.15, 0, 0);
  g.add(bridge);

  // Stone Zen Pagoda Lantern on Bank
  const lanternBase = new Mesh(new CylinderGeometry(0.2, 0.24, 0.3, 12), mats.darkStone);
  lanternBase.position.set(-1.8, 0.4, -1.2);
  const lanternChamber = new Mesh(new BoxGeometry(0.3, 0.3, 0.3), mats.hoiAnYellow);
  lanternChamber.position.set(-1.8, 0.7, -1.2);
  const lanternRoof = new Mesh(new ConeGeometry(0.42, 0.25, 4), mats.darkTile);
  lanternRoof.rotation.y = Math.PI / 4;
  lanternRoof.position.set(-1.8, 0.95, -1.2);
  const lanternLight = new PointLight(0xffaa22, 1.2, 4);
  lanternLight.position.set(-1.8, 0.75, -1.2);
  g.add(lanternBase, lanternChamber, lanternRoof, lanternLight);

  return g;
}

// 13. Dungeon Tavern (Quán Rượu Hầm) - Realistic Texture
function createTavernDungeon(): Group {
  const g = new Group();
  g.add(createBasePedestal(3.2, mats.darkStone));

  // Back Medieval Dungeon Stone Vault Wall
  const backWall = new Mesh(new BoxGeometry(4.6, 3.2, 0.4), mats.tavernDungeonStone);
  backWall.position.set(0, 1.7, -1.8);
  g.add(backWall);

  // Stone Archway Framing
  [-1.8, 1.8].forEach((x) => {
    const pillar = new Mesh(new BoxGeometry(0.5, 3.2, 0.6), mats.darkStone);
    pillar.position.set(x, 1.7, -1.7);
    g.add(pillar);
  });
  const archHeader = new Mesh(new BoxGeometry(4.2, 0.5, 0.6), mats.darkStone);
  archHeader.position.set(0, 3.35, -1.7);
  g.add(archHeader);

  // Heavy Wood Tavern Table
  const tableTop = new Mesh(new BoxGeometry(2.4, 0.12, 1.2), mats.darkWood);
  tableTop.position.set(0, 1.0, 0);
  const tableLegs = [
    { x: -1.0, z: -0.45 },
    { x: 1.0, z: -0.45 },
    { x: -1.0, z: 0.45 },
    { x: 1.0, z: 0.45 },
  ];
  tableLegs.forEach((l) => {
    const leg = new Mesh(new CylinderGeometry(0.08, 0.08, 0.95, 12), mats.darkWood);
    leg.position.set(l.x, 0.5, l.z);
    g.add(leg);
  });
  g.add(tableTop);

  // Wooden Stools / Benches
  [-1.0, 1.0].forEach((z) => {
    const bench = new Mesh(new BoxGeometry(2.0, 0.08, 0.35), mats.warmWood);
    bench.position.set(0, 0.6, z);
    [-0.8, 0.8].forEach((bx) => {
      const bLeg = new Mesh(new CylinderGeometry(0.05, 0.05, 0.55, 8), mats.darkWood);
      bLeg.position.set(bx, 0.3, z);
      g.add(bLeg);
    });
    g.add(bench);
  });

  // Stacked Ale / Wine Barrels in Corner
  const barrelPositions = [
    { x: -1.5, y: 0.65, z: -1.1 },
    { x: -0.85, y: 0.65, z: -1.2 },
    { x: -1.2, y: 1.45, z: -1.15 },
  ];
  barrelPositions.forEach((b) => {
    const barrel = new Mesh(new CylinderGeometry(0.34, 0.38, 0.85, 16), mats.warmWood);
    barrel.position.set(b.x, b.y, b.z);
    [-0.25, 0.25].forEach((ry) => {
      const ring = new Mesh(new CylinderGeometry(0.385, 0.385, 0.05, 16), mats.ironSteel);
      ring.position.set(b.x, b.y + ry, b.z);
      g.add(ring);
    });
    g.add(barrel);
  });

  // Table Props: Iron Tankard & Candle Holder
  const candleHolder = new Mesh(new CylinderGeometry(0.12, 0.16, 0.06, 12), mats.ironSteel);
  candleHolder.position.set(0.3, 1.09, 0);
  const candleWax = new Mesh(new CylinderGeometry(0.04, 0.04, 0.24, 8), mats.mushroomStem);
  candleWax.position.set(0.3, 1.24, 0);
  const flame = new Mesh(new SphereGeometry(0.04, 8, 8), mats.lanternAmber);
  flame.position.set(0.3, 1.39, 0);
  const candleLight = new PointLight(0xffaa22, 1.5, 4);
  candleLight.position.set(0.3, 1.45, 0);
  g.add(candleHolder, candleWax, flame, candleLight);

  return g;
}

// 14. Gnome Card Table (Bàn Cược Gnomes) - Realistic Texture
function createGnomeTable(): Group {
  const g = new Group();
  g.add(createBasePedestal(3.2, mats.darkWood));

  // Round High-Stakes Gambling Table
  const tableBase = new Mesh(new CylinderGeometry(0.4, 0.6, 0.85, 12), mats.darkWood);
  tableBase.position.y = 0.55;
  const tablePedestal = new Mesh(new CylinderGeometry(2.0, 2.0, 0.12, 24), mats.darkWood);
  tablePedestal.position.y = 1.0;
  const feltTop = new Mesh(new CylinderGeometry(1.82, 1.82, 0.02, 24), mats.tableFeltGreen);
  feltTop.position.y = 1.07;
  g.add(tableBase, tablePedestal, feltTop);

  // Playing Cards spread on table
  const cardAngles = [0, 0.2, -0.35, 1.2, 1.4, 2.8, -1.8];
  cardAngles.forEach((a, i) => {
    const card = new Mesh(new BoxGeometry(0.18, 0.01, 0.28), mats.mushroomDots);
    card.rotation.y = a;
    card.position.set(Math.cos(a) * 0.45 + (i % 2) * 0.1, 1.09, Math.sin(a) * 0.45);
    g.add(card);
  });

  // Stacks of Gold Coins / Chips
  const chipPiles = [
    { x: -0.6, z: 0.3, count: 5 },
    { x: -0.75, z: 0.15, count: 8 },
    { x: 0.6, z: -0.4, count: 6 },
    { x: 0.45, z: 0.6, count: 4 },
  ];
  chipPiles.forEach((p) => {
    for (let c = 0; c < p.count; c++) {
      const chip = new Mesh(new CylinderGeometry(0.08, 0.08, 0.025, 16), mats.goldCoin);
      chip.position.set(p.x, 1.09 + c * 0.025, p.z);
      g.add(chip);
    }
  });

  // Dice Cup & Pair of Dice
  const cup = new Mesh(new CylinderGeometry(0.12, 0.09, 0.25, 12), mats.darkWood);
  cup.position.set(0.25, 1.2, -0.3);
  const die1 = new Mesh(new BoxGeometry(0.07, 0.07, 0.07), mats.mushroomDots);
  die1.rotation.set(0.2, 0.4, 0.1);
  die1.position.set(0.05, 1.11, -0.2);
  const die2 = new Mesh(new BoxGeometry(0.07, 0.07, 0.07), mats.mushroomDots);
  die2.rotation.set(-0.3, 0.7, 0.2);
  die2.position.set(-0.1, 1.11, -0.35);
  g.add(cup, die1, die2);

  // Suspended Brass Pendant Lamp Overhead
  const cord = new Mesh(new CylinderGeometry(0.01, 0.01, 1.2, 8), mats.ironSteel);
  cord.position.set(0, 2.7, 0);
  const shade = new Mesh(new ConeGeometry(0.5, 0.3, 16, 1, true), mats.ironSteel);
  shade.position.set(0, 2.1, 0);
  const bulb = new Mesh(new SphereGeometry(0.1, 12, 12), mats.lanternAmber);
  bulb.position.set(0, 2.02, 0);
  const spotLight = new PointLight(0xfffaee, 2.2, 5);
  spotLight.position.set(0, 1.95, 0);
  g.add(cord, shade, bulb, spotLight);

  return g;
}

// 15. Mushroom House (Nhà nấm cổ tích) - Realistic Texture
function createMushroomHouseRealistic(): Group {
  const g = new Group();
  g.add(createBasePedestal(3.2, mats.darkStone));

  // Earthy Forest Floor with Rich Loam & Moss Mounds
  const soilBase = new Mesh(new CylinderGeometry(3.0, 3.1, 0.08, 32), mats.darkWood);
  soilBase.position.y = 0.26;
  const mound1 = new Mesh(new SphereGeometry(0.9, 16, 12), mats.moss);
  mound1.scale.set(1.3, 0.35, 1.1);
  mound1.position.set(-1.1, 0.28, -0.6);
  const mound2 = new Mesh(new SphereGeometry(0.7, 16, 12), mats.moss);
  mound2.scale.set(1.0, 0.3, 0.9);
  mound2.position.set(1.2, 0.28, 0.8);
  g.add(soilBase, mound1, mound2);

  // Weathered Slate Stepping Stones
  const stonePositions = [
    { x: 0, z: 1.8, r: 0.38 },
    { x: 0.12, z: 1.25, r: 0.4 },
    { x: -0.05, z: 0.7, r: 0.36 },
  ];
  stonePositions.forEach((st) => {
    const stone = new Mesh(new CylinderGeometry(st.r, st.r * 1.15, 0.06, 12), mats.darkStone);
    stone.position.set(st.x, 0.29, st.z);
    g.add(stone);
  });

  // Realistic Weathered Organic Fungal Stem
  const stem = new Mesh(new CylinderGeometry(0.92, 1.38, 2.2, 28), mats.mushroomStemRealistic);
  stem.position.set(0, 1.25, 0);
  g.add(stem);

  // Aged Rustic Timber Door with Iron Brackets
  const door = new Mesh(new CylinderGeometry(0.42, 0.42, 0.95, 16, 1, false, 0, Math.PI), mats.darkWood);
  door.rotation.y = -Math.PI / 2;
  door.position.set(0, 0.75, 1.2);
  door.scale.set(1.0, 1.0, 0.3);
  const doorPanel = new Mesh(new BoxGeometry(0.8, 0.7, 0.1), mats.driftwoodTimber);
  doorPanel.position.set(0, 0.55, 1.2);
  const doorknob = new Mesh(new SphereGeometry(0.04, 8, 8), mats.ironSteel);
  doorknob.position.set(0.25, 0.65, 1.26);
  g.add(door, doorPanel, doorknob);

  // Iron Cage Lantern above Door
  const lamp = new Mesh(new SphereGeometry(0.11, 12, 12), mats.lanternAmber);
  lamp.position.set(0, 1.45, 1.18);
  const lampLight = new PointLight(0xffaa22, 1.4, 4);
  lampLight.position.set(0, 1.45, 1.25);
  g.add(lamp, lampLight);

  // Leaded Windows with Timber Framing
  [-0.95, 0.95].forEach((x) => {
    const winFrame = new Mesh(new TorusGeometry(0.24, 0.045, 12, 24), mats.driftwoodTimber);
    winFrame.rotation.y = x < 0 ? Math.PI / 2 : -Math.PI / 2;
    winFrame.position.set(x, 1.4, 0);
    const winGlass = new Mesh(new CylinderGeometry(0.21, 0.21, 0.04, 16), mats.lanternAmber);
    winGlass.rotation.z = Math.PI / 2;
    winGlass.position.set(x, 1.4, 0);
    g.add(winFrame, winGlass);
  });

  // Deep Earthy Crimson Cap (Hemisphere / Dome)
  const cap = new Mesh(
    new SphereGeometry(2.1, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.58),
    mats.mushroomCapRealistic
  );
  cap.position.set(0, 2.05, 0);
  g.add(cap);

  // Underside Fungal Gills
  const capBottom = new Mesh(new CylinderGeometry(2.05, 1.18, 0.22, 32), mats.mushroomStemRealistic);
  capBottom.position.set(0, 2.1, 0);
  g.add(capBottom);

  // Organic Spore Patches on Cap
  const dotConfigs = [
    { x: 0, y: 3.8, z: 0, r: 0.34, rotX: 0, rotZ: 0 },
    { x: 1.1, y: 3.3, z: 0.6, r: 0.25, rotX: -0.4, rotZ: -0.6 },
    { x: -1.2, y: 3.2, z: 0.5, r: 0.27, rotX: -0.3, rotZ: 0.6 },
    { x: 0.5, y: 3.4, z: -1.1, r: 0.24, rotX: 0.6, rotZ: -0.3 },
    { x: -0.6, y: 3.3, z: -1.0, r: 0.26, rotX: 0.6, rotZ: 0.3 },
    { x: 1.5, y: 2.6, z: -0.3, r: 0.21, rotX: 0.2, rotZ: -0.9 },
    { x: -1.4, y: 2.5, z: -0.4, r: 0.22, rotX: 0.2, rotZ: 0.9 },
    { x: 0.0, y: 2.9, z: 1.5, r: 0.23, rotX: -0.8, rotZ: 0 },
  ];
  dotConfigs.forEach((d) => {
    const dot = new Mesh(new CylinderGeometry(d.r, d.r, 0.05, 16), mats.mushroomDotsRealistic);
    dot.rotation.x = d.rotX;
    dot.rotation.z = d.rotZ;
    dot.position.set(d.x, d.y, d.z);
    g.add(dot);
  });

  // Weathered Stone Chimney
  const chimney = new Mesh(new CylinderGeometry(0.18, 0.21, 0.85, 12), mats.concreteOld);
  chimney.position.set(0.7, 3.55, -0.6);
  const chimneyCap = new Mesh(new CylinderGeometry(0.25, 0.25, 0.08, 12), mats.darkTile);
  chimneyCap.position.set(0.7, 4.0, -0.6);
  g.add(chimney, chimneyCap);

  return g;
}

// 16. Water Lotus Pond (Đầm sen tươi tốt) - Realistic Texture
function createWaterLotusPondRealistic(): Group {
  const g = new Group();
  g.add(createBasePedestal(3.2, mats.darkStone));

  // Natural River Stone Basin Rim
  const pondRim = new Mesh(new TorusGeometry(2.7, 0.26, 12, 32), mats.darkStone);
  pondRim.rotation.x = Math.PI / 2;
  pondRim.position.y = 0.26;
  g.add(pondRim);

  // Deep Clear Lake Water
  const water = new Mesh(new CylinderGeometry(2.65, 2.65, 0.06, 36), mats.waterMurkyRealistic);
  water.position.y = 0.23;
  g.add(water);

  // Damp Earthy River Bank
  const mossBank = new Mesh(new CylinderGeometry(2.7, 2.7, 0.1, 32, 1, false, 0, Math.PI * 0.7), mats.moss);
  mossBank.position.set(0, 0.26, 0);
  g.add(mossBank);

  // Waxy Forest-Green Floating Lily Pads
  const padConfigs = [
    { x: -1.0, z: -0.6, r: 0.55, rot: 0.4 },
    { x: -1.5, z: 0.2, r: 0.45, rot: 1.2 },
    { x: -0.4, z: -1.4, r: 0.5, rot: -0.6 },
    { x: 1.1, z: 0.7, r: 0.6, rot: 2.1 },
    { x: 1.6, z: -0.4, r: 0.48, rot: -1.5 },
    { x: 0.6, z: 1.4, r: 0.42, rot: 0.8 },
    { x: -0.8, z: 1.2, r: 0.52, rot: 2.7 },
  ];
  padConfigs.forEach((p) => {
    const pad = new Mesh(new CylinderGeometry(p.r, p.r, 0.02, 24, 1, false, 0, Math.PI * 1.85), mats.lilyPadRealistic);
    pad.rotation.y = p.rot;
    pad.position.set(p.x, 0.265, p.z);
    g.add(pad);
  });

  // Natural Pale Blush / White Lotus Flowers
  const flowerConfigs = [
    { x: -0.95, z: -0.55, scale: 1.0 },
    { x: 1.15, z: 0.65, scale: 0.85 },
    { x: -0.75, z: 1.25, scale: 0.75 },
  ];
  flowerConfigs.forEach((f) => {
    const lotusGroup = new Group();
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const petal = new Mesh(new ConeGeometry(0.11, 0.3, 5), mats.lotusRealisticPink);
      petal.rotation.x = Math.PI / 4;
      petal.rotation.y = angle;
      petal.position.set(Math.cos(angle) * 0.11, 0.13, Math.sin(angle) * 0.11);
      lotusGroup.add(petal);
    }
    const center = new Mesh(new CylinderGeometry(0.08, 0.08, 0.13, 12), mats.lotusCenterYellow);
    center.position.y = 0.11;
    lotusGroup.add(center);

    lotusGroup.scale.set(f.scale, f.scale, f.scale);
    lotusGroup.position.set(f.x, 0.275, f.z);
    g.add(lotusGroup);
  });

  // Weathered Driftwood Footbridge
  const bridge = new Group();
  for (let step = -4; step <= 4; step++) {
    const t = step / 4;
    const yArch = (1 - t * t) * 0.42 + 0.35;
    const plank = new Mesh(new BoxGeometry(0.65, 0.06, 0.22), mats.driftwoodTimber);
    plank.position.set(0, yArch, step * 0.26);
    bridge.add(plank);
  }
  [-0.34, 0.34].forEach((x) => {
    for (let post = -3; post <= 3; post += 2) {
      const t = post / 4;
      const yArch = (1 - t * t) * 0.42 + 0.35;
      const pole = new Mesh(new CylinderGeometry(0.03, 0.03, 0.48, 8), mats.darkWood);
      pole.position.set(x, yArch + 0.24, post * 0.26);
      bridge.add(pole);
    }
  });
  bridge.position.set(0.15, 0, 0);
  g.add(bridge);

  // Granite Zen Lantern on Pond Bank
  const lanternBase = new Mesh(new CylinderGeometry(0.2, 0.24, 0.3, 12), mats.darkStone);
  lanternBase.position.set(-1.8, 0.4, -1.2);
  const lanternChamber = new Mesh(new BoxGeometry(0.3, 0.3, 0.3), mats.concreteOld);
  lanternChamber.position.set(-1.8, 0.7, -1.2);
  const lanternRoof = new Mesh(new ConeGeometry(0.42, 0.25, 4), mats.darkTile);
  lanternRoof.rotation.y = Math.PI / 4;
  lanternRoof.position.set(-1.8, 0.95, -1.2);
  const lanternLight = new PointLight(0xffaa22, 1.3, 4.5);
  lanternLight.position.set(-1.8, 0.75, -1.2);
  g.add(lanternBase, lanternChamber, lanternRoof, lanternLight);

  return g;
}

export function createConceptDiorama(conceptId: string): Group {
  switch (conceptId) {
    case "hanoi-train-street":
      return createHanoiTrainStreet();
    case "hoian-ancient-town":
      return createHoianAncientTown();
    case "kowloon-walled-city":
      return createKowloonWalledCity();
    case "forest":
      return createForest();
    case "overgrow":
      return createOvergrow();
    case "central-highlands":
      return createCentralHighlands();
    case "old-school":
      return createOldSchool();
    case "shore":
      return createShore();
    case "village":
      return createVillage();
    case "factory":
      return createFactory();
    case "ancient-lake":
      return createAncientLake();
    // Gambling Gnomes concepts - Stylized & Realistic
    case "mushroom-house":
      return createMushroomHouse();
    case "mushroom-house-realistic":
      return createMushroomHouseRealistic();
    case "water-lotus-pond":
      return createWaterLotusPond();
    case "water-lotus-pond-realistic":
      return createWaterLotusPondRealistic();
    case "dungeon-tavern":
      return createTavernDungeon();
    case "gnome-table":
      return createGnomeTable();
    default:
      return createHanoiTrainStreet();
  }
}

import * as THREE from 'three';
import { createFacadeTexture, createSurfaceTexture, type FacadeStyle } from './proceduralTextures';
import { FLOOR_HEIGHT_METERS } from './walkthroughGraph';

export interface BuiltArchitectureScene {
  root: THREE.Group;
  floorInteriorGroup: THREE.Group;
  setActiveFloor: (floorIndex: number, flatNumber: string) => void;
  update: (elapsedSec: number) => void;
  dispose: () => void;
}

interface VentureThemeSpec {
  facadeStyle: FacadeStyle;
  floorCount: number;
  accentHex: number;
  trimHex: number;
  railingHex: number;
  poolPos: [number, number];
  poolSize: [number, number];
  clubPos: [number, number];
  playPos: [number, number];
  parkingPos: [number, number];
  hasWaterfront: boolean;
  steppedTerraces: boolean;
  curvedCorner: boolean;
}

const VENTURE_SPECS: Record<string, VentureThemeSpec> = {
  'sky-crest-residences': {
    facadeStyle: 'travertine',
    floorCount: 5,
    accentHex: 0x141e2b, // Deep architectural navy fins
    trimHex: 0xb89452, // Subtle gold cornice
    railingHex: 0x263545,
    poolPos: [9.5, 18.5],
    poolSize: [9.0, 5.2],
    clubPos: [-9.5, 18.0],
    playPos: [-16.5, -5.0],
    parkingPos: [-15.5, 6.0],
    hasWaterfront: false,
    steppedTerraces: false,
    curvedCorner: false,
  },
  'aurelia-heights': {
    facadeStyle: 'sandstone',
    floorCount: 4,
    accentHex: 0x4a6b53, // Botanical green trims
    trimHex: 0xb89452,
    railingHex: 0x4a6b53,
    poolPos: [-10.0, 17.5],
    poolSize: [8.5, 5.5],
    clubPos: [10.5, 17.5],
    playPos: [17.0, -3.5],
    parkingPos: [-15.0, -7.0],
    hasWaterfront: false,
    steppedTerraces: false,
    curvedCorner: true,
  },
  'saffron-quarters': {
    facadeStyle: 'terracotta',
    floorCount: 5,
    accentHex: 0x6c4c38, // Warm cedar timber
    trimHex: 0x4a6b53,
    railingHex: 0x5c4333,
    poolPos: [0.0, 19.5],
    poolSize: [9.5, 4.8],
    clubPos: [13.5, 14.5],
    playPos: [-14.0, 14.5],
    parkingPos: [-16.5, -4.5],
    hasWaterfront: false,
    steppedTerraces: true,
    curvedCorner: false,
  },
  'blue-bay-terrace': {
    facadeStyle: 'limestone',
    floorCount: 6,
    accentHex: 0x1d2d3d, // Crisp charcoal-navy mullions
    trimHex: 0xc5a467,
    railingHex: 0x90b4c4,
    poolPos: [0.0, 21.0],
    poolSize: [11.5, 5.2],
    clubPos: [-13.5, 17.5],
    playPos: [15.5, -6.5],
    parkingPos: [-16.5, 2.0],
    hasWaterfront: true,
    steppedTerraces: false,
    curvedCorner: false,
  },
};

function makeMat(params: THREE.MeshStandardMaterialParameters): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial(params);
}

function addBox(
  parent: THREE.Object3D,
  w: number,
  h: number,
  d: number,
  x: number,
  y: number,
  z: number,
  mat: THREE.Material,
  castShadow = true,
  receiveShadow = true,
): THREE.Mesh {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  m.castShadow = castShadow;
  m.receiveShadow = receiveShadow;
  parent.add(m);
  return m;
}

function buildFurnishedFloorShell(
  aniso: number,
  accentHex: number,
  goldMat: THREE.Material,
  glassMat: THREE.Material,
  wallTex: THREE.Texture,
): THREE.Group {
  const group = new THREE.Group();

  const oakTex = createSurfaceTexture('oak', aniso, 5, 5);
  const marbleTex = createSurfaceTexture('marble', aniso, 4, 4);
  const terrazzoTex = createSurfaceTexture('terrazzo', aniso, 4, 4);
  const slateTex = createSurfaceTexture('slate', aniso, 3, 3);
  const rugTex = createSurfaceTexture('rug', aniso, 1, 1);

  const oakMat = makeMat({ map: oakTex, roughness: 0.62, metalness: 0.04 });
  const marbleMat = makeMat({ map: marbleTex, roughness: 0.3, metalness: 0.05 });
  const terrazzoMat = makeMat({ map: terrazzoTex, roughness: 0.35, metalness: 0.05 });
  const slateMat = makeMat({ map: slateTex, roughness: 0.48, metalness: 0.06 });
  const rugMat = makeMat({ map: rugTex, roughness: 0.92, metalness: 0.0 });
  const interiorWallMat = makeMat({ color: 0xf6f2ea, roughness: 0.85, metalness: 0.0 });
  const facadeWallMat = makeMat({ map: wallTex, roughness: 0.78, metalness: 0.04 });
  const ceilingMat = makeMat({ color: 0xfbf9f5, roughness: 0.9, metalness: 0.0 });
  const walnutMat = makeMat({ color: 0x5d432c, roughness: 0.52, metalness: 0.05 });
  const creamFabricMat = makeMat({ color: 0xe9e2d4, roughness: 0.88, metalness: 0.0 });
  const botanicalFabricMat = makeMat({ color: 0x4a6b53, roughness: 0.82, metalness: 0.0 });
  const navyCabinetMat = makeMat({ color: accentHex, roughness: 0.42, metalness: 0.08 });
  const darkMetalMat = makeMat({ color: 0x202935, roughness: 0.35, metalness: 0.75 });
  const ceramicMat = makeMat({ color: 0xffffff, roughness: 0.22, metalness: 0.06 });

  const H = 3.15;

  // -------------------------------------------------------------------------
  // A. CORRIDOR, LIFT LOBBY & STAIRCASE (z: -5.4 .. -0.6)
  // -------------------------------------------------------------------------
  addBox(group, 15.2, 0.14, 5.0, 0, 0.02, -3.0, marbleMat, false, true); // Lobby + corridor floor
  addBox(group, 15.2, 0.15, 5.0, 0, H + 0.08, -3.0, ceilingMat, false, false); // Ceiling

  // North facade wall behind elevator & stairwell with bright stairwell window
  addBox(group, 5.4, H, 0.25, -4.9, H / 2, -5.5, facadeWallMat);
  addBox(group, 5.4, H, 0.25, 4.9, H / 2, -5.5, facadeWallMat);
  addBox(group, 4.4, 0.85, 0.25, 0, 0.425, -5.5, facadeWallMat);
  addBox(group, 4.4, 0.65, 0.25, 0, H - 0.325, -5.5, facadeWallMat);
  addBox(group, 4.4, 1.65, 0.06, 0, 1.68, -5.5, glassMat, false, false);

  // Lift doors (x = -2.4, z = -5.2)
  addBox(group, 1.8, 2.35, 0.16, -2.4, 1.18, -5.3, darkMetalMat);
  addBox(group, 0.82, 2.25, 0.06, -2.82, 1.13, -5.2, goldMat);
  addBox(group, 0.82, 2.25, 0.06, -1.98, 1.13, -5.2, goldMat);

  // Staircase flights (x = +2.6, z = -4.6)
  for (let s = 0; s < 8; s++) {
    addBox(group, 1.6, 0.22, 0.32, 2.6, 0.11 + s * 0.2, -5.0 + s * 0.26, marbleMat);
  }
  addBox(group, 0.08, 0.95, 2.2, 1.85, 1.2, -4.1, darkMetalMat);

  // Corridor side walls
  addBox(group, 0.22, H, 5.0, -7.5, H / 2, -3.0, interiorWallMat);
  addBox(group, 0.22, H, 5.0, 7.5, H / 2, -3.0, interiorWallMat);

  // Partition between corridor and flat (z = -0.6) with open threshold at x=0 for Flat Gate
  addBox(group, 6.8, H, 0.22, -4.1, H / 2, -0.6, interiorWallMat);
  addBox(group, 6.8, H, 0.22, 4.1, H / 2, -0.6, interiorWallMat);
  addBox(group, 1.6, 0.7, 0.22, 0, H - 0.35, -0.6, interiorWallMat); // Door header

  // Flat entrance door leaf swung slightly open & brass nameplate
  addBox(group, 0.08, 2.35, 1.2, -0.72, 1.18, 0.05, walnutMat);
  addBox(group, 0.22, 0.14, 0.06, 1.05, 1.55, -0.74, goldMat);

  // Neighboring flat doors along corridor
  for (const doorX of [-5.2, 5.2]) {
    addBox(group, 1.25, 2.3, 0.12, doorX, 1.15, -0.52, walnutMat);
    addBox(group, 0.26, 0.12, 0.06, doorX, 1.55, -0.44, goldMat);
  }

  // Corridor wall sconces
  for (const sx of [-4.5, 0, 4.5]) {
    addBox(group, 0.25, 0.3, 0.12, sx, 2.15, -0.76, goldMat);
  }

  // -------------------------------------------------------------------------
  // B. SELECTED FLAT INTERIOR (x: -7.5 .. +7.5, z: -0.6 .. +7.8)
  // -------------------------------------------------------------------------
  // Living + Bedrooms oak floor, Kitchen terrazzo, Bathrooms slate, Balcony marble
  addBox(group, 7.2, 0.12, 8.4, 0.2, 0.02, 3.6, oakMat, false, true); // Central living/hall
  addBox(group, 4.0, 0.12, 8.4, 5.5, 0.02, 3.6, oakMat, false, true); // East wing (Bed 1)
  addBox(group, 4.0, 0.12, 4.6, -5.5, 0.02, 1.7, terrazzoMat, false, true); // Kitchen + Utility
  addBox(group, 4.0, 0.12, 3.8, -5.5, 0.02, 5.9, oakMat, false, true); // West Bed 2
  addBox(group, 2.6, 0.12, 2.8, 6.2, 0.02, 1.1, slateMat, false, true); // Bath 1
  addBox(group, 2.6, 0.12, 2.4, -1.6, 0.02, 6.6, slateMat, false, true); // Bath 2
  addBox(group, 15.0, 0.14, 8.4, 0, H + 0.08, 3.6, ceilingMat, false, false); // Flat ceiling

  // Exterior West wall (-7.5) with window in Bed 2 & Utility louver
  addBox(group, 0.22, H, 5.0, -7.5, H / 2, 1.9, interiorWallMat);
  addBox(group, 0.22, 0.9, 3.4, -7.5, 0.45, 6.1, interiorWallMat);
  addBox(group, 0.22, 0.65, 3.4, -7.5, H - 0.325, 6.1, interiorWallMat);
  addBox(group, 0.06, 1.6, 3.4, -7.5, 1.7, 6.1, glassMat, false, false);

  // Exterior East wall (+7.5) with window in Master Bedroom
  addBox(group, 0.22, H, 3.6, 7.5, H / 2, 1.2, interiorWallMat);
  addBox(group, 0.22, 0.9, 4.8, 7.5, 0.45, 5.4, interiorWallMat);
  addBox(group, 0.22, 0.65, 4.8, 7.5, H - 0.325, 5.4, interiorWallMat);
  addBox(group, 0.06, 1.6, 4.8, 7.5, 1.7, 5.4, glassMat, false, false);

  // South Courtyard Glass Curtain & Balcony Sliders (z = +7.8)
  // Large panoramic window in Living/Dining + Bedroom 2 + Sliding Glass to Balcony in Master Bedroom
  addBox(group, 15.2, 0.35, 0.2, 0, H - 0.175, 7.8, interiorWallMat);
  addBox(group, 2.6, 0.85, 0.2, -5.8, 0.425, 7.8, interiorWallMat); // Bed 2 window sill
  addBox(group, 2.6, 1.95, 0.06, -5.8, 1.82, 7.8, glassMat, false, false);
  addBox(group, 4.4, 0.85, 0.2, -0.6, 0.425, 7.8, interiorWallMat); // Living panoramic sill
  addBox(group, 4.4, 1.95, 0.06, -0.6, 1.82, 7.8, glassMat, false, false);
  // Open slider gap at x = 2.6 .. 5.2 leading directly onto Back Balcony!
  addBox(group, 1.5, 2.8, 0.08, 5.6, 1.4, 7.8, glassMat, false, false);
  addBox(group, 0.12, H, 0.2, 7.4, H / 2, 7.8, interiorWallMat);

  // Interior room partitions with open doorways
  // Master Bedroom 1 East partition (x = 2.7, z: 2.8 .. 7.8 with doorway z: 2.8..4.1)
  addBox(group, 0.18, H, 3.4, 2.7, H / 2, 6.1, interiorWallMat);
  addBox(group, 0.18, H, 3.4, 2.7, H / 2, 1.1, interiorWallMat);
  addBox(group, 0.18, 0.7, 1.4, 2.7, H - 0.35, 3.5, interiorWallMat);

  // Bath 1 partition (z = 2.5, x: 4.9 .. 7.5 with doorway x: 4.9..5.9)
  addBox(group, 1.6, H, 0.16, 6.7, H / 2, 2.5, interiorWallMat);
  addBox(group, 0.16, H, 3.1, 4.9, H / 2, 0.95, interiorWallMat);

  // Utility divider behind kitchen (z = 3.6, x: -7.5 .. -5.2)
  addBox(group, 2.3, H, 0.16, -6.35, H / 2, 3.6, interiorWallMat);

  // Bedroom 2 partition (z = 4.9, x: -7.5 .. -2.9 with doorway x: -4.1..-2.9)
  addBox(group, 3.4, H, 0.18, -5.8, H / 2, 4.9, interiorWallMat);
  addBox(group, 0.18, H, 2.9, -2.9, H / 2, 6.35, interiorWallMat);

  // Bath 2 partition (x: -2.9 .. -0.3, z = 5.4 with doorway)
  addBox(group, 1.6, H, 0.16, -1.1, H / 2, 5.4, interiorWallMat);
  addBox(group, 0.16, H, 2.4, -0.3, H / 2, 6.6, interiorWallMat);

  // -------------------------------------------------------------------------
  // C. FURNITURE & FIXTURES
  // -------------------------------------------------------------------------
  // 1. Living Room (Main Hall)
  addBox(group, 3.2, 0.03, 2.4, 0.4, 0.09, 3.4, rugMat, false, true);
  // L-shaped sofa facing East/South media console
  addBox(group, 2.5, 0.42, 0.92, 0.5, 0.28, 4.2, creamFabricMat); // Sofa base
  addBox(group, 2.5, 0.45, 0.22, 0.5, 0.65, 4.55, creamFabricMat); // Backrest
  addBox(group, 0.9, 0.42, 1.6, 1.4, 0.28, 3.5, creamFabricMat); // Chaise
  addBox(group, 0.45, 0.35, 0.45, -0.2, 0.6, 4.35, botanicalFabricMat); // Accent pillow
  // Coffee table
  addBox(group, 1.25, 0.07, 0.72, 0.3, 0.44, 3.1, marbleMat);
  addBox(group, 1.0, 0.36, 0.5, 0.3, 0.2, 3.1, darkMetalMat);
  // Media console + TV on North-East feature wall
  addBox(group, 2.1, 0.45, 0.45, 0.6, 0.28, 1.15, walnutMat);
  addBox(group, 1.55, 0.88, 0.06, 0.6, 1.18, 1.02, darkMetalMat);

  // 2. Dining Area (x = -2.3, z = 4.5)
  addBox(group, 1.9, 0.08, 1.05, -2.3, 0.76, 4.6, marbleMat);
  addBox(group, 0.14, 0.7, 0.75, -2.9, 0.38, 4.6, walnutMat);
  addBox(group, 0.14, 0.7, 0.75, -1.7, 0.38, 4.6, walnutMat);
  for (const cx of [-2.85, -2.3, -1.75]) {
    addBox(group, 0.42, 0.45, 0.42, cx, 0.28, 3.9, botanicalFabricMat);
    addBox(group, 0.42, 0.45, 0.42, cx, 0.28, 5.3, botanicalFabricMat);
  }
  // Brass dining pendant light
  addBox(group, 1.2, 0.06, 0.18, -2.3, 2.35, 4.6, goldMat);

  // 3. Open Kitchen (Right of Hall: x = -5.5, z = 1.6)
  // Breakfast island
  addBox(group, 0.9, 0.92, 2.4, -3.9, 0.52, 2.1, navyCabinetMat);
  addBox(group, 1.05, 0.08, 2.55, -3.9, 1.0, 2.1, marbleMat);
  for (const sz of [1.4, 2.1, 2.8]) {
    addBox(group, 0.36, 0.65, 0.36, -3.25, 0.38, sz, walnutMat);
  }
  // Rear kitchen counter + upper cabinets + range hood
  addBox(group, 0.75, 0.9, 3.6, -6.95, 0.51, 1.5, navyCabinetMat);
  addBox(group, 0.8, 0.07, 3.65, -6.95, 0.98, 1.5, marbleMat);
  addBox(group, 0.45, 0.8, 2.5, -7.1, 2.25, 1.3, walnutMat);
  addBox(group, 0.6, 0.55, 0.85, -7.0, 2.35, 2.8, darkMetalMat); // Hood
  addBox(group, 0.85, 2.1, 0.95, -6.9, 1.1, 0.0, darkMetalMat); // Fridge

  // 4. Master Bedroom 1 (Straight Left: x = 4.9, z = 4.9)
  addBox(group, 2.0, 0.4, 2.2, 5.2, 0.26, 4.9, walnutMat); // King frame
  addBox(group, 1.88, 0.26, 2.08, 5.2, 0.52, 4.9, creamFabricMat); // Mattress
  addBox(group, 2.1, 1.05, 0.14, 5.2, 0.85, 3.85, botanicalFabricMat); // Headboard
  addBox(group, 0.52, 0.5, 0.45, 3.9, 0.3, 4.0, walnutMat); // Nightstand L
  addBox(group, 0.52, 0.5, 0.45, 6.5, 0.3, 4.0, walnutMat); // Nightstand R
  addBox(group, 0.6, 2.5, 2.2, 7.1, 1.3, 5.8, walnutMat); // Wardrobe

  // 5. Bathroom 1 (x = 6.2, z = 1.1)
  addBox(group, 1.35, 0.72, 0.55, 6.1, 0.44, 0.15, navyCabinetMat);
  addBox(group, 1.4, 0.06, 0.58, 6.1, 0.82, 0.15, marbleMat);
  addBox(group, 0.5, 0.14, 0.4, 6.1, 0.92, 0.15, ceramicMat); // Basin
  addBox(group, 1.2, 0.95, 0.05, 6.1, 1.55, -0.1, goldMat); // Mirror frame
  addBox(group, 0.06, 2.2, 1.3, 5.9, 1.15, 1.4, glassMat, false, false); // Glass shower

  // 6. Backside Private Balcony (x = 2.6 .. 6.8, z = 7.8 .. 9.35)
  addBox(group, 4.4, 0.14, 1.6, 4.6, 0.02, 8.6, marbleMat);
  // Glass balustrade
  addBox(group, 4.4, 1.05, 0.06, 4.6, 0.58, 9.36, glassMat, false, false);
  addBox(group, 0.06, 1.05, 1.6, 2.42, 0.58, 8.6, glassMat, false, false);
  addBox(group, 0.06, 1.05, 1.6, 6.78, 0.58, 8.6, glassMat, false, false);
  addBox(group, 4.42, 0.06, 0.08, 4.6, 1.12, 9.36, goldMat); // Top handrail
  // Outdoor lounge chairs & planter
  addBox(group, 0.7, 0.42, 0.72, 3.3, 0.28, 8.65, walnutMat);
  addBox(group, 0.7, 0.42, 0.72, 5.9, 0.28, 8.65, walnutMat);
  addBox(group, 0.55, 0.1, 0.55, 4.6, 0.45, 8.65, darkMetalMat);

  // 7. Second Bedroom (Right -> Straight & Left: x = -5.1, z = 6.4)
  addBox(group, 1.7, 0.38, 2.05, -5.2, 0.25, 6.5, walnutMat);
  addBox(group, 1.6, 0.24, 1.95, -5.2, 0.5, 6.5, creamFabricMat);
  addBox(group, 1.8, 0.95, 0.12, -5.2, 0.8, 5.55, navyCabinetMat);
  addBox(group, 0.55, 2.4, 1.8, -7.1, 1.25, 6.4, walnutMat);

  // 8. Bathroom 2 (x = -1.6, z = 6.6)
  addBox(group, 1.15, 0.7, 0.52, -1.6, 0.42, 5.8, navyCabinetMat);
  addBox(group, 0.44, 0.14, 0.38, -1.6, 0.84, 5.8, ceramicMat);
  addBox(group, 0.06, 2.15, 1.2, -1.4, 1.1, 7.0, glassMat, false, false);

  return group;
}

export function buildArchitecturalScene(
  ventureId: string,
  renderer: THREE.WebGLRenderer,
  isSoftwareGl: boolean,
): BuiltArchitectureScene {
  const spec = VENTURE_SPECS[ventureId] ?? VENTURE_SPECS['sky-crest-residences'];
  const aniso = renderer.capabilities.getMaxAnisotropy();

  const root = new THREE.Group();
  const disposables: Array<{ dispose: () => void }> = [];

  // Textures
  const facadeTex = createFacadeTexture(spec.facadeStyle, aniso, 5, 4);
  const pavingTex = createSurfaceTexture('paving', aniso, 12, 12);
  const asphaltTex = createSurfaceTexture('asphalt', aniso, 16, 4);
  const grassTex = createSurfaceTexture('grass', aniso, 14, 14);
  const waterTex = createSurfaceTexture('water', aniso, 3, 2);
  disposables.push(facadeTex, pavingTex, asphaltTex, grassTex, waterTex);

  // Shared materials
  const facadeMat = makeMat({ map: facadeTex, roughness: 0.72, metalness: 0.04 });
  const accentMat = makeMat({ color: spec.accentHex, roughness: 0.45, metalness: 0.32 });
  const trimMat = makeMat({ color: spec.trimHex, roughness: 0.35, metalness: 0.65 });
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xaad0dc,
    roughness: 0.08,
    metalness: 0.1,
    transmission: 0.55,
    transparent: true,
    opacity: 0.62,
  });
  const railingMat = makeMat({ color: spec.railingHex, roughness: 0.35, metalness: 0.5 });
  const grassMat = makeMat({ map: grassTex, roughness: 0.92, metalness: 0.0 });
  const pavingMat = makeMat({ map: pavingTex, roughness: 0.85, metalness: 0.02 });
  const asphaltMat = makeMat({ map: asphaltTex, roughness: 0.88, metalness: 0.02 });
  const waterMat = makeMat({
    map: waterTex,
    color: 0x5cc4d0,
    roughness: 0.14,
    metalness: 0.15,
    transparent: true,
    opacity: 0.92,
  });
  const trackMat = makeMat({ color: 0xb7684b, roughness: 0.85, metalness: 0.0 }); // Cushioned jogging track
  const woodMat = makeMat({ color: 0x7b5638, roughness: 0.7, metalness: 0.05 });
  const darkSteelMat = makeMat({ color: 0x202a36, roughness: 0.35, metalness: 0.72 });
  const concreteMat = makeMat({ color: 0xd6d1c7, roughness: 0.82, metalness: 0.02 });

  // ---------------------------------------------------------------------------
  // 1. SITE GROUND, ROADS, SIDEWALKS, COURTYARD & BOTANICAL GARDENS
  // ---------------------------------------------------------------------------
  // Wide landscaped perimeter lawn
  addBox(root, 120, 0.2, 120, 0, -0.15, 0, grassMat, false, true);

  // Surrounding North & West arterial roads
  addBox(root, 120, 0.12, 9.5, 0, -0.04, -22.5, asphaltMat, false, true);
  addBox(root, 9.0, 0.12, 120, -24.5, -0.04, 0, asphaltMat, false, true);

  // Road dashed lane centerlines
  const stripeMat = makeMat({ color: 0xf4efe3, roughness: 0.6 });
  for (let x = -48; x <= 48; x += 6) {
    addBox(root, 2.8, 0.02, 0.2, x, 0.03, -22.5, stripeMat, false, false);
  }
  for (let z = -48; z <= 48; z += 6) {
    addBox(root, 0.2, 0.02, 2.8, -24.5, 0.03, z, stripeMat, false, false);
  }

  // Sidewalks & paved arrival courtyard apron
  addBox(root, 44, 0.14, 3.2, 0, 0.01, -16.2, pavingMat, false, true);
  addBox(root, 24, 0.14, 10.5, 0, 0.01, -11.5, pavingMat, false, true);
  // Courtyard stone terrace behind building
  addBox(root, 32, 0.12, 19.0, 0, 0.01, 16.5, pavingMat, false, true);

  // Perimeter walking & jogging track loop
  const trackW = 1.9;
  addBox(root, 39, 0.08, trackW, 0, 0.03, 25.0, trackMat, false, true);
  addBox(root, 39, 0.08, trackW, 0, 0.03, -13.8, trackMat, false, true);
  addBox(root, trackW, 0.08, 40.5, 19.0, 0.03, 5.6, trackMat, false, true);
  addBox(root, trackW, 0.08, 40.5, -19.0, 0.03, 5.6, trackMat, false, true);

  // Waterfront lake for Blue Bay Terrace on far South (+Z)
  if (spec.hasWaterfront) {
    addBox(root, 120, 0.08, 34, 0, -0.02, 46, waterMat, false, true);
    addBox(root, 42, 0.25, 3.0, 0, 0.15, 29.0, woodMat, false, true); // Lakeside timber boardwalk
  }

  // ---------------------------------------------------------------------------
  // 2. DISTINCT ARCHITECTURAL APARTMENT TOWER (PER-VENTURE GEOMETRY)
  // ---------------------------------------------------------------------------
  const buildingGroup = new THREE.Group();
  root.add(buildingGroup);

  const floorsContainer = new THREE.Group();
  buildingGroup.add(floorsContainer);

  // Ground reception canopy & front columns
  addBox(buildingGroup, 9.5, 0.35, 4.8, 0, 3.35, -10.5, accentMat);
  addBox(buildingGroup, 9.7, 0.1, 4.9, 0, 3.55, -10.5, trimMat);
  addBox(buildingGroup, 0.45, 3.4, 0.45, -4.1, 1.7, -12.4, trimMat);
  addBox(buildingGroup, 0.45, 3.4, 0.45, 4.1, 1.7, -12.4, trimMat);
  // Illuminated reception desk inside ground lobby
  addBox(buildingGroup, 3.4, 1.05, 0.8, 0, 0.52, -7.8, woodMat);
  addBox(buildingGroup, 3.5, 0.08, 0.88, 0, 1.07, -7.8, trimMat);

  // Build exterior multi-floor shell with open active floor window/balcony clarity
  const rebuildTowerShell = (activeFloorIdx: number) => {
    while (floorsContainer.children.length > 0) {
      const child = floorsContainer.children[0];
      floorsContainer.remove(child);
    }

    for (let f = 0; f < spec.floorCount; f++) {
      const fy = f * FLOOR_HEIGHT_METERS;
      const stepShrink = spec.steppedTerraces ? f * 0.65 : 0;
      const W = 18.0 - stepShrink * 1.4;
      const D = 14.8 - stepShrink * 0.6;
      const isFloorActive = f === activeFloorIdx;

      // Floor structural slab
      addBox(floorsContainer, W, 0.24, D, 0, fy + 0.12, 1.6, concreteMat);

      if (!isFloorActive) {
        // Closed architectural bay for non-active floors with glazed windows
        addBox(floorsContainer, W - 0.5, FLOOR_HEIGHT_METERS - 0.3, D - 0.6, 0, fy + FLOOR_HEIGHT_METERS / 2, 1.6, facadeMat);

        // Panoramic glass facade bands on North & South
        addBox(floorsContainer, W - 2.4, 1.9, 0.1, 0, fy + 1.85, 1.6 + D / 2 - 0.25, glassMat, false, false);
        addBox(floorsContainer, W - 2.4, 1.9, 0.1, 0, fy + 1.85, 1.6 - D / 2 + 0.25, glassMat, false, false);

        // Projecting balconies per architectural style
        if (spec.curvedCorner) {
          // Aurelia Heights: Rounded corner facade balconies
          const cyl = new THREE.Mesh(
            new THREE.CylinderGeometry(2.2, 2.2, 0.22, 18, 1, false, 0, Math.PI),
            concreteMat,
          );
          cyl.position.set(-W / 2 + 1.2, fy + 0.14, 1.6 + D / 2);
          floorsContainer.add(cyl);
          const cylRail = new THREE.Mesh(
            new THREE.CylinderGeometry(2.15, 2.15, 1.0, 18, 1, true, 0, Math.PI),
            glassMat,
          );
          cylRail.position.set(-W / 2 + 1.2, fy + 0.72, 1.6 + D / 2);
          floorsContainer.add(cylRail);
        }

        // South balcony slab & glass railing
        const balW = spec.facadeStyle === 'limestone' ? W + 0.8 : 7.5;
        addBox(floorsContainer, balW, 0.2, 1.75, 0, fy + 0.12, 1.6 + D / 2 + 0.75, concreteMat);
        addBox(floorsContainer, balW, 0.98, 0.06, 0, fy + 0.68, 1.6 + D / 2 + 1.58, glassMat, false, false);
        addBox(floorsContainer, balW + 0.05, 0.07, 0.08, 0, fy + 1.18, 1.6 + D / 2 + 1.58, trimMat);
      } else {
        // Active floor: keep exterior flanking piers & fascia framing so interior + balcony look completely seamless
        addBox(floorsContainer, 1.3, FLOOR_HEIGHT_METERS, D - 0.4, -W / 2 + 0.65, fy + FLOOR_HEIGHT_METERS / 2, 1.6, facadeMat);
        addBox(floorsContainer, 1.3, FLOOR_HEIGHT_METERS, D - 0.4, W / 2 - 0.65, fy + FLOOR_HEIGHT_METERS / 2, 1.6, facadeMat);
      }

      // Distinctive per-venture facade articulation
      if (ventureId === 'sky-crest-residences') {
        // Vertical deep-navy architectural fins along East & West wings
        for (let fx = -7.5; fx <= 7.5; fx += 3.0) {
          addBox(floorsContainer, 0.18, FLOOR_HEIGHT_METERS, 0.55, fx, fy + FLOOR_HEIGHT_METERS / 2, -6.0, accentMat);
        }
      } else if (ventureId === 'aurelia-heights') {
        // Botanical-green & gold horizontal bandings
        addBox(floorsContainer, W + 0.35, 0.22, D + 0.35, 0, fy + FLOOR_HEIGHT_METERS - 0.11, 1.6, accentMat);
      } else if (ventureId === 'saffron-quarters') {
        // Cedar timber soffits & planted terrace greenery strip on stepped decks
        addBox(floorsContainer, W + 0.4, 0.18, 0.9, 0, fy + FLOOR_HEIGHT_METERS - 0.08, 1.6 + D / 2 + 0.3, accentMat);
        if (f > 0) {
          addBox(floorsContainer, 2.2, 0.45, 0.65, -W / 2 + 1.3, fy + 0.35, 1.6 + D / 2 + 0.35, grassMat);
          addBox(floorsContainer, 2.2, 0.45, 0.65, W / 2 - 1.3, fy + 0.35, 1.6 + D / 2 + 0.35, grassMat);
        }
      } else if (ventureId === 'blue-bay-terrace') {
        // Wrap-around glass sky-balcony trim
        addBox(floorsContainer, W + 1.2, 0.18, D + 1.2, 0, fy + 0.14, 1.6, railingMat);
      }
    }

    // Rooftop crown & penthouse pergola
    const topY = spec.floorCount * FLOOR_HEIGHT_METERS;
    const topW = spec.steppedTerraces ? 13.5 : 18.4;
    const topD = spec.steppedTerraces ? 12.2 : 15.2;
    addBox(floorsContainer, topW, 0.35, topD, 0, topY + 0.18, 1.6, concreteMat);
    addBox(floorsContainer, topW + 0.4, 0.22, topD + 0.4, 0, topY + 0.45, 1.6, accentMat);
    // Rooftop architectural pergola beams
    for (let px = -4.5; px <= 4.5; px += 1.5) {
      addBox(floorsContainer, 0.16, 0.24, 6.0, px, topY + 2.6, 1.5, trimMat);
    }
    addBox(floorsContainer, 0.25, 2.2, 0.25, -4.5, topY + 1.4, -1.2, darkSteelMat);
    addBox(floorsContainer, 0.25, 2.2, 0.25, 4.5, topY + 1.4, -1.2, darkSteelMat);
    addBox(floorsContainer, 0.25, 2.2, 0.25, -4.5, topY + 1.4, 4.2, darkSteelMat);
    addBox(floorsContainer, 0.25, 2.2, 0.25, 4.5, topY + 1.4, 4.2, darkSteelMat);
  };

  // ---------------------------------------------------------------------------
  // 3. SWIMMING POOL, CLUBHOUSE, PLAY AREA, PARKING & TREES (INSTANCED)
  // ---------------------------------------------------------------------------
  // Swimming Pool + Sun Loungers
  const [px, pz] = spec.poolPos;
  const [pw, pd] = spec.poolSize;
  addBox(root, pw + 1.8, 0.16, pd + 1.8, px, 0.08, pz, concreteMat, false, true);
  addBox(root, pw, 0.14, pd, px, 0.1, pz, waterMat, false, false);
  // Loungers
  const loungerMat = makeMat({ color: 0xf6f2e8, roughness: 0.7 });
  for (let i = -1; i <= 1; i++) {
    addBox(root, 0.8, 0.32, 1.9, px + i * 2.1, 0.26, pz - pd / 2 - 1.3, loungerMat);
  }

  // Clubhouse Pavilion
  const [cx, cz] = spec.clubPos;
  addBox(root, 7.6, 0.24, 5.8, cx, 0.12, cz, concreteMat, false, true);
  addBox(root, 0.3, 3.3, 0.3, cx - 3.5, 1.7, cz - 2.5, darkSteelMat);
  addBox(root, 0.3, 3.3, 0.3, cx + 3.5, 1.7, cz - 2.5, darkSteelMat);
  addBox(root, 0.3, 3.3, 0.3, cx - 3.5, 1.7, cz + 2.5, darkSteelMat);
  addBox(root, 0.3, 3.3, 0.3, cx + 3.5, 1.7, cz + 2.5, darkSteelMat);
  addBox(root, 7.2, 2.8, 0.08, cx, 1.6, cz + 2.5, glassMat, false, false);
  addBox(root, 8.2, 0.28, 6.4, cx, 3.45, cz, accentMat);
  addBox(root, 8.4, 0.12, 6.6, cx, 3.65, cz, trimMat);
  // Clubhouse interior lounge seating
  addBox(root, 2.4, 0.45, 0.9, cx, 0.46, cz - 0.5, makeMat({ color: 0x4a6b53, roughness: 0.85 }));

  // Children's Play Area
  const [kx, kz] = spec.playPos;
  const playMat = makeMat({ color: 0x5c8064, roughness: 0.9 });
  addBox(root, 6.4, 0.1, 5.4, kx, 0.05, kz, playMat, false, true);
  // Climbing tower + yellow/gold slide + swing A-frame
  addBox(root, 1.3, 2.1, 1.3, kx - 1.2, 1.1, kz, woodMat);
  addBox(root, 1.6, 0.24, 1.6, kx - 1.2, 2.45, kz, trimMat);
  const slide = addBox(root, 0.65, 0.12, 2.4, kx - 1.2, 0.9, kz + 1.5, trimMat);
  slide.rotation.x = 0.55;
  // Swing frame
  addBox(root, 2.6, 0.12, 0.12, kx + 1.4, 2.25, kz, darkSteelMat);
  addBox(root, 0.1, 2.25, 0.1, kx + 0.2, 1.12, kz, darkSteelMat);
  addBox(root, 0.1, 2.25, 0.1, kx + 2.6, 1.12, kz, darkSteelMat);

  // Covered Parking Carport + Stylized Vehicles
  const [vx, vz] = spec.parkingPos;
  addBox(root, 7.2, 0.12, 10.5, vx, 0.06, vz, asphaltMat, false, true);
  addBox(root, 7.2, 0.22, 10.2, vx, 2.75, vz, darkSteelMat);
  addBox(root, 0.22, 2.75, 0.22, vx - 3.2, 1.37, vz - 4.6, darkSteelMat);
  addBox(root, 0.22, 2.75, 0.22, vx - 3.2, 1.37, vz + 4.6, darkSteelMat);
  const carColors = [0x1d2939, 0xe8e3d9, 0x4a6b53];
  for (let c = 0; c < 3; c++) {
    const czPos = vz - 3.1 + c * 3.1;
    const carMat = makeMat({ color: carColors[c], roughness: 0.28, metalness: 0.45 });
    addBox(root, 3.8, 0.65, 1.75, vx, 0.48, czPos, carMat);
    addBox(root, 2.1, 0.52, 1.5, vx - 0.1, 1.02, czPos, carMat);
  }

  // Outdoor garden benches
  const benchPositions: Array<[number, number, number]> = [
    [6.2, 13.5, 0],
    [-6.2, 13.5, 0],
    [17.8, 2.0, Math.PI / 2],
    [-17.8, -11.0, Math.PI / 2],
  ];
  for (const [bx, bz, rot] of benchPositions) {
    const bGroup = new THREE.Group();
    bGroup.position.set(bx, 0, bz);
    bGroup.rotation.y = rot;
    addBox(bGroup, 1.8, 0.1, 0.55, 0, 0.46, 0, woodMat);
    addBox(bGroup, 0.12, 0.45, 0.5, -0.75, 0.22, 0, darkSteelMat);
    addBox(bGroup, 0.12, 0.45, 0.5, 0.75, 0.22, 0, darkSteelMat);
    root.add(bGroup);
  }

  // Instanced Botanical Trees & Perimeter Shrubs
  const treeCoords: Array<[number, number, number]> = [
    [-15, -16.5, 1.1],
    [-8, -16.8, 1.0],
    [8, -16.8, 1.05],
    [15, -16.5, 1.15],
    [21.5, -10, 1.2],
    [21.5, -2, 1.0],
    [21.5, 8, 1.25],
    [21.5, 17, 1.1],
    [-21.2, -13, 1.1],
    [-21.2, 13, 1.15],
    [-21.2, 21, 1.0],
    [-14, 27.5, 1.2],
    [-4, 27.5, 1.05],
    [6, 27.5, 1.15],
    [15, 27.5, 1.2],
    [14.5, 9.5, 0.9],
    [-13.5, 10.5, 0.95],
  ];
  const trunkGeo = new THREE.CylinderGeometry(0.18, 0.26, 2.6, 8);
  const trunkMat = makeMat({ color: 0x5c422c, roughness: 0.9 });
  const canopyGeo = new THREE.DodecahedronGeometry(1.65, 1);
  const canopyMat = makeMat({ color: 0x3e6248, roughness: 0.85 });

  const trunksInst = new THREE.InstancedMesh(trunkGeo, trunkMat, treeCoords.length);
  const canopiesInst = new THREE.InstancedMesh(canopyGeo, canopyMat, treeCoords.length);
  trunksInst.castShadow = !isSoftwareGl;
  canopiesInst.castShadow = !isSoftwareGl;

  const dummy = new THREE.Object3D();
  treeCoords.forEach(([tx, tz, scale], i) => {
    dummy.position.set(tx, 1.3 * scale, tz);
    dummy.scale.set(scale, scale, scale);
    dummy.rotation.y = i * 0.7;
    dummy.updateMatrix();
    trunksInst.setMatrixAt(i, dummy.matrix);

    dummy.position.set(tx, 3.4 * scale, tz);
    dummy.scale.set(scale * 1.05, scale * 0.95, scale * 1.05);
    dummy.updateMatrix();
    canopiesInst.setMatrixAt(i, dummy.matrix);
  });
  root.add(trunksInst, canopiesInst);

  // ---------------------------------------------------------------------------
  // 4. FURNISHED FLOOR SHELL (CORRIDOR + LIFT + STAIRS + SELECTED FLAT)
  // ---------------------------------------------------------------------------
  const floorInteriorGroup = buildFurnishedFloorShell(
    aniso,
    spec.accentHex,
    trimMat,
    glassMat,
    facadeTex,
  );
  root.add(floorInteriorGroup);

  // Warm interior chandelier point lights inside Living Hall & Master Bedroom
  const hallLight = new THREE.PointLight(0xffecd2, 1.6, 14, 1.6);
  hallLight.position.set(-0.6, 2.65, 3.2);
  floorInteriorGroup.add(hallLight);

  const bedLight = new THREE.PointLight(0xffecd2, 1.2, 11, 1.6);
  bedLight.position.set(4.8, 2.65, 4.6);
  floorInteriorGroup.add(bedLight);

  const kitLight = new THREE.PointLight(0xfff4e0, 1.1, 10, 1.6);
  kitLight.position.set(-4.5, 2.65, 2.2);
  floorInteriorGroup.add(kitLight);

  let currentFloor = -1;
  const setActiveFloor = (floorIndex: number, _flatNumber: string) => {
    const safeIdx = Math.max(0, Math.min(spec.floorCount - 1, floorIndex));
    floorInteriorGroup.position.y = safeIdx * FLOOR_HEIGHT_METERS;
    if (safeIdx !== currentFloor) {
      currentFloor = safeIdx;
      rebuildTowerShell(safeIdx);
    }
  };

  setActiveFloor(0, 'G01');

  const update = (elapsedSec: number) => {
    // Gentle pool water UV drift
    waterTex.offset.x = (elapsedSec * 0.015) % 1;
    waterTex.offset.y = (elapsedSec * 0.008) % 1;
  };

  const dispose = () => {
    root.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.geometry) mesh.geometry.dispose();
      if (mesh.material) {
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((m) => m.dispose());
        } else {
          mesh.material.dispose();
        }
      }
    });
    disposables.forEach((d) => d.dispose());
  };

  return {
    root,
    floorInteriorGroup,
    setActiveFloor,
    update,
    dispose,
  };
}

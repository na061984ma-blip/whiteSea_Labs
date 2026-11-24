import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Building2,
  Compass,
  DoorOpen,
  Home,
  Layers,
  MapPin,
  Maximize2,
  Minimize2,
  RotateCcw,
  RotateCw,
  Trees,
  Upload,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import type {
  DirectionCode,
  FloorPlan,
  PanoramaNode,
} from '../types/realEstate';
import {
  buildArchitecturalScene,
  type BuiltArchitectureScene,
} from '../three/architecturalModels';
import {
  buildWalkthroughGraph,
  getDirectionCameraPose,
  type TourHotspot3D,
  type TourNode3D,
  type TourZone,
} from '../three/walkthroughGraph';
import { DIRECTION_ORDER, yawToDirection } from '../utils/ventureStats';

interface Panorama360ViewerProps {
  ventureId: string;
  ventureName: string;
  nodes: PanoramaNode[];
  floors: FloorPlan[];
  activeNodeId: string;
  activeFlatFloorIndex: number;
  activeFlatId: string | null;
  targetDirection?: DirectionCode | null;
  targetYaw?: number | null;
  onSelectNode: (nodeId: string) => void;
  onSelectFlatFor360: (floorIndex: number, flatId: string) => void;
  onJumpToFloor?: (floorIndex: number) => void;
  onExitTour?: () => void;
  onUploadCustomPanorama?: (nodeId: string, mediaUrl: string, mediaType: 'image' | 'video') => void;
}

interface ProjectedHotspot3D {
  hotspot: TourHotspot3D;
  x: number;
  y: number;
  visible: boolean;
}

const DIRECTION_YAW: Record<DirectionCode, number> = {
  N: 0,
  NE: 45,
  E: 90,
  SE: 135,
  S: 180,
  SW: 225,
  W: 270,
  NW: 315,
};

// Module-scoped scratch vectors to avoid GC churn inside render loops
const _lookTarget = new THREE.Vector3();
const _projVec = new THREE.Vector3();
const _worldPos = new THREE.Vector3();

function computeLookTarget(
  pos: THREE.Vector3,
  yawDeg: number,
  pitchDeg: number,
  out: THREE.Vector3,
) {
  const yawRad = THREE.MathUtils.degToRad(yawDeg);
  const pitchRad = THREE.MathUtils.degToRad(pitchDeg);
  const cosP = Math.cos(pitchRad);
  out.set(
    pos.x + cosP * Math.sin(yawRad) * 10,
    pos.y + Math.sin(pitchRad) * 10,
    pos.z - cosP * Math.cos(yawRad) * 10,
  );
  return out;
}

// Map legacy node IDs from seeds/directional views to 3D graph node IDs
function normalizeTourNodeId(rawId: string): string {
  if (rawId.endsWith('-ext-front')) return 'ext-front';
  if (rawId.endsWith('-ext-back')) return 'ext-back';
  if (rawId.endsWith('-ext-right')) return 'ext-right';
  if (rawId.endsWith('-ext-left')) return 'ext-left';
  if (rawId.endsWith('-flat-gate')) return 'flat-gate';
  if (rawId.endsWith('-flat-hall')) return 'flat-hall';
  if (rawId.endsWith('-flat-kitchen')) return 'flat-kitchen';
  if (rawId.endsWith('-flat-bedroom-1')) return 'flat-bedroom-1';
  if (rawId.endsWith('-flat-bath-1')) return 'flat-bath-1';
  if (rawId.endsWith('-flat-balcony')) return 'flat-balcony';
  if (rawId.endsWith('-flat-bedroom-2')) return 'flat-bedroom-2';
  if (rawId.endsWith('-flat-bath-2')) return 'flat-bath-2';
  return rawId;
}

export const Panorama360Viewer: React.FC<Panorama360ViewerProps> = ({
  ventureId,
  ventureName,
  floors,
  activeNodeId,
  activeFlatFloorIndex,
  activeFlatId,
  targetDirection,
  targetYaw,
  onSelectNode,
  onSelectFlatFor360,
  onExitTour,
}) => {
  const activeFloor = floors.find((f) => f.floorIndex === activeFlatFloorIndex) ?? floors[0];
  const activeFlat =
    activeFloor?.flats.find((u) => u.id === activeFlatId) ?? activeFloor?.flats[0];
  const flatNumber = activeFlat?.flatNumber ?? '101';

  const graphNodes = useMemo(
    () =>
      buildWalkthroughGraph(
        ventureId,
        ventureName,
        activeFloor?.floorIndex ?? 0,
        activeFloor?.floorName ?? 'Ground Floor',
        flatNumber,
      ),
    [ventureId, ventureName, activeFloor?.floorIndex, activeFloor?.floorName, flatNumber],
  );

  const normalizedActiveId = normalizeTourNodeId(activeNodeId);
  const currentTourNode: TourNode3D =
    graphNodes.find((n) => n.id === normalizedActiveId) ?? graphNodes[0];

  const [zoneTab, setZoneTab] = useState<TourZone>(currentTourNode.zone);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [liveYaw, setLiveYaw] = useState(currentTourNode.defaultYaw);
  const [liveFov, setLiveFov] = useState(66);
  const [showCompassRing, setShowCompassRing] = useState(false);
  const [showFlatSelectorModal, setShowFlatSelectorModal] = useState(false);
  const [projectedHotspots, setProjectedHotspots] = useState<ProjectedHotspot3D[]>([]);
  const [customPanoUrl, setCustomPanoUrl] = useState<string | null>(null);

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [promptFloorIdx, setPromptFloorIdx] = useState<number>(activeFlatFloorIndex);
  const [promptFlatId, setPromptFlatId] = useState<string>(activeFlat?.id ?? '');

  useEffect(() => {
    setPromptFloorIdx(activeFlatFloorIndex);
    setPromptFlatId(activeFlat?.id ?? '');
  }, [activeFlatFloorIndex, activeFlat?.id]);

  useEffect(() => {
    setZoneTab(currentTourNode.zone);
  }, [currentTourNode.zone]);

  const cameraStateRef = useRef({
    posX: currentTourNode.position[0],
    posY: currentTourNode.position[1],
    posZ: currentTourNode.position[2],
    targetPosX: currentTourNode.position[0],
    targetPosY: currentTourNode.position[1],
    targetPosZ: currentTourNode.position[2],
    yaw: currentTourNode.defaultYaw,
    pitch: currentTourNode.defaultPitch,
    fov: 66,
    targetYaw: currentTourNode.defaultYaw,
    targetPitch: currentTourNode.defaultPitch,
    targetFov: 66,
    isDragging: false,
    lastX: 0,
    lastY: 0,
  });

  const threeRefs = useRef<{
    renderer?: THREE.WebGLRenderer;
    scene?: THREE.Scene;
    camera?: THREE.PerspectiveCamera;
    builtScene?: BuiltArchitectureScene;
    panoSphere?: THREE.Mesh;
    panoMat?: THREE.MeshBasicMaterial;
    panoTex?: THREE.Texture | null;
    pmremGen?: THREE.PMREMGenerator;
    envRt?: THREE.WebGLRenderTarget;
    isSoftwareGl: boolean;
    requestRender: () => void;
    hotspots: TourHotspot3D[];
    customMode: boolean;
  }>({
    isSoftwareGl: false,
    requestRender: () => {},
    hotspots: currentTourNode.hotspots,
    customMode: false,
  });

  threeRefs.current.hotspots = customPanoUrl ? [] : currentTourNode.hotspots;
  threeRefs.current.customMode = Boolean(customPanoUrl);

  // Initialize Three.js renderer + lighting once
  useEffect(() => {
    const mount = canvasMountRef.current;
    if (!mount) return;

    const isSoftwareGl = (() => {
      try {
        const probe = document.createElement('canvas').getContext('webgl2');
        if (!probe) return true;
        const ext = probe.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : probe.RENDERER;
        const gpu = String(probe.getParameter(param));
        probe.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return false;
      }
    })();

    const width = mount.clientWidth || 960;
    const height = mount.clientHeight || 540;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xdbe6ee);
    scene.fog = new THREE.FogExp2(0xdbe6ee, 0.0085);

    const camera = new THREE.PerspectiveCamera(66, width / height, 0.12, 240);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.04;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.touchAction = 'none';

    mount.innerHTML = '';
    mount.appendChild(renderer.domElement);

    // Environment reflection + warm daylight key + cool sky bounce
    const pmremGen = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envRt = pmremGen.fromScene(roomEnv, 0.04);
    scene.environment = envRt.texture;
    roomEnv.dispose();

    const hemi = new THREE.HemisphereLight(0xf2f7fb, 0x8d826e, 0.85);
    scene.add(hemi);

    const sun = new THREE.DirectionalLight(0xfff5e4, 2.2);
    sun.position.set(28, 42, -24);
    if (!isSoftwareGl) {
      sun.castShadow = true;
      sun.shadow.mapSize.set(1024, 1024);
      sun.shadow.camera.near = 5;
      sun.shadow.camera.far = 110;
      const d = 32;
      sun.shadow.camera.left = -d;
      sun.shadow.camera.right = d;
      sun.shadow.camera.top = d;
      sun.shadow.camera.bottom = -d;
      sun.shadow.bias = -0.0005;
    }
    scene.add(sun);

    // Optional equirectangular sphere for user-uploaded Insta360 photos
    const panoGeo = new THREE.SphereGeometry(90, 48, 32);
    panoGeo.scale(-1, 1, 1);
    const panoMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const panoSphere = new THREE.Mesh(panoGeo, panoMat);
    panoSphere.visible = false;
    scene.add(panoSphere);

    let frameId = 0;
    let lastTime = performance.now();
    const startClock = lastTime;
    let renderBusy = false;
    let renderDirty = false;
    let lastUiSync = 0;

    function updateHotspotsOverlay() {
      const w = mount?.clientWidth || 960;
      const h = mount?.clientHeight || 540;
      const list = threeRefs.current.hotspots;
      const next: ProjectedHotspot3D[] = [];

      for (const hs of list) {
        _worldPos.set(hs.position[0], hs.position[1], hs.position[2]);
        _projVec.copy(_worldPos).project(camera);
        const visible =
          _projVec.z > 0 &&
          _projVec.z < 1 &&
          Math.abs(_projVec.x) <= 0.98 &&
          Math.abs(_projVec.y) <= 0.96;
        next.push({
          hotspot: hs,
          x: (_projVec.x * 0.5 + 0.5) * w,
          y: (-_projVec.y * 0.5 + 0.5) * h,
          visible,
        });
      }
      setProjectedHotspots(next);
    }

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (!gl || !gl.fenceSync) {
        frameId = window.setTimeout(cb, 80);
        return;
      }
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function renderFrame() {
      const now = performance.now();
      const delta = Math.min((now - lastTime) / 1000, 0.08);
      const elapsedSec = (now - startClock) / 1000;
      lastTime = now;

      const cs = cameraStateRef.current;

      let yawDiff = ((cs.targetYaw - cs.yaw + 540) % 360) - 180;
      if (isSoftwareGl) {
        cs.posX = cs.targetPosX;
        cs.posY = cs.targetPosY;
        cs.posZ = cs.targetPosZ;
        cs.yaw = (cs.targetYaw + 360) % 360;
        cs.pitch = THREE.MathUtils.clamp(cs.targetPitch, -78, 78);
        cs.fov = THREE.MathUtils.clamp(cs.targetFov, 30, 92);
      } else {
        const speed = 7.5;
        const rotSpeed = 11.0;
        cs.posX = THREE.MathUtils.damp(cs.posX, cs.targetPosX, speed, delta);
        cs.posY = THREE.MathUtils.damp(cs.posY, cs.targetPosY, speed, delta);
        cs.posZ = THREE.MathUtils.damp(cs.posZ, cs.targetPosZ, speed, delta);

        const dampFactor = 1 - Math.exp(-rotSpeed * delta);
        cs.yaw = (cs.yaw + yawDiff * dampFactor + 360) % 360;
        cs.pitch = THREE.MathUtils.damp(
          cs.pitch,
          THREE.MathUtils.clamp(cs.targetPitch, -78, 78),
          rotSpeed,
          delta,
        );
        cs.fov = THREE.MathUtils.damp(
          cs.fov,
          THREE.MathUtils.clamp(cs.targetFov, 30, 92),
          10,
          delta,
        );
      }

      if (Math.abs(camera.fov - cs.fov) > 0.05) {
        camera.fov = cs.fov;
        camera.updateProjectionMatrix();
      }

      if (threeRefs.current.customMode) {
        camera.position.set(0, 0, 0);
      } else {
        camera.position.set(cs.posX, cs.posY, cs.posZ);
      }
      computeLookTarget(camera.position, cs.yaw, cs.pitch, _lookTarget);
      camera.lookAt(_lookTarget);

      threeRefs.current.builtScene?.update(elapsedSec);
      renderer.render(scene, camera);
      updateHotspotsOverlay();

      if (now - lastUiSync > 90) {
        lastUiSync = now;
        setLiveYaw(Math.round(cs.yaw));
        setLiveFov(Math.round(cs.fov));
      }

      yawDiff = ((cs.targetYaw - cs.yaw + 540) % 360) - 180;
      const distSq =
        (cs.targetPosX - cs.posX) ** 2 +
        (cs.targetPosY - cs.posY) ** 2 +
        (cs.targetPosZ - cs.posZ) ** 2;

      const stillSettling =
        !isSoftwareGl &&
        (distSq > 0.002 ||
          Math.abs(yawDiff) > 0.15 ||
          Math.abs(cs.targetPitch - cs.pitch) > 0.15 ||
          Math.abs(cs.targetFov - cs.fov) > 0.15);

      if (stillSettling) {
        renderDirty = true;
      }
    }

    function requestRender() {
      if (renderBusy) {
        renderDirty = true;
        return;
      }
      renderBusy = true;
      frameId = requestAnimationFrame(() => {
        renderDirty = false;
        renderFrame();
        const done = () => {
          renderBusy = false;
          if (renderDirty) requestRender();
        };
        if (isSoftwareGl) afterDraw(done);
        else done();
      });
    }

    threeRefs.current = {
      ...threeRefs.current,
      renderer,
      scene,
      camera,
      panoSphere,
      panoMat,
      pmremGen,
      envRt,
      isSoftwareGl,
      requestRender,
    };

    const handleResize = () => {
      if (!mount) return;
      const w = mount.clientWidth || 960;
      const h = mount.clientHeight || 540;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      requestRender();
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(mount);

    requestRender();

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      threeRefs.current.builtScene?.dispose();
      threeRefs.current.panoTex?.dispose();
      panoGeo.dispose();
      panoMat.dispose();
      envRt.dispose();
      pmremGen.dispose();
      renderer.dispose();
    };
  }, []);

  // Rebuild 3D architectural model cleanly whenever ventureId changes
  useEffect(() => {
    const { scene, renderer, isSoftwareGl, requestRender } = threeRefs.current;
    if (!scene || !renderer) return;

    if (threeRefs.current.builtScene) {
      scene.remove(threeRefs.current.builtScene.root);
      threeRefs.current.builtScene.dispose();
      threeRefs.current.builtScene = undefined;
    }

    const built = buildArchitecturalScene(ventureId, renderer, isSoftwareGl);
    built.setActiveFloor(activeFlatFloorIndex, flatNumber);
    scene.add(built.root);
    threeRefs.current.builtScene = built;
    setCustomPanoUrl(null);
    if (threeRefs.current.panoSphere) {
      threeRefs.current.panoSphere.visible = false;
    }
    requestRender();
  }, [ventureId]);

  // Move active floor elevation when user picks another floor
  useEffect(() => {
    threeRefs.current.builtScene?.setActiveFloor(activeFlatFloorIndex, flatNumber);
    threeRefs.current.requestRender();
  }, [activeFlatFloorIndex, flatNumber]);

  // Smoothly glide Street-View camera to active node
  useEffect(() => {
    const cs = cameraStateRef.current;
    cs.targetPosX = currentTourNode.position[0];
    cs.targetPosY = currentTourNode.position[1];
    cs.targetPosZ = currentTourNode.position[2];
    cs.targetYaw = currentTourNode.defaultYaw;
    cs.targetPitch = currentTourNode.defaultPitch;
    threeRefs.current.requestRender();
  }, [currentTourNode.id, currentTourNode.position[1]]);

  // Handle explicit compass direction jump from DirectionalCompassExplorer
  useEffect(() => {
    if (targetDirection) {
      const pose = getDirectionCameraPose(targetDirection);
      const cs = cameraStateRef.current;
      cs.targetPosX = pose.position[0];
      cs.targetPosY = pose.position[1];
      cs.targetPosZ = pose.position[2];
      cs.targetYaw = pose.yaw;
      cs.targetPitch = 2;
      threeRefs.current.requestRender();
      return;
    }
    if (typeof targetYaw === 'number') {
      cameraStateRef.current.targetYaw = targetYaw;
      cameraStateRef.current.targetPitch = 0;
      threeRefs.current.requestRender();
    }
  }, [targetDirection, targetYaw]);

  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const navigateToTourNode = useCallback(
    (nodeId: string) => {
      setCustomPanoUrl(null);
      if (threeRefs.current.panoSphere) threeRefs.current.panoSphere.visible = false;
      if (threeRefs.current.builtScene) threeRefs.current.builtScene.root.visible = true;
      onSelectNode(nodeId);
    },
    [onSelectNode],
  );

  // Laptop Keyboard Navigation (Arrow keys + WASD + +/- Zoom + R Reset + F Fullscreen)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      const cs = cameraStateRef.current;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        if (currentTourNode.connections.forwardNodeId) {
          e.preventDefault();
          navigateToTourNode(currentTourNode.connections.forwardNodeId);
        }
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        if (currentTourNode.connections.backwardNodeId) {
          e.preventDefault();
          navigateToTourNode(currentTourNode.connections.backwardNodeId);
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        if (e.shiftKey || !currentTourNode.connections.leftNodeId) {
          cs.targetYaw = (cs.targetYaw - 22 + 360) % 360;
          threeRefs.current.requestRender();
        } else {
          navigateToTourNode(currentTourNode.connections.leftNodeId);
        }
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        if (e.shiftKey || !currentTourNode.connections.rightNodeId) {
          cs.targetYaw = (cs.targetYaw + 22) % 360;
          threeRefs.current.requestRender();
        } else {
          navigateToTourNode(currentTourNode.connections.rightNodeId);
        }
      } else if (e.key === 'q' || e.key === 'Q') {
        cs.targetYaw = (cs.targetYaw - 22 + 360) % 360;
        threeRefs.current.requestRender();
      } else if (e.key === 'e' || e.key === 'E') {
        cs.targetYaw = (cs.targetYaw + 22) % 360;
        threeRefs.current.requestRender();
      } else if (e.key === '+' || e.key === '=') {
        cs.targetFov = THREE.MathUtils.clamp(cs.targetFov - 8, 30, 92);
        threeRefs.current.requestRender();
      } else if (e.key === '-') {
        cs.targetFov = THREE.MathUtils.clamp(cs.targetFov + 8, 30, 92);
        threeRefs.current.requestRender();
      } else if (e.key === 'r' || e.key === 'R') {
        cs.targetYaw = currentTourNode.defaultYaw;
        cs.targetPitch = currentTourNode.defaultPitch;
        cs.targetFov = 66;
        threeRefs.current.requestRender();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentTourNode, navigateToTourNode]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const cs = cameraStateRef.current;
    cs.isDragging = true;
    cs.lastX = e.clientX;
    cs.lastY = e.clientY;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const cs = cameraStateRef.current;
    if (!cs.isDragging) return;
    const dx = e.clientX - cs.lastX;
    const dy = e.clientY - cs.lastY;
    cs.lastX = e.clientX;
    cs.lastY = e.clientY;

    const sensitivity = (cs.fov / 66) * 0.24;
    cs.targetYaw = (cs.targetYaw - dx * sensitivity + 360) % 360;
    cs.targetPitch = THREE.MathUtils.clamp(cs.targetPitch + dy * sensitivity, -78, 78);
    threeRefs.current.requestRender();
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    cameraStateRef.current.isDragging = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const cs = cameraStateRef.current;
    cs.targetFov = THREE.MathUtils.clamp(cs.targetFov + e.deltaY * 0.04, 30, 92);
    threeRefs.current.requestRender();
  };

  const adjustZoom = (deltaFov: number) => {
    const cs = cameraStateRef.current;
    cs.targetFov = THREE.MathUtils.clamp(cs.targetFov + deltaFov, 30, 92);
    threeRefs.current.requestRender();
  };

  const rotateCamera = (deltaYaw: number) => {
    const cs = cameraStateRef.current;
    cs.targetYaw = (cs.targetYaw + deltaYaw + 360) % 360;
    threeRefs.current.requestRender();
  };

  const resetView = () => {
    const cs = cameraStateRef.current;
    cs.targetPosX = currentTourNode.position[0];
    cs.targetPosY = currentTourNode.position[1];
    cs.targetPosZ = currentTourNode.position[2];
    cs.targetYaw = currentTourNode.defaultYaw;
    cs.targetPitch = currentTourNode.defaultPitch;
    cs.targetFov = 66;
    threeRefs.current.requestRender();
  };

  const turnToDirection = (dir: DirectionCode) => {
    const pose = getDirectionCameraPose(dir);
    const cs = cameraStateRef.current;
    if (currentTourNode.zone === 'exterior') {
      cs.targetPosX = pose.position[0];
      cs.targetPosY = pose.position[1];
      cs.targetPosZ = pose.position[2];
      cs.targetYaw = pose.yaw;
    } else {
      cs.targetYaw = DIRECTION_YAW[dir];
    }
    cs.targetPitch = 0;
    setShowCompassRing(false);
    threeRefs.current.requestRender();
  };

  const toggleFullscreen = async () => {
    const el = wrapperRef.current;
    if (!el) return;
    try {
      if (!document.fullscreenElement) {
        await el.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // Ignore
    }
  };

  const handleExitVirtualTour = async () => {
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch {
        // Ignore
      }
    }
    if (customPanoUrl) {
      setCustomPanoUrl(null);
      if (threeRefs.current.panoSphere) threeRefs.current.panoSphere.visible = false;
      if (threeRefs.current.builtScene) threeRefs.current.builtScene.root.visible = true;
      threeRefs.current.requestRender();
    }
    onExitTour?.();
  };

  const handleUploadInsta360 = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const loader = new THREE.TextureLoader();
    loader.load(url, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      if (threeRefs.current.panoTex) threeRefs.current.panoTex.dispose();
      threeRefs.current.panoTex = tex;
      if (threeRefs.current.panoMat && threeRefs.current.panoSphere) {
        threeRefs.current.panoMat.map = tex;
        threeRefs.current.panoMat.needsUpdate = true;
        threeRefs.current.panoSphere.visible = true;
      }
      if (threeRefs.current.builtScene) {
        threeRefs.current.builtScene.root.visible = false;
      }
      setCustomPanoUrl(url);
      threeRefs.current.requestRender();
    });
    e.target.value = '';
  };

  const exteriorNodes = graphNodes.filter((n) => n.zone === 'exterior');
  const floorNodes = graphNodes.filter((n) => n.zone === 'floor');
  const interiorNodes = graphNodes.filter((n) => n.zone === 'interior');
  const zoneNodes =
    zoneTab === 'exterior'
      ? exteriorNodes
      : zoneTab === 'floor'
        ? floorNodes
        : interiorNodes;

  const directionInfo = yawToDirection(liveYaw);
  const zoomPct = Math.round(((92 - liveFov) / (92 - 30)) * 100);
  const promptFloor = floors.find((f) => f.floorIndex === promptFloorIdx) ?? floors[0];

  return (
    <div
      ref={wrapperRef}
      className={`relative bg-[#141E2B] rounded-2xl overflow-hidden border border-[#E2DDD3] shadow-sm select-none ${
        isFullscreen ? 'w-screen h-screen rounded-none flex flex-col' : 'w-full'
      }`}
    >
      {/* Top Location Indicator & Exit Tour Header */}
      <div className="bg-[#141E2B] border-b border-[#243244] px-4 sm:px-5 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#B89452] font-medium">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span>
              {currentTourNode.zone === 'exterior'
                ? 'Outside Grounds & Amenities'
                : currentTourNode.zone === 'floor'
                  ? `${activeFloor?.floorName} Common Areas`
                  : `${activeFloor?.floorName} · Flat ${flatNumber} Interior`}
            </span>
            <span className="text-[#FAF8F4]/40">·</span>
            <span className="text-[#FAF8F4]/75">{currentTourNode.compassHeadingLabel}</span>
          </div>
          <h3 className="font-display text-base sm:text-lg font-bold text-[#FAF8F4] truncate mt-0.5">
            {currentTourNode.title}
          </h3>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowFlatSelectorModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#4A6B53] hover:bg-[#3B5844] text-[#FAF8F4] text-xs font-semibold transition-colors cursor-pointer"
          >
            <DoorOpen className="w-3.5 h-3.5" />
            <span>Floor &amp; Flat ({flatNumber})</span>
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#243244] hover:bg-[#31435A] text-[#FAF8F4] text-xs font-medium transition-colors cursor-pointer"
          >
            {isFullscreen ? (
              <Minimize2 className="w-3.5 h-3.5" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">{isFullscreen ? 'Exit Fullscreen' : 'Full Screen'}</span>
          </button>

          <button
            type="button"
            onClick={handleExitVirtualTour}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#FAF8F4]/25 hover:bg-[#FAF8F4]/10 text-[#FAF8F4] text-xs font-medium transition-colors cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exit Tour</span>
          </button>
        </div>
      </div>

      {/* Zone Switcher + Area / Room Navigation Strip */}
      <div className="bg-[#1B2738] border-b border-[#243244] px-4 py-2.5 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                setZoneTab('exterior');
                navigateToTourNode('ext-front');
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                zoneTab === 'exterior'
                  ? 'bg-[#B89452] text-[#141E2B]'
                  : 'bg-[#141E2B] text-[#FAF8F4]/80 hover:text-white'
              }`}
            >
              <Trees className="w-3.5 h-3.5" />
              <span>Outside &amp; Amenities</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setZoneTab('floor');
                navigateToTourNode('floor-corridor');
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                zoneTab === 'floor'
                  ? 'bg-[#B89452] text-[#141E2B]'
                  : 'bg-[#141E2B] text-[#FAF8F4]/80 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Floors &amp; Corridor</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setZoneTab('interior');
                navigateToTourNode('flat-hall');
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                zoneTab === 'interior'
                  ? 'bg-[#B89452] text-[#141E2B]'
                  : 'bg-[#141E2B] text-[#FAF8F4]/80 hover:text-white'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Inside Flat ({flatNumber})</span>
            </button>
          </div>

          {/* Quick Inline Floor & Flat Dropdown */}
          <div className="flex items-center gap-2 text-xs">
            <select
              value={activeFlatFloorIndex}
              onChange={(e) => {
                const idx = Number(e.target.value);
                const fl = floors.find((f) => f.floorIndex === idx);
                const firstFlat = fl?.flats[0]?.id;
                if (firstFlat) {
                  onSelectFlatFor360(idx, firstFlat);
                }
              }}
              className="px-2.5 py-1.5 rounded-lg bg-[#141E2B] border border-[#2C3C52] text-[#FAF8F4] text-xs"
              aria-label="Select floor"
            >
              {floors.map((fl) => (
                <option key={fl.floorIndex} value={fl.floorIndex}>
                  {fl.floorName}
                </option>
              ))}
            </select>

            <select
              value={activeFlat?.id ?? ''}
              onChange={(e) => onSelectFlatFor360(activeFlatFloorIndex, e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-[#141E2B] border border-[#2C3C52] text-[#FAF8F4] text-xs"
              aria-label="Select flat"
            >
              {(activeFloor?.flats ?? []).map((u) => (
                <option key={u.id} value={u.id}>
                  Flat {u.flatNumber} ({u.bhk})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Location Chips for Current Zone */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
          {zoneNodes.map((node) => (
            <button
              key={node.id}
              type="button"
              onClick={() => navigateToTourNode(node.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                node.id === currentTourNode.id
                  ? 'bg-[#4A6B53] text-white'
                  : 'bg-[#141E2B] text-[#FAF8F4]/75 hover:bg-[#243244] hover:text-white'
              }`}
            >
              {node.shortLabel}
            </button>
          ))}
        </div>
      </div>

      {/* Main Interactive 3D Viewport */}
      <div
        className={`relative w-full overflow-hidden ${
          isFullscreen ? 'flex-1 min-h-0' : 'h-[440px] sm:h-[520px] lg:h-[560px]'
        }`}
      >
        <div
          ref={canvasMountRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onWheel={handleWheel}
          className="w-full h-full cursor-grab active:cursor-grabbing"
          aria-label={`Interactive 3D 360 view: ${currentTourNode.title}. Drag to look around or use arrow keys to walk.`}
        />

        {/* Projected 3D Spatial Hotspots */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {projectedHotspots.map(({ hotspot, x, y, visible }) =>
            visible ? (
              <button
                key={hotspot.id}
                type="button"
                onClick={() => {
                  if (hotspot.action === 'enter-flat') {
                    setShowFlatSelectorModal(true);
                  } else if (hotspot.targetNodeId) {
                    navigateToTourNode(hotspot.targetNodeId);
                  }
                }}
                style={{ transform: `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)` }}
                className="pointer-events-auto absolute top-0 left-0 px-3 py-1.5 rounded-lg bg-[#141E2B]/95 border border-[#B89452] text-[#FAF8F4] text-xs font-medium shadow-md hover:bg-[#B89452] hover:text-[#141E2B] transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-[#B89452] shrink-0" />
                <span>{hotspot.title}</span>
              </button>
            ) : null,
          )}
        </div>

        {/* Top-Left Compass Rose Toggle */}
        <div className="absolute top-3 left-3 z-10">
          <button
            type="button"
            onClick={() => setShowCompassRing((prev) => !prev)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#141E2B] border border-[#2C3C52] text-[#FAF8F4] hover:border-[#B89452] transition-colors cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full border border-[#B89452]/70 flex items-center justify-center bg-[#1B2738]">
              <Compass
                className="w-4 h-4 text-[#B89452] transition-transform duration-150"
                style={{ transform: `rotate(${liveYaw}deg)` }}
              />
            </div>
            <div className="text-left">
              <div className="text-xs font-semibold tabular-nums leading-tight">
                {directionInfo.code} · {directionInfo.normalizedDeg}°
              </div>
              <div className="text-[11px] text-[#FAF8F4]/70 leading-tight">
                {directionInfo.label}
              </div>
            </div>
          </button>

          {showCompassRing && (
            <div className="mt-2 p-2.5 rounded-xl bg-[#141E2B] border border-[#2C3C52] grid grid-cols-4 gap-1.5 w-52 shadow-xl">
              {DIRECTION_ORDER.map((dir) => (
                <button
                  key={dir}
                  type="button"
                  onClick={() => turnToDirection(dir)}
                  className={`py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    directionInfo.code === dir
                      ? 'bg-[#B89452] text-[#141E2B] font-bold'
                      : 'bg-[#1B2738] text-[#FAF8F4]/85 hover:bg-[#243244]'
                  }`}
                >
                  {dir}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Street-View Directional Arrow Overlay (Forward / Backward / Left / Right) */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1.5 max-w-[95%]">
          {currentTourNode.connections.forwardNodeId && (
            <button
              type="button"
              onClick={() => navigateToTourNode(currentTourNode.connections.forwardNodeId!)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#B89452] hover:bg-[#9E7B3B] text-[#141E2B] text-xs font-bold shadow-lg transition-colors whitespace-nowrap cursor-pointer"
            >
              <ArrowUp className="w-4 h-4 shrink-0" />
              <span>{currentTourNode.connections.forwardLabel || 'Forward'}</span>
            </button>
          )}

          <div className="flex items-center justify-center gap-1.5 flex-wrap">
            {currentTourNode.connections.leftNodeId && (
              <button
                type="button"
                onClick={() => navigateToTourNode(currentTourNode.connections.leftNodeId!)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#141E2B] border border-[#2C3C52] hover:border-[#B89452] text-[#FAF8F4] text-xs font-medium shadow-md transition-colors whitespace-nowrap cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-[#B89452]" />
                <span>{currentTourNode.connections.leftLabel || 'Left'}</span>
              </button>
            )}

            {currentTourNode.connections.backwardNodeId && (
              <button
                type="button"
                onClick={() => navigateToTourNode(currentTourNode.connections.backwardNodeId!)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#141E2B] border border-[#2C3C52] hover:border-[#B89452] text-[#FAF8F4] text-xs font-medium shadow-md transition-colors whitespace-nowrap cursor-pointer"
              >
                <ArrowDown className="w-3.5 h-3.5 text-[#B89452]" />
                <span>{currentTourNode.connections.backwardLabel || 'Back'}</span>
              </button>
            )}

            {currentTourNode.connections.rightNodeId && (
              <button
                type="button"
                onClick={() => navigateToTourNode(currentTourNode.connections.rightNodeId!)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#141E2B] border border-[#2C3C52] hover:border-[#B89452] text-[#FAF8F4] text-xs font-medium shadow-md transition-colors whitespace-nowrap cursor-pointer"
              >
                <span>{currentTourNode.connections.rightLabel || 'Right'}</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#B89452]" />
              </button>
            )}
          </div>
        </div>

        {/* Floor & Flat Selection Modal */}
        {showFlatSelectorModal && (
          <div className="absolute inset-0 z-30 bg-[#141E2B]/85 flex items-center justify-center p-4">
            <div className="bg-[#FAF8F4] text-[#1D2939] w-full max-w-md rounded-2xl border border-[#E2DDD3] p-6 shadow-2xl space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold text-[#4A6B53]">Select Residence</p>
                  <h4 className="font-display text-xl font-bold text-[#141E2B] mt-0.5">
                    Choose Floor &amp; Flat
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setShowFlatSelectorModal(false)}
                  className="p-1.5 rounded-lg hover:bg-[#F3EFE8] cursor-pointer"
                  aria-label="Close floor selector"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-sm">
                <div>
                  <label className="block text-xs font-medium text-[#1D2939]/75 mb-1">
                    Floor Level
                  </label>
                  <select
                    value={promptFloorIdx}
                    onChange={(e) => {
                      const idx = Number(e.target.value);
                      setPromptFloorIdx(idx);
                      const fl = floors.find((f) => f.floorIndex === idx);
                      setPromptFlatId(fl?.flats[0]?.id || '');
                    }}
                    className="w-full px-3 py-2.5 rounded-lg bg-white border border-[#E2DDD3] text-sm font-medium"
                  >
                    {floors.map((fl) => (
                      <option key={fl.floorIndex} value={fl.floorIndex}>
                        {fl.floorName} ({fl.flats.length} Flats)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#1D2939]/75 mb-1">
                    Flat Unit
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(promptFloor?.flats ?? []).map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => setPromptFlatId(u.id)}
                        className={`p-2.5 rounded-lg border text-left text-xs transition-colors cursor-pointer ${
                          promptFlatId === u.id
                            ? 'bg-[#141E2B] text-[#FAF8F4] border-[#141E2B]'
                            : 'bg-white text-[#1D2939] border-[#E2DDD3] hover:border-[#B89452]'
                        }`}
                      >
                        <div className="font-bold">Flat {u.flatNumber}</div>
                        <div className="opacity-75">
                          {u.bhk} · {u.status}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    if (!promptFlatId) return;
                    setShowFlatSelectorModal(false);
                    onSelectFlatFor360(promptFloorIdx, promptFlatId);
                    navigateToTourNode('floor-corridor');
                  }}
                  className="py-2.5 px-3 rounded-lg border border-[#141E2B] text-[#141E2B] hover:bg-[#F3EFE8] text-xs font-semibold transition-colors cursor-pointer"
                >
                  Floor Corridor
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!promptFlatId) return;
                    setShowFlatSelectorModal(false);
                    onSelectFlatFor360(promptFloorIdx, promptFlatId);
                    navigateToTourNode('flat-gate');
                  }}
                  className="py-2.5 px-3 rounded-lg bg-[#141E2B] hover:bg-[#4A6B53] text-[#FAF8F4] text-xs font-semibold transition-colors cursor-pointer"
                >
                  Enter Flat Gate →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Camera, Keyboard Hint & 360° Rotation Controls */}
      <div className="bg-[#141E2B] border-t border-[#243244] px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-0.5 max-w-xl">
          <p className="text-xs text-[#FAF8F4]/90">{currentTourNode.description}</p>
          <p className="text-[11px] text-[#FAF8F4]/55">
            Drag mouse to look 360° · Arrow keys / WASD to move · Q / E to rotate · Scroll to zoom
          </p>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => rotateCamera(-30)}
            className="inline-flex items-center gap-1 px-2.5 py-2 rounded-lg bg-[#1B2738] hover:bg-[#243244] text-[#FAF8F4] text-xs font-medium cursor-pointer"
            title="Rotate Left (Q)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Turn L</span>
          </button>

          <button
            type="button"
            onClick={() => rotateCamera(30)}
            className="inline-flex items-center gap-1 px-2.5 py-2 rounded-lg bg-[#1B2738] hover:bg-[#243244] text-[#FAF8F4] text-xs font-medium cursor-pointer"
            title="Rotate Right (E)"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Turn R</span>
          </button>

          <button
            type="button"
            onClick={() => adjustZoom(-10)}
            className="inline-flex items-center gap-1 px-2.5 py-2 rounded-lg bg-[#1B2738] hover:bg-[#243244] text-[#FAF8F4] text-xs font-medium cursor-pointer"
          >
            <ZoomIn className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Zoom In</span>
          </button>

          <span className="text-xs font-mono tabular-nums text-[#FAF8F4]/70 px-1">
            {zoomPct}%
          </span>

          <button
            type="button"
            onClick={() => adjustZoom(10)}
            className="inline-flex items-center gap-1 px-2.5 py-2 rounded-lg bg-[#1B2738] hover:bg-[#243244] text-[#FAF8F4] text-xs font-medium cursor-pointer"
          >
            <ZoomOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Zoom Out</span>
          </button>

          <button
            type="button"
            onClick={resetView}
            className="inline-flex items-center gap-1 px-2.5 py-2 rounded-lg bg-[#1B2738] hover:bg-[#243244] text-[#FAF8F4] text-xs font-medium cursor-pointer"
          >
            <span>Reset</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleUploadInsta360}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-2.5 py-2 rounded-lg bg-[#243244] hover:bg-[#31435A] text-[#FAF8F4] text-xs font-medium cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-[#B89452]" />
            <span className="hidden sm:inline">360° Photo</span>
          </button>
        </div>
      </div>
    </div>
  );
};

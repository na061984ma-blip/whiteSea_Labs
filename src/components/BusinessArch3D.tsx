import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { Compass, Eye, RotateCcw } from 'lucide-react';
import type { ApartmentVenture } from '../types/realEstate';

interface BusinessArch3DProps {
  ventures: ApartmentVenture[];
  selectedVentureId: string;
  onSelectVentureId: (id: string) => void;
  onLaunch360: (ventureId: string) => void;
}

function drawArchSignTexture(
  canvas: HTMLCanvasElement,
  apartmentName: string,
  tagline: string,
  location: string,
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.fillStyle = '#141E2B';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Subtle top & bottom gold border strips
  ctx.fillStyle = '#B89452';
  ctx.fillRect(0, 0, canvas.width, 10);
  ctx.fillRect(0, canvas.height - 10, canvas.width, 10);

  // Inner botanical green accent rule
  ctx.fillStyle = '#4A6B53';
  ctx.fillRect(48, 34, canvas.width - 96, 3);

  // Top brand kicker
  ctx.fillStyle = '#B89452';
  ctx.font = '600 24px "DM Sans", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('MERIDIAN ESTATES · BUSINESS ARCHWAY', canvas.width / 2, 76);

  // Main Apartment Name
  ctx.fillStyle = '#FAF8F4';
  ctx.font = '700 62px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillText(apartmentName.toUpperCase(), canvas.width / 2, 150);

  // Location & tagline
  ctx.fillStyle = '#E2DDD3';
  ctx.font = '500 22px "DM Sans", system-ui, sans-serif';
  ctx.fillText(`${location}  ·  ${tagline}`, canvas.width / 2, 198);
}

export const BusinessArch3D: React.FC<BusinessArch3DProps> = ({
  ventures,
  selectedVentureId,
  onSelectVentureId,
  onLaunch360,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [controlsCollapsed, setControlsCollapsed] = useState(false);

  const activeVenture =
    ventures.find((v) => v.id === selectedVentureId) ?? ventures[0];

  const sceneHooksRef = useRef<{
    signCanvas?: HTMLCanvasElement;
    signTexture?: THREE.CanvasTexture;
    requestRender: () => void;
    resetCamera: () => void;
  }>({
    requestRender: () => {},
    resetCamera: () => {},
  });

  // Initialize Three.js PBR 3D Business Arch scene once
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return false;
      }
    })();

    const width = mount.clientWidth || 1000;
    const height = mount.clientHeight || 440;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#EFE7DA');
    scene.fog = new THREE.Fog('#EFE7DA', 22, 55);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 3.6, 12.5);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize(width, height);
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';

    mount.innerHTML = '';
    mount.appendChild(renderer.domElement);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;
    pmrem.dispose();

    // 3-Point Warm/Cool Studio Rig
    const hemiLight = new THREE.HemisphereLight('#DCEEF2', '#C5B8A5', 0.85);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight('#FFF3E0', 2.1);
    keyLight.position.set(8, 12, 10);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.left = -10;
    keyLight.shadow.camera.right = 10;
    keyLight.shadow.camera.top = 10;
    keyLight.shadow.camera.bottom = -4;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight('#B89452', 0.55);
    rimLight.position.set(-9, 6, -8);
    scene.add(rimLight);

    // Materials
    const travertineMat = new THREE.MeshStandardMaterial({
      color: '#EAE3D6',
      roughness: 0.72,
      metalness: 0.04,
    });
    const deepTealMat = new THREE.MeshStandardMaterial({
      color: '#141E2B',
      roughness: 0.36,
      metalness: 0.28,
    });
    const turquoiseMat = new THREE.MeshStandardMaterial({
      color: '#4A6B53',
      roughness: 0.34,
      metalness: 0.2,
    });
    const brassMat = new THREE.MeshPhysicalMaterial({
      color: '#B89452',
      roughness: 0.22,
      metalness: 0.92,
      anisotropy: 0.7,
    });
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: '#D5EEF0',
      roughness: 0.08,
      metalness: 0.05,
      transmission: isSoftwareGl ? 0 : 0.75,
      transparent: true,
      opacity: isSoftwareGl ? 0.38 : 0.85,
      ior: 1.5,
      thickness: 0.3,
    });
    const groundMat = new THREE.MeshStandardMaterial({
      color: '#E5DAC9',
      roughness: 0.92,
      metalness: 0.0,
    });

    // Ground & Contact Shadow Plaza
    const groundMesh = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), groundMat);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.receiveShadow = true;
    scene.add(groundMesh);

    // Radial contact shadow beneath arch
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 256;
    shadowCanvas.height = 256;
    const sCtx = shadowCanvas.getContext('2d');
    if (sCtx) {
      const grad = sCtx.createRadialGradient(128, 128, 20, 128, 128, 124);
      grad.addColorStop(0, 'rgba(20, 30, 43, 0.34)');
      grad.addColorStop(0.65, 'rgba(20, 30, 43, 0.11)');
      grad.addColorStop(1, 'rgba(20, 30, 43, 0)');
      sCtx.fillStyle = grad;
      sCtx.fillRect(0, 0, 256, 256);
    }
    const contactTex = new THREE.CanvasTexture(shadowCanvas);
    const contactPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(11.5, 5.2),
      new THREE.MeshBasicMaterial({
        map: contactTex,
        transparent: true,
        depthWrite: false,
      }),
    );
    contactPlane.rotation.x = -Math.PI / 2;
    contactPlane.position.y = 0.02;
    scene.add(contactPlane);

    // COMPOSITE 3D BUSINESS ARCH GROUP (12+ Architectural Parts)
    const archGroup = new THREE.Group();
    scene.add(archGroup);

    // 1. Stepped Travertine Entrance Plinth & Walkway
    const lowerPlinth = new THREE.Mesh(
      new THREE.BoxGeometry(10.6, 0.24, 3.6),
      travertineMat,
    );
    lowerPlinth.position.set(0, 0.12, 0);
    lowerPlinth.castShadow = true;
    lowerPlinth.receiveShadow = true;
    archGroup.add(lowerPlinth);

    const upperPlinth = new THREE.Mesh(
      new THREE.BoxGeometry(9.4, 0.18, 2.8),
      travertineMat,
    );
    upperPlinth.position.set(0, 0.33, 0);
    upperPlinth.castShadow = true;
    upperPlinth.receiveShadow = true;
    archGroup.add(upperPlinth);

    // Walkway approach strip
    const walkway = new THREE.Mesh(
      new THREE.BoxGeometry(3.8, 0.04, 6.2),
      deepTealMat,
    );
    walkway.position.set(0, 0.04, 3.6);
    walkway.receiveShadow = true;
    archGroup.add(walkway);

    // 2. Twin Architectural Columns + Bases + Capitals + Brass Trim
    [-2.55, 2.55].forEach((xPos) => {
      const pierBase = new THREE.Mesh(
        new THREE.BoxGeometry(1.18, 0.55, 1.32),
        travertineMat,
      );
      pierBase.position.set(xPos, 0.69, 0);
      pierBase.castShadow = true;
      pierBase.receiveShadow = true;
      archGroup.add(pierBase);

      const mainPier = new THREE.Mesh(
        new THREE.BoxGeometry(0.92, 3.25, 1.05),
        deepTealMat,
      );
      mainPier.position.set(xPos, 2.59, 0);
      mainPier.castShadow = true;
      mainPier.receiveShadow = true;
      archGroup.add(mainPier);

      // Vertical brass inlay rib
      const brassRib = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 3.1, 1.1),
        brassMat,
      );
      brassRib.position.set(xPos, 2.59, 0);
      archGroup.add(brassRib);

      // Pier capital collar
      const capital = new THREE.Mesh(
        new THREE.BoxGeometry(1.16, 0.24, 1.26),
        travertineMat,
      );
      capital.position.set(xPos, 4.22, 0);
      capital.castShadow = true;
      archGroup.add(capital);
    });

    // 3. Sweeping Extruded Arch Crown (Semicircular Portal)
    const outerRadius = 2.95;
    const innerRadius = 2.08;
    const archShape = new THREE.Shape();
    archShape.absarc(0, 0, outerRadius, 0, Math.PI, false);
    archShape.lineTo(-innerRadius, 0);
    archShape.absarc(0, 0, innerRadius, Math.PI, 0, true);
    archShape.closePath();

    const archGeo = new THREE.ExtrudeGeometry(archShape, {
      depth: 0.98,
      bevelEnabled: true,
      bevelThickness: 0.08,
      bevelSize: 0.06,
      bevelSegments: 3,
      curveSegments: 36,
    });
    archGeo.translate(0, 0, -0.49);
    const archMesh = new THREE.Mesh(archGeo, travertineMat);
    archMesh.position.set(0, 4.2, 0);
    archMesh.castShadow = true;
    archMesh.receiveShadow = true;
    archGroup.add(archMesh);

    // Inner Turquoise Arch Soffit Ring
    const innerTrimShape = new THREE.Shape();
    innerTrimShape.absarc(0, 0, 2.12, 0, Math.PI, false);
    innerTrimShape.lineTo(-1.96, 0);
    innerTrimShape.absarc(0, 0, 1.96, Math.PI, 0, true);
    innerTrimShape.closePath();
    const innerTrimGeo = new THREE.ExtrudeGeometry(innerTrimShape, {
      depth: 1.06,
      bevelEnabled: false,
      curveSegments: 36,
    });
    innerTrimGeo.translate(0, 0, -0.53);
    const innerTrimMesh = new THREE.Mesh(innerTrimGeo, turquoiseMat);
    innerTrimMesh.position.set(0, 4.2, 0);
    archGroup.add(innerTrimMesh);

    // 4. Illuminated Entablature Signboard Frame + CanvasTexture
    const entablatureFrame = new THREE.Mesh(
      new THREE.BoxGeometry(6.8, 1.38, 1.18),
      deepTealMat,
    );
    entablatureFrame.position.set(0, 5.15, 0.05);
    entablatureFrame.castShadow = true;
    archGroup.add(entablatureFrame);

    const entablatureCap = new THREE.Mesh(
      new THREE.BoxGeometry(7.2, 0.16, 1.34),
      brassMat,
    );
    entablatureCap.position.set(0, 5.9, 0.05);
    archGroup.add(entablatureCap);

    const signCanvas = document.createElement('canvas');
    signCanvas.width = 1024;
    signCanvas.height = 256;
    drawArchSignTexture(
      signCanvas,
      activeVenture?.name || 'Skycrest Residences',
      activeVenture?.tagline || '360° Residential Showcase',
      activeVenture?.location || 'Hyderabad',
    );
    const signTexture = new THREE.CanvasTexture(signCanvas);
    signTexture.colorSpace = THREE.SRGBColorSpace;
    signTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();

    const signMat = new THREE.MeshStandardMaterial({
      map: signTexture,
      roughness: 0.35,
      metalness: 0.1,
    });
    const frontSign = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 1.2), signMat);
    frontSign.position.set(0, 5.15, 0.65);
    archGroup.add(frontSign);

    const backSign = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 1.2), signMat);
    backSign.rotation.y = Math.PI;
    backSign.position.set(0, 5.15, -0.55);
    archGroup.add(backSign);

    // 5. Recessed Glass Vestibule Portal Behind Arch
    const glassPortal = new THREE.Mesh(
      new THREE.BoxGeometry(3.75, 3.6, 0.14),
      glassMat,
    );
    glassPortal.position.set(0, 2.22, -0.42);
    archGroup.add(glassPortal);

    // 6. Wing Planter Boxes + Instanced Architectural Foliage
    [-4.1, 4.1].forEach((px) => {
      const planter = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 0.68, 1.4),
        travertineMat,
      );
      planter.position.set(px, 0.58, 0.25);
      planter.castShadow = true;
      planter.receiveShadow = true;
      archGroup.add(planter);

      const soil = new THREE.Mesh(
        new THREE.BoxGeometry(1.42, 0.08, 1.22),
        new THREE.MeshStandardMaterial({ color: '#4A3F35', roughness: 0.95 }),
      );
      soil.position.set(px, 0.9, 0.25);
      archGroup.add(soil);
    });

    // Instanced Foliage Shrubs inside both planters
    const shrubGeo = new THREE.IcosahedronGeometry(0.28, 1);
    const shrubMat = new THREE.MeshStandardMaterial({
      color: '#FFFFFF',
      roughness: 0.85,
      metalness: 0.02,
    });
    const shrubCount = 24;
    const shrubs = new THREE.InstancedMesh(shrubGeo, shrubMat, shrubCount);
    shrubs.castShadow = !isSoftwareGl;
    const dummy = new THREE.Object3D();
    const tint = new THREE.Color();
    const greens = ['#1D5B52', '#266E62', '#2F7D6D', '#194A43'];
    for (let i = 0; i < shrubCount; i++) {
      const side = i < 12 ? -4.1 : 4.1;
      const localIdx = i % 12;
      const col = localIdx % 4;
      const row = Math.floor(localIdx / 4);
      dummy.position.set(
        side - 0.42 + col * 0.28,
        1.12 + (localIdx % 2) * 0.14,
        -0.12 + row * 0.36,
      );
      const s = 0.85 + ((i * 7) % 5) * 0.08;
      dummy.scale.set(s, s * 1.15, s);
      dummy.rotation.y = i * 0.6;
      dummy.updateMatrix();
      shrubs.setMatrixAt(i, dummy.matrix);
      tint.set(greens[i % greens.length]);
      shrubs.setColorAt(i, tint);
    }
    shrubs.instanceMatrix.needsUpdate = true;
    if (shrubs.instanceColor) shrubs.instanceColor.needsUpdate = true;
    shrubs.computeBoundingSphere();
    archGroup.add(shrubs);

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 2.75, 0);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.06;
    controls.maxPolarAngle = Math.PI / 2 - 0.04;
    controls.minPolarAngle = 0.22;
    controls.minDistance = 7;
    controls.maxDistance = 20;
    controls.update();

    let frameId = 0;
    let renderBusy = false;
    let renderDirty = false;
    let settlingUntil = 0;

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

    function requestRender() {
      if (renderBusy) {
        renderDirty = true;
        return;
      }
      renderBusy = true;
      frameId = requestAnimationFrame(() => {
        renderDirty = false;
        controls.update();
        renderer.render(scene, camera);
        const done = () => {
          renderBusy = false;
          if (renderDirty || (!isSoftwareGl && performance.now() < settlingUntil)) {
            requestRender();
          }
        };
        if (isSoftwareGl) afterDraw(done);
        else done();
      });
    }

    controls.addEventListener('change', () => {
      settlingUntil = performance.now() + 450;
      requestRender();
    });

    const handleResize = () => {
      if (!mount) return;
      const w = mount.clientWidth || 1000;
      const h = mount.clientHeight || 440;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      requestRender();
    };
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(mount);

    sceneHooksRef.current = {
      signCanvas,
      signTexture,
      requestRender,
      resetCamera: () => {
        camera.position.set(0, 3.6, 12.5);
        controls.target.set(0, 2.75, 0);
        controls.update();
        requestRender();
      },
    };

    requestRender();

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      controls.dispose();
      signTexture.dispose();
      contactTex.dispose();
      envTex.dispose();
      archGroup.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
          else obj.material.dispose();
        }
      });
      groundMesh.geometry.dispose();
      groundMat.dispose();
      renderer.dispose();
    };
  }, []);

  // Update 3D Business Arch signage whenever active venture changes
  useEffect(() => {
    const { signCanvas, signTexture, requestRender } = sceneHooksRef.current;
    if (!signCanvas || !signTexture || !activeVenture) return;
    drawArchSignTexture(
      signCanvas,
      activeVenture.name,
      activeVenture.tagline,
      activeVenture.location,
    );
    signTexture.needsUpdate = true;
    requestRender();
  }, [activeVenture?.id, activeVenture?.name, activeVenture?.tagline, activeVenture?.location]);

  if (!activeVenture) return null;

  return (
    <div className="relative rounded-2xl overflow-hidden border border-[#E2DDD3] bg-[#F3EFE8]">
      {/* Top Minimal Spec Label */}
      <div className="px-5 py-3.5 bg-[#141E2B] text-[#FAF8F4] flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-[#B89452]">
            Interactive 3D Business Archway · Drag to Orbit
          </p>
          <h3 className="font-display text-lg font-bold">
            {activeVenture.name} — Entrance Monument
          </h3>
        </div>
        <button
          type="button"
          onClick={() => onLaunch360(activeVenture.id)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#4A6B53] hover:bg-[#3B5844] text-white text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
        >
          <Eye className="w-4 h-4" />
          <span>View 360°</span>
        </button>
      </div>

      {/* 3D WebGL Viewport */}
      <div className="relative w-full h-[360px] sm:h-[430px]">
        <div
          ref={mountRef}
          className="w-full h-full cursor-grab active:cursor-grabbing"
          aria-label={`Interactive 3D Business Arch for ${activeVenture.name}`}
        />

        {/* Collapsible Bottom Control Dock (Zero Viewport Occlusion) */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-[94%] max-w-[780px] flex flex-col items-center">
          <button
            type="button"
            onClick={() => setControlsCollapsed((prev) => !prev)}
            className="px-3 py-1 rounded-t-lg bg-[#141E2B] text-[#FAF8F4] text-[11px] font-medium border border-b-0 border-[#283548] cursor-pointer"
          >
            {controlsCollapsed ? '▴ Show Arch Controls' : '▾ Hide Arch Controls'}
          </button>

          {!controlsCollapsed && (
            <div className="w-full p-2 rounded-xl bg-[#141E2B]/95 border border-[#283548] flex flex-wrap items-center justify-between gap-2 shadow-lg">
              <div className="flex items-center gap-1.5 overflow-x-auto max-w-full">
                {ventures.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => onSelectVentureId(v.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                      v.id === activeVenture.id
                        ? 'bg-[#4A6B53] text-white'
                        : 'bg-[#1D2939] text-[#FAF8F4]/80 hover:bg-[#283548]'
                    }`}
                  >
                    {v.name}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => sceneHooksRef.current.resetCamera()}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#1D2939] hover:bg-[#283548] text-[#FAF8F4] text-xs font-medium cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
                <button
                  type="button"
                  onClick={() => onLaunch360(activeVenture.id)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#B89452] hover:bg-[#9E7B3B] text-[#141E2B] font-bold text-xs cursor-pointer"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Enter 360°</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

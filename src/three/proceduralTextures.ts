import * as THREE from 'three';

export type FacadeStyle = 'travertine' | 'sandstone' | 'terracotta' | 'limestone';
export type SurfaceKind =
  | 'oak'
  | 'marble'
  | 'terrazzo'
  | 'slate'
  | 'paving'
  | 'asphalt'
  | 'grass'
  | 'water'
  | 'rug';

function createCanvas(size = 512): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  return [canvas, ctx];
}

function finalizeTexture(
  canvas: HTMLCanvasElement,
  repeatX: number,
  repeatY: number,
  aniso: number,
  srgb = true,
): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  if (srgb) {
    tex.colorSpace = THREE.SRGBColorSpace;
  }
  tex.anisotropy = Math.min(8, Math.max(1, aniso));
  tex.needsUpdate = true;
  return tex;
}

export function createFacadeTexture(
  style: FacadeStyle,
  aniso = 4,
  repeatX = 4,
  repeatY = 4,
): THREE.CanvasTexture {
  const [canvas, ctx] = createCanvas(512);
  const palettes: Record<
    FacadeStyle,
    { base: string; alt: string; seam: string; grain: string }
  > = {
    travertine: {
      base: '#EAE3D5',
      alt: '#E3DAC8',
      seam: '#C9BEAB',
      grain: 'rgba(130, 115, 92, 0.08)',
    },
    sandstone: {
      base: '#DFC9AA',
      alt: '#D7BD9A',
      seam: '#B59B78',
      grain: 'rgba(120, 88, 52, 0.09)',
    },
    terracotta: {
      base: '#D9C2AC',
      alt: '#CEB299',
      seam: '#A48369',
      grain: 'rgba(130, 75, 48, 0.08)',
    },
    limestone: {
      base: '#E7E6E0',
      alt: '#DCDAD3',
      seam: '#B9B6AE',
      grain: 'rgba(80, 90, 100, 0.07)',
    },
  };
  const pal = palettes[style];
  ctx.fillStyle = pal.base;
  ctx.fillRect(0, 0, 512, 512);

  const cols = 4;
  const rows = 8;
  const cw = 512 / cols;
  const rh = 512 / rows;

  for (let r = 0; r < rows; r++) {
    const offset = r % 2 === 0 ? 0 : cw * 0.5;
    for (let c = -1; c <= cols; c++) {
      const x = c * cw + offset;
      const y = r * rh;
      ctx.fillStyle = (r + c) % 2 === 0 ? pal.base : pal.alt;
      ctx.fillRect(x + 1, y + 1, cw - 2, rh - 2);
      ctx.strokeStyle = pal.seam;
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, cw, rh);
    }
  }

  ctx.fillStyle = pal.grain;
  for (let i = 0; i < 650; i++) {
    const gx = (i * 73) % 512;
    const gy = (i * 139) % 512;
    ctx.fillRect(gx, gy, 10 + (i % 18), 1.5);
  }

  return finalizeTexture(canvas, repeatX, repeatY, aniso, true);
}

export function createSurfaceTexture(
  kind: SurfaceKind,
  aniso = 4,
  repeatX = 4,
  repeatY = 4,
): THREE.CanvasTexture {
  const [canvas, ctx] = createCanvas(512);

  if (kind === 'oak') {
    ctx.fillStyle = '#B88D5E';
    ctx.fillRect(0, 0, 512, 512);
    const plankW = 64;
    const plankH = 256;
    for (let x = 0; x < 512; x += plankW) {
      for (let y = 0; y < 512; y += plankH) {
        const shift = ((x / plankW) % 2) * 128;
        const py = (y + shift) % 512;
        const shade = ((x + y) / 64) % 3;
        ctx.fillStyle = shade === 0 ? '#BA8F61' : shade === 1 ? '#AE8254' : '#C3996B';
        ctx.fillRect(x + 1, py + 1, plankW - 2, plankH - 2);
        ctx.strokeStyle = 'rgba(72, 46, 22, 0.25)';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x, py, plankW, plankH);
        ctx.fillStyle = 'rgba(72, 46, 22, 0.08)';
        for (let g = 0; g < 18; g++) {
          ctx.fillRect(x + 6 + g * 3, py + 4, 1, plankH - 8);
        }
      }
    }
  } else if (kind === 'marble') {
    ctx.fillStyle = '#F2EFE8';
    ctx.fillRect(0, 0, 512, 512);
    const tile = 256;
    for (let x = 0; x < 512; x += tile) {
      for (let y = 0; y < 512; y += tile) {
        ctx.fillStyle = (x + y) % 512 === 0 ? '#F4F1EA' : '#ECE7DE';
        ctx.fillRect(x + 2, y + 2, tile - 4, tile - 4);
        ctx.strokeStyle = '#D5CEC2';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, tile, tile);
      }
    }
    ctx.strokeStyle = 'rgba(155, 145, 128, 0.22)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 14; i++) {
      ctx.beginPath();
      ctx.moveTo(0, i * 38);
      ctx.bezierCurveTo(160, i * 38 + 20, 340, i * 38 - 18, 512, i * 38 + 10);
      ctx.stroke();
    }
  } else if (kind === 'terrazzo') {
    ctx.fillStyle = '#EAE6DC';
    ctx.fillRect(0, 0, 512, 512);
    const speckles = ['#B89452', '#4A6B53', '#8E939A', '#D6CEC0', '#1D2939'];
    for (let i = 0; i < 480; i++) {
      ctx.fillStyle = speckles[i % speckles.length];
      const sx = (i * 97) % 506;
      const sy = (i * 193) % 506;
      const r = 2 + (i % 5);
      ctx.fillRect(sx, sy, r, r);
    }
    ctx.strokeStyle = '#CFC8BA';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, 256, 256);
    ctx.strokeRect(256, 256, 256, 256);
  } else if (kind === 'slate') {
    ctx.fillStyle = '#D4D6D2';
    ctx.fillRect(0, 0, 512, 512);
    const sz = 128;
    for (let x = 0; x < 512; x += sz) {
      for (let y = 0; y < 512; y += sz) {
        ctx.fillStyle = ((x + y) / sz) % 2 === 0 ? '#D8DAD6' : '#CED1CC';
        ctx.fillRect(x + 2, y + 2, sz - 4, sz - 4);
      }
    }
  } else if (kind === 'paving') {
    ctx.fillStyle = '#D9D2C5';
    ctx.fillRect(0, 0, 512, 512);
    const pw = 64;
    const ph = 32;
    for (let r = 0; r < 16; r++) {
      const off = (r % 2) * 32;
      for (let c = -1; c < 9; c++) {
        ctx.fillStyle = (r + c) % 3 === 0 ? '#DDD6CA' : (r + c) % 2 === 0 ? '#D2C9BA' : '#E3DDD2';
        ctx.fillRect(c * pw + off + 2, r * ph + 2, pw - 4, ph - 4);
      }
    }
  } else if (kind === 'asphalt') {
    ctx.fillStyle = '#333942';
    ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 1600; i++) {
      ctx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.14)';
      ctx.fillRect((i * 53) % 512, (i * 113) % 512, 2, 2);
    }
  } else if (kind === 'grass') {
    ctx.fillStyle = '#537657';
    ctx.fillRect(0, 0, 512, 512);
    const greens = ['#486A4D', '#5B805E', '#628A64', '#416146'];
    for (let i = 0; i < 1800; i++) {
      ctx.fillStyle = greens[i % greens.length];
      ctx.fillRect((i * 71) % 512, (i * 149) % 512, 3, 7);
    }
  } else if (kind === 'water') {
    ctx.fillStyle = '#3F929E';
    ctx.fillRect(0, 0, 512, 512);
    ctx.strokeStyle = 'rgba(220, 248, 255, 0.25)';
    ctx.lineWidth = 3;
    for (let y = 16; y < 512; y += 32) {
      ctx.beginPath();
      for (let x = 0; x <= 512; x += 32) {
        const wave = Math.sin((x / 512) * Math.PI * 4 + y) * 6;
        if (x === 0) ctx.moveTo(x, y + wave);
        else ctx.lineTo(x, y + wave);
      }
      ctx.stroke();
    }
  } else if (kind === 'rug') {
    ctx.fillStyle = '#E8E0D1';
    ctx.fillRect(0, 0, 512, 512);
    ctx.strokeStyle = '#B89452';
    ctx.lineWidth = 10;
    ctx.strokeRect(24, 24, 464, 464);
    ctx.strokeStyle = 'rgba(20, 30, 43, 0.14)';
    ctx.lineWidth = 2;
    for (let y = 56; y < 456; y += 22) {
      ctx.beginPath();
      ctx.moveTo(44, y);
      ctx.lineTo(468, y);
      ctx.stroke();
    }
  }

  return finalizeTexture(canvas, repeatX, repeatY, aniso, true);
}

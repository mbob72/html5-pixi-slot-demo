import { Texture } from 'pixi.js';
import type { SymbolId } from '../state/types';

interface SymbolPalette {
  label: string;
  fill: string;
  stroke: string;
  accent: string;
}

const PALETTE: Record<SymbolId, SymbolPalette> = {
  CHERRY: { label: 'CH', fill: '#c92947', stroke: '#ff8a9e', accent: '#ffd7dd' },
  LEMON: { label: 'LE', fill: '#e7c742', stroke: '#fff39a', accent: '#483b00' },
  BAR: { label: 'BAR', fill: '#252735', stroke: '#f4d483', accent: '#ffffff' },
  SEVEN: { label: '7', fill: '#b3172b', stroke: '#ffd260', accent: '#ffffff' },
  DIAMOND: { label: 'D', fill: '#24b7d8', stroke: '#a9f3ff', accent: '#06323b' },
  WILD: { label: 'W', fill: '#7b36df', stroke: '#ffd86b', accent: '#ffffff' },
};

export type SymbolTextureMap = Record<SymbolId, Texture>;

export function createSymbolTextures(size = 132): SymbolTextureMap {
  return Object.fromEntries(
    Object.entries(PALETTE).map(([id, palette]) => [
      id,
      Texture.from(createSymbolCanvas(size, palette)),
    ]),
  ) as SymbolTextureMap;
}

function createSymbolCanvas(size: number, palette: SymbolPalette): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const resolution = Math.ceil(window.devicePixelRatio || 1);
  canvas.width = size * resolution;
  canvas.height = size * resolution;
  canvas.style.width = `${size}px`;
  canvas.style.height = `${size}px`;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context is not available.');
  }

  ctx.scale(resolution, resolution);
  ctx.clearRect(0, 0, size, size);

  const center = size / 2;
  const radius = size * 0.38;
  const gradient = ctx.createRadialGradient(center * 0.8, center * 0.7, 8, center, center, radius);
  gradient.addColorStop(0, '#ffffff');
  gradient.addColorStop(0.18, palette.stroke);
  gradient.addColorStop(1, palette.fill);

  ctx.shadowColor = palette.stroke;
  ctx.shadowBlur = 18;
  ctx.fillStyle = gradient;
  roundedRect(ctx, 12, 12, size - 24, size - 24, 24);
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.lineWidth = 5;
  ctx.strokeStyle = palette.stroke;
  ctx.stroke();

  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  roundedRect(ctx, 25, 22, size - 50, size * 0.18, 14);
  ctx.fill();

  ctx.font = `900 ${palette.label.length > 1 ? 33 : 56}px Inter, Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineWidth = 5;
  ctx.strokeStyle = 'rgba(0,0,0,0.45)';
  ctx.fillStyle = palette.accent;
  ctx.strokeText(palette.label, center, center + 4);
  ctx.fillText(palette.label, center, center + 4);

  return canvas;
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): void {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

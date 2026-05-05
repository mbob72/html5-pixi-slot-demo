import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import gifenc from 'gifenc';

const { GIFEncoder, applyPalette, quantize } = gifenc;

const WIDTH = 720;
const HEIGHT = 420;
const FRAMES = 54;
const DELAY_MS = 70;
const OUTPUT = resolve('public/preview.gif');

const colors = {
  bg: [8, 9, 15, 255],
  panel: [14, 16, 26, 255],
  machine: [18, 22, 36, 255],
  reel: [7, 9, 16, 255],
  gold: [255, 212, 101, 255],
  goldDim: [111, 90, 43, 255],
  text: [255, 241, 197, 255],
  muted: [154, 157, 178, 255],
  red: [190, 38, 63, 255],
  cherry: [211, 42, 75, 255],
  lemon: [228, 202, 65, 255],
  bar: [45, 48, 66, 255],
  seven: [184, 22, 45, 255],
  diamond: [37, 183, 216, 255],
  wild: [123, 54, 223, 255],
  white: [255, 255, 255, 255],
};

const symbolStrip = [
  { label: 'CH', color: colors.cherry },
  { label: 'LE', color: colors.lemon },
  { label: 'BAR', color: colors.bar },
  { label: '7', color: colors.seven },
  { label: 'D', color: colors.diamond },
  { label: 'W', color: colors.wild },
];

const finalSymbols = [
  ['CH', 'D', 'LE'],
  ['BAR', 'D', '7'],
  ['W', 'D', 'CH'],
  ['LE', 'D', 'BAR'],
  ['7', 'D', 'W'],
];

async function createPreviewGif() {
  const gif = GIFEncoder();

  for (let frame = 0; frame < FRAMES; frame += 1) {
    const image = createImage(WIDTH, HEIGHT, colors.bg);
    drawScene(image, frame);
    const palette = quantize(image.data, 96, { format: 'rgb444' });
    const index = applyPalette(image.data, palette, 'rgb444');
    gif.writeFrame(index, WIDTH, HEIGHT, {
      palette,
      delay: DELAY_MS,
      repeat: 0,
    });
  }

  gif.finish();
  await mkdir(dirname(OUTPUT), { recursive: true });
  await writeFile(OUTPUT, gif.bytes());
}

function drawScene(image, frame) {
  fillRect(image, 0, 0, WIDTH, HEIGHT, colors.bg);
  fillRect(image, 0, 0, WIDTH, HEIGHT, [10, 12, 23, 255]);
  fillRect(image, 34, 24, WIDTH - 68, HEIGHT - 48, colors.panel);
  strokeRect(image, 34, 24, WIDTH - 68, HEIGHT - 48, colors.goldDim, 2);

  drawText(image, 'PIXI SLOT DEMO', 214, 48, 4, colors.gold);
  fillRect(image, 72, 100, 576, 236, colors.machine);
  strokeRect(image, 72, 100, 576, 236, colors.gold, 3);

  const spinFrame = Math.min(frame, 38);
  const winPhase = Math.max(0, frame - 40);
  const paylinePulse = frame < 39 ? 0.35 + Math.sin(frame * 0.55) * 0.22 : 0.28;
  fillRect(image, 92, 214, 536, 4, [...colors.gold.slice(0, 3), Math.round(255 * paylinePulse)]);

  for (let reel = 0; reel < 5; reel += 1) {
    const x = 104 + reel * 104;
    fillRect(image, x, 118, 88, 190, colors.reel);
    strokeRect(image, x, 118, 88, 190, [45, 52, 73, 255], 2);

    const stopFrame = 19 + reel * 5;
    const spinning = frame < stopFrame;
    const settle = Math.max(0, Math.min(1, (frame - stopFrame) / 5));
    const bounce = spinning ? 0 : Math.sin(settle * Math.PI) * (1 - settle) * 12;
    const offset = spinning ? (spinFrame * (18 + reel * 3)) % 76 : 0;
    const squash = spinning ? 1.05 : 1 - bounce * 0.002;

    if (spinning) {
      fillRect(image, x + 16, 126, 56, 154, [255, 214, 105, 32]);
      fillRect(image, x + 24, 150, 40, 96, [255, 255, 255, 24]);
    }

    for (let row = -1; row < 4; row += 1) {
      const y = 128 + row * 62 + offset + bounce;
      if (y < 90 || y > 304) {
        continue;
      }

      const symbol = spinning
        ? symbolStrip[(row + reel + Math.floor(frame / 2)) % symbolStrip.length]
        : symbolByLabel(finalSymbols[reel][Math.max(0, Math.min(2, row))]);
      const winning = !spinning && row === 1 && winPhase > 0;
      drawSymbol(image, symbol, x + 14, y, 60, squash, winning, winPhase);
    }
  }

  drawHud(image, frame, winPhase);
}

function drawHud(image, frame, winPhase) {
  drawPanel(image, 72, 352, 128, 'BALANCE', frame < 8 ? '1000' : winPhase > 0 ? '1020' : '980');
  drawPanel(image, 216, 352, 92, 'BET', '20');
  drawPanel(image, 324, 352, 128, 'LAST WIN', winPhase > 0 ? '40' : '0');

  const spinColor = frame < 40 ? [130, 24, 44, 255] : colors.red;
  fillRect(image, 534, 352, 116, 46, spinColor);
  strokeRect(image, 534, 352, 116, 46, colors.gold, 2);
  drawText(image, 'SPIN', 559, 368, 3, colors.white);

  if (winPhase > 0) {
    const pulse = 1 + Math.sin(winPhase * 0.8) * 0.1;
    fillRect(image, 248, 76, 224, 44, colors.red);
    strokeRect(image, 248, 76, 224, 44, colors.gold, 3);
    drawText(image, 'WIN 40', Math.round(286 - pulse * 2), 91, 4, colors.text);
  }
}

function drawPanel(image, x, y, width, label, value) {
  fillRect(image, x, y, width, 46, [16, 19, 30, 255]);
  strokeRect(image, x, y, width, 46, colors.goldDim, 1);
  drawText(image, label, x + 10, y + 8, 1, colors.muted);
  drawText(image, value, x + 10, y + 24, 2, colors.text);
}

function drawSymbol(image, symbol, x, y, size, squash, winning, winPhase) {
  const glow = winning ? Math.round(65 + Math.sin(winPhase * 0.8) * 42) : 0;
  if (winning) {
    fillRect(image, x - 4, y - 4, size + 8, size + 8, [255, 216, 105, glow]);
  }

  const height = Math.round(size * squash);
  fillRect(image, x, y + Math.round((size - height) / 2), size, height, symbol.color);
  strokeRect(image, x, y + Math.round((size - height) / 2), size, height, colors.gold, 2);
  fillRect(image, x + 9, y + 8, size - 18, 8, [255, 255, 255, 52]);

  const scale = symbol.label.length === 3 ? 2 : 3;
  const textWidth = textPixelWidth(symbol.label, scale);
  drawText(
    image,
    symbol.label,
    x + Math.round((size - textWidth) / 2),
    y + 23,
    scale,
    colors.white,
  );
}

function symbolByLabel(label) {
  return symbolStrip.find((symbol) => symbol.label === label) ?? symbolStrip[0];
}

function createImage(width, height, color) {
  const data = new Uint8Array(width * height * 4);
  const image = { width, height, data };
  fillRect(image, 0, 0, width, height, color);
  return image;
}

function fillRect(image, x, y, width, height, color) {
  const x0 = Math.max(0, Math.round(x));
  const y0 = Math.max(0, Math.round(y));
  const x1 = Math.min(image.width, Math.round(x + width));
  const y1 = Math.min(image.height, Math.round(y + height));
  const alpha = color[3] / 255;

  for (let py = y0; py < y1; py += 1) {
    for (let px = x0; px < x1; px += 1) {
      const index = (py * image.width + px) * 4;
      image.data[index] = Math.round(color[0] * alpha + image.data[index] * (1 - alpha));
      image.data[index + 1] = Math.round(color[1] * alpha + image.data[index + 1] * (1 - alpha));
      image.data[index + 2] = Math.round(color[2] * alpha + image.data[index + 2] * (1 - alpha));
      image.data[index + 3] = 255;
    }
  }
}

function strokeRect(image, x, y, width, height, color, lineWidth) {
  fillRect(image, x, y, width, lineWidth, color);
  fillRect(image, x, y + height - lineWidth, width, lineWidth, color);
  fillRect(image, x, y, lineWidth, height, color);
  fillRect(image, x + width - lineWidth, y, lineWidth, height, color);
}

function drawText(image, text, x, y, scale, color) {
  let cursor = x;
  for (const char of text) {
    if (char === ' ') {
      cursor += 4 * scale;
      continue;
    }

    const glyph = FONT[char] ?? FONT['?'];
    glyph.forEach((row, rowIndex) => {
      [...row].forEach((pixel, columnIndex) => {
        if (pixel === '1') {
          fillRect(image, cursor + columnIndex * scale, y + rowIndex * scale, scale, scale, color);
        }
      });
    });
    cursor += (glyph[0].length + 1) * scale;
  }
}

function textPixelWidth(text, scale) {
  return [...text].reduce((width, char) => {
    if (char === ' ') {
      return width + 4 * scale;
    }
    return width + ((FONT[char] ?? FONT['?'])[0].length + 1) * scale;
  }, 0);
}

const FONT = {
  '?': ['111', '001', '011', '010', '000', '010', '000'],
  0: ['111', '101', '101', '101', '101', '101', '111'],
  1: ['010', '110', '010', '010', '010', '010', '111'],
  2: ['111', '001', '001', '111', '100', '100', '111'],
  3: ['111', '001', '001', '111', '001', '001', '111'],
  4: ['101', '101', '101', '111', '001', '001', '001'],
  5: ['111', '100', '100', '111', '001', '001', '111'],
  6: ['111', '100', '100', '111', '101', '101', '111'],
  7: ['111', '001', '001', '010', '010', '010', '010'],
  8: ['111', '101', '101', '111', '101', '101', '111'],
  9: ['111', '101', '101', '111', '001', '001', '111'],
  A: ['01110', '10001', '10001', '11111', '10001', '10001', '10001'],
  B: ['11110', '10001', '10001', '11110', '10001', '10001', '11110'],
  C: ['01111', '10000', '10000', '10000', '10000', '10000', '01111'],
  D: ['11110', '10001', '10001', '10001', '10001', '10001', '11110'],
  E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
  H: ['10001', '10001', '10001', '11111', '10001', '10001', '10001'],
  I: ['111', '010', '010', '010', '010', '010', '111'],
  L: ['10000', '10000', '10000', '10000', '10000', '10000', '11111'],
  M: ['10001', '11011', '10101', '10101', '10001', '10001', '10001'],
  N: ['10001', '11001', '10101', '10011', '10001', '10001', '10001'],
  O: ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
  P: ['11110', '10001', '10001', '11110', '10000', '10000', '10000'],
  S: ['01111', '10000', '10000', '01110', '00001', '00001', '11110'],
  T: ['11111', '00100', '00100', '00100', '00100', '00100', '00100'],
  W: ['10001', '10001', '10001', '10101', '10101', '11011', '10001'],
  X: ['10001', '10001', '01010', '00100', '01010', '10001', '10001'],
};

await createPreviewGif();

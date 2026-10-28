/**
 * CooLink Icon Generator
 * Generates all required PWA icons using Node.js canvas (no external deps needed beyond @napi-rs/canvas which we avoid)
 * Instead: generates valid minimal PNG files using pure Node.js Buffer (no deps)
 * 
 * Run: node generate-icons.js
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function createPng(width, height, pixelFn) {
  const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  function crc32(buf) {
    const table = (() => {
      const t = new Uint32Array(256);
      for (let i = 0; i < 256; i++) {
        let c = i;
        for (let j = 0; j < 8; j++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
        t[i] = c;
      }
      return t;
    })();
    let crc = 0xFFFFFFFF;
    for (const byte of buf) crc = table[(crc ^ byte) & 0xFF] ^ (crc >>> 8);
    return (~crc) >>> 0;
  }

  function chunk(type, data) {
    const typeBuf = Buffer.from(type, 'ascii');
    const lenBuf = Buffer.allocUnsafe(4);
    lenBuf.writeUInt32BE(data.length, 0);
    const crcBuf = Buffer.allocUnsafe(4);
    const crcData = Buffer.concat([typeBuf, data]);
    crcBuf.writeUInt32BE(crc32(crcData), 0);
    return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
  }

  // IHDR
  const ihdr = Buffer.allocUnsafe(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type: RGB
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

  // Build raw scanlines
  const rows = [];
  for (let y = 0; y < height; y++) {
    const row = Buffer.allocUnsafe(1 + width * 3);
    row[0] = 0; // filter none
    for (let x = 0; x < width; x++) {
      const [r, g, b] = pixelFn(x, y, width, height);
      row[1 + x * 3] = r;
      row[2 + x * 3] = g;
      row[3 + x * 3] = b;
    }
    rows.push(row);
  }

  const rawData = Buffer.concat(rows);
  const compressedData = zlib.deflateSync(rawData, { level: 9 });

  const idat = chunk('IDAT', compressedData);
  const iend = chunk('IEND', Buffer.alloc(0));

  return Buffer.concat([PNG_SIGNATURE, chunk('IHDR', ihdr), idat, iend]);
}

// CooLink icon pixel function: blue gradient background with white hard-hat silhouette
function coolinkPixel(x, y, w, h) {
  const cx = w / 2, cy = h / 2;
  const r = Math.min(w, h) * 0.5;

  // Padding circle
  const dx = x - cx, dy = y - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Background: blue gradient
  const t = y / h;
  const bgR = Math.round(37 + (29 - 37) * t);
  const bgG = Math.round(99 + (78 - 99) * t);
  const bgB = Math.round(235 + (216 - 235) * t);

  if (dist > r * 0.92) return [bgR, bgG, bgB]; // outside icon circle — solid bg

  // White background inner circle
  const nx = (x - cx) / r;
  const ny = (y - cy) / r;

  // Hard hat shape — simple geometric representation
  // Brim: ellipse at bottom portion
  const hatCy = cy - h * 0.04;
  const hatScale = 0.6;

  // Dome: upper half circle
  const domeDx = (x - cx) / (r * hatScale);
  const domeDy = (y - (hatCy - r * 0.05)) / (r * hatScale * 0.65);
  const inDome = (domeDx * domeDx + domeDy * domeDy < 1) && y < hatCy;

  // Brim: flat rectangle
  const brimY = hatCy;
  const brimHalf = r * 0.72;
  const brimHeight = r * 0.12;
  const inBrim = Math.abs(x - cx) < brimHalf && Math.abs(y - brimY) < brimHeight;

  // Inner brim cutout top
  const innerCutDx = (x - cx) / (r * hatScale * 0.98);
  const innerCutDy = (y - (hatCy + r * 0.01)) / (r * hatScale * 0.28);
  const inInnerCut = (innerCutDx * innerCutDx + innerCutDy * innerCutDy < 1) && y > hatCy - r * 0.1;

  if ((inDome || inBrim) && !inInnerCut) {
    return [255, 255, 255]; // white hat
  }

  return [bgR, bgG, bgB]; // blue background
}

// Maskable version has more padding (safe zone)
function coolinkMaskablePixel(x, y, w, h) {
  const safeX = x * 0.7 + w * 0.15;
  const safeY = y * 0.7 + h * 0.15;
  return coolinkPixel(safeX, safeY, w, h);
}

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconDir = path.join(__dirname, 'public', 'icons');
if (!fs.existsSync(iconDir)) fs.mkdirSync(iconDir, { recursive: true });

console.log('🎨 Generating CooLink PWA icons...');

for (const size of sizes) {
  const buf = createPng(size, size, coolinkPixel);
  fs.writeFileSync(path.join(iconDir, `icon-${size}.png`), buf);
  console.log(`  ✓ icon-${size}.png (${buf.length} bytes)`);
}

// Maskable icons
for (const size of [192, 512]) {
  const buf = createPng(size, size, coolinkMaskablePixel);
  fs.writeFileSync(path.join(iconDir, `icon-maskable-${size}.png`), buf);
  console.log(`  ✓ icon-maskable-${size}.png (${buf.length} bytes)`);
}

// Apple splash/touch icon (same as 512 maskable)
const appleTouchBuf = createPng(180, 180, coolinkPixel);
fs.writeFileSync(path.join(iconDir, 'apple-touch-icon.png'), appleTouchBuf);
console.log('  ✓ apple-touch-icon.png (180x180)');

console.log('\n✅ All PWA icons generated successfully!');

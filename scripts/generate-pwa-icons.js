const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

// Helper to create a valid PNG file without external dependencies
function createPng(width, height, drawFn) {
  // 1. Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // 2. IHDR Chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // bit depth 8
  ihdr.writeUInt8(6, 9); // color type 6 (RGBA)
  ihdr.writeUInt8(0, 10); // compression method 0
  ihdr.writeUInt8(0, 11); // filter method 0
  ihdr.writeUInt8(0, 12); // interlace method 0

  const ihdrChunk = makeChunk("IHDR", ihdr);

  // 3. IDAT Chunk (raw RGBA raster with filter byte 0 per line)
  const rawBytes = Buffer.alloc(height * (width * 4 + 1));
  let offset = 0;

  for (let y = 0; y < height; y++) {
    rawBytes[offset++] = 0; // Filter: None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = drawFn(x, y, width, height);
      rawBytes[offset++] = r;
      rawBytes[offset++] = g;
      rawBytes[offset++] = b;
      rawBytes[offset++] = a;
    }
  }

  const compressed = zlib.deflateSync(rawBytes);
  const idatChunk = makeChunk("IDAT", compressed);

  // 4. IEND Chunk
  const iendChunk = makeChunk("IEND", Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(4 + 4 + len + 4);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4);
  data.copy(chunk, 8);

  const crc = crc32(Buffer.concat([Buffer.from(type), data]));
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

// Standard IEEE 802.3 CRC32
function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    const byte = buf[i];
    crc ^= byte;
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

// Visual drawing function: Comiks X Dark theme (#0a0a0a) + Brand Green badge (#34d399) + "CX" Mark
function drawCxIcon(x, y, w, h, isMaskable = false) {
  const margin = isMaskable ? Math.round(w * 0.1) : Math.round(w * 0.05);
  const radius = Math.round(w * 0.2);

  // Background
  const inBadge =
    x >= margin &&
    x < w - margin &&
    y >= margin &&
    y < h - margin;

  if (!inBadge) {
    return isMaskable ? [10, 10, 10, 255] : [0, 0, 0, 0];
  }

  // Rounded rectangle check
  const rx = x < margin + radius ? margin + radius - x : (x > w - margin - radius ? x - (w - margin - radius) : 0);
  const ry = y < margin + radius ? margin + radius - y : (y > h - margin - radius ? y - (h - margin - radius) : 0);
  if (rx > 0 && ry > 0 && rx * rx + ry * ry > radius * radius) {
    return isMaskable ? [10, 10, 10, 255] : [0, 0, 0, 0];
  }

  // Brand Green badge base: #34d399 (rgb: 52, 211, 153) or #10b981 (rgb: 16, 185, 129)
  // Simple geometric stylized "CX" representation
  const cx = w / 2;
  const cy = h / 2;
  const dx = x - cx;
  const dy = y - cy;

  // Render stylized 'C' on left, 'X' on right
  const scale = w / 192;
  const leftC = dx >= -50 * scale && dx <= -10 * scale && dy >= -45 * scale && dy <= 45 * scale;
  const leftCHole = dx >= -35 * scale && dx <= 0 && dy >= -25 * scale && dy <= 25 * scale;
  const isC = leftC && (!leftCHole || dx <= -35 * scale);

  const rightX1 = Math.abs((dx - 30 * scale) - dy) < 8 * scale && dx >= 8 * scale && dx <= 52 * scale && Math.abs(dy) <= 45 * scale;
  const rightX2 = Math.abs((dx - 30 * scale) + dy) < 8 * scale && dx >= 8 * scale && dx <= 52 * scale && Math.abs(dy) <= 45 * scale;
  const isX = rightX1 || rightX2;

  if (isC || isX) {
    // Bold dark text/mark on green badge: #09090b
    return [9, 9, 11, 255];
  }

  // Gradient green badge fill
  const grad = Math.min(255, Math.max(0, Math.round(153 + (y / h) * 40)));
  return [52, 211, grad, 255];
}

const outDir = path.join(__dirname, "..", "public", "icons");
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

console.log("Generating PWA Icons in public/icons/...");

// 1. icon-192x192.png
const p192 = createPng(192, 192, (x, y, w, h) => drawCxIcon(x, y, w, h, false));
fs.writeFileSync(path.join(outDir, "icon-192x192.png"), p192);

// 2. icon-512x512.png
const p512 = createPng(512, 512, (x, y, w, h) => drawCxIcon(x, y, w, h, false));
fs.writeFileSync(path.join(outDir, "icon-512x512.png"), p512);

// 3. icon-maskable-512x512.png
const pMask512 = createPng(512, 512, (x, y, w, h) => drawCxIcon(x, y, w, h, true));
fs.writeFileSync(path.join(outDir, "icon-maskable-512x512.png"), pMask512);

// 4. apple-touch-icon.png (180x180)
const pApple = createPng(180, 180, (x, y, w, h) => drawCxIcon(x, y, w, h, true));
fs.writeFileSync(path.join(outDir, "apple-touch-icon.png"), pApple);

// 5. SVG icon
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" rx="100" fill="#34d399"/>
  <text x="50%" y="54%" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="220" fill="#09090b" text-anchor="middle" dominant-baseline="middle">CX</text>
</svg>`;
fs.writeFileSync(path.join(outDir, "icon.svg"), svg, "utf8");

console.log("✅ Successfully generated all PWA icons!");

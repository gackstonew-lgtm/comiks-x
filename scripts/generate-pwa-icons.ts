import fs from "fs";
import path from "path";
import zlib from "zlib";

// PNG Chunk builder using pure Node.js builtins (zlib)
function createChunk(type: string, data: Buffer): Buffer {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(zlib.crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}

function encodePng(width: number, height: number, rgbaBuffer: Buffer): Buffer {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk: 13 bytes
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8 bits per channel
  ihdr[9] = 6; // color type 6: RGBA
  ihdr[10] = 0; // default compression
  ihdr[11] = 0; // default filter
  ihdr[12] = 0; // non-interlaced

  // Build raw scanlines: each line starts with filter byte 0x00
  const scanlineLength = 1 + width * 4;
  const rawData = Buffer.alloc(height * scanlineLength);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * scanlineLength;
    rawData[rowOffset] = 0; // Filter 0 (None)
    rgbaBuffer.copy(rawData, rowOffset + 1, y * width * 4, (y + 1) * width * 4);
  }

  const idatData = zlib.deflateSync(rawData, { level: 9 });

  return Buffer.concat([
    sig,
    createChunk("IHDR", ihdr),
    createChunk("IDAT", idatData),
    createChunk("IEND", Buffer.alloc(0)),
  ]);
}

interface DrawOptions {
  width: number;
  height: number;
  isMaskable?: boolean;
  cornerRadius?: number;
}

function renderComiksXIcon({ width, height, isMaskable = false, cornerRadius = 0 }: DrawOptions): Buffer {
  const buf = Buffer.alloc(width * height * 4);

  // Colors
  const bgR = 52, bgG = 211, bgB = 153; // Emerald #34d399
  const darkR = 9, darkG = 9, darkB = 11; // Studio dark #09090b

  const cx = width / 2;
  const cy = height / 2;
  const r = cornerRadius;

  // Maskable icons require full background bleed with no clipped corners
  const effectiveRadius = isMaskable ? 0 : r;

  // Scale factor relative to 512 base
  const scale = width / 512;
  // If maskable, safe zone is inner 80%, so scale inner content by 0.72
  const glyphScale = (isMaskable ? 0.70 : 0.88) * scale;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;

      // Check rounded corner bounding box
      let insideBg = true;
      if (effectiveRadius > 0) {
        let dx = 0;
        let dy = 0;
        if (x < effectiveRadius) dx = effectiveRadius - x;
        else if (x > width - effectiveRadius) dx = x - (width - effectiveRadius);

        if (y < effectiveRadius) dy = effectiveRadius - y;
        else if (y > height - effectiveRadius) dy = y - (height - effectiveRadius);

        if (dx > 0 && dy > 0) {
          insideBg = (dx * dx + dy * dy) <= (effectiveRadius * effectiveRadius);
        }
      }

      if (!insideBg) {
        // Transparent outside rounded corners
        buf[idx] = 0;
        buf[idx + 1] = 0;
        buf[idx + 2] = 0;
        buf[idx + 3] = 0;
        continue;
      }

      // Default background color (emerald #34d399)
      buf[idx] = bgR;
      buf[idx + 1] = bgG;
      buf[idx + 2] = bgB;
      buf[idx + 3] = 255;

      // Coordinate relative to center in normalized glyph coordinates [-200, 200]
      const nx = (x - cx) / glyphScale;
      const ny = (y - cy) / glyphScale;

      // 1. Draw "C" glyph centered around nx = -85
      const cCenterX = -85;
      const cCenterY = 0;
      const cDist = Math.hypot(nx - cCenterX, ny - cCenterY);
      const outerR = 95;
      const innerR = 48;
      const inRing = cDist >= innerR && cDist <= outerR;
      const inRightCutout = (nx - cCenterX) > 10 && Math.abs(ny - cCenterY) < 42;

      let inC = inRing && !inRightCutout;

      // 2. Draw "X" glyph centered around nx = 90
      const xCenterX = 90;
      const xCenterY = 0;
      const lx = nx - xCenterX;
      const ly = ny - xCenterY;
      const strokeW = 46;

      // Main diagonal: |lx - ly| <= strokeW/sqrt(2)
      // Other diagonal: |lx + ly| <= strokeW/sqrt(2)
      const bound = 92;
      const inBox = Math.abs(lx) <= bound && Math.abs(ly) <= bound;
      const diag1 = Math.abs(lx - ly) <= 32;
      const diag2 = Math.abs(lx + ly) <= 32;
      const inX = inBox && (diag1 || diag2);

      if (inC || inX) {
        buf[idx] = darkR;
        buf[idx + 1] = darkG;
        buf[idx + 2] = darkB;
        buf[idx + 3] = 255;
      }
    }
  }

  return encodePng(width, height, buf);
}

// Generate Screenshot Mockup (dark studio UI canvas)
function renderStudioScreenshot(width: number, height: number, isMobile: boolean): Buffer {
  const buf = Buffer.alloc(width * height * 4);

  // Fill dark background #09090b
  for (let i = 0; i < width * height; i++) {
    buf[i * 4] = 9;
    buf[i * 4 + 1] = 9;
    buf[i * 4 + 2] = 11;
    buf[i * 4 + 3] = 255;
  }

  // Draw Top Bar (#121215)
  const topBarH = isMobile ? 56 : 64;
  for (let y = 0; y < topBarH; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      buf[idx] = 18;
      buf[idx + 1] = 18;
      buf[idx + 2] = 21;
    }
  }

  // Draw Emerald accent line
  for (let x = 0; x < Math.min(width, isMobile ? 120 : 260); x++) {
    const y = topBarH - 2;
    const idx = (y * width + x) * 4;
    buf[idx] = 52;
    buf[idx + 1] = 211;
    buf[idx + 2] = 153;
  }

  // Draw Side Panel on Desktop
  if (!isMobile) {
    const sideW = 240;
    for (let y = topBarH; y < height; y++) {
      for (let x = 0; x < sideW; x++) {
        const idx = (y * width + x) * 4;
        buf[idx] = 14;
        buf[idx + 1] = 14;
        buf[idx + 2] = 17;
      }
    }
  }

  // Draw Central Studio Canvas Card (#18181b with emerald border)
  const padX = isMobile ? 24 : 280;
  const padY = isMobile ? topBarH + 24 : topBarH + 32;
  const cardW = width - padX - (isMobile ? 24 : 40);
  const cardH = height - padY - (isMobile ? 80 : 48);

  for (let y = padY; y < padY + cardH; y++) {
    for (let x = padX; x < padX + cardW; x++) {
      const idx = (y * width + x) * 4;
      // Border or fill
      const isBorder = (x === padX || x === padX + cardW - 1 || y === padY || y === padY + cardH - 1);
      if (isBorder) {
        buf[idx] = 39;
        buf[idx + 1] = 39;
        buf[idx + 2] = 42;
      } else {
        buf[idx] = 24;
        buf[idx + 1] = 24;
        buf[idx + 2] = 27;
      }
    }
  }

  return encodePng(width, height, buf);
}

async function main() {
  const iconsDir = path.join(process.cwd(), "public", "icons");
  const screenshotsDir = path.join(process.cwd(), "public", "screenshots");

  fs.mkdirSync(iconsDir, { recursive: true });
  fs.mkdirSync(screenshotsDir, { recursive: true });

  console.log("🎨 Generating PWA Icons for Comiks X...");

  // 1. 192x192 PNG (standard)
  const icon192 = renderComiksXIcon({ width: 192, height: 192, cornerRadius: 36 });
  fs.writeFileSync(path.join(iconsDir, "icon-192x192.png"), icon192);
  console.log("✅ Generated public/icons/icon-192x192.png (192x192)");

  // 2. 512x512 PNG (standard)
  const icon512 = renderComiksXIcon({ width: 512, height: 512, cornerRadius: 96 });
  fs.writeFileSync(path.join(iconsDir, "icon-512x512.png"), icon512);
  console.log("✅ Generated public/icons/icon-512x512.png (512x512)");

  // 3. 512x512 PNG (maskable with full bleed safe-zone padding)
  const iconMaskable = renderComiksXIcon({ width: 512, height: 512, isMaskable: true });
  fs.writeFileSync(path.join(iconsDir, "icon-maskable-512x512.png"), iconMaskable);
  console.log("✅ Generated public/icons/icon-maskable-512x512.png (512x512 maskable)");

  // 4. Apple Touch Icon 180x180 (no corner radius, solid background per Apple guidelines)
  const appleTouch = renderComiksXIcon({ width: 180, height: 180, cornerRadius: 0 });
  fs.writeFileSync(path.join(iconsDir, "apple-touch-icon.png"), appleTouch);
  console.log("✅ Generated public/icons/apple-touch-icon.png (180x180)");

  // 5. Shortcut Icon 96x96
  const shortcutIcon = renderComiksXIcon({ width: 96, height: 96, cornerRadius: 20 });
  fs.writeFileSync(path.join(iconsDir, "shortcut-96x96.png"), shortcutIcon);
  console.log("✅ Generated public/icons/shortcut-96x96.png (96x96)");

  // 6. Favicon 32x32
  const favicon = renderComiksXIcon({ width: 32, height: 32, cornerRadius: 6 });
  fs.writeFileSync(path.join(process.cwd(), "public", "favicon.ico"), favicon);
  console.log("✅ Generated public/favicon.ico (32x32)");

  // 7. Screenshots for rich install modal
  console.log("📸 Generating rich PWA install screenshots...");
  const screenWide = renderStudioScreenshot(1280, 720, false);
  fs.writeFileSync(path.join(screenshotsDir, "screenshot-wide.png"), screenWide);
  console.log("✅ Generated public/screenshots/screenshot-wide.png (1280x720)");

  const screenNarrow = renderStudioScreenshot(540, 960, true);
  fs.writeFileSync(path.join(screenshotsDir, "screenshot-narrow.png"), screenNarrow);
  console.log("✅ Generated public/screenshots/screenshot-narrow.png (540x960)");

  console.log("🎉 All PWA assets successfully generated!");
}

main().catch((err) => {
  console.error("Error generating icons:", err);
  process.exit(1);
});

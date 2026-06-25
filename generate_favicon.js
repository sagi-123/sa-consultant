/**
 * generate_favicon.js
 * Generates a valid .ico file (multi-size: 16x16, 32x32, 48x48)
 * from a source PNG using Node.js built-in modules + Jimp (auto-installed).
 * 
 * Usage: node generate_favicon.js
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Auto-install jimp if not present
try {
  require.resolve('jimp');
} catch (_) {
  console.log('Installing jimp temporarily...');
  execSync('npm install jimp --no-save', { stdio: 'inherit', cwd: __dirname });
}

const Jimp = require('jimp');

const SRC_PNG  = path.join(__dirname, 'C:\\Users\\shame\\.gemini\\antigravity\\brain\\86950e86-a949-4a9e-8f6c-c59d3972c837\\favicon_square_1782243950753.png');
const OUT_ICO  = path.join(__dirname, 'public', 'favicon.ico');
const OUT_PNG  = path.join(__dirname, 'public', 'favicon.png');

const SIZES = [16, 32, 48, 64];

async function pngToIco(pngPath, icoPath, sizes) {
  const images = [];

  for (const size of sizes) {
    const img = await Jimp.read(pngPath);
    img.resize(size, size);
    const pngBuf = await img.getBufferAsync(Jimp.MIME_PNG);
    images.push({ size, buf: pngBuf });
  }

  // Build ICO binary
  // ICO format: header (6 bytes) + directory entries (16 bytes each) + image data
  const count = images.length;
  const headerSize = 6;
  const dirEntrySize = 16;
  const dirSize = dirEntrySize * count;
  const dataOffset = headerSize + dirSize;

  // Calculate total size
  let totalDataSize = 0;
  for (const img of images) totalDataSize += img.buf.length;

  const ico = Buffer.alloc(dataOffset + totalDataSize);

  // ICO Header
  ico.writeUInt16LE(0, 0);       // Reserved (must be 0)
  ico.writeUInt16LE(1, 2);       // Type: 1 = ICO
  ico.writeUInt16LE(count, 4);   // Number of images

  let imgOffset = dataOffset;

  for (let i = 0; i < images.length; i++) {
    const { size, buf } = images[i];
    const dirOffset = headerSize + i * dirEntrySize;

    // Directory entry
    ico.writeUInt8(size >= 256 ? 0 : size, dirOffset);      // Width (0 = 256)
    ico.writeUInt8(size >= 256 ? 0 : size, dirOffset + 1);  // Height (0 = 256)
    ico.writeUInt8(0, dirOffset + 2);                        // Color palette (0 = no palette)
    ico.writeUInt8(0, dirOffset + 3);                        // Reserved
    ico.writeUInt16LE(1, dirOffset + 4);                     // Color planes
    ico.writeUInt16LE(32, dirOffset + 6);                    // Bits per pixel
    ico.writeUInt32LE(buf.length, dirOffset + 8);            // Size of image data
    ico.writeUInt32LE(imgOffset, dirOffset + 12);            // Offset of image data

    // Copy image data
    buf.copy(ico, imgOffset);
    imgOffset += buf.length;
  }

  fs.writeFileSync(icoPath, ico);
  console.log(`✅ ICO written: ${icoPath} (${(ico.length / 1024).toFixed(1)} KB, ${count} sizes: ${sizes.join(', ')})`);
}

async function main() {
  // Also save a crisp 64x64 PNG for the <link rel="icon"> tag
  const img = await Jimp.read(SRC_PNG);
  img.resize(64, 64);
  await img.writeAsync(OUT_PNG);
  console.log(`✅ favicon.png written: ${OUT_PNG} (64x64)`);

  await pngToIco(SRC_PNG, OUT_ICO, SIZES);
  console.log('\n🎉 Done! Both favicon.ico and favicon.png have been updated.');
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});

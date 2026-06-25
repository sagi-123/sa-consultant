/**
 * generate_favicon.cjs
 * Generates a valid multi-size .ico file from a PNG source.
 * Uses jimp (auto-installed) for image resizing.
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const SRC_PNG = 'C:\\Users\\shame\\.gemini\\antigravity\\brain\\86950e86-a949-4a9e-8f6c-c59d3972c837\\favicon_square_1782243950753.png';
const OUT_ICO = path.join(__dirname, 'public', 'favicon.ico');
const OUT_PNG = path.join(__dirname, 'public', 'favicon.png');

const SIZES = [16, 32, 48, 64];

// Auto-install jimp if not present
try {
  require.resolve('jimp');
  console.log('jimp already installed.');
} catch (_) {
  console.log('Installing jimp temporarily...');
  execSync('npm install jimp --no-save', { stdio: 'inherit', cwd: __dirname });
}

const Jimp = require('jimp');

async function pngToIco(pngPath, icoPath, sizes) {
  const images = [];
  for (const size of sizes) {
    const img = await Jimp.read(pngPath);
    img.resize(size, size);
    const pngBuf = await img.getBufferAsync(Jimp.MIME_PNG);
    images.push({ size, buf: pngBuf });
    console.log(`  Resized to ${size}x${size}: ${pngBuf.length} bytes`);
  }

  const count = images.length;
  const headerSize = 6;
  const dirEntrySize = 16;
  const dirSize = dirEntrySize * count;
  const dataOffset = headerSize + dirSize;

  let totalDataSize = 0;
  for (const img of images) totalDataSize += img.buf.length;

  const ico = Buffer.alloc(dataOffset + totalDataSize);
  ico.writeUInt16LE(0, 0);
  ico.writeUInt16LE(1, 2);
  ico.writeUInt16LE(count, 4);

  let imgOffset = dataOffset;
  for (let i = 0; i < images.length; i++) {
    const { size, buf } = images[i];
    const dirOffset = headerSize + i * dirEntrySize;
    ico.writeUInt8(size >= 256 ? 0 : size, dirOffset);
    ico.writeUInt8(size >= 256 ? 0 : size, dirOffset + 1);
    ico.writeUInt8(0, dirOffset + 2);
    ico.writeUInt8(0, dirOffset + 3);
    ico.writeUInt16LE(1, dirOffset + 4);
    ico.writeUInt16LE(32, dirOffset + 6);
    ico.writeUInt32LE(buf.length, dirOffset + 8);
    ico.writeUInt32LE(imgOffset, dirOffset + 12);
    buf.copy(ico, imgOffset);
    imgOffset += buf.length;
  }

  fs.writeFileSync(icoPath, ico);
  console.log(`\n✅ ICO written: ${icoPath} (${(ico.length / 1024).toFixed(1)} KB, sizes: ${sizes.join(', ')}px)`);
}

async function main() {
  console.log('\n📸 Generating favicons from:', SRC_PNG);

  // Save a crisp 64x64 PNG for <link rel="icon">
  const imgPng = await Jimp.read(SRC_PNG);
  imgPng.resize(64, 64);
  await imgPng.writeAsync(OUT_PNG);
  console.log(`✅ favicon.png written: ${OUT_PNG} (64x64)`);

  // Build proper multi-size ICO
  await pngToIco(SRC_PNG, OUT_ICO, SIZES);

  console.log('\n🎉 Done! Both favicon.ico and favicon.png have been updated.');
}

main().catch(err => {
  console.error('\n❌ Error:', err.message);
  process.exit(1);
});

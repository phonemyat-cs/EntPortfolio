#!/usr/bin/env node
/**
 * Regenerate the raster icons from public/favicon.svg.
 *
 * The SVG is the source of truth. Everything else is derived, so edit the SVG
 * and re-run this rather than editing the PNGs.
 *
 *   node scripts/build-favicon.mjs
 *
 * Writes:
 *   public/favicon.ico        16 + 32 + 48px, for browser tabs and history
 *   public/apple-touch-icon.png   180px, for an iOS home-screen bookmark
 *
 * Run rarely — only when the mark changes — so the output is committed rather
 * than built on every deploy.
 */

import { readFile, writeFile } from "node:fs/promises";
import process from "node:process";

const SVG = "public/favicon.svg";
const ICO = "public/favicon.ico";
const APPLE = "public/apple-touch-icon.png";

/** Sizes inside the .ico. 16 is the one people actually see in a tab. */
const ICO_SIZES = [16, 32, 48];
const APPLE_SIZE = 180;

/**
 * Build an .ico wrapping PNG images.
 *
 * The format is a 6-byte header, then a 16-byte directory entry per image,
 * then the image data. Storing PNGs rather than BMPs is allowed and is what
 * every modern generator does — it avoids the BMP variant's upside-down rows
 * and separate alpha mask.
 */
function buildIco(pngs) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // 1 = icon
  header.writeUInt16LE(pngs.length, 4);

  let offset = 6 + pngs.length * 16;
  const entries = pngs.map(({ size, data }) => {
    const entry = Buffer.alloc(16);
    // 0 means 256 in this field; none of our sizes hit that, but be correct.
    entry.writeUInt8(size >= 256 ? 0 : size, 0); // width
    entry.writeUInt8(size >= 256 ? 0 : size, 1); // height
    entry.writeUInt8(0, 2); // palette size, 0 = truecolour
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // colour planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(data.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += data.length;
    return entry;
  });

  return Buffer.concat([header, ...entries, ...pngs.map((p) => p.data)]);
}

async function main() {
  let sharp;
  try {
    sharp = (await import("sharp")).default;
  } catch {
    console.error("sharp is not installed. Run:\n\n  bun install\n");
    process.exit(1);
  }

  const svg = await readFile(SVG);

  // density scales the SVG rasteriser; without it small sizes render blurry.
  const render = (size) =>
    sharp(svg, { density: (72 * size) / 16 })
      .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png({ compressionLevel: 9 })
      .toBuffer();

  const pngs = await Promise.all(
    ICO_SIZES.map(async (size) => ({ size, data: await render(size) })),
  );
  const ico = buildIco(pngs);
  await writeFile(ICO, ico);
  console.log(`  ${ICO.padEnd(28)} ${ICO_SIZES.join(" + ")}px, ${ico.length} bytes`);

  const apple = await render(APPLE_SIZE);
  await writeFile(APPLE, apple);
  console.log(`  ${APPLE.padEnd(28)} ${APPLE_SIZE}px, ${apple.length} bytes`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

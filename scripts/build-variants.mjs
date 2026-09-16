#!/usr/bin/env node
/**
 * Generate the responsive variants of each photograph for upload.
 *
 * Reads camera originals from photos-source/, writes resized AVIF, WebP and
 * JPEG files to build/images/<id>/<width>.<ext>, matching the object keys
 * src/content/images.ts asks for.
 *
 * This is a local tool, not part of `bun run build`. The site build never
 * touches photos-source/ — see docs/IMAGES.md for why and for the upload step.
 *
 *   bun add -d sharp
 *   node scripts/build-variants.mjs
 *   node scripts/build-variants.mjs --id coast-walker --source DSCF2490.jpg
 */

import { mkdir, readdir, stat } from "node:fs/promises";
import { basename, extname, join } from "node:path";
import process from "node:process";

const SOURCE_DIR = "photos-source";
const OUT_DIR = join("build", "images");

// Kept in step with imageWidths in src/content/images.ts by the check below.
const WIDTHS = [480, 800, 1200, 1600, 2000];

/** Quality per format. AVIF tolerates a lower number for the same perceived result. */
const QUALITY = { avif: 50, webp: 75, jpg: 82 };

function parseArgs(argv) {
  const args = { id: undefined, source: undefined };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === "--id") args.id = argv[i + 1];
    if (argv[i] === "--source") args.source = argv[i + 1];
  }
  return args;
}

/**
 * Fail loudly if the width list here drifts from the one the site renders.
 * A mismatch means the page requests a variant that was never uploaded, which
 * shows up as a blank frame and nothing in any log.
 */
async function assertWidthsMatchSite() {
  const source = await import("node:fs/promises").then((fs) =>
    fs.readFile("src/content/images.ts", "utf8"),
  );
  const match = source.match(/export const imageWidths = \[([^\]]+)\]/);
  if (!match) throw new Error("Could not find imageWidths in src/content/images.ts");
  const siteWidths = match[1]
    .split(",")
    .map((n) => Number(n.trim()))
    .filter((n) => !Number.isNaN(n));
  const same = siteWidths.length === WIDTHS.length && siteWidths.every((w, i) => w === WIDTHS[i]);
  if (!same) {
    throw new Error(
      `Width mismatch.\n  this script: ${WIDTHS.join(", ")}\n  the site:    ${siteWidths.join(", ")}\n` +
        "Update both, regenerate, and re-upload before deploying.",
    );
  }
}

async function loadSharp() {
  try {
    return (await import("sharp")).default;
  } catch {
    console.error("sharp is not installed. Run:\n\n  bun add -d sharp\n");
    process.exit(1);
  }
}

async function generate(sharp, sourcePath, id) {
  const outDir = join(OUT_DIR, id);
  await mkdir(outDir, { recursive: true });

  const image = sharp(sourcePath, { failOn: "error" });
  const { width: srcWidth } = await image.metadata();
  if (!srcWidth) throw new Error(`Could not read dimensions of ${sourcePath}`);

  let written = 0;
  for (const width of WIDTHS) {
    // Never upscale. A 480px-wide source does not gain anything from a 2000px
    // variant except a bigger file.
    if (width > srcWidth) continue;

    // No .withMetadata() here, deliberately. sharp strips EXIF by default, and
    // calling withMetadata() is what *keeps* it — the opposite of what reading
    // the name suggests. Camera originals carry serial numbers, lens data,
    // sometimes GPS and sometimes the photographer's name, none of which
    // belong on a public bucket.
    const resized = sharp(sourcePath).resize({ width, withoutEnlargement: true });

    await Promise.all([
      resized
        .clone()
        .avif({ quality: QUALITY.avif })
        .toFile(join(outDir, `${width}.avif`)),
      resized
        .clone()
        .webp({ quality: QUALITY.webp })
        .toFile(join(outDir, `${width}.webp`)),
      resized
        .clone()
        .jpeg({ quality: QUALITY.jpg, mozjpeg: true })
        .toFile(join(outDir, `${width}.jpg`)),
    ]);
    written += 3;
  }

  const { size } = await stat(sourcePath);
  console.log(
    `  ${id.padEnd(20)} ${srcWidth}px source (${(size / 1048576).toFixed(1)} MB) -> ${written} files`,
  );
}

async function main() {
  await assertWidthsMatchSite();
  const sharp = await loadSharp();
  const { id, source } = parseArgs(process.argv.slice(2));

  if (id && source) {
    console.log(`Generating variants into ${OUT_DIR}/`);
    await generate(sharp, join(SOURCE_DIR, source), id);
    return;
  }
  if (id || source) {
    console.error("--id and --source must be given together.");
    process.exit(1);
  }

  const files = (await readdir(SOURCE_DIR)).filter((f) => /\.jpe?g$/i.test(f));
  if (files.length === 0) {
    console.error(`No JPEGs in ${SOURCE_DIR}/.`);
    process.exit(1);
  }

  console.log(`Generating variants for ${files.length} photographs into ${OUT_DIR}/`);
  for (const file of files) {
    // Default id is the filename without its extension, lowercased. Camera
    // filenames make poor ids — pass --id to give a photograph a real one.
    await generate(sharp, join(SOURCE_DIR, file), basename(file, extname(file)).toLowerCase());
  }

  console.log("\nDone. Upload with the rclone command in docs/IMAGES.md.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

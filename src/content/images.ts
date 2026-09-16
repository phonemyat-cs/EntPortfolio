/**
 * Image URL resolution.
 *
 * Photographs are served from object storage (Cloudflare R2) rather than
 * bundled into the build, so the repository does not grow by twenty megabytes
 * per photograph. See docs/IMAGES.md for the upload process.
 *
 * The constraint that shapes this file: Cloudflare's on-the-fly resizing
 * (`/cdn-cgi/image/...`) only runs on domains proxied through Cloudflare, and
 * the site is hosted on Netlify. R2 therefore serves plain static objects and
 * resizes nothing, so every width in `imageWidths` must exist as its own
 * uploaded file. Recorded as C2 in docs/REQUIREMENTS.md.
 */

/**
 * Widths generated for each photograph, in pixels.
 *
 * Stops at 2000: beyond that the difference is invisible on a screen and you
 * are only spending someone's bandwidth. Covers 1x phones through 2x laptops.
 */
export const imageWidths = [480, 800, 1200, 1600, 2000] as const;

/**
 * Formats in `<source>` order, best first. The browser takes the first it can
 * decode, so AVIF before WebP before the JPEG fallback in the `<img>` itself.
 */
export const imageFormats = ["avif", "webp"] as const;

export type ImageFormat = (typeof imageFormats)[number];

/**
 * Base URL of the bucket, without a trailing slash. Unset in local
 * development and on any clone without credentials.
 */
const baseUrl = import.meta.env.VITE_IMAGE_BASE_URL?.replace(/\/$/, "");

/** True when photographs are served from the remote host. */
export const usingRemoteImages = Boolean(baseUrl);

/**
 * Object key for one variant. Must match what the upload script writes.
 *
 * Shape: `<id>/<width>.<format>` — e.g. `coast-walker/1200.avif`.
 * A directory per photograph rather than a flat `coast-walker-1200.avif`, so a
 * photograph can be removed from the bucket with one prefix delete.
 */
export function variantKey(id: string, width: number, format: ImageFormat | "jpg"): string {
  return `${id}/${width}.${format}`;
}

/**
 * srcset for one format, or undefined when no image host is configured.
 *
 * Returning undefined rather than a guessed URL matters: a srcset pointing at
 * files that do not exist fails silently per-image, and on a portfolio that
 * means blank frames with no error anywhere.
 */
export function buildSrcSet(id: string, format: ImageFormat | "jpg"): string | undefined {
  if (!baseUrl) return undefined;
  return imageWidths.map((w) => `${baseUrl}/${variantKey(id, w, format)} ${w}w`).join(", ");
}

/**
 * The `src` for a photograph: the remote JPEG fallback when a host is
 * configured, otherwise the bundled asset the build already has.
 *
 * This fallback is what keeps `bun run build` working on a clean clone with no
 * accounts and no credentials, which is one of the teardown's done conditions.
 */
export function imageSrc(id: string, bundledSrc: string): string {
  if (!baseUrl) return bundledSrc;
  return `${baseUrl}/${variantKey(id, 1600, "jpg")}`;
}

/**
 * The `sizes` attribute telling the browser how wide the image will be laid
 * out, so it can pick a variant before CSS has been applied.
 *
 * Wrong `sizes` is worse than none — the browser will confidently fetch the
 * wrong file — so these mirror the actual grid breakpoints in routes/index.tsx:
 * one column, then two at sm, then three at lg, inside a 1440px container.
 */
export const gridSizes = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw";

/** The hero occupies roughly the wider column of a two-column split. */
export const heroSizes = "(min-width: 768px) 64vw, 100vw";

/**
 * Site identity — the strings that appear in metadata, social cards and the
 * contact block, in one place rather than duplicated across route files.
 *
 * PLACEHOLDER CONTENT. Every value below was invented by the draft generator.
 * "Rowan Vale" is not a real photographer and rowanvale.photo is not a real
 * domain. The site is not shippable until these are replaced. Tracked as a
 * content gap in docs/REQUIREMENTS.md.
 */

/**
 * Canonical origin, used to turn relative asset paths into the absolute URLs
 * that og:image and og:url require — relative URLs are ignored by most
 * scrapers.
 *
 * Netlify exposes the deploy's own origin as URL at build time, so setting
 * VITE_SITE_URL from it keeps deploy previews from advertising the production
 * URL in their metadata. Falls back to the production domain.
 */
export const siteUrl = (import.meta.env.VITE_SITE_URL ?? "https://rowanvale.photo").replace(
  /\/$/,
  "",
);

export const site = {
  name: "Rowan Vale",
  title: "Rowan Vale Photography",
  description: "Film-inspired landscape and street photography by Rowan Vale.",
  /** Shown in the footer and used for the mailto link. */
  email: "hello@rowanvale.photo",
  instagram: {
    handle: "@rowanvale",
    url: "https://instagram.com/rowanvale",
  },
} as const;

/** Absolute URL for a path rooted at the site origin. */
export function absoluteUrl(path: string): string {
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

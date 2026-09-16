/// <reference types="vite/client" />

// Declaring the variables the app reads does two things the bare index
// signature on ImportMetaEnv does not: it satisfies
// noPropertyAccessFromIndexSignature so dot access typechecks, and it keeps
// Vite's static replacement of import.meta.env.VITE_* working, which bracket
// access would defeat.
//
// Both are optional. The app has a fallback for each, and nothing here is
// required for a local build.
interface ImportMetaEnv {
  /**
   * Canonical origin for absolute metadata URLs, e.g. https://rowanvale.photo.
   * On Netlify, set this from the deploy's own URL so previews do not
   * advertise the production domain.
   */
  readonly VITE_SITE_URL?: string;

  /**
   * Base URL of the bucket serving photograph variants, e.g.
   * https://images.rowanvale.photo. Unset locally, where the build falls back
   * to the bundled placeholder assets.
   */
  readonly VITE_IMAGE_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

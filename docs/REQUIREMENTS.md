# Requirements

Every statement in [`docs/spec.md`](spec.md) that constrains the build, quoted
rather than summarised, with its status against the current code.

`docs/spec.md` is terse — it is a bulleted list of attributes, not prose — so
several rows below are marked **unclear** where a reasonable reader could take
the line two ways. Those are listed for a decision, not guessed at.

Status values: **present** · **missing** · **conflicts** · **unclear** ·
**gap (accepted)** — a missing requirement deliberately not being built, with
the reason recorded.

---

## Functional

| ID  | Requirement                                                                                              | Source                   | Status                                                                                                             |
| --- | -------------------------------------------------------------------------------------------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| R1  | "Search/sort bar"                                                                                        | spec.md §Search/sort bar | **gap (accepted)** — the build has filters but no text search and no sort control. Scope decision: filters only.   |
| R2  | "Attribute/options: Location, theme, device"                                                             | spec.md §Search/sort bar | **present** — all three are filter dimensions.                                                                     |
| R3  | Image attributes: "Location, theme, device, color, preset, tag (optional – trip tag), preset (optional)" | spec.md §Image           | **present** — all six, with `tripTag` optional. Reading recorded as U1.                                            |
| R4  | "Image Grid: A mix of 16:9, 4:3, 1:1"                                                                    | spec.md §Image Grid      | **present** — `wide`, `standard` and `square`.                                                                     |
| R5  | "Preset: A collection of presets group by the same / similar style"                                      | spec.md §Preset          | **present** — footer lists each preset with its frame count and filters the archive to it. Reading recorded as U4. |
| R6  | "Contact: Email, Instagram"                                                                              | spec.md §Contact         | **present** — both wired to `src/content/site.ts`. Values are still placeholders.                                  |
| R7  | "Feeback Form - Optional"                                                                                | spec.md §Feedback Form   | **gap (accepted)** — marked optional in the spec. Not built. Needs a form backend; see note below.                 |
| R8  | "Hosting: Cloudflare free tier"                                                                          | spec.md §Image → Hosting | **conflicts** — see the conflicts section.                                                                         |

### Derived from R3

| ID  | Requirement                                                  | Status      |
| --- | ------------------------------------------------------------ | ----------- |
| R9  | Preset is a filterable image attribute                       | **present** |
| R10 | Trip tag is a filterable image attribute, optional per image | **present** |

### Present but not in the spec

The draft built these on its own initiative. Recorded so nobody later mistakes
them for requirements.

| ID  | Feature                                                             | Note                                                                                                                         |
| --- | ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| R11 | Snap-scrolling hero gallery, six frames, drag + arrows + pagination | From `docs/DESIGN-INTENT.md`, not the spec.                                                                                  |
| R12 | "extras" filter — film grain, people, rain, long exposure           | Not a spec attribute. Closest match is the spec's "tag", but the spec scopes tag to trips. Kept alongside `tripTag`; see U2. |
| R13 | Result count, clear-filters action, empty state                     | Reasonable and kept.                                                                                                         |
| R14 | Responsive nav with a mobile menu                                   | Kept.                                                                                                                        |

---

## Non-functional

The spec is silent on all of these. They come from `docs/lovable-teardown.md`'s
verification checklist, which is the only written standard this build has.

| ID  | Requirement                                                                                   | Source                           | Status                                                                                                                                                               |
| --- | --------------------------------------------------------------------------------------------- | -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| N1  | `bun install && bun run build` succeeds on a clean clone with no accounts                     | teardown §Verification           | **present**                                                                                                                                                          |
| N2  | No Lovable package in the dependency tree; no `gpteng.co` or `lovable.dev` request at runtime | teardown §Context                | **present** — Phase 1.                                                                                                                                               |
| N3  | No secret, API key, project id or personal email in tracked files                             | teardown §Verification           | **present** — no secrets. But see the note on email below.                                                                                                           |
| N4  | Every route loads after a hard refresh                                                        | teardown §Verification           | **present** — server-rendered, so every URL is a real server response. The SPA-redirect failure mode does not exist here.                                            |
| N5  | Lighthouse performance and accessibility both above 90, no layout shift                       | teardown §Verification           | **present** — 100 / 100 / 96 / 100 with the image pipeline active, CLS 0. See Verification below.                                                                    |
| N6  | Every image has non-placeholder `alt` text                                                    | teardown §Verification, §Phase 4 | **conflicts** — see below.                                                                                                                                           |
| N7  | Every image has explicit `width`/`height`                                                     | teardown §Phase 4                | **present** — all eight verified against the JPEG headers; the hero now reads them from the photo record instead of an index check.                                  |
| N8  | `srcset`, `loading="lazy"`, `decoding="async"` on images                                      | teardown §Phase 4                | **present** — AVIF/WebP/JPEG `srcset` with `sizes`, `decoding="async"` everywhere, lazy on all but the hero's first frame, which is eager at `fetchPriority="high"`. |
| N9  | Galleries in data, not hardcoded in JSX                                                       | teardown §Phase 4                | **present** — `src/content/photos.ts`.                                                                                                                               |
| N10 | Source images web-ready, ~2500px longest edge, never full-resolution exports                  | teardown §Phase 4                | **gap (accepted)** — `photos-source/` holds 7728×5152 originals. They are upload sources, never build inputs; nothing in `src/` imports them.                        |
| N11 | Bundle size recorded against the Phase 0 baseline                                             | teardown §Verification           | **present** — `docs/INVENTORY.md` §2.                                                                                                                                |
| N12 | Node version pinned via `.nvmrc` and `engines`                                                | teardown §Phase 3                | **present** — plus `.bun-version`, since the two runtimes pin separately.                                                                                            |
| N13 | CI running typecheck, lint and build on pull requests                                         | teardown §Phase 5                | **present** — `.github/workflows/ci.yml`. Checks only; Netlify deploys.                                                                                              |
| N14 | `.env.example` committed, `.env` gitignored                                                   | teardown §Phase 5                | **present** — verified with `git check-ignore` both ways.                                                                                                            |
| N15 | Dead shadcn/ui components and their Radix packages removed                                    | teardown §Phase 3                | **present** — all 46 plus 45 packages; 413 → 271 installed.                                                                                                          |

---

## Conflicts

Listed, not resolved, except where a decision has already been taken and
recorded.

### C1 — Hosting: Cloudflare vs Netlify · **resolved**

`docs/spec.md` says "Hosting: Cloudflare free tier".
`docs/lovable-teardown.md` §Phase 5 says "Host: Netlify", arguing from Vercel's
non-commercial restriction on its free tier — an argument that says nothing
about Cloudflare either way.

The draft itself shipped a third answer: nitro's preset was `cloudflare-module`.

**Decision: Netlify for the site, Cloudflare for the images.** The spec's line
sits under _Image → Hosting_, so reading it as the image host rather than the
site host satisfies both documents. Consequence recorded in C2.

### C2 — Cloudflare image resizing does not work on a Netlify domain

Cloudflare's on-the-fly resizing (`/cdn-cgi/image/...`) only runs on domains
proxied through Cloudflare. With the site on Netlify, R2 serves plain static
objects and resizes nothing.

Responsive `srcset` therefore needs **pre-generated width variants uploaded to
R2**, not URL parameters. This is a real ongoing cost — every new photograph
needs its variants generated and uploaded before it can be referenced.
Documented in `docs/IMAGES.md`.

### C3 — Image pipeline: remote host vs build-time optimisation

`docs/lovable-teardown.md` §Phase 4 says to install `vite-imagetools` and
generate AVIF/WebP variants at build time, arguing it "replaces a paid image
CDN entirely for a portfolio-sized site".

`docs/spec.md` says Cloudflare hosting for images.

**Decision: remote hosting, per the spec.** The teardown's build-time route was
not taken. Its argument still stands on the merits — for eleven photographs it
would have been simpler and cheaper — but the spec is the source of truth and
it names a host.

### C4 — "Every image has non-placeholder alt text" vs placeholder content

N6 cannot be satisfied while the site runs on invented content.

The mechanical half is fixed: `Photo` now carries an `alt` field separate from
`title`, and every image passes it. The grid previously passed
`alt={photo.title}`, so its alt text was the caption — "Weather Moving In"
describes nothing to a screen reader.

What remains is not fixable in code. The descriptions are of generated images
of places nobody went, so they are accurate about the pixels and false about
the world. Flagged as a content gap, per the teardown's instruction to flag
rather than invent descriptions.

### C5 — Grid ratios: spec asks for three, design intent gives two

`docs/spec.md` asks for "a mix of 16:9, 4:3, 1:1".
`docs/DESIGN-INTENT.md` says "mixed 16:9 and 4:3".

The spec wins — it is the source of truth, and the design intent document is a
record of what the generator was told, not a requirement. R4.

---

## Unclear

Ambiguities in `docs/spec.md`, listed rather than guessed at.

### U1 — "preset" appears twice in the image attribute list

> "Location, theme, device, color, preset, tag (optional – trip tag), preset (optional)"

`preset` is listed once unqualified and once as optional. Either it is a typo,
or one occurrence means "which preset was applied to this photo" and the other
means "which preset collection this photo belongs to" — which are genuinely
different fields.

**Built as:** one optional `preset` field, treated as the preset applied to the
photo, which also groups it into that preset's collection. If the two were
meant to be separate fields, this is wrong and needs a second field.

### U2 — Is "tag" only ever a trip tag?

> "tag (optional – trip tag)"

The parenthetical reads as an example rather than a constraint, but the field is
named generically. If tags are meant to be free-form, the draft's "extras"
filter (R12) may be the same idea under another name and the two should merge.

**Built as:** a single optional `tripTag` field, named for what the spec says it
holds. `extras` kept separate.

### U3 — What does the search bar search?

R1 is not being built, so this is moot for now. Recorded because it will matter
if search is picked up later: titles only, or titles plus every attribute?

### U4 — Where do presets link to?

> "A collection of presets group by the same / similar style"

The draft's footer links suggest presets are something you leave the site to
get — a store, a Gumroad page, a download. The spec describes them as a
grouping of photographs. These are compatible but imply different UI.

**Built as:** a grouping of photographs, per the spec's wording. The footer
links stay dead until there is a real destination for them.

---

## Notes

**On the feedback form (R7).** It is optional in the spec and is not built. Worth
knowing before it is: a static site cannot process a form submission on its own.
Netlify Forms handles this without a backend and is the obvious fit given the
hosting decision, but it changes the build — form markup needs a `netlify`
attribute, and spam handling needs configuring.

**On N3 and personal email.** The check asks for no personal email in tracked
files. `src/content/site.ts` contains `hello@rowanvale.photo`, which is invented
and not anyone's address. When real contact details replace it, a business
address belongs in the repository; a personal one does not.

---

## Verification

The teardown brief's checklist, run rather than asserted. Commit `fa68492`
plus this one.

| Check                                                                             | Result                                                                                                                                                                                                                                                                                                                |
| --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Lovable grep returns nothing                                                      | **Pass, with a caveat.** No `lovable`, `gpteng` or `gptengineer` in any source, config or dependency. The word survives in `docs/`, which records what was removed and why, and in two filename references to `docs/lovable-teardown.md`. Scrubbing those would delete the evidence the rest of this file depends on. |
| `rm -rf node_modules && bun install && bun run build` on a clean clone            | **Pass.** 271 packages, build green, no accounts or credentials needed.                                                                                                                                                                                                                                               |
| No request to `lovable.dev`, `gpteng.co` or an unexpected third party             | **Pass, with one third party.** Every external origin in the built output is ours, an SVG namespace, or a string inside a library error message. The one real runtime request is Google Fonts. Expected, but see the open items.                                                                                      |
| No secret, API key or project id in tracked files                                 | **Pass.** The only matches are byte coincidences inside JPEG data and the word "secret" in a CI comment.                                                                                                                                                                                                              |
| Every route loads, and still loads after a hard refresh                           | **Pass.** `/` returns 200 and an unknown path returns a real 404 from the production build. Server-rendered, so every URL is a server response — the SPA-redirect failure mode does not exist.                                                                                                                        |
| Lighthouse performance and accessibility above 90, no layout shift                | **Pass.** See below.                                                                                                                                                                                                                                                                                                  |
| Every image has non-placeholder alt text and explicit width/height                | **Partial.** Mechanically complete; the text describes placeholder images. C4.                                                                                                                                                                                                                                        |
| Bundle size recorded against the Phase 0 baseline                                 | **Pass.** `docs/INVENTORY.md` §2, and in each commit that moved it.                                                                                                                                                                                                                                                   |
| Every requirement is present or a recorded gap                                    | **Pass.** Three accepted gaps: R1 search/sort, R7 feedback form, N10 originals in `photos-source/`.                                                                                                                                                                                                                   |
| A second Netlify build is faster than the first, proving the image cache persists | **Not applicable, and not run.** That check assumes build-time image processing worth caching. Images are generated locally and served from R2, so the Netlify build never touches a photograph and there is no image cache to persist. Nothing has been deployed yet, so no deploy-time claim is made here at all.   |

### Lighthouse

Desktop preset, production build, served by `bun run preview`.

|                                                 | Performance | Accessibility | Best Practices | SEO     |
| ----------------------------------------------- | ----------- | ------------- | -------------- | ------- |
| With image pipeline (`VITE_IMAGE_BASE_URL` set) | **100**     | **100**       | 96             | **100** |
| Bundled-asset fallback (unset)                  | 85          | **100**       | 96             | **100** |

CLS 0, LCP 0.5s, TBT 0ms with the pipeline active; all nine images served as
AVIF.

Two things worth reading off that table:

- **The fallback path scores 85**, below the brief's 90 threshold, and every
  point it loses is an image audit — `modern-image-formats`,
  `uses-responsive-images`, `image-delivery-insight`. That is the expected
  result of serving single-resolution JPEGs with no `srcset`, and it is what
  the R2 pipeline exists to fix. The fallback is a build-without-credentials
  affordance, not a production configuration. **Do not deploy with
  `VITE_IMAGE_BASE_URL` unset.**
- **Best Practices 96** is a sandbox artefact, not a defect. The only failing
  audit is `errors-in-console`, and the single error is
  `ERR_CERT_AUTHORITY_INVALID` from the test environment's TLS proxy
  intercepting the Google Fonts request.

The run was done against a local static server standing in for R2, serving
variants generated from the placeholder assets by the same code path
`scripts/build-variants.mjs` uses.

---

## Open items

Neither is a requirement. Both are recorded so they are decisions rather than
oversights.

1. **Google Fonts is the one third-party runtime request.** Two extra
   connections on a render-blocking path, and every visitor's IP goes to
   Google. Self-hosting DM Sans and Newsreader removes it entirely and is a
   contained change. Not done — it was not asked for, and it is a change to
   how the site loads rather than part of the teardown.
2. **`overrides.rolldown` is an undocumented pin** inherited from the draft.
   Left alone; nothing in this work depends on it either way.

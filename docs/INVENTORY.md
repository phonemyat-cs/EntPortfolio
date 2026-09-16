# Inventory — Phase 0

A written record of the Lovable draft **as handed over**, taken before any code
changed. Every later deletion is justified against this file.

Taken at commit `91b2d59`, 16 September 2026.

---

## 1. The handover does not match the teardown instructions

`docs/lovable-teardown.md` describes a different application than the one in
the zip. It assumes the common Lovable output: Vite + React + **react-router**,
a real `index.html`, the `lovable-tagger` package, a `componentTagger()` entry
in the Vite plugin array, and a Supabase client.

The draft is **TanStack Start** — server-rendered, built through nitro, with
file-based routing. Consequences for the plan:

| Teardown instruction                                           | Reality                                                                                  |
| -------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Remove `lovable-tagger` from `package.json` + `vite.config.ts` | Package is not present. Not installed, not imported.                                     |
| Delete the `cdn.gpteng.co` script from `index.html`            | There is no `index.html`. The document shell is `RootShell` in `src/routes/__root.tsx`.  |
| Fix Open Graph tags in `index.html`                            | They live in the `head()` of `__root.tsx` and `routes/index.tsx`. One real hit — see §4. |
| Move hardcoded Supabase keys to env vars                       | No Supabase. No `src/integrations/`, no `supabase/config.toml`, no client, no calls.     |
| Flag the Supabase project id before deleting                   | Not applicable.                                                                          |
| Keep `package-lock.json` over `bun.lockb`                      | Neither exists. The project is bun-native — see §6.                                      |
| Netlify SPA redirect `/* /index.html 200`                      | Meaningless for an SSR app; there is no `index.html` to redirect to.                     |

**The coupling the instructions miss is the significant one.** See §4.

---

## 2. Baseline

Established before any change, so a teardown regression can be told apart from
a pre-existing break.

`bun install --frozen-lockfile` → 413 packages, 3.30s.
`bun run build` → **succeeds**, no errors.

Nitro preset: **`cloudflare-module`** (the default from the Lovable config).
Output is a Cloudflare Worker plus a static public directory.

### Client bundle — the number Phase 3 is measured against

| Artefact              | Raw           | Gzip          |
| --------------------- | ------------- | ------------- |
| `assets/index-*.js`   | 344.91 kB     | **108.40 kB** |
| `assets/routes-*.js`  | 10.96 kB      | 3.49 kB       |
| `assets/styles-*.css` | 79.18 kB      | 13.80 kB      |
| **Total JS**          | **355.87 kB** | **111.89 kB** |

`.output/public` 1.7M total · `.output/server` 984K.

### Warnings

- `WARN inlineDynamicImports option is ignored because the codeSplitting option is specified` — emitted from inside the nitro environment build, not from project code. Pre-existing; not introduced by the teardown.

---

## 3. Stack

From `package.json`. React 19, Tailwind 4, Vite 8, TanStack Start 1.168.

| Package                             | Version                         |
| ----------------------------------- | ------------------------------- |
| `@tanstack/react-start`             | 1.168.32                        |
| `@tanstack/react-router`            | 1.170.18                        |
| `@tanstack/router-plugin`           | 1.168.23                        |
| `@tanstack/react-query`             | ^5.101.1                        |
| `react` / `react-dom`               | ^19.2.0                         |
| `vite`                              | 8.1.5                           |
| `tailwindcss` / `@tailwindcss/vite` | ^4.2.1                          |
| `nitro`                             | 3.0.260603-beta (devDependency) |
| `typescript`                        | ^5.8.3                          |

`overrides: { rolldown: "1.2.1" }` — a pin, reason undocumented. Left alone;
Vite 8 uses rolldown internally and unpinning it is not part of this work.

Note `nitro` and `vite` are pinned exactly while everything else floats on a
caret range. `nitro` is a beta.

### Routes

File-based, two files, one URL.

| File                    | URL | Notes                                                                |
| ----------------------- | --- | -------------------------------------------------------------------- |
| `src/routes/__root.tsx` | —   | App shell. `head()` metadata, `RootShell`, 404 and error boundaries. |
| `src/routes/index.tsx`  | `/` | The entire site. 12.5 kB single component.                           |

`src/routeTree.gen.ts` is generated — do not hand-edit.

Supporting: `src/router.tsx` (router + QueryClient), `src/start.ts` (CSRF +
error middleware), `src/server.ts` (SSR error wrapper, set as the nitro build
entry via `tanstackStart.server.entry`).

`@tanstack/react-query` is installed and a `QueryClient` is provided through
router context in `__root.tsx`, but **no component calls a query**. It is
wiring for data fetching the draft never does.

### Dead UI components — all 46 of them

Every file in `src/components/ui/` is unused. `src/routes/index.tsx` is written
in raw HTML elements and Tailwind classes and imports nothing from
`@/components`. Verified:

```
grep -rn "@/components\|components/ui" src --include=*.tsx --include=*.ts \
  | grep -v "^src/components/ui/"     # returns nothing
```

```
accordion alert alert-dialog aspect-ratio avatar badge breadcrumb button
calendar card carousel chart checkbox collapsible command context-menu dialog
drawer dropdown-menu form hover-card input input-otp label menubar
navigation-menu pagination popover progress radio-group resizable scroll-area
select separator sheet sidebar skeleton slider sonner switch table tabs
textarea toggle toggle-group tooltip
```

Also dead:

- `src/hooks/use-mobile.tsx` — imported only by `ui/sidebar.tsx`.
- `src/lib/utils.ts` — the `cn()` helper, imported only by `src/components/ui/*`.

This makes roughly 25 Radix packages plus `recharts`, `embla-carousel-react`,
`cmdk`, `vaul`, `react-day-picker`, `input-otp`, `react-resizable-panels`,
`react-hook-form`, `@hookform/resolvers`, `zod`, `date-fns` and `sonner`
candidates for removal in Phase 3.

### Live application code

`src/lib/error-capture.ts`, `src/lib/error-page.ts`, `src/server.ts`,
`src/start.ts`, `src/router.tsx`, `src/styles.css`, both route files.

These are error-handling infrastructure, not Lovable telemetry — they capture
SSR errors that h3 would otherwise swallow into an opaque 500. `error-capture.ts`
monkey-patches `console.error`, which is worth knowing about but is ours to
keep. They send nothing anywhere.

---

## 4. Lovable coupling

Full grep, excluding `node_modules`, `.git` and `bun.lock`:

### The real one: `@lovable.dev/vite-tanstack-config`

`vite.config.ts` is four lines long because the package **is** the Vite config.
It is a `devDependency` at `^2.20.0` and supplies, at minimum:

- `@tailwindcss/vite`
- `vite-tsconfig-paths` scoped to `./tsconfig.json`
- `tanstackStart()`, including the `importProtection` settings
- `nitro()` with `defaultPreset: "cloudflare-module"`
- `@vitejs/plugin-react`
- the `@` → `./src` alias, and React / TanStack Query `dedupe`
- `optimizeDeps.include` for the React runtime
- `css.transformer: "lightningcss"`
- `VITE_*` env injection via `define`
- dev-only: TanStack devtools, HMR gate, a dev-server bridge, an assets proxy
  pointed at `*.lovable.app`, and sandbox detection forcing host `::` port 8080

Most of that is ordinary open-source plugin wiring that any TanStack Start
project needs. The sandbox, devtools-injection, HMR-gate and assets-proxy paths
are Lovable-editor-specific and gate on `isSandbox`, which is false outside
their build. Removing the package means **reconstructing the plugin chain by
hand**. This is the largest single task in Phase 1 and the teardown
instructions do not mention it.

`lightningcss` is a transitive dependency of this package. Keeping
`css.transformer: "lightningcss"` after removal would require adding
`lightningcss` as a direct dependency — a native binary. Tailwind 4 does its own
processing through `@tailwindcss/vite`, so dropping the transformer is the
cheaper choice.

### Everything else

| Artefact                                             | Location                                          | Disposition                                                                                                                                                   |
| ---------------------------------------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `reportLovableError()`                               | `src/lib/lovable-error-reporting.ts` (whole file) | Delete. Posts to `window.__lovableEvents` / `window.__lovableReportRuntimeError`, which exist only inside the Lovable editor preview. Dead weight outside it. |
| Its call site                                        | `src/routes/__root.tsx:13`, `:41`                 | Remove import and the `useEffect` in `ErrorComponent`.                                                                                                        |
| `twitter:site: "@Lovable"`                           | `src/routes/__root.tsx:87`                        | Replace. Points social cards at Lovable's account.                                                                                                            |
| Missing `og:image` / `og:url`                        | `__root.tsx`, `routes/index.tsx`                  | Neither is set at all, so link previews have no image. Not a Lovable artefact but a gap the same commit should close.                                         |
| `.lovable/project.json`                              | template id + revision hash                       | Delete. Editor bookkeeping.                                                                                                                                   |
| `.lovable/plan/photographer-portfolio-2026-09-16.md` | the generation prompt                             | Keep the content — it is the only record of the intended visual direction. Fold into docs before deleting the directory.                                      |
| `LOVABLE:BEGIN/END` block                            | `AGENTS.md:1-10`                                  | Delete the block. It instructs agents not to rewrite history because it would desync Lovable. Irrelevant once disconnected, and actively misleading.          |
| `minimumReleaseAgeExcludes`                          | `bunfig.toml:7`                                   | Drop the four `@lovable.dev/*` entries. Keep the 24h supply-chain guard itself — that is a good default worth keeping.                                        |
| README                                               | `README.md` (whole file)                          | Rewrite. Lovable onboarding copy, "Open your project in the Lovable editor".                                                                                  |
| `roadmap.md`                                         | root                                              | Lovable's own build checklist, all items ticked. Superseded by `docs/REQUIREMENTS.md` in Phase 2.                                                             |

### Not found

No `gpteng.co`. No `gptengineer.js`. No `componentTagger`. No `lovable-tagger`.
No `*.lovable.app` asset URL in any tracked source file. The `lovable.app`
reference inside the config package is dev-server-only and gated on sandbox
detection.

---

## 5. Images

### Bundled placeholder assets — `src/assets/`, 8 files, 1.3 MB

Generated by Lovable, not photographs of anything real. Imported as modules by
`src/routes/index.tsx`, so Vite fingerprints and emits them.

| File                  | Size     |
| --------------------- | -------- |
| `concrete-stairs.jpg` | 137.3 kB |
| `pine-ridge.jpg`      | 138.3 kB |
| `night-cyclist.jpg`   | 143.1 kB |
| `pale-dunes.jpg`      | 145.3 kB |
| `still-lake.jpg`      | 154.2 kB |
| `coast-walker.jpg`    | 166.9 kB |
| `coastal-cabin.jpg`   | 183.7 kB |
| `tram-lines.jpg`      | 218.8 kB |

Already web-sized. Served as single-resolution JPEG with no `srcset`, no AVIF
or WebP variant, and no responsive sizing — one file for every viewport.

`<img>` markup is better than typical generated code: `width` and `height` are
set on every image, and the grid images carry `loading="lazy"`. Missing:
`decoding="async"` everywhere, `srcset`/`sizes` everywhere, and `fetchpriority`
on the first hero frame.

The declared dimensions are **not verified against the files**. The hero
`<img>` widths are chosen by an inline index check (`i === 2 || i === 4`)
rather than read from the data.

### Camera originals — `photos-source/`, 11 files, ~210 MB

The real photographs. Fujifilm X100VI.

| File           | Pixels    | Size    | Shot             |
| -------------- | --------- | ------- | ---------------- |
| `DSCF2490.jpg` | 7728×5152 | 21.9 MB | 2026-08-20 22:28 |
| `DSCF2499.jpg` | 7728×5152 | 19.5 MB | 2026-08-20 22:29 |
| `DSCF2552.JPG` | 7728×5152 | 23.9 MB | 2026-08-30 17:19 |
| `DSCF2595.JPG` | 5472×3648 | 10.9 MB | 2026-08-30 17:47 |
| `DSCF2659.jpg` | 7728×5152 | 19.9 MB | 2026-09-01 14:38 |
| `DSCF2660.jpg` | 7728×5152 | 20.9 MB | 2026-09-01 14:36 |
| `DSCF2661.jpg` | 7728×5152 | 13.4 MB | 2026-09-01 14:40 |
| `DSCF2664.JPG` | 7728×5152 | 15.0 MB | 2026-09-01 09:40 |
| `DSCF2690.jpg` | 7728×5152 | 15.8 MB | 2026-09-01 14:42 |
| `DSCF2696.jpg` | 7728×5152 | 16.1 MB | 2026-09-01 14:43 |
| `DSCF2727.jpg` | 7728×5152 | 22.6 MB | 2026-09-13 22:49 |

Four shoot dates — 20 Aug, 30 Aug, 1 Sep, 13 Sep — which is the natural
grouping for the spec's optional "trip tag".

**These were committed to git before the teardown began.** `.git` is 197 MB
against a source tree of a few hundred kB. Git stores binaries in full on every
revision, so they are in history permanently unless history is rewritten.
Rewriting was considered and explicitly **not** chosen; recorded here so the
cost is visible rather than forgotten.

Mixed file extensions (`.jpg` and `.JPG`) will bite on a case-sensitive host if
anything ever globs them.

---

## 6. Packaging, config and third-party requests

### Lockfile

One lockfile: `bun.lock` (text format, 140 kB). No `package-lock.json`, no
`bun.lockb`, no `yarn.lock`, no `pnpm-lock.yaml` — so the teardown
instruction to "keep one, defaulting to `package-lock.json`" has nothing to
resolve.

`bunfig.toml` configures `saveTextLockfile` and a 24-hour `minimumReleaseAge`
supply-chain guard. The project is bun-native by construction. Converting to npm
would mean generating a lockfile that has never been tested and discarding a
working supply-chain control, so **bun stays**. Only the four `@lovable.dev/*`
allowlist entries come out.

### Third-party runtime requests

One, and it is not Lovable's:

```
src/routes/__root.tsx  →  fonts.googleapis.com  (DM Sans, Newsreader)
                          fonts.gstatic.com     (preconnect)
```

The verification checklist asks for "no request to any unexpected third-party
domain". Google Fonts is expected but is still a third-party request on every
page load, costing two extra connections and leaking visitor IPs to Google.
Self-hosting the two families is a small, separable change. **Recorded as an
open item, not actioned in Phase 0.**

The film-grain texture is an inline SVG data URI in `src/styles.css` — no
network request. Good as-is.

### Secrets

None. Full scan of tracked text files for `api_key`, `secret`, `token`,
`password` and private-key headers returns nothing. The only matches are byte
coincidences inside JPEG data.

No `.env` file exists. `.gitignore` covers `*.local` and `.dev.vars` but has
**no `.env` entry** — to be added in Phase 5 alongside `.env.example`.

### Missing project hygiene

- No `.nvmrc`, no `engines` field. The build is not pinned to a Node version.
- No `typecheck` script. `tsconfig.json` is strict and well configured
  (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`) but nothing runs
  `tsc`, so those settings are only enforced in an editor.
- No CI. No `.github/` directory at all.
- No test setup, and no tests.

---

## 7. Open items carried into later phases

1. `@lovable.dev/vite-tanstack-config` must be replaced by a hand-written
   plugin chain before anything else in Phase 1. (§4)
2. `@tanstack/react-query` is wired but unused — decide in Phase 3 whether to
   keep the wiring. (§3)
3. Declared image dimensions are unverified and hero widths are hardcoded by
   index. Fix when the content model lands in Phase 4. (§5)
4. Google Fonts is the one third-party runtime request. Self-hosting is
   proposed, not done. (§6)
5. `overrides.rolldown` is an undocumented pin. Left alone. (§3)
6. `.gitignore` has no `.env` entry. (§6)
7. Every photograph, caption, location, camera and contact detail in the draft
   is invented. Retained as placeholder content by decision; the site is not
   shippable until real content replaces it. (§5, and `docs/REQUIREMENTS.md`)

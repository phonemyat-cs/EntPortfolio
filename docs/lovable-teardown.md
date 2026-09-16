---
title: "Lovable Teardown — Claude Code Instructions"
subtitle: "Photography site · prepared 16 September 2026"
---

# Context and goal

Take a Lovable-generated photography site, remove everything that ties it to Lovable's platform, and hand back a repo that builds and deploys from our own GitHub with no external account required.

The starting point is a Lovable draft plus a Word document holding requirements Lovable did not implement. The Word doc is the source of truth for *what the site should do*; the Lovable draft is a starting point for *how it currently looks*, and nothing in it is sacred.

**Framework decision, made up front: keep Vite + React.** Lovable generates Vite + React + TypeScript + Tailwind + shadcn/ui. That stack is ours to keep — none of it is Lovable-proprietary. Porting to Astro is a separate project with its own justification, and mixing it into this teardown makes both harder to review. Do not port frameworks as part of this work. If a case for Astro emerges, raise it as an open question and stop.

Done means: `npm ci && npm run build` succeeds on a clean clone with no Lovable account, no `gpteng.co` or `lovable.dev` request at runtime, no Lovable package in the dependency tree, and every requirement in the Word doc either implemented or listed as a known gap.

# Ground rules

Work phase by phase. Do not start a phase before the previous one is committed and the build passes.

- Work on a branch: `git checkout -b teardown/lovable`. Never commit to `main` during this work.
- One commit per logical removal, with the reason in the message (`remove gpteng.co editor script from index.html`). A single "remove Lovable" commit is unreviewable and unrevertable.
- Run `npm run build` after every commit. If it breaks, fix it in that commit before moving on.
- Do not reformat, rename, or restructure files you were not asked to touch. A diff full of Prettier noise hides the actual changes.
- Do not rewrite components to "improve" them during the teardown. Removal and refactoring are separate passes; mixing them means nobody can tell which change broke what.
- Do not invent requirements. If the Word doc and the Lovable build disagree, record the conflict and ask — do not silently pick one.
- Do not delete anything whose purpose is unclear. Move it to a `_quarantine/` directory, note it, and decide at the end.
- When a decision needs the user, stop and ask. Do not guess at brand colours, copy, pricing, or contact details.

# Phase 0 — Inventory and baseline

Change nothing in this phase. Produce `docs/INVENTORY.md` and commit it, so every later deletion can be justified against a written record.

**Establish the baseline first.** Run `npm ci`, then `npm run build`, then `npm run dev` and load the site. Record whether it builds clean, any warnings, and the production bundle size per chunk. If the Lovable draft does not build as handed over, stop and report that before touching anything — you cannot tell a teardown regression from a pre-existing break without a green baseline.

**Convert the Word doc.** Put the `.docx` in `docs/`, then convert it to Markdown so it is diffable and greppable:

```
pandoc docs/spec.docx -t gfm -o docs/spec.md --extract-media=docs/spec-media
```

If pandoc is unavailable, use `python-docx` or `mammoth`. Commit both the original and the Markdown. Do not paraphrase the spec — convert it verbatim and leave interpretation to Phase 2.

**Then grep for Lovable's fingerprints** and list every hit with file and line:

```
grep -rin "lovable\|gpteng\|gptengineer\|componentTagger" . \
  --exclude-dir=node_modules --exclude-dir=.git
```

**Record in `docs/INVENTORY.md`:** the exact stack and versions from `package.json`; every route and page component; which shadcn/ui components in `src/components/ui/` are actually imported anywhere (and which are dead); whether Supabase is wired in, and if so which tables and functions are called; where images live and how many there are, with total size; every hardcoded secret, key, URL or ID found in tracked files.

# Phase 1 — Strip the Lovable dependencies

Remove platform coupling only. Keep Vite, React, TypeScript, Tailwind and shadcn/ui — those are ordinary open-source tools, not Lovable's.

Each item below names the artefact, the file it lives in, and what to do with it.

- **`lovable-tagger`** — in `package.json` devDependencies and `vite.config.ts`. Remove the package and the `componentTagger()` entry from the plugins array, including the `mode === 'development'` conditional wrapped around it.
- **GPT Engineer script** — in `index.html`. Delete the `<script src="https://cdn.gpteng.co/gptengineer.js">` tag. This is the in-browser select-to-edit hook and does nothing outside Lovable.
- **Open Graph metadata** — in `index.html`. Replace `og:image`, `og:url`, `twitter:image` and `twitter:site`; they point at `lovable.dev` assets and `@lovable_dev`. Replace `<meta name="author">` too.
- **README** — `README.md`. Rewrite entirely. The generated one is Lovable onboarding copy with a project URL in it. Replace with real setup, build and deploy instructions.
- **Supabase client** — `src/integrations/supabase/client.ts`. If present, the URL and publishable key are hardcoded. Move them to `import.meta.env.VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, add `.env.example`, and confirm `.env` is gitignored.
- **Supabase project id** — `supabase/config.toml`. Points at a Lovable-provisioned project. Flag it; see the open questions before deleting.
- **Duplicate lockfiles** — repo root. Lovable often leaves `bun.lockb` beside `package-lock.json`. Keep one, defaulting to `package-lock.json` unless the user runs Bun.
- **Generated assets** — `src/assets/` and `public/`. Any image fetched from a `lovable.dev` or CDN URL must be pulled local or replaced. A remote URL on their infrastructure will break without warning.

**A note on the Supabase key.** The anon key is designed to be public and is not a leak by itself, but it identifies a project on someone else's account. If that project stays in use, rotate nothing and just move it to env vars. If we are migrating to our own Supabase project, the key changes anyway.

After each removal, confirm the dev server still boots and the page renders. `componentTagger` in particular sits in the Vite plugin chain, and removing it incorrectly breaks the build in a way that looks like a React error.

# Phase 2 — Reconcile against the Word spec

The Word doc holds detail Lovable never saw. Turn it into a checklist before writing any feature code.

Read `docs/spec.md` and extract every statement that constrains the build into `docs/REQUIREMENTS.md`, one row per requirement:

| ID | Requirement (verbatim or close) | Source | Status |
| ----- | -------------------------------------- | ------------- | ---------------------------- |
| R1 | … | spec.md §2 | present / missing / conflicts / unclear |

Rules for building that table:

- Quote the spec rather than summarising it. A paraphrase loses the constraint that mattered.
- Mark **conflicts** where the Lovable build already does something the spec contradicts. Do not resolve them — list them for the user.
- Mark **unclear** where the spec is ambiguous rather than guessing an interpretation.
- Include the non-functional requirements people skip: page load targets, accessibility, SEO, mobile breakpoints, browser support, language.
- A Word doc often carries design intent in styling rather than words — headings, bold, tables, embedded screenshots. Check the extracted media directory before assuming the doc is text only.

Then implement **only the `missing` rows**, smallest first, one commit each, referencing the requirement ID in the message. Leave `conflicts` and `unclear` untouched until the user rules on them. Update the Status column as you go so the table stays an accurate picture of where the build is.

# Phase 3 — Own the dependency tree

Lovable installs the full shadcn/ui set regardless of what the design uses. A generated project typically carries 40-plus components in `src/components/ui/` and a Radix package for each, most of them never imported.

1. Find dead UI components. For every file in `src/components/ui/`, grep the rest of `src/` for an import of it. Write the unused list to `docs/INVENTORY.md` before deleting anything.
2. Delete unused components and the Radix packages that only they imported. Check each package has no other importer before removing it — several shadcn components share a Radix primitive.
3. Run `npx depcheck` as a cross-check, but treat its output as a suggestion. It misreports Tailwind plugins, type-only imports, and anything referenced from config files.
4. Rebuild and compare bundle size against the Phase 0 baseline. Record the before and after in the commit message.
5. Audit what remains: `npm audit`, and check nothing sits on a prerelease or `latest` range. Lovable sometimes pins oddly.
6. Commit `package-lock.json` and pin Node with a `.nvmrc` plus an `engines` field. The build must be reproducible on a clean machine and on CI.

Skip this phase entirely if the Word spec adds features that may need those components. Deleting a dialog in Phase 3 and reinstalling it in Phase 2 is wasted work — which is why Phase 2 comes first.

# Phase 4 — Image pipeline and content model

This is the part Lovable will have got wrong, because it optimises for looking right in a preview rather than loading fast on a phone. On a photography site it is the whole ballgame.

**Audit what is there.** List every image with dimensions and file size. Anything served at full resolution and scaled down in CSS is a bug. Check whether `<img>` tags carry `srcset`, `width`, `height`, `loading="lazy"` and `decoding="async"` — generated code usually has none of them, which means layout shift on every gallery.

**Add build-time optimisation.** Install `vite-imagetools`, import photos as modules, and let the build emit AVIF and WebP variants at several widths with a JPEG fallback. This replaces a paid image CDN entirely for a portfolio-sized site. Serve the largest variant at roughly 2000px — beyond that nobody can see the difference on a screen and you are just spending bandwidth.

**Fix the source files.** Source images committed to git should be web-ready, around 2500px on the longest edge, never RAWs or full-resolution exports. Git stores binaries in full on every revision with no delta compression, so a re-export of the whole gallery permanently doubles repo size. GitHub also hard-rejects any single file over 100MB.

**Define the content model explicitly.** Lovable will have hardcoded galleries into JSX. Move them to data — a typed array or a set of files under `src/content/` — with a shape agreed once:

```ts
type Photo = { src: string; alt: string; width: number; height: number; caption?: string }
type Gallery = { slug: string; title: string; cover: string; photos: Photo[] }
```

Every photo needs real `alt` text. Generated placeholders such as "photo" or "image of a person" fail accessibility and waste the SEO value of a gallery page. If the Word doc does not supply alt text, flag it as a content gap rather than inventing descriptions.

# Phase 5 — Deploy and CI

**Host: Netlify.** Vercel's fair use policy restricts the free Hobby tier to non-commercial personal use, and counts advertising the sale of a service, or being paid to build or host a site, as commercial. A photographer's business site is commercial on both counts. Netlify's free plan carries no such restriction. Use Vercel only if this is a personal portfolio with nothing for sale.

**Do not add a scheduled daily rebuild.** There is no external data source, so a cron rebuild produces a byte-identical site and burns build minutes for nothing. Deploy on push to `main`; the Git integration does that with no configuration.

**Do not hand-write a GitHub Actions deploy workflow.** Netlify builds from the repo directly. A second build pipeline duplicates work and drifts out of sync. Use Actions for checks only:

```yaml
# .github/workflows/ci.yml — on: [pull_request]
# steps: npm ci → npm run typecheck → npm run lint → npm run build
```

**Watch the build budget.** The Netlify free plan gives 100GB bandwidth and 300 build minutes per month. Image processing is the expensive step: a cold build over a few hundred photos can take 8–15 minutes, which burns the month in roughly 20–30 deploys. Persist the image cache between builds via `netlify-plugin-cache` pointed at the imagetools cache directory, and verify the second build is materially faster than the first. Exceeding the free limits suspends the site for the rest of the calendar month rather than billing an overage.

**Also set up:** `netlify.toml` with build command, publish directory and a SPA redirect (`/* /index.html 200` — without it every route except the homepage 404s on refresh); security headers; `.env.example` committed and `.env` ignored; environment variables set in the Netlify dashboard, never in the repo; a custom domain with HTTPS.

# Verification

Run all of these before opening the pull request. Report each result explicitly rather than asserting the work is done.

- [ ] `grep -rin "lovable\|gpteng\|gptengineer" . --exclude-dir=node_modules --exclude-dir=.git` returns nothing
- [ ] `rm -rf node_modules && npm ci && npm run build` succeeds from a clean clone
- [ ] DevTools Network tab on the built site shows no request to any `lovable.dev`, `gpteng.co` or unexpected third-party domain
- [ ] No secret, API key, project id or personal email in tracked files: `git log -p | grep -iE "key|secret|token|password"`
- [ ] Every route loads, and every route still loads after a hard refresh (catches the missing SPA redirect)
- [ ] Lighthouse on the gallery page: performance and accessibility both above 90, no layout shift
- [ ] Every image has non-placeholder `alt` text and explicit `width`/`height`
- [ ] Bundle size recorded against the Phase 0 baseline
- [ ] Every row in `docs/REQUIREMENTS.md` is `present`, or listed as a known gap with a reason
- [ ] A second Netlify build is meaningfully faster than the first, proving the image cache persists

# Open questions

Claude Code should surface these in Phase 0 rather than guessing, since each one changes the work downstream.

- **Is Supabase actually in use?** If the Lovable draft wired up a database that no feature reads from, it comes out entirely. If a form or booking flow depends on it, we need our own Supabase project and a migration plan before Phase 1 touches the client.
- **Who owns the Lovable account?** If the draft is still live at a `*.lovable.app` URL and anyone has that link, decide whether it stays up during the cutover or comes down immediately.
- **Is this a commercial site?** It determines Netlify versus Vercel, and it is a licence question, not a preference.
- **Where do the real photos come from?** The draft almost certainly uses stock or generated placeholders. Nothing in Phase 4 can be sized properly until the actual image set and its volume are known.
- **Who updates the site after handover?** Git-as-CMS is fine if that is you and no one else. If a photographer will add galleries themselves, a CMS belongs in the plan now rather than as a retrofit.
- **What does the Word doc say about anything paid?** Print sales, bookings and client proofing each pull in a third-party service and change the architecture. Do not build any of them from scratch.

# Photography portfolio

A single-page, image-first photography portfolio. Server-rendered with
TanStack Start, styled with Tailwind, deployed to Netlify.

> **This site is not shippable yet.** Every photograph, caption, location,
> camera and contact detail in it is placeholder content invented by the draft
> generator it grew out of — "Rowan Vale" is not a real photographer. See
> [`docs/REQUIREMENTS.md`](docs/REQUIREMENTS.md) for the gap list.

## Requirements

- [Bun](https://bun.sh) 1.3 or newer.

This project uses bun, not npm. `bun.lock` is the only lockfile and
`bunfig.toml` configures a 24-hour supply-chain guard that npm has no
equivalent for. Installing with npm would generate a second, untested lockfile
and silently drop that guard.

## Getting started

```sh
bun install
bun run dev
```

The dev server runs on <http://localhost:8080>.

## Scripts

| Script            | What it does                        |
| ----------------- | ----------------------------------- |
| `bun run dev`     | Dev server with HMR on port 8080.   |
| `bun run build`   | Production build into `.output/`.   |
| `bun run preview` | Serve the production build locally. |
| `bun run lint`    | ESLint over the project.            |
| `bun run format`  | Prettier, writing in place.         |

## How it is put together

```
src/
  routes/          file-based routing — every .tsx here is a URL
    __root.tsx     app shell: <html>, head metadata, 404 and error boundaries
    index.tsx      /  — the entire site
  content/         site identity and photo data, kept out of JSX
  lib/             SSR error capture and the fallback error page
  assets/          placeholder images bundled by the build
  styles.css       Tailwind layer and the film-grain texture
  router.tsx       router + QueryClient construction
  start.ts         CSRF and error middleware
  server.ts        SSR entry, wraps errors h3 would otherwise swallow
photos-source/     camera originals — upload sources, never build inputs
docs/              inventory, spec, requirements, image pipeline
```

Routing is file-based: adding `src/routes/about.tsx` creates `/about`.
`src/routeTree.gen.ts` is generated from that directory — do not edit it by
hand. There is no `src/pages/` and no `app/layout.tsx`; those are Next.js and
Remix conventions and do not apply. See `src/routes/README.md`.

### Images

Photographs are served from remote object storage rather than bundled, so the
repository does not grow by tens of megabytes per shoot. The build falls back
to the bundled placeholder assets when no image host is configured, which keeps
`bun run build` working on a clean clone with no accounts and no credentials.

See [`docs/IMAGES.md`](docs/IMAGES.md) for the variant naming scheme and how to
upload a new set.

## Configuration

Copy `.env.example` to `.env` and fill in what you need. Every variable is
optional and has a fallback, so the project builds without a `.env` at all.

`.env` is gitignored. Never commit it. On Netlify these are set in the site's
environment variables, not in the repository.

## Deployment

Netlify builds from this repository directly on push to `main` — there is no
deploy workflow in `.github/`, and adding one would duplicate that build and
drift out of sync with it. `netlify.toml` holds the build command, publish
directory and security headers.

GitHub Actions runs checks only, on pull requests: typecheck, lint, build.

## Documentation

| File                                                   | Contents                                                                   |
| ------------------------------------------------------ | -------------------------------------------------------------------------- |
| [`docs/spec.md`](docs/spec.md)                         | The requirements document. Source of truth for what the site should do.    |
| [`docs/REQUIREMENTS.md`](docs/REQUIREMENTS.md)         | Every requirement from the spec, with its build status and the known gaps. |
| [`docs/INVENTORY.md`](docs/INVENTORY.md)               | The draft as handed over, recorded before any change.                      |
| [`docs/IMAGES.md`](docs/IMAGES.md)                     | Image pipeline: variants, naming, upload.                                  |
| [`docs/DESIGN-INTENT.md`](docs/DESIGN-INTENT.md)       | The original visual direction, preserved for judging regressions.          |
| [`docs/lovable-teardown.md`](docs/lovable-teardown.md) | The teardown brief this repository was reworked against.                   |

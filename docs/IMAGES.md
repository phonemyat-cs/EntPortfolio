# Images

Photographs are served from Cloudflare R2, not bundled into the build.

## Why remote, and what it costs

`docs/spec.md` says "Hosting: Cloudflare free tier" under _Image_. The teardown
brief argued the opposite — build-time optimisation with `vite-imagetools`, no
CDN at all — and for eleven photographs its argument was the better one. The
spec wins because it is the source of truth. Recorded as C3 in
`docs/REQUIREMENTS.md`.

The consequence is the thing to understand before adding a photograph:

> **Cloudflare's on-the-fly resizing does not work here.** `/cdn-cgi/image/...`
> transformations only run on domains proxied through Cloudflare, and the site
> is on Netlify. R2 serves plain static objects and resizes nothing.

So every width the site can request must already exist in the bucket as its own
file. There is no URL parameter that produces one on demand. Adding a
photograph means generating fifteen files and uploading them. Recorded as C2.

## What the site requests

Defined in `src/content/images.ts`. Object keys are `<id>/<width>.<format>`:

```
coast-walker/480.avif   coast-walker/480.webp   coast-walker/480.jpg
coast-walker/800.avif   coast-walker/800.webp   coast-walker/800.jpg
coast-walker/1200.avif  coast-walker/1200.webp  coast-walker/1200.jpg
coast-walker/1600.avif  coast-walker/1600.webp  coast-walker/1600.jpg
coast-walker/2000.avif  coast-walker/2000.webp  coast-walker/2000.jpg
```

A directory per photograph, rather than a flat `coast-walker-1200.avif`, so one
prefix delete removes a photograph from the bucket completely.

`<id>` is the `id` field on the record in `src/content/photos.ts`. The `1600.jpg`
variant is the `src` on the `<img>`, so it is the one a browser without AVIF or
WebP support falls back to — it must always exist.

Widths stop at 2000. Past that the difference is invisible on a screen and you
are only spending someone's bandwidth.

## Adding photographs

### 1. Generate the variants

```sh
node scripts/build-variants.mjs        # everything in photos-source/
```

`sharp` is already a devDependency, so `bun install` is all the setup there is.

Or one photograph, giving it a real id rather than a camera filename:

```sh
node scripts/build-variants.mjs --id coast-walker --source DSCF2490.jpg
```

Output lands in `build/images/<id>/`, which is gitignored. The script never
upscales, and it **strips EXIF** — camera originals carry serial numbers, lens
data, sometimes GPS coordinates and sometimes the photographer's name, none of
which belong on a public bucket.

A worked example, from a 7728×5152 Fujifilm original:

|      | Original | 2000px | 1600px | 800px  |
| ---- | -------- | ------ | ------ | ------ |
| AVIF | —        | 234 kB | 151 kB | 57 kB  |
| WebP | —        | 358 kB | 244 kB | 84 kB  |
| JPEG | 21.9 MB  | 481 kB | 312 kB | 101 kB |

21.9 MB down to 151 kB for the variant most laptops will actually fetch.

### 2. Upload to R2

```sh
rclone sync build/images r2:your-bucket \
  --header-upload "Cache-Control: public, max-age=31536000, immutable"
```

A one-year immutable cache is safe because object keys are content-addressed by
id and width — a changed photograph gets a new id, it does not overwrite an old
key. If you do overwrite a key, that cache header means clients keep the old
picture for a year. Don't.

### 3. Add the record

Add an entry to `photos` in `src/content/photos.ts`. `width` and `height` are
the **intrinsic dimensions of the original**, not of any variant — they exist so
the browser can reserve the right space before the image arrives. `alt` must
describe the photograph, not repeat the caption.

### 4. Point the site at the bucket

Set `VITE_IMAGE_BASE_URL` to the bucket's public URL, in `.env` locally and in
Netlify's environment variables for deploys.

## When no bucket is configured

`VITE_IMAGE_BASE_URL` unset — a fresh clone, a contributor with no credentials,
CI — makes `buildSrcSet()` return `undefined` and `imageSrc()` fall back to the
bundled placeholder assets in `src/assets/`. The page renders plain `<img>`
tags with no `<picture>` and no `srcset`.

This is deliberate. `bun install && bun run build` has to work on a clean clone
with no accounts, which is one of the teardown brief's conditions for done.

It also means a **misconfigured** `VITE_IMAGE_BASE_URL` fails differently from
an unset one: pointing at a bucket that lacks the variants gives broken images
on a deployed site with nothing in any log, because a `srcset` entry that 404s
fails silently per-image. After changing the bucket, load the site and check the
network tab.

## Keeping the two width lists in step

`scripts/build-variants.mjs` and `src/content/images.ts` each hold a width list,
and they have to match — a width in the site's list with no uploaded file is a
blank frame. The script reads the site's list on every run and refuses to do
anything if they differ:

```
Width mismatch.
  this script: 480, 800, 1200, 1600, 2000
  the site:    480, 800, 1200, 1600
Update both, regenerate, and re-upload before deploying.
```

## The originals in `photos-source/`

Eleven Fujifilm X100VI files at 7728×5152, 11–25 MB each, about 210 MB.

They are upload sources only. Nothing in `src/` imports them and nothing should
— an import would inline a 20 MB file into the bundle.

They were committed before the teardown began, so they are in git history
permanently, and `.git` is 197 MB against a source tree of a few hundred kB.
Purging them would need a history rewrite, which was considered and deliberately
not done. Do not add more full-resolution originals: git stores binaries in full
on every revision with no delta compression, and GitHub hard-rejects any single
file over 100 MB.

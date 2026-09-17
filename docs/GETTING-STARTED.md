# Getting started — do these in order

Everything left to do, as a checklist. The other files in `docs/` explain _why_
things are the way they are. This one is just _what to do_.

**Where things stand:** the code is finished and working. What is missing is
your content and your accounts. Nothing below requires you to write code —
Steps 1 and 2 are editing text in two files, the rest is clicking through two
websites.

**Time:** about 20 minutes for Steps 0–2, about an hour for Steps 3–6 the first
time you do them.

| Step | What                                 | Needs an account?       |
| ---- | ------------------------------------ | ----------------------- |
| 0    | Run the site on your own machine     | No                      |
| 1    | Put your name and contact details in | No                      |
| 2    | Put your photographs in              | No                      |
| 3    | Create the image bucket              | Cloudflare (free)       |
| 4    | Upload the images                    | Cloudflare              |
| 5    | Put the site online                  | Netlify (free) + GitHub |
| 6    | Use your own domain                  | A domain registrar      |

You can stop after any step. After Step 2 you have a working site on your
laptop. After Step 5 it is on the internet.

---

## Step 0 — Run it on your machine

You need [Bun](https://bun.sh). Install it with one command:

```sh
curl -fsSL https://bun.sh/install | bash
```

Then, in the project folder:

```sh
bun install
bun run dev
```

Open **http://localhost:8080**.

**You should see:** the portfolio, with a photo strip you can drag, filter
buttons that work, and a grid of eight pictures.

**If you see that, everything is working.** The pictures are placeholders and
the name is fake — that is expected, and Steps 1 and 2 fix it.

Leave this running while you do the next steps. It reloads automatically every
time you save a file.

> Press `Ctrl+C` in the terminal to stop it.

---

## Step 1 — Put your name and contact details in

Open **`src/content/site.ts`**. Change these six lines to your own details:

```ts
export const site = {
  name: "Rowan Vale", // ← your name
  title: "Rowan Vale Photography", // ← browser tab + link previews
  description: "Film-inspired landscape and street photography by Rowan Vale.",
  email: "hello@rowanvale.photo", // ← your contact email
  instagram: {
    handle: "@rowanvale", // ← your handle
    url: "https://instagram.com/rowanvale", // ← your profile link
  },
} as const;
```

A little lower in the same file, change the fallback domain. If you do not have
a domain yet, leave it — Step 6 comes back to this.

```text
export const siteUrl = (import.meta.env.VITE_SITE_URL ?? "https://rowanvale.photo").replace(
```

Change only the `https://rowanvale.photo` part. Leave the rest of the line
alone.

Save. The browser updates by itself.

**Check it worked:** your name is at the top left, and your email is the link at
the bottom.

> **Use a business email, not a personal one.** It goes in the public
> repository and on a public web page, where scrapers will find it.

---

## Step 2 — Put your photographs in

Two things happen here: the image files go in one folder, and a description of
each one goes in a file.

### 2a. Copy your photos in

Put your full-size photographs in the **`photos-source/`** folder. There are
eleven in there already — delete them if you don't want them.

Give each file a name you'll recognise. `harbour-fog.jpg` is easier to work with
than `DSCF2490.jpg`.

> **Don't worry about file size.** These never reach the website. Step 4 makes
> small copies. Do not add more than a handful of very large files, though —
> git keeps every version of them forever.

### 2b. Describe each photo

Open **`src/content/photos.ts`**. It has eight entries that look like this:

```ts
{
  id: "coast-walker",
  src: coastWalker,
  title: "Last Light, Vík",
  alt: "A figure walking a misty black-sand coast at dusk.",
  theme: "Landscape",
  color: "Cool",
  location: "Iceland",
  device: "Leica Q2",
  preset: "Quiet Weather",
  tripTag: "Iceland 2025",
  extras: "People",
  ratio: "standard",
  width: 1408,
  height: 1056,
},
```

Replace them with your own. Here is what each line means:

| Line               | What to put                                                                                                                                            |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `id`               | A short name, lowercase with dashes. **Must match the filename you used in `photos-source/`**, without the `.jpg`. This is how Step 4 connects them.   |
| `src`              | Leave as-is for now — it points at a placeholder until Step 4.                                                                                         |
| `title`            | The caption shown under the picture.                                                                                                                   |
| `alt`              | A plain description of what is in the picture, for blind visitors and Google. **Not** the caption. "A figure walking a misty coast", not "Last Light". |
| `theme`            | `Landscape`, `Street`, `Architecture` — or invent your own.                                                                                            |
| `color`            | `Cool`, `Warm`, `Monochrome`, `Blue hour` — or your own.                                                                                               |
| `location`         | Where you took it.                                                                                                                                     |
| `device`           | The camera.                                                                                                                                            |
| `preset`           | Which edit/preset you used. Photos sharing a preset get grouped together.                                                                              |
| `tripTag`          | Optional. Which trip it came from. Delete the line if not relevant.                                                                                    |
| `extras`           | Optional extra label — `Rain`, `People`, `Film grain`.                                                                                                 |
| `ratio`            | How it is cropped on the page: `wide` (16:9), `standard` (4:3), or `square` (1:1).                                                                     |
| `width` / `height` | The real pixel size of your original file.                                                                                                             |

> **Whatever you type into `theme`, `color`, `location` and the rest becomes a
> filter button automatically.** You don't have to register them anywhere.

**Don't know your photo's width and height?** On a Mac, right-click → Get Info.
On Windows, right-click → Properties → Details.

**Check it worked:** the grid shows your captions and the filter buttons list
your own locations and cameras.

At this point the site works and is yours. The pictures are still the
placeholder images — Step 4 swaps those in.

---

## Step 3 — Create the image bucket (Cloudflare)

Your photos are served from Cloudflare's storage rather than being packed into
the website. This keeps the site fast and the repository small.

1. Sign up at **[dash.cloudflare.com](https://dash.cloudflare.com)** — free.
2. In the left sidebar click **R2**. You will be asked for a payment card even
   on the free plan. The free tier is 10 GB of storage and there is no charge
   for downloads.
3. Click **Create bucket**. Name it something like `portfolio-images`. Any
   region is fine.
4. Open the bucket → **Settings** tab.
5. Find **Public access**. You have two choices:
   - **Custom domain** (recommended) — e.g. `images.yoursite.com`. Requires your
     domain to be on Cloudflare. Fast, unlimited, and the proper option.
   - **R2.dev subdomain** — one click, no domain needed. Fine for testing.
     **Cloudflare rate-limits this and says not to use it in production.**
6. Copy the public URL it gives you. It looks like
   `https://pub-1a2b3c.r2.dev` or `https://images.yoursite.com`.

Keep that URL. Step 4 and Step 5 both need it.

---

## Step 4 — Make the small copies and upload them

### 4a. Generate them

```sh
node scripts/build-variants.mjs
```

This reads `photos-source/` and writes small copies into `build/images/`. It
makes five sizes in three formats for each photo, so browsers can pick whichever
is smallest for the screen looking at it.

**You should see** one line per photograph, like:

```
  harbour-fog          7728px source (21.9 MB) -> 15 files
```

A 22 MB original becomes about 150 kB. That is the whole point.

> The script also removes the hidden data your camera embeds — serial number,
> lens, sometimes GPS coordinates of where you stood. You do not want that on a
> public server.

### 4b. Upload them

Install [rclone](https://rclone.org/downloads/), then connect it to Cloudflare:

```sh
rclone config
```

Answer: `n` for new remote → name it `r2` → choose **Cloudflare R2** → paste the
Access Key ID and Secret Access Key. You create those keys in the Cloudflare
dashboard under **R2 → Manage API tokens → Create API token**, with
**Object Read & Write** permission.

Then upload:

```sh
rclone sync build/images r2:portfolio-images \
  --header-upload "Cache-Control: public, max-age=31536000, immutable"
```

Use your own bucket name instead of `portfolio-images`.

**Check it worked:** open `https://YOUR-BUCKET-URL/harbour-fog/800.avif` in a
browser (use one of your own photo ids). You should see the picture.

### 4c. Tell the site where they are

Create a file called **`.env`** in the project folder:

```
VITE_IMAGE_BASE_URL=https://pub-1a2b3c.r2.dev
```

Use your own URL, with no slash at the end.

Restart the dev server (`Ctrl+C`, then `bun run dev`). Your real photographs
should now appear.

> `.env` is deliberately never committed to git. There is a `.env.example` in
> the project showing what goes in it.

---

## Step 5 — Put it on the internet (Netlify)

### 5a. Push your changes to GitHub

```sh
git add -A
git commit -m "add my photos and details"
git push
```

### 5b. Connect Netlify

1. Sign up at **[app.netlify.com](https://app.netlify.com)** — free, no card.
2. **Add new site → Import an existing project → GitHub**.
3. Pick this repository.
4. **Leave the build settings alone.** The project already contains a
   `netlify.toml` that tells Netlify everything it needs.
5. Before clicking deploy, open **Add environment variables** and add:

   | Key                   | Value                       |
   | --------------------- | --------------------------- |
   | `VITE_IMAGE_BASE_URL` | your bucket URL from Step 3 |

6. Click **Deploy**.

**This one matters.** If you forget `VITE_IMAGE_BASE_URL`, the site still
deploys and still looks fine — it quietly falls back to the placeholder images
and gets noticeably slower. It will not show you an error. Set it.

Wait a couple of minutes. Netlify gives you a URL like
`random-name-123.netlify.app`. Open it.

**Check it worked:** your photos load, and the address bar shows the Netlify
URL, not localhost.

From now on, every `git push` redeploys automatically.

---

## Step 6 — Use your own domain

1. Buy a domain anywhere (Namecheap, Cloudflare, Porkbun…).
2. In Netlify: **Domain management → Add a domain**, then follow its
   instructions for pointing your domain at it.
3. Netlify sets up the HTTPS certificate on its own. Give it up to an hour.
4. Add one more environment variable in Netlify so link previews use the right
   address:

   | Key             | Value                    |
   | --------------- | ------------------------ |
   | `VITE_SITE_URL` | `https://yourdomain.com` |

5. Redeploy (**Deploys → Trigger deploy**).

---

## When something looks wrong

| What you see                              | What it means                                                                                      |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Photos are blank or broken                | The `id` in `photos.ts` doesn't match the folder name in the bucket. They must be identical.       |
| Photos look like the originals, not yours | `VITE_IMAGE_BASE_URL` isn't set. Locally check `.env`; on Netlify check the environment variables. |
| Site is slow after deploying              | Same cause — you're getting the fallback images.                                                   |
| `bun run dev` prints errors               | Run `bun install` first.                                                                           |
| A filter button is missing                | Nothing has that value yet. Buttons come from your photo data.                                     |
| `Width mismatch` from the script          | You changed the sizes in one file but not the other. The message says which.                       |
| Netlify build fails                       | Open the deploy log. It runs the same `bun run build` you can run yourself to see the same error.  |

**Before asking anyone for help, run these three:**

```sh
bun run typecheck   # finds mistakes in the data files
bun run lint        # finds formatting problems
bun run build       # proves it would deploy
```

If all three pass, the project is fine and the problem is a setting.

---

## Things deliberately not built

Not oversights — decisions, recorded in `docs/REQUIREMENTS.md`:

- **Search box and sort control.** The filter buttons were chosen instead.
- **Feedback form.** Optional in your spec. It needs a form service; Netlify
  Forms is the easy option if you want it later.
- **A way to add photos without editing files.** Adding a photo means editing
  `photos.ts` and re-running Step 4. If you'd rather click buttons in a browser,
  that means adding a CMS, which is a separate piece of work.

## The other documents

You do not need these to launch. They are here for when you want to know why.

| File                    | What it's for                                            |
| ----------------------- | -------------------------------------------------------- |
| `docs/IMAGES.md`        | Full detail on how images work                           |
| `docs/REQUIREMENTS.md`  | Every requirement, its status, and every decision        |
| `docs/INVENTORY.md`     | What the original draft contained before it was reworked |
| `docs/DESIGN-INTENT.md` | The original look and feel, for reference                |

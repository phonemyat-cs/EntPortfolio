# Design intent

Preserved verbatim from `.lovable/plan/photographer-portfolio-2026-09-16.md`
before that directory was deleted. It is the only written record of what the
draft was _trying_ to look like, which matters when judging whether a later
change is a fix or a regression.

This is a record of intent, not a requirement. `docs/spec.md` is the source of
truth for what the site must do; `docs/REQUIREMENTS.md` tracks it.

---

## Build

- Create a single-page, image-first portfolio with a minimal navigation and a calm, gloomy film aesthetic.
- Place the photographer introduction on the left and a six-image, snap-scrolling gallery on the right that shows one frame at a time.
- Add working multi-category filters for theme, color, location, device, and extras, plus a clear action and result count.
- Build a mixed 16:9 and 4:3 photography grid with subtle captions and image-focused interactions.
- Finish with preset links, social links, and contact information.

## Visual direction

- Muted charcoal, fog gray, faded olive, and warm film-paper tones.
- Editorial serif paired with a restrained sans-serif.
- Grain, fine borders, generous spacing, and subtle fades rather than glossy effects.

## Technical details

- Generate a cohesive set of portfolio photographs and keep them as bundled project assets.
- Implement touch drag, horizontal wheel/trackpad scrolling, snapping, arrows, and pagination for the top gallery.
- Keep filter state in the page and update the visible grid immediately.
- Ensure accessible labels, keyboard controls, responsive navigation, and route-specific social metadata.
- Verify the final page in desktop and mobile-sized browser views.

---

## Where this conflicts with the spec

- **"a mixed 16:9 and 4:3 grid"** — `docs/spec.md` asks for "a mix of 16:9, 4:3, 1:1". The 1:1 ratio is missing from both the plan and the build.
- **"keep them as bundled project assets"** — superseded. Photographs are moving to remote hosting; see `docs/IMAGES.md`.

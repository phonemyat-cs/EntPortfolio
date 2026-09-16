import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";

import { filterOptions, heroPhotos, photos, type FilterKey } from "@/content/photos";
import { site } from "@/content/site";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Rowan Vale — Film & Travel Photography" },
    { name: "description", content: "A quiet archive of film-inspired landscape, street, and architectural photography by Rowan Vale." },
    { property: "og:title", content: "Rowan Vale — Film & Travel Photography" },
    { property: "og:description", content: "A quiet archive of film-inspired landscape, street, and architectural photography." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Portfolio,
});

function Portfolio() {
  const [filters, setFilters] = useState<Partial<Record<FilterKey, string>>>({});
  const [openFilter, setOpenFilter] = useState<FilterKey | null>(null);
  const [slide, setSlide] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const stripRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => photos.filter((photo) => Object.entries(filters).every(([key, value]) => photo[key as FilterKey] === value)), [filters]);
  const moveSlide = (next: number) => {
    const index = (next + heroPhotos.length) % heroPhotos.length;
    setSlide(index);
    stripRef.current?.children[index]?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
  };

  return <main className="film-grain min-h-screen overflow-x-hidden bg-film text-film-foreground">
    <header className="sticky top-0 z-40 border-b border-film-line bg-film/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-5 md:px-10">
        <a href="#top" className="font-display text-xl">Rowan Vale</a>
        <nav className="hidden items-center gap-8 text-xs uppercase text-film-muted md:flex">
          <a className="transition-colors hover:text-film-foreground" href="#archive">Archive</a><a className="transition-colors hover:text-film-foreground" href="#about">About</a><a className="transition-colors hover:text-film-foreground" href="#presets">Presets</a><a className="transition-colors hover:text-film-foreground" href="#contact">Contact</a>
        </nav>
        <button onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu" aria-expanded={menuOpen} className="flex size-9 items-center justify-center border border-film-line text-lg md:hidden">{menuOpen ? "×" : "≡"}</button>
      </div>
      {menuOpen && <nav className="grid border-t border-film-line px-5 py-3 text-sm md:hidden">{["archive", "about", "presets", "contact"].map((item) => <a key={item} href={`#${item}`} onClick={() => setMenuOpen(false)} className="border-b border-film-line py-3 capitalize last:border-0">{item}</a>)}</nav>}
    </header>

    <section id="top" className="mx-auto grid max-w-[1440px] gap-10 px-5 pb-16 pt-12 md:grid-cols-[minmax(280px,0.72fr)_minmax(0,1.28fr)] md:px-10 md:pb-24 md:pt-20">
      <div id="about" className="flex flex-col justify-center md:pr-8">
        <p className="mb-5 text-[10px] uppercase text-film-muted">Independent photographer · Edmonton / anywhere</p>
        <h1 className="max-w-lg font-display text-5xl leading-[0.98] sm:text-6xl">The quiet parts of a place, held on film.</h1>
        <p className="mt-7 max-w-md text-sm leading-7 text-film-muted">I’m Rowan, a photographer drawn to changing weather, overlooked corners, and people moving through them. What began with a borrowed camera became a decade-long practice of walking slowly and noticing more.</p>
        <p className="mt-8 text-xs text-film-muted">Selected work, 2018—2026</p>
      </div>

      <div className="min-w-0">
        <div ref={stripRef} onScroll={(e) => { const el = e.currentTarget; setSlide(Math.round(el.scrollLeft / el.clientWidth)); }} className="no-scrollbar flex aspect-[4/3] w-full snap-x snap-mandatory overflow-x-auto scroll-smooth overscroll-x-contain">
          {heroPhotos.map((src, i) => <figure key={src} className="relative h-full min-w-full snap-start overflow-hidden bg-muted">
            <img src={src} alt={["Figure walking on a misty coast", "Tram on a rain-soaked street", "Clouds over a pine ridge", "Figure in a concrete stairwell", "Still lake at dusk", "Dunes under an overcast sky"][i]} width={i === 2 || i === 4 ? 1600 : 1408} height={i === 2 || i === 4 ? 912 : 1056} className="h-full w-full object-cover" />
            <figcaption className="absolute bottom-0 left-0 right-0 flex justify-between bg-film/75 px-4 py-3 text-[10px] uppercase backdrop-blur-sm"><span>{String(i + 1).padStart(2, "0")} / 06</span><span className="text-film-muted">Drag or scroll</span></figcaption>
          </figure>)}
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex gap-2" aria-label="Gallery pagination">{heroPhotos.map((_, i) => <button key={i} onClick={() => moveSlide(i)} aria-label={`Show photo ${i + 1}`} className={`h-px transition-all ${i === slide ? "w-8 bg-film-accent" : "w-4 bg-film-muted"}`} />)}</div>
          <div className="flex gap-2"><button onClick={() => moveSlide(slide - 1)} aria-label="Previous photo" className="grid size-9 place-items-center border border-film-line transition-colors hover:bg-secondary">←</button><button onClick={() => moveSlide(slide + 1)} aria-label="Next photo" className="grid size-9 place-items-center border border-film-line transition-colors hover:bg-secondary">→</button></div>
        </div>
      </div>
    </section>

    <section id="archive" className="border-y border-film-line bg-card">
      <div className="mx-auto max-w-[1440px] px-5 py-5 md:px-10">
        <div className="flex items-center justify-between"><p className="text-[10px] uppercase text-film-muted">Filter archive</p><button onClick={() => setFilters({})} disabled={!Object.keys(filters).length} className="text-xs text-film-accent disabled:opacity-30">Clear filters</button></div>
        <div className="mt-4 flex flex-wrap gap-2">
          {(Object.keys(filterOptions) as FilterKey[]).map((key) => <div key={key} className="relative">
            <button onClick={() => setOpenFilter(openFilter === key ? null : key)} aria-expanded={openFilter === key} className={`border px-3 py-2 text-xs capitalize transition-colors ${filters[key] ? "border-film-accent bg-accent text-accent-foreground" : "border-film-line hover:border-film-muted"}`}>{key}{filters[key] ? ` · ${filters[key]}` : " +"}</button>
            {openFilter === key && <div className="absolute left-0 top-full z-30 mt-2 min-w-44 border border-film-line bg-popover p-1 shadow-2xl">{filterOptions[key].map((option) => <button key={option} onClick={() => { setFilters((f) => ({ ...f, [key]: option })); setOpenFilter(null); }} className="block w-full px-3 py-2 text-left text-xs hover:bg-secondary">{option}</button>)}</div>}
          </div>)}
          <span className="ml-auto self-center text-[10px] text-film-muted">{filtered.length} {filtered.length === 1 ? "frame" : "frames"}</span>
        </div>
      </div>
    </section>

    <section className="mx-auto max-w-[1440px] px-5 py-12 md:px-10 md:py-20">
      {filtered.length ? <div className="grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">{filtered.map((photo, i) => <article key={photo.title} className={photo.ratio === "wide" && i % 3 === 0 ? "sm:col-span-2" : ""}>
        <div className={`group overflow-hidden bg-muted ${photo.ratio === "wide" ? "aspect-video" : "aspect-[4/3]"}`}><img loading="lazy" src={photo.src} alt={photo.title} width={photo.width} height={photo.height} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.025]" /></div>
        <div className="mt-3 flex items-start justify-between gap-4"><h2 className="font-display text-xl">{photo.title}</h2><p className="text-right text-[10px] leading-5 text-film-muted">{photo.location}<br />{photo.device}</p></div>
      </article>)}</div> : <div className="py-24 text-center"><p className="font-display text-3xl">No frames meet in this light.</p><button onClick={() => setFilters({})} className="mt-5 border-b border-film-accent pb-1 text-xs text-film-accent">Reset the archive</button></div>}
    </section>

    <footer id="contact" className="border-t border-film-line bg-card">
      <div className="mx-auto grid max-w-[1440px] gap-12 px-5 py-16 md:grid-cols-2 md:px-10 md:py-24">
        <div><p className="text-[10px] uppercase text-film-muted">Commissions & conversation</p><h2 className="mt-4 max-w-xl font-display text-4xl sm:text-5xl">Have a place, story, or feeling worth keeping?</h2><a href={`mailto:${site.email}`} className="mt-8 inline-block border-b border-film-accent pb-1 text-sm text-film-accent">{site.email}</a></div>
        <div id="presets" className="grid grid-cols-2 gap-8 md:justify-self-end md:gap-16"><div><p className="mb-4 text-[10px] uppercase text-film-muted">Film presets</p><a href="#" className="block py-1 text-sm hover:text-film-accent">Quiet Weather ↗</a><a href="#" className="block py-1 text-sm hover:text-film-accent">After Rain ↗</a><a href="#" className="block py-1 text-sm hover:text-film-accent">Full collection ↗</a></div><div><p className="mb-4 text-[10px] uppercase text-film-muted">Elsewhere</p><a href={site.instagram.url} rel="me noopener" target="_blank" className="block py-1 text-sm hover:text-film-accent">Instagram {site.instagram.handle} ↗</a></div></div>
      </div>
      <div className="mx-auto flex max-w-[1440px] justify-between border-t border-film-line px-5 py-5 text-[10px] text-film-muted md:px-10"><span>© {new Date().getFullYear()} {site.name}</span><a href="#top">Back to top ↑</a></div>
    </footer>
  </main>;
}
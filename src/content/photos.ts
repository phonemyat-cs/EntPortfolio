import coastWalker from "@/assets/coast-walker.jpg";
import coastalCabin from "@/assets/coastal-cabin.jpg";
import concreteStairs from "@/assets/concrete-stairs.jpg";
import nightCyclist from "@/assets/night-cyclist.jpg";
import paleDunes from "@/assets/pale-dunes.jpg";
import pineRidge from "@/assets/pine-ridge.jpg";
import stillLake from "@/assets/still-lake.jpg";
import tramLines from "@/assets/tram-lines.jpg";

/**
 * The archive.
 *
 * PLACEHOLDER CONTENT. These are generated images, not photographs. Every
 * location, camera, caption, preset and description below is invented — nobody
 * went to Vík or the Dolomites with a Leica, and none of these presets exist.
 * The real photographs are in `photos-source/` and are not wired up yet.
 * Tracked as a content gap in docs/REQUIREMENTS.md (C4).
 */

/** Aspect ratios the grid lays out. docs/spec.md asks for all three. */
export type Ratio = "wide" | "standard" | "square";

/** Filterable attributes, per docs/spec.md §Image → Attributes. */
export type FilterKey = "theme" | "color" | "location" | "device" | "preset" | "tripTag" | "extras";

export type Photo = {
  /** Stable identifier, independent of the filename. Used as the React key. */
  id: string;
  src: string;
  /** Caption shown under the image. Not a description of it — never use as alt. */
  title: string;
  /**
   * What the picture actually shows, for screen readers.
   * Must describe the image, not repeat the caption.
   */
  alt: string;
  theme: string;
  color: string;
  location: string;
  device: string;
  /** Which preset was applied; also groups the photo into that collection. */
  preset: string;
  /** Which trip this came from. Optional, per the spec. */
  tripTag?: string;
  extras: string;
  ratio: Ratio;
  /** Intrinsic pixel dimensions, so the browser reserves space before load. */
  width: number;
  height: number;
};

export const photos: Photo[] = [
  {
    id: "pine-ridge",
    src: pineRidge,
    title: "Weather Moving In",
    alt: "Low cloud breaking over a ridge of dark pines.",
    theme: "Landscape",
    color: "Cool",
    location: "Dolomites",
    device: "Leica Q2",
    preset: "Quiet Weather",
    tripTag: "Alps 2024",
    extras: "Film grain",
    ratio: "wide",
    width: 1600,
    height: 912,
  },
  {
    id: "concrete-stairs",
    src: concreteStairs,
    title: "Between Floors",
    alt: "A lone figure descending a concrete stairwell, seen from above.",
    theme: "Architecture",
    color: "Monochrome",
    location: "London",
    device: "Fuji X100V",
    preset: "Hard Light",
    extras: "People",
    ratio: "square",
    width: 1408,
    height: 1056,
  },
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
  {
    id: "tram-lines",
    src: tramLines,
    title: "The Night Tram",
    alt: "A tram crossing a rain-soaked street under blue evening light.",
    theme: "Street",
    color: "Blue hour",
    location: "Prague",
    device: "Sony A7R",
    preset: "After Rain",
    tripTag: "Central Europe 2025",
    extras: "Rain",
    ratio: "standard",
    width: 1408,
    height: 1056,
  },
  {
    id: "still-lake",
    src: stillLake,
    title: "One Light Left",
    alt: "A still lake at dusk with a single lit window on the far shore.",
    theme: "Landscape",
    color: "Cool",
    location: "Canada",
    device: "Sony A7R",
    preset: "Quiet Weather",
    extras: "Long exposure",
    ratio: "wide",
    width: 1600,
    height: 912,
  },
  {
    id: "pale-dunes",
    src: paleDunes,
    title: "A Soft Horizon",
    alt: "Pale dunes fading into an overcast sky with no visible horizon.",
    theme: "Landscape",
    color: "Warm",
    location: "Namibia",
    device: "Leica Q2",
    preset: "Warm Paper",
    extras: "Film grain",
    ratio: "standard",
    width: 1408,
    height: 1056,
  },
  {
    id: "night-cyclist",
    src: nightCyclist,
    title: "Home Through Rain",
    alt: "A cyclist crossing an empty street in the rain, lit from behind.",
    theme: "Street",
    color: "Warm",
    location: "Berlin",
    device: "Fuji X100V",
    preset: "After Rain",
    tripTag: "Central Europe 2025",
    extras: "Rain",
    ratio: "wide",
    width: 1600,
    height: 912,
  },
  {
    id: "coastal-cabin",
    src: coastalCabin,
    title: "Shelter, North",
    alt: "A small dark cabin on a bare headland above a grey sea.",
    theme: "Architecture",
    color: "Cool",
    location: "Norway",
    device: "Sony A7R",
    preset: "Quiet Weather",
    tripTag: "Iceland 2025",
    extras: "Film grain",
    ratio: "square",
    width: 1408,
    height: 1056,
  },
];

const byId = new Map(photos.map((photo) => [photo.id, photo]));

/**
 * The six frames in the hero strip, in order.
 *
 * Referenced by id rather than by importing the assets a second time, so the
 * hero reads its alt text and dimensions from the same record the grid does.
 */
export const heroPhotos: Photo[] = [
  "coast-walker",
  "tram-lines",
  "pine-ridge",
  "concrete-stairs",
  "still-lake",
  "pale-dunes",
].flatMap((id) => {
  const photo = byId.get(id);
  return photo ? [photo] : [];
});

/** Label for each filter dimension, since some keys do not read as prose. */
export const filterLabels: Record<FilterKey, string> = {
  theme: "theme",
  color: "color",
  location: "location",
  device: "device",
  preset: "preset",
  tripTag: "trip",
  extras: "extras",
};

/**
 * Filter options, derived from the photos rather than hand-listed.
 *
 * The hand-written list this replaces had already drifted: "Dolomites" and
 * "Namibia" were photo locations with no matching option, so two of the eight
 * photographs could not be reached through the location filter at all.
 */
export const filterOptions: Record<FilterKey, string[]> = Object.fromEntries(
  (Object.keys(filterLabels) as FilterKey[]).map((key) => [
    key,
    [...new Set(photos.map((photo) => photo[key]).filter((v): v is string => Boolean(v)))].sort(),
  ]),
) as Record<FilterKey, string[]>;

/** Presets that have at least one photograph, most-used first. */
export const presetCollections: { name: string; count: number }[] = filterOptions.preset
  .map((name) => ({ name, count: photos.filter((photo) => photo.preset === name).length }))
  .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

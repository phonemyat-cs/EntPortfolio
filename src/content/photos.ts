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
 * location, camera and caption below is invented — nobody went to Vík or the
 * Dolomites with a Leica. The real photographs are in `photos-source/` and are
 * not wired up yet. Tracked as a content gap in docs/REQUIREMENTS.md (C4).
 */

export type FilterKey = "theme" | "color" | "location" | "device" | "extras";

export type Photo = {
  src: string;
  title: string;
  theme: string;
  color: string;
  location: string;
  device: string;
  extras: string;
  ratio: "wide" | "standard";
  width: number;
  height: number;
};

export const photos: Photo[] = [
  {
    src: pineRidge,
    title: "Weather Moving In",
    theme: "Landscape",
    color: "Cool",
    location: "Dolomites",
    device: "Leica Q2",
    extras: "Film grain",
    ratio: "wide",
    width: 1600,
    height: 912,
  },
  {
    src: concreteStairs,
    title: "Between Floors",
    theme: "Architecture",
    color: "Monochrome",
    location: "London",
    device: "Fuji X100V",
    extras: "People",
    ratio: "standard",
    width: 1408,
    height: 1056,
  },
  {
    src: coastWalker,
    title: "Last Light, Vík",
    theme: "Landscape",
    color: "Cool",
    location: "Iceland",
    device: "Leica Q2",
    extras: "People",
    ratio: "standard",
    width: 1408,
    height: 1056,
  },
  {
    src: tramLines,
    title: "The Night Tram",
    theme: "Street",
    color: "Blue hour",
    location: "Prague",
    device: "Sony A7R",
    extras: "Rain",
    ratio: "standard",
    width: 1408,
    height: 1056,
  },
  {
    src: stillLake,
    title: "One Light Left",
    theme: "Landscape",
    color: "Cool",
    location: "Canada",
    device: "Sony A7R",
    extras: "Long exposure",
    ratio: "wide",
    width: 1600,
    height: 912,
  },
  {
    src: paleDunes,
    title: "A Soft Horizon",
    theme: "Landscape",
    color: "Warm",
    location: "Namibia",
    device: "Leica Q2",
    extras: "Film grain",
    ratio: "standard",
    width: 1408,
    height: 1056,
  },
  {
    src: nightCyclist,
    title: "Home Through Rain",
    theme: "Street",
    color: "Warm",
    location: "Berlin",
    device: "Fuji X100V",
    extras: "Rain",
    ratio: "wide",
    width: 1600,
    height: 912,
  },
  {
    src: coastalCabin,
    title: "Shelter, North",
    theme: "Architecture",
    color: "Cool",
    location: "Norway",
    device: "Sony A7R",
    extras: "Film grain",
    ratio: "standard",
    width: 1408,
    height: 1056,
  },
];

export const heroPhotos = [coastWalker, tramLines, pineRidge, concreteStairs, stillLake, paleDunes];

export const filterOptions: Record<FilterKey, string[]> = {
  theme: ["Landscape", "Street", "Architecture"],
  color: ["Cool", "Warm", "Monochrome", "Blue hour"],
  location: ["Iceland", "Prague", "Norway", "Canada"],
  device: ["Leica Q2", "Fuji X100V", "Sony A7R"],
  extras: ["Film grain", "People", "Rain", "Long exposure"],
};

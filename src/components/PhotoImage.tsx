import { buildSrcSet, imageFormats, imageSrc } from "@/content/images";
import type { Photo } from "@/content/photos";

type Props = {
  photo: Photo;
  /** How wide the image will be laid out. See gridSizes / heroSizes. */
  sizes: string;
  className?: string;
  /**
   * The one image above the fold. Loads eagerly at high priority; everything
   * else is lazy. Exactly one image on the page should set this.
   */
  priority?: boolean;
};

/**
 * One photograph, with its responsive variants.
 *
 * Emits a <picture> so the browser picks AVIF, then WebP, then the JPEG in the
 * <img>. When no image host is configured the srcsets are undefined and this
 * degrades to a plain <img> pointing at the bundled asset — which is what
 * makes a clean clone build and run with no credentials.
 */
export function PhotoImage({ photo, sizes, className, priority = false }: Props) {
  const loading = priority ? "eager" : "lazy";

  return (
    <picture>
      {imageFormats.map((format) => {
        const srcSet = buildSrcSet(photo.id, format);
        return srcSet ? (
          <source key={format} type={`image/${format}`} srcSet={srcSet} sizes={sizes} />
        ) : null;
      })}
      <img
        src={imageSrc(photo.id, photo.src)}
        srcSet={buildSrcSet(photo.id, "jpg")}
        sizes={sizes}
        alt={photo.alt}
        width={photo.width}
        height={photo.height}
        loading={loading}
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
        className={className}
      />
    </picture>
  );
}

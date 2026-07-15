import React, { useState, useEffect, useRef } from 'react';
import ImageLightbox from '../ImageLightbox/ImageLightbox';
import styles from './ImageSlideshow.module.css';

/**
 * ImageSlideshow
 * Props:
 *  - images: string[]   Array of image URLs/paths (max 10)
 *  - fallback: string   URL to show when images is empty
 *  - alt: string
 *  - interval: number   ms between slides, default 5000
 *  - className: string  extra class on wrapper
 *  - enableZoom: bool    opt-in: clicking a slide opens a fullscreen lightbox.
 *                        Only set this on detail-view usages — listing/card
 *                        usages rely on click passing through to open the card's
 *                        own detail modal, and zoom would swallow that click.
 *  - contentType: string  "Package" | "Destination" | "Festival" | "Itinerary" | "Service"
 *                         — when provided (with contentId) alongside enableZoom,
 *                         the lightbox also shows a per-image comment thread.
 *  - contentId: string    Mongo _id of the content item the images belong to.
 */
const ImageSlideshow = ({ images = [], fallback, alt = 'Image', interval = 5000, className = '', enableZoom = false, contentType, contentId }) => {
  const [current, setCurrent] = useState(0);
  const [errors, setErrors]   = useState({});  // track per-index load errors
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const timerRef = useRef(null);

  // Normalise: combine images with fallback
  const BASE_URL = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace('/api', '')
    : '';

  const resolveUrl = (src) => {
    if (!src) return null;
    if (src.startsWith('http') || src.startsWith('//')) return src;
    // local upload path like /uploads/image-xxx.jpg
    return `${BASE_URL}${src}`;
  };

  const allImages = images.length > 0
    ? images.map(resolveUrl).filter(Boolean)
    : fallback ? [resolveUrl(fallback)].filter(Boolean) : [];

  // Filter out images that errored
  const validImages = allImages.filter((_, i) => !errors[i]);
  const count = validImages.length;

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (count > 1 && !lightboxOpen) {
      timerRef.current = setInterval(() => {
        setCurrent((prev) => (prev + 1) % count);
      }, interval);
    }
  };

  useEffect(() => {
    setCurrent(0);
    startTimer();
    return () => clearInterval(timerRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allImages.join(','), interval, Object.keys(errors).length]);

  // Pause/resume auto-advance while the lightbox is open so the background
  // carousel can't change `current` (and yank the lightbox to another image)
  // while the user is viewing/commenting on a specific photo.
  useEffect(() => {
    if (lightboxOpen) {
      clearInterval(timerRef.current);
    } else {
      startTimer();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightboxOpen]);

  const goTo = (idx) => {
    setCurrent(idx);
    startTimer(); // reset timer on manual nav
  };

  const prev = (e) => { e && e.stopPropagation(); goTo((current - 1 + count) % count); };
  const next = (e) => { e && e.stopPropagation(); goTo((current + 1) % count); };

  if (count === 0) {
    return (
      <div className={`${styles.wrapper} ${className}`}>
        <div className={styles.placeholder}>
          <i className="fas fa-image" />
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.wrapper} ${className}`}>
      {/* Slides — use eager loading so every slide is ready for the transition */}
      {validImages.map((src, i) => {
        const origIdx = allImages.indexOf(src);
        return (
          <img
            key={i}
            src={src}
            alt={`${alt} ${i + 1}`}
            className={`${styles.slide} ${i === current ? styles.slideActive : ''} ${enableZoom ? styles.zoomable : ''}`}
            loading="eager"
            onError={() => setErrors((prev) => ({ ...prev, [origIdx]: true }))}
            onClick={enableZoom ? (e) => { e.stopPropagation(); setLightboxOpen(true); } : undefined}
          />
        );
      })}

      {/* Arrows (only when multiple) */}
      {count > 1 && (
        <>
          <button className={`${styles.arrow} ${styles.arrowLeft}`} onClick={prev} aria-label="Previous">
            <i className="fas fa-chevron-left" />
          </button>
          <button className={`${styles.arrow} ${styles.arrowRight}`} onClick={next} aria-label="Next">
            <i className="fas fa-chevron-right" />
          </button>
        </>
      )}

      {/* Dots */}
      {count > 1 && (
        <div className={styles.dots}>
          {allImages.map((_, i) => (
            <button
              key={i}
              className={`${styles.dot} ${i === current ? styles.dotActive : ''}`}
              onClick={(e) => { e.stopPropagation(); goTo(i); }}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* Counter badge */}
      {count > 1 && (
        <span className={styles.counter}>{current + 1}/{count}</span>
      )}

      {enableZoom && lightboxOpen && (
        <ImageLightbox
          images={validImages}
          startIndex={current}
          alt={alt}
          contentType={contentType}
          contentId={contentId}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
};

export default ImageSlideshow;

import React, { useState, useEffect, useRef } from 'react';
import styles from './ImageSlideshow.module.css';

/**
 * ImageSlideshow
 * Props:
 *  - images: string[]   Array of image URLs/paths (max 10)
 *  - fallback: string   URL to show when images is empty
 *  - alt: string
 *  - interval: number   ms between slides, default 5000
 *  - className: string  extra class on wrapper
 */
const ImageSlideshow = ({ images = [], fallback, alt = 'Image', interval = 5000, className = '' }) => {
  const [current, setCurrent] = useState(0);
  const [errors, setErrors]   = useState({});  // track per-index load errors
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
    if (count > 1) {
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
            className={`${styles.slide} ${i === current ? styles.slideActive : ''}`}
            loading="eager"
            onError={() => setErrors((prev) => ({ ...prev, [origIdx]: true }))}
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
    </div>
  );
};

export default ImageSlideshow;

import React, { useEffect, useState } from "react";
import styles from "./BackendWakeup.module.css";

const HEALTH_URL =
  (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "") + "/health";

const POLL_INTERVAL = 3000; // ms between retries
const MAX_WAIT = 90000;     // 90s timeout

export default function BackendWakeup({ children }) {
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(true); // for fade-out
  const [dots, setDots] = useState(".");
  const [elapsed, setElapsed] = useState(0);

  // Animated dots
  useEffect(() => {
    const id = setInterval(
      () => setDots((d) => (d.length >= 3 ? "." : d + ".")),
      500
    );
    return () => clearInterval(id);
  }, []);

  // Elapsed seconds counter
  useEffect(() => {
    if (ready) return;
    const id = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [ready]);

  // Poll backend health
  useEffect(() => {
    let cancelled = false;
    const start = Date.now();

    const ping = async () => {
      try {
        const res = await fetch(HEALTH_URL, { method: "GET", cache: "no-store" });
        if (res.ok && !cancelled) {
          // fade out then unmount loader
          setReady(true);
          setTimeout(() => setVisible(false), 600);
          return;
        }
      } catch {
        // backend not ready yet – keep polling
      }

      if (!cancelled && Date.now() - start < MAX_WAIT) {
        setTimeout(ping, POLL_INTERVAL);
      } else if (!cancelled) {
        // Timeout: let the app load anyway, requests will fail gracefully
        setReady(true);
        setTimeout(() => setVisible(false), 600);
      }
    };

    ping();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      {!ready || visible ? (
        <div className={`${styles.overlay} ${ready ? styles.fadeOut : ""}`}>
          {/* Decorative blobs */}
          <div className={styles.blob1} />
          <div className={styles.blob2} />

          <div className={styles.card}>
            {/* Logo / brand */}
            <div className={styles.logoRow}>
              <svg className={styles.planeIcon} viewBox="0 0 24 24" fill="none">
                <path
                  d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0 0 11.5 2 1.5 1.5 0 0 0 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"
                  fill="currentColor"
                />
              </svg>
              <span className={styles.brand}>ITravelz</span>
            </div>

            {/* Spinner ring */}
            <div className={styles.spinnerWrap}>
              <div className={styles.ring} />
              <div className={styles.ringInner} />
            </div>

            {/* Message */}
            <p className={styles.title}>Серверийг асааж байна{dots}</p>
            <p className={styles.subtitle}>
              Render.com дээрх серверийг сэрээж байна, түр хүлээнэ үү.
            </p>

            {/* Elapsed */}
            <div className={styles.elapsed}>
              <span>{elapsed}с өнгөрлөө</span>
            </div>

            {/* Progress bar */}
            <div className={styles.progressTrack}>
              <div
                className={styles.progressBar}
                style={{
                  width: `${Math.min((elapsed / 60) * 100, 95)}%`,
                }}
              />
            </div>

            {/* Step dots */}
            <div className={styles.steps}>
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className={`${styles.step} ${elapsed > i * 5 ? styles.stepActive : ""}`}
                />
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {/* Render children behind loader so they're ready on fade-out */}
      <div
        style={{
          visibility: visible && !ready ? "hidden" : "visible",
          opacity: visible && !ready ? 0 : 1,
          transition: "opacity 0.4s ease",
        }}
      >
        {children}
      </div>
    </>
  );
}

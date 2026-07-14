"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "warborn:intro-seen";

function rememberIntro() {
  try {
    window.localStorage.setItem(STORAGE_KEY, "1");
  } catch {
    // The animation still works when storage is unavailable.
  }
}

export function OpeningCinematic() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(STORAGE_KEY) === "1") {
        const hideTimer = window.setTimeout(() => setVisible(false), 0);
        return () => window.clearTimeout(hideTimer);
      }
    } catch {
      // Continue without persistence when storage is unavailable.
    }

    document.body.classList.add("intro-active");
    const duration = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 700 : 6500;
    const timer = window.setTimeout(() => {
      rememberIntro();
      document.body.classList.remove("intro-active");
      setVisible(false);
    }, duration);

    return () => {
      window.clearTimeout(timer);
      document.body.classList.remove("intro-active");
    };
  }, []);

  function dismiss() {
    rememberIntro();
    document.body.classList.remove("intro-active");
    setVisible(false);
  }

  if (!visible) return null;

  return <div className="opening-cinematic" role="dialog" aria-modal="true" aria-label="Warborn opening">
    <div className="opening-scene" aria-hidden="true" />
    <div className="opening-vignette" aria-hidden="true" />
    <div className="opening-embers" aria-hidden="true">
      {Array.from({ length: 12 }, (_, index) => <span key={index} />)}
    </div>
    <div className="opening-lockup">
      <span className="opening-ornament" aria-hidden="true"><i /></span>
      <small>THE WAR HAS AWAKENED</small>
      <strong>WARBORN</strong>
      <p>Choose your allegiance. Forge your legend.</p>
      <span className="opening-rule" aria-hidden="true" />
    </div>
    <button type="button" className="opening-skip" onClick={dismiss}>Skip intro</button>
  </div>;
}

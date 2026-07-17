import { useEffect, useState } from "react";

const STORAGE_KEY = "soccer-dashboard-ui-scale";
const MIN_SCALE = 0.8;
const MAX_SCALE = 1.6;
const STEP = 0.1;
const DEFAULT_SCALE = 1;

function loadInitialScale() {
  try {
    const saved = Number(localStorage.getItem(STORAGE_KEY));
    if (saved >= MIN_SCALE && saved <= MAX_SCALE) return saved;
  } catch {
    // localStorage unavailable (private mode / blocked cookies) — use default
  }
  return DEFAULT_SCALE;
}

export function useUiScale() {
  const [scale, setScale] = useState(loadInitialScale);

  useEffect(() => {
    document.documentElement.style.fontSize = `${16 * scale}px`;
    try {
      localStorage.setItem(STORAGE_KEY, String(scale));
    } catch {
      // storage unavailable/full — zoom still works for this session
    }
  }, [scale]);

  function zoomIn() {
    setScale((s) => Math.min(MAX_SCALE, Math.round((s + STEP) * 10) / 10));
  }

  function zoomOut() {
    setScale((s) => Math.max(MIN_SCALE, Math.round((s - STEP) * 10) / 10));
  }

  return { scale, zoomIn, zoomOut, minScale: MIN_SCALE, maxScale: MAX_SCALE };
}

"use client";

import { useEffect } from "react";

export default function ParallaxRig() {
  useEffect(() => {
    const root = document.documentElement;

    let raf = 0;
    let targetX = 0.5;
    let targetY = 0.5;
    let curX = 0.5;
    let curY = 0.5;

    const onMove = (e) => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      targetX = x;
      targetY = y;

      if (!raf) {
        raf = requestAnimationFrame(tick);
      }
    };

    const tick = () => {
      raf = 0;
      // smoothing (lerp)
      curX += (targetX - curX) * 0.08;
      curY += (targetY - curY) * 0.08;

      root.style.setProperty("--mx", String(curX));
      root.style.setProperty("--my", String(curY));
    };

    // init
    root.style.setProperty("--mx", "0.5");
    root.style.setProperty("--my", "0.5");

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return null;
}

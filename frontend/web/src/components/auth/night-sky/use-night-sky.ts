"use client";

import { useEffect, type RefObject } from "react";
import { ORION_LINKS, ORION_STARS } from "@/components/marketing/hero/constellation-data";
import { sky } from "./signal";
import { TAU, clamp01, drawDust, drawLinks, drawShockwave, drawStar, easeOut, spark, AURORA, type Dust, type Pt } from "./draw";

/**
 * Canvas engine for the auth night sky. The Orion figure is charted faintly; as the
 * form fills in, its links connect one by one (each star is a legal domain), a comet
 * circles it while signing in, it flashes ember on an error and ignites on success.
 * Reduced motion: no twinkle, parallax or comets, but the figure still reflects progress.
 */
export function useNightSky(canvasRef: RefObject<HTMLCanvasElement | null>) {
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mono = getComputedStyle(document.documentElement).getPropertyValue("--font-geist-mono").trim() || "monospace";
    const start = performance.now();
    const pointer = { x: -9999, y: -9999, tx: 0, ty: 0, px: 0, py: 0, active: false };
    let w = 0;
    let h = 0;
    let dust: Dust[] = [];
    let lit = 0; // eased number of connected links
    let raf = 0;
    let shoot: { x: number; y: number; vx: number; vy: number; life: number } | null = null;
    let nextShoot = start + 2500;

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas!.width = Math.round(w * dpr);
      canvas!.height = Math.round(h * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(420, Math.floor((w * h) / 2600));
      dust = Array.from({ length: count }, () => ({
        x: Math.random(),
        y: Math.random(),
        r: Math.random() < 0.07 ? 1 + Math.random() * 0.8 : 0.25 + Math.random() * 0.6,
        depth: 0.2 + Math.random() * 0.8,
        phase: Math.random() * TAU,
        speed: 0.5 + Math.random() * 1.6,
      }));
    }

    function draw(now: number) {
      const t = still ? 100 : (now - start) / 1000;
      const s = sky.get();
      const wide = w >= 520;
      if (!still) {
        pointer.px += (pointer.tx - pointer.px) * 0.05;
        pointer.py += (pointer.ty - pointer.py) * 0.05;
      }
      ctx!.clearRect(0, 0, w, h);
      drawDust(ctx!, dust, w, h, t, pointer.px, pointer.py, still);

      const target = s.mood === "success" ? ORION_LINKS.length : s.progress * ORION_LINKS.length;
      lit = still ? target : lit + (target - lit) * 0.08;

      // Desktop: centred above the headline. Mobile banner: tucked top-right, clear of the headline.
      const size = wide ? Math.min(w * 0.62, h * 0.56) : Math.min(w * 0.5, h * 0.72);
      const ox = wide ? w / 2 - size / 2 : w - size - w * 0.07;
      const oy = wide ? h * 0.47 - size / 2 : h * 0.1;
      const pts: Pt[] = ORION_STARS.map((st) => ({
        ...st,
        px: ox + st.x * size - pointer.px * 30,
        py: oy + st.y * size - pointer.py * 20,
      }));

      drawLinks(ctx!, pts, s, lit, t, now);

      // Pointer reaches out to nearby stars.
      if (pointer.active && !still) {
        for (const p of pts) {
          const d = Math.hypot(p.px - pointer.x, p.py - pointer.y);
          if (d > 220) continue;
          ctx!.globalAlpha = (1 - d / 220) * 0.5;
          ctx!.strokeStyle = "rgba(25,211,174,0.9)";
          ctx!.beginPath();
          ctx!.moveTo(pointer.x, pointer.y);
          ctx!.lineTo(p.px, p.py);
          ctx!.stroke();
        }
      }

      const litStars = new Set<number>();
      ORION_LINKS.forEach(([a, z], i) => {
        if (lit - i >= 0.98) litStars.add(a).add(z);
      });
      const age = now - s.moodAt;
      const flare = s.mood === "success" && !still ? Math.max(0, 1 - age / 900) : 0;
      const error = s.mood === "error" && age < 700 && (still || Math.sin(age / 40) > -0.3);
      pts.forEach((p, i) => {
        const near = pointer.active ? clamp01(1 - Math.hypot(p.px - pointer.x, p.py - pointer.y) / 150) : 0;
        drawStar(ctx!, p, i, {
          appear: still ? 1 : easeOut(clamp01((t - 0.15 - i * 0.12) / 0.7)),
          lit: litStars.has(i),
          near,
          t,
          still,
          labels: wide,
          flare,
          mono,
          error,
        });
      });
      if (s.mood === "success" && !still) drawShockwave(ctx!, w / 2, oy + size / 2, age, Math.max(w, h) * 0.75);

      if (!still) {
        if (!shoot && now > nextShoot) {
          shoot = { x: w * (0.4 + Math.random() * 0.6), y: h * Math.random() * 0.3, vx: -(6 + Math.random() * 4), vy: 2.4 + Math.random() * 2, life: 1 };
          nextShoot = now + 4500 + Math.random() * 6000;
        }
        if (shoot) {
          const tail = ctx!.createLinearGradient(shoot.x, shoot.y, shoot.x - shoot.vx * 16, shoot.y - shoot.vy * 16);
          tail.addColorStop(0, "rgba(233,255,248,0.9)");
          tail.addColorStop(1, "rgba(233,255,248,0)");
          ctx!.globalAlpha = shoot.life;
          ctx!.strokeStyle = tail;
          ctx!.lineWidth = 1.3;
          ctx!.beginPath();
          ctx!.moveTo(shoot.x, shoot.y);
          ctx!.lineTo(shoot.x - shoot.vx * 16, shoot.y - shoot.vy * 16);
          ctx!.stroke();
          ctx!.lineWidth = 1;
          spark(ctx!, shoot.x, shoot.y, 1.2, AURORA, shoot.life);
          shoot.x += shoot.vx;
          shoot.y += shoot.vy;
          shoot.life -= 0.016;
          if (shoot.life <= 0) shoot = null;
        }
      }
      ctx!.globalAlpha = 1;
    }

    function loop(now: number) {
      draw(now);
      raf = document.hidden ? 0 : requestAnimationFrame(loop);
    }
    function resume() {
      if (!raf && !document.hidden) raf = requestAnimationFrame(loop);
    }
    function onPointerMove(e: PointerEvent) {
      const rect = canvas!.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      pointer.tx = clamp01(pointer.x / w) * 2 - 1;
      pointer.ty = clamp01(pointer.y / h) * 2 - 1;
      pointer.active = e.pointerType === "mouse" && pointer.x >= 0 && pointer.x <= w && pointer.y >= 0 && pointer.y <= h;
    }

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("visibilitychange", resume);
    resize();
    resume();
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("visibilitychange", resume);
    };
  }, [canvasRef]);
}

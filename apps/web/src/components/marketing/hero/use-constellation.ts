"use client";

import { useEffect, type RefObject } from "react";
import { ORION_LINKS, ORION_STARS } from "./constellation-data";

type DustStar = { x: number; y: number; r: number; depth: number; phase: number; speed: number };
type Shooting = { x: number; y: number; vx: number; vy: number; life: number };

const TAU = Math.PI * 2;
const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const easeOut = (n: number) => 1 - Math.pow(1 - n, 3);
const rgba = ([r, g, b]: [number, number, number], a: number) => `rgba(${r},${g},${b},${a})`;

/**
 * Canvas engine for the hero sky: parallax star dust, the Orion constellation
 * drawing itself in, domain labels, pointer "connections" and the odd
 * shooting star. Drawn as ink on paper, like a star chart. Pauses off-screen; renders one still frame for reduced motion.
 */
export function useConstellation(canvasRef: RefObject<HTMLCanvasElement | null>) {
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mono = getComputedStyle(document.documentElement).getPropertyValue("--font-geist-mono").trim() || "monospace";

    let w = 0;
    let h = 0;
    let dust: DustStar[] = [];
    let shooting: Shooting | null = null;
    let nextShoot = performance.now() + 3500;
    const start = performance.now();
    const pointer = { x: -9999, y: -9999, tx: 0, ty: 0, px: 0, py: 0, active: false };
    let raf = 0;
    let visible = true;

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas!.width = Math.round(w * dpr);
      canvas!.height = Math.round(h * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.min(360, Math.floor((w * h) / 4200));
      dust = Array.from({ length: count }, () => ({
        x: Math.random(),
        y: Math.random(),
        r: Math.random() < 0.08 ? 1.1 + Math.random() * 0.7 : 0.3 + Math.random() * 0.7,
        depth: 0.2 + Math.random() * 0.8,
        phase: Math.random() * TAU,
        speed: 0.6 + Math.random() * 1.8,
      }));
      if (reduced) draw(performance.now() + 10_000);
    }

    /** Where the constellation sits: right half on desktop, a faint crown on mobile. */
    function box() {
      const desktop = w >= 1024;
      const size = desktop ? Math.min(w * 0.38, h * 0.74) : Math.min(w * 0.9, h * 0.42);
      return {
        desktop,
        size,
        x: desktop ? w * 0.75 - size / 2 : w / 2 - size / 2,
        y: desktop ? h * 0.5 - size / 2 : h * 0.06,
      };
    }

    function draw(now: number) {
      const t = (now - start) / 1000;
      pointer.px += (pointer.tx - pointer.px) * 0.05;
      pointer.py += (pointer.ty - pointer.py) * 0.05;
      ctx!.clearRect(0, 0, w, h);

      // Star dust with depth-based parallax.
      ctx!.fillStyle = "#0c1a17";
      for (const s of dust) {
        const twinkle = reduced ? 0.8 : 0.55 + 0.45 * Math.sin(t * s.speed + s.phase);
        ctx!.globalAlpha = twinkle * (0.06 + s.depth * 0.2);
        ctx!.beginPath();
        ctx!.arc(s.x * w - pointer.px * 22 * s.depth, s.y * h - pointer.py * 14 * s.depth, s.r, 0, TAU);
        ctx!.fill();
      }

      const b = box();
      const strength = b.desktop ? 1 : 0.55;
      const pts = ORION_STARS.map((s) => ({
        ...s,
        px: b.x + s.x * b.size - pointer.px * 34,
        py: b.y + s.y * b.size - pointer.py * 22,
      }));

      // Constellation lines draw in one after another.
      const lineT = reduced ? 1 : clamp01((t - 0.6) / 2.4);
      ctx!.lineWidth = 1;
      ORION_LINKS.forEach(([a, z], i) => {
        const local = easeOut(clamp01((lineT - (i / ORION_LINKS.length) * 0.6) / 0.4));
        if (local <= 0) return;
        const A = pts[a];
        const Z = pts[z];
        const grad = ctx!.createLinearGradient(A.px, A.py, Z.px, Z.py);
        grad.addColorStop(0, "rgba(8,122,101,0.6)");
        grad.addColorStop(1, "rgba(8,122,101,0.2)");
        ctx!.globalAlpha = strength;
        ctx!.strokeStyle = grad;
        ctx!.beginPath();
        ctx!.moveTo(A.px, A.py);
        ctx!.lineTo(A.px + (Z.px - A.px) * local, A.py + (Z.py - A.py) * local);
        ctx!.stroke();
      });

      // Pointer reaches out to nearby stars.
      if (pointer.active && !reduced) {
        for (const p of pts) {
          const d = Math.hypot(p.px - pointer.x, p.py - pointer.y);
          if (d > 240) continue;
          ctx!.globalAlpha = (1 - d / 240) * 0.6 * strength;
          ctx!.strokeStyle = "rgba(25,211,174,0.9)";
          ctx!.beginPath();
          ctx!.moveTo(pointer.x, pointer.y);
          ctx!.lineTo(p.px, p.py);
          ctx!.stroke();
        }
      }

      // The stars themselves: glow, core, flare and label.
      pts.forEach((p, i) => {
        const appear = reduced ? 1 : easeOut(clamp01((t - 0.2 - i * 0.14) / 0.7));
        if (appear <= 0) return;
        const near = pointer.active ? clamp01(1 - Math.hypot(p.px - pointer.x, p.py - pointer.y) / 160) : 0;
        const pulse = reduced ? 1 : 1 + 0.12 * Math.sin(t * 1.4 + i * 1.7);
        const R = p.mag * 18 * pulse * (1 + near * 0.6);

        const glow = ctx!.createRadialGradient(p.px, p.py, 0, p.px, p.py, R);
        glow.addColorStop(0, rgba(p.color, 0.95));
        glow.addColorStop(0.22, rgba(p.color, 0.35));
        glow.addColorStop(1, rgba(p.color, 0));
        ctx!.globalAlpha = appear * strength;
        ctx!.fillStyle = glow;
        ctx!.beginPath();
        ctx!.arc(p.px, p.py, R, 0, TAU);
        ctx!.fill();

        // Four-point diffraction flare on the bright ones.
        if (p.mag >= 1) {
          const f = R * 1.5;
          ctx!.strokeStyle = rgba(p.color, 0.35 * appear);
          ctx!.beginPath();
          ctx!.moveTo(p.px - f, p.py);
          ctx!.lineTo(p.px + f, p.py);
          ctx!.moveTo(p.px, p.py - f);
          ctx!.lineTo(p.px, p.py + f);
          ctx!.stroke();
        }

        ctx!.fillStyle = "#0c1a17";
        ctx!.beginPath();
        ctx!.arc(p.px, p.py, p.mag * 1.7, 0, TAU);
        ctx!.fill();

        if (b.desktop) {
          const labelIn = reduced ? 1 : clamp01((t - 2.8 - i * 0.1) / 0.8);
          ctx!.globalAlpha = labelIn * (0.55 + near * 0.45);
          ctx!.font = `500 10px ${mono}`;
          ctx!.fillStyle = near > 0.1 ? "#087a65" : "rgba(12,26,23,0.55)";
          ctx!.fillText(p.label.toUpperCase(), p.px + 14, p.py - 10);
        }
      });

      // Occasional shooting star.
      if (!reduced) {
        if (!shooting && now > nextShoot) {
          shooting = { x: w * (0.35 + Math.random() * 0.6), y: h * Math.random() * 0.35, vx: -(7 + Math.random() * 4), vy: 2.6 + Math.random() * 2, life: 1 };
          nextShoot = now + 5000 + Math.random() * 7000;
        }
        if (shooting) {
          const s = shooting;
          const tail = ctx!.createLinearGradient(s.x, s.y, s.x - s.vx * 14, s.y - s.vy * 14);
          tail.addColorStop(0, "rgba(8,122,101,0.8)");
          tail.addColorStop(1, "rgba(8,122,101,0)");
          ctx!.globalAlpha = s.life;
          ctx!.strokeStyle = tail;
          ctx!.lineWidth = 1.4;
          ctx!.beginPath();
          ctx!.moveTo(s.x, s.y);
          ctx!.lineTo(s.x - s.vx * 14, s.y - s.vy * 14);
          ctx!.stroke();
          ctx!.lineWidth = 1;
          s.x += s.vx;
          s.y += s.vy;
          s.life -= 0.014;
          if (s.life <= 0) shooting = null;
        }
      }

      ctx!.globalAlpha = 1;
    }

    function loop(now: number) {
      draw(now);
      raf = visible && !document.hidden ? requestAnimationFrame(loop) : 0;
    }

    function resume() {
      if (!reduced && !raf && visible && !document.hidden) raf = requestAnimationFrame(loop);
    }

    function onPointerMove(e: PointerEvent) {
      const rect = canvas!.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      pointer.tx = (pointer.x / w - 0.5) * 2;
      pointer.ty = (pointer.y / h - 0.5) * 2;
      pointer.active = e.pointerType === "mouse" && pointer.y >= 0 && pointer.y <= h;
    }

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      resume();
    });
    io.observe(canvas);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("visibilitychange", resume);
    resize();
    resume();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("visibilitychange", resume);
    };
  }, [canvasRef]);
}

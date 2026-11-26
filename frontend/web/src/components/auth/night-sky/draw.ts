import { ORION_LINKS, type ConstellationStar } from "@/components/marketing/hero/constellation-data";
import type { SkyState } from "./signal";

export type RGB = [number, number, number];
export type Pt = ConstellationStar & { px: number; py: number };
export type Dust = { x: number; y: number; r: number; depth: number; phase: number; speed: number };

export const TAU = Math.PI * 2;
export const AURORA: RGB = [25, 211, 174];
export const EMBER: RGB = [224, 83, 47];
export const GOLD: RGB = [232, 186, 96];
export const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
export const easeOut = (n: number) => 1 - Math.pow(1 - n, 3);
export const rgba = ([r, g, b]: RGB, a: number) => `rgba(${r},${g},${b},${a})`;

/** Twinkling star dust, with depth-based parallax against the pointer. */
export function drawDust(ctx: CanvasRenderingContext2D, dust: Dust[], w: number, h: number, t: number, px: number, py: number, still: boolean) {
  ctx.fillStyle = "#e9fff8";
  for (const s of dust) {
    const twinkle = still ? 0.8 : 0.45 + 0.55 * Math.sin(t * s.speed + s.phase);
    ctx.globalAlpha = twinkle * (0.12 + s.depth * 0.5);
    ctx.beginPath();
    ctx.arc(s.x * w - px * 26 * s.depth, s.y * h - py * 18 * s.depth, s.r, 0, TAU);
    ctx.fill();
  }
}

/**
 * Lines: the whole figure is always faintly charted (dashed); the first `lit` links
 * light up solid, with a spark travelling along each connected line.
 * While pending, a comet races around the figure.
 */
export function drawLinks(ctx: CanvasRenderingContext2D, pts: Pt[], s: SkyState, lit: number, t: number, now: number) {
  ctx.lineWidth = 1;
  ORION_LINKS.forEach(([a, z], i) => {
    const A = pts[a];
    const Z = pts[z];
    ctx.setLineDash([2, 6]);
    ctx.globalAlpha = 0.28;
    ctx.strokeStyle = "rgba(201,245,234,0.7)";
    ctx.beginPath();
    ctx.moveTo(A.px, A.py);
    ctx.lineTo(Z.px, Z.py);
    ctx.stroke();
    ctx.setLineDash([]);

    const share = clamp01(lit - i);
    if (share <= 0) return;
    const ex = A.px + (Z.px - A.px) * share;
    const ey = A.py + (Z.py - A.py) * share;
    const col = s.mood === "error" && now - s.moodAt < 700 ? EMBER : AURORA;
    const grad = ctx.createLinearGradient(A.px, A.py, Z.px, Z.py);
    grad.addColorStop(0, rgba(col, 0.95));
    grad.addColorStop(1, rgba(col, 0.45));
    ctx.globalAlpha = 1;
    ctx.shadowColor = rgba(col, 0.9);
    ctx.shadowBlur = 12;
    ctx.lineWidth = 1.6;
    ctx.strokeStyle = grad;
    ctx.beginPath();
    ctx.moveTo(A.px, A.py);
    ctx.lineTo(ex, ey);
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.lineWidth = 1;

    if (share >= 1) {
      const k = (t * 0.45 + i * 0.37) % 1;
      spark(ctx, A.px + (Z.px - A.px) * k, A.py + (Z.py - A.py) * k, 2.2, col, 0.9);
    }
  });

  if (s.mood === "pending") {
    const total = ORION_LINKS.length;
    const pos = ((now - s.moodAt) / 1000) * 3.2;
    for (let trail = 0; trail < 6; trail++) {
      const p = pos - trail * 0.06;
      const i = Math.floor(((p % total) + total) % total);
      const k = p - Math.floor(p);
      const [a, z] = ORION_LINKS[i];
      spark(ctx, pts[a].px + (pts[z].px - pts[a].px) * k, pts[a].py + (pts[z].py - pts[a].py) * k, 3.4 - trail * 0.45, GOLD, 1 - trail * 0.15);
    }
  }
}

export function spark(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, col: RGB, a: number) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r * 4);
  g.addColorStop(0, rgba([255, 255, 255], a));
  g.addColorStop(0.3, rgba(col, a * 0.8));
  g.addColorStop(1, rgba(col, 0));
  ctx.globalAlpha = 1;
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r * 4, 0, TAU);
  ctx.fill();
}

/** A star: halo, diffraction flare, hot core and its legal-domain label. */
export function drawStar(
  ctx: CanvasRenderingContext2D,
  p: Pt,
  i: number,
  o: { appear: number; lit: boolean; near: number; t: number; still: boolean; labels: boolean; flare: number; mono: string; error: boolean },
) {
  if (o.appear <= 0) return;
  const col: RGB = o.error ? EMBER : p.color;
  const pulse = o.still ? 1 : 1 + 0.14 * Math.sin(o.t * 1.3 + i * 1.7);
  const R = p.mag * (o.lit ? 22 : 12) * pulse * (1 + o.near * 0.6 + o.flare * 1.6);

  const glow = ctx.createRadialGradient(p.px, p.py, 0, p.px, p.py, R);
  glow.addColorStop(0, rgba(col, o.lit ? 0.95 : 0.55));
  glow.addColorStop(0.25, rgba(col, o.lit ? 0.32 : 0.14));
  glow.addColorStop(1, rgba(col, 0));
  ctx.globalAlpha = o.appear;
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(p.px, p.py, R, 0, TAU);
  ctx.fill();

  if (o.lit && p.mag >= 1) {
    const f = R * 1.6;
    ctx.strokeStyle = rgba(col, 0.4 * o.appear);
    ctx.beginPath();
    ctx.moveTo(p.px - f, p.py);
    ctx.lineTo(p.px + f, p.py);
    ctx.moveTo(p.px, p.py - f);
    ctx.lineTo(p.px, p.py + f);
    ctx.stroke();
  }

  ctx.fillStyle = o.lit ? "#ffffff" : "rgba(233,255,248,0.75)";
  ctx.beginPath();
  ctx.arc(p.px, p.py, p.mag * (o.lit ? 2 : 1.4), 0, TAU);
  ctx.fill();

  if (o.labels) {
    ctx.globalAlpha = o.appear * (o.lit ? 0.95 : 0.4 + o.near * 0.5);
    ctx.font = `500 10px ${o.mono}`;
    ctx.fillStyle = o.lit ? rgba(AURORA, 1) : "rgba(201,245,234,0.8)";
    ctx.fillText(p.label.toUpperCase(), p.px + 14, p.py - 10);
  }
}

/** Expanding ring on success. */
export function drawShockwave(ctx: CanvasRenderingContext2D, cx: number, cy: number, age: number, size: number) {
  const k = clamp01(age / 1400);
  if (k >= 1) return;
  ctx.globalAlpha = (1 - k) * 0.8;
  ctx.strokeStyle = rgba(AURORA, 1);
  ctx.lineWidth = 2 * (1 - k) + 0.5;
  ctx.beginPath();
  ctx.arc(cx, cy, easeOut(k) * size, 0, TAU);
  ctx.stroke();
  ctx.lineWidth = 1;
}

"use client";

import { useEffect, useRef } from "react";

const SPACING = 26;
const RADIUS = 130;
const PULL = 12;
const EASE = 0.14;
const BASE_RADIUS = 1;
const MAX_RADIUS = 2.4;

type Dot = {
  ox: number;
  oy: number;
  x: number;
  y: number;
};

export function InteractiveDotGrid({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = canvas?.parentElement;
    if (!canvas || !wrapper) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;
    let dots: Dot[] = [];
    const mouse = { x: -9999, y: -9999 };
    let rafId = 0;

    function buildDots() {
      dots = [];
      for (let y = SPACING / 2; y < height; y += SPACING) {
        for (let x = SPACING / 2; x < width; x += SPACING) {
          dots.push({ ox: x, oy: y, x, y });
        }
      }
    }

    function resize() {
      const rect = wrapper!.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildDots();
    }

    function onPointerMove(e: PointerEvent) {
      const rect = wrapper!.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    }

    function onPointerLeave() {
      mouse.x = -9999;
      mouse.y = -9999;
    }

    function tick() {
      ctx!.clearRect(0, 0, width, height);
      ctx!.fillStyle = "rgba(18, 19, 23, 0.16)";

      for (const dot of dots) {
        const dx = mouse.x - dot.ox;
        const dy = mouse.y - dot.oy;
        const dist = Math.hypot(dx, dy);

        let targetX = dot.ox;
        let targetY = dot.oy;
        let radius = BASE_RADIUS;

        if (dist < RADIUS) {
          const strength = 1 - dist / RADIUS;
          const angle = Math.atan2(dy, dx);
          targetX = dot.ox + Math.cos(angle) * PULL * strength;
          targetY = dot.oy + Math.sin(angle) * PULL * strength;
          radius = BASE_RADIUS + (MAX_RADIUS - BASE_RADIUS) * strength;
        }

        dot.x += (targetX - dot.x) * EASE;
        dot.y += (targetY - dot.y) * EASE;

        ctx!.beginPath();
        ctx!.arc(dot.x, dot.y, radius, 0, Math.PI * 2);
        ctx!.fill();
      }

      rafId = requestAnimationFrame(tick);
    }

    const ro = new ResizeObserver(resize);
    ro.observe(wrapper);
    resize();
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerleave", onPointerLeave);
    rafId = requestAnimationFrame(tick);

    return () => {
      ro.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      className={`pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_60%_60%_at_50%_35%,black,transparent)] ${className}`}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}

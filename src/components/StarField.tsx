"use client";
import { useEffect, useRef } from "react";

type Star = {
  x: number;
  y: number;
  z: number;     // depth 0..1 — affects size + brightness
  vy: number;    // vertical drift
  twinkle: number; // phase 0..2pi
};

const STAR_COUNT = 180;

export default function StarField() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let stars: Star[] = [];
    let raf = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      if (!canvas) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      stars = Array.from({ length: STAR_COUNT }, () => makeStar());
    }

    function makeStar(): Star {
      return {
        x: Math.random() * (canvas?.width ?? 0),
        y: Math.random() * (canvas?.height ?? 0),
        z: Math.random(),
        vy: 0.05 + Math.random() * 0.25,
        twinkle: Math.random() * Math.PI * 2
      };
    }

    function draw() {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // soft nebula wash overlay
      const grad = ctx.createRadialGradient(
        canvas.width * 0.3,
        canvas.height * 0.2,
        0,
        canvas.width * 0.3,
        canvas.height * 0.2,
        Math.max(canvas.width, canvas.height) * 0.6
      );
      grad.addColorStop(0, "rgba(168,85,247,0.08)");
      grad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (const s of stars) {
        s.y += s.vy * dpr;
        s.twinkle += 0.02;
        if (s.y > canvas.height) {
          s.y = -2;
          s.x = Math.random() * canvas.width;
        }
        const size = (0.4 + s.z * 1.6) * dpr;
        const alpha = 0.4 + Math.sin(s.twinkle) * 0.25 + s.z * 0.4;
        ctx.beginPath();
        ctx.fillStyle = `rgba(${200 + s.z * 55}, ${230 + s.z * 25}, 255, ${alpha})`;
        ctx.arc(s.x, s.y, size, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    }

    resize();
    draw();
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0"
    />
  );
}

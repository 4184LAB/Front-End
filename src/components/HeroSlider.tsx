"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { slides } from "@/data/site";
import { Emblem } from "./ui";

export default function HeroSlider() {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const slide = slides[index];

  const move = (step: number) => setIndex((i) => (i + step + slides.length) % slides.length);

  useEffect(() => {
    if (!playing || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % slides.length), 6000);
    return () => clearInterval(timer);
  }, [playing]);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="주요 소식"
      className="band -mt-12 text-white [--band:var(--navy)]"
    >
      <div className="flex items-center justify-between gap-10 py-12">
        <div className="min-h-64 max-w-2xl" aria-live={playing ? "off" : "polite"}>
          <p className="text-sm font-semibold text-gold">{slide.label}</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-5xl">{slide.title}</h1>
          <p className="mt-4 leading-relaxed text-white/80 sm:text-lg">{slide.text}</p>
          <Link href={slide.href} className="btn mt-6 bg-gold text-navy-deep">
            {slide.linkLabel} →
          </Link>
        </div>
        <Emblem className="hidden h-56 w-auto shrink-0 lg:block" />
      </div>
      <div className="flex items-center gap-2 pb-6 text-sm">
        <button
          type="button"
          onClick={() => move(-1)}
          aria-label="이전"
          className="btn btn-sm border border-white/40"
        >
          ‹
        </button>
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          className="btn btn-sm border border-white/40"
        >
          {playing ? "정지" : "재생"}
        </button>
        <button
          type="button"
          onClick={() => move(1)}
          aria-label="다음"
          className="btn btn-sm border border-white/40"
        >
          ›
        </button>
        <span className="ml-2 text-white/70">
          {index + 1} / {slides.length}
        </span>
      </div>
    </section>
  );
}

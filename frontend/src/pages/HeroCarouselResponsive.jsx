// HeroCarouselResponsive.jsx — same style, now pure data-driven (no demo defaults)
import React, { useEffect, useRef, useState } from "react";

const THEME = {
  bg: "#F7F7F7",
  brown: "#854836",
  gold: "#FFB22C",
  text: "#000000",
  font: "Poppins, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
};

function IconArrow() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden>
      <path d="M5 12h14M13 6l6 6-6 6" stroke={THEME.text} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
function IconChevron({ dir = "left" }) {
  const d = dir === "left" ? "M15 19L8 12l7-7" : "M9 5l7 7-7 7";
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden>
      <path d={d} stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconicCTA({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="relative group inline-flex items-center gap-3 px-5 py-2.5 md:px-7 md:py-3 rounded-2xl font-semibold shadow-lg active:scale-[0.98] transition-transform"
      style={{ fontFamily: THEME.font, color: THEME.text, background: THEME.gold }}
    >
      <span
        className="absolute -inset-1 rounded-3xl blur-md opacity-60 group-hover:opacity-90 transition"
        style={{ background: `radial-gradient(60% 60% at 50% 50%, ${THEME.gold}77, transparent)` }}
        aria-hidden
      />
      <span
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{ boxShadow: `0 8px 24px rgba(0,0,0,0.15), inset 0 0 0 2px ${THEME.gold}` }}
        aria-hidden
      />
      <span className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none" aria-hidden>
        <span className="absolute -left-1/3 top-0 h-full w-1/3 bg-white/40 -skew-x-12 transform -translate-x-[120%] group-hover:translate-x-[320%] transition duration-700" />
      </span>
      <span className="relative text-sm md:text-base">Learn More</span>
      <span className="relative -mr-0.5 md:-mr-1">
        <IconArrow />
      </span>
    </button>
  );
}

export default function HeroCarouselResponsive({
  slides = [],              // content only; if empty, render nothing
  auto = true,              // behavior flags are fine to default
  interval = 5000,
  onCtaClick,               // optional callback
}) {
  // If there’s no real data, don’t render the hero (keeps your “no defaults” rule)
  if (!Array.isArray(slides) || slides.length === 0) return null;

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const touch = useRef({ x: 0 });

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e) => setReduced(e.matches);
    mq.addEventListener ? mq.addEventListener("change", onChange) : mq.addListener(onChange);
    return () => (mq.removeEventListener ? mq.removeEventListener("change", onChange) : mq.removeListener(onChange));
  }, []);

  useEffect(() => {
    if (!auto || reduced) return;
    const id = setInterval(() => { if (!paused) next(); }, interval);
    return () => clearInterval(id);
  }, [index, paused, auto, interval, reduced, slides.length]);

  function next() { setIndex((i) => (i + 1) % slides.length); }
  function prev() { setIndex((i) => (i - 1 + slides.length) % slides.length); }

  function onTouchStart(e) { touch.current.x = e.touches[0].clientX; }
  function onTouchEnd(e) {
    const dx = e.changedTouches[0].clientX - touch.current.x;
    if (Math.abs(dx) > 40) { dx < 0 ? next() : prev(); }
  }

  function alignClasses(a) {
    if (a === "center") return "items-end sm:items-center text-center justify-center";
    if (a === "right") return "items-end sm:items-center text-right justify-end";
    return "items-end sm:items-center text-left justify-start"; // left
  }

  return (
    <section
      className="relative w-full"
      style={{ fontFamily: THEME.font, background: THEME.bg }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative overflow-hidden" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        {/* Track */}
        <div className="flex transition-transform duration-700 ease-out" style={{ transform: `translateX(-${index * 100}%)` }}>
          {slides.map((s, i) => (
            <div key={s.id || i} className="relative min-w-full h-[58vh] sm:h-[66vh] md:h-[78vh] lg:h-[88vh]">
              {/* Image */}
              <img src={s.src} alt={s.title || `Slide ${i + 1}`} className="absolute inset-0 h-full w-full object-cover" draggable={false} />
              {/* Overlay for readability */}
              <div className="absolute inset-0" style={{ background: "linear-gradient(0deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.25) 40%, rgba(0,0,0,0.15) 100%)" }} />

              {/* Content wrapper (unchanged style) */}
              <div className={`relative h-full flex ${alignClasses(s.align)} px-3 sm:px-4`}>
                <div className="w-full max-w-6xl mx-auto">
                  <div
                    className="inline-block max-w-[92%] sm:max-w-xl md:max-w-2xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 backdrop-blur-md shadow-2xl"
                    style={{ background: "rgba(255,255,255,0.14)", border: `1px solid rgba(255,255,255,0.35)`, color: "#fff" }}
                  >
                    <p className="text-[11px] sm:text-xs md:text-sm tracking-wide" style={{ color: THEME.gold }}>
                      {/* keep your tiny pretitle look; only render a decorative bullet line */}
                      • Adventure • Desert • Sand •
                    </p>
                    {s.title ? (
                      <h1 className="mt-1 sm:mt-2 text-2xl sm:text-3xl md:text-5xl font-extrabold leading-[1.15]">
                        {s.title}
                      </h1>
                    ) : null}
                    {s.subtitle ? (
                      <p className="mt-2 sm:mt-3 md:mt-4 text-white/85 text-xs sm:text-sm md:text-lg max-w-prose">
                        {s.subtitle}
                      </p>
                    ) : null}
                    <div className="mt-3 sm:mt-4 md:mt-6 flex flex-wrap items-center gap-2 sm:gap-3">
                      <IconicCTA onClick={() => (onCtaClick ? onCtaClick(s) : null)} />
                    </div>
                  </div>
                </div>
              </div>

              {/* slide badge */}
              <div className="pointer-events-none absolute right-3 top-3 sm:right-5 sm:top-5 select-none">
                <div className="rounded-xl sm:rounded-2xl px-2.5 py-1 text-[10px] sm:text-xs font-semibold shadow"
                  style={{ background: THEME.gold, color: THEME.text }}>
                  {String(i + 1).padStart(2, "0")} / {slides.length}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Controls (unchanged style) */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-2 sm:px-3 md:px-4">
          <button onClick={prev} className="pointer-events-auto grid place-items-center h-10 w-10 sm:h-11 sm:w-11 md:h-12 md:w-12 rounded-full bg-black/30 hover:bg-black/45 transition" aria-label="Previous slide">
            <IconChevron dir="left" />
          </button>
          <button onClick={next} className="pointer-events-auto grid place-items-center h-10 w-10 sm:h-11 sm:w-11 md:h-12 md:w-12 rounded-full bg-black/30 hover:bg-black/45 transition" aria-label="Next slide">
            <IconChevron dir="right" />
          </button>
        </div>

        {/* Dots (unchanged style) */}
        <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 sm:gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className="relative h-2.5 w-6 sm:w-7 rounded-full overflow-hidden"
              aria-label={`Go to slide ${i + 1}`}
              style={{ background: "rgba(255,255,255,0.45)" }}
            >
              <span className="absolute left-0 top-0 h-full transition-all" style={{ width: i === index ? "100%" : "0%", background: THEME.gold }} />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

// src/components/TestimonialCarousel.jsx
// Desert-themed, animated testimonial carousel (real data)
// Colors: bg #F7F7F7, brown #854836, gold #FFB22C, text #000, font: Poppins

import React, { useEffect, useRef, useState } from "react";
import PUBLICAPI from "../apipublic";

const THEME = {
  bg: "#F7F7F7",
  brown: "#854836",
  gold: "#FFB22C",
  text: "#000000",
  font: "Poppins, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
};

// (Optional) Stars block — render only if a rating exists in future
function Stars({ n }) {
  if (typeof n !== "number") return null; // no defaults
  return (
    <div className="flex items-center gap-1" aria-label={`${n} stars`}>
      {[...Array(5)].map((_, i) => (
        <svg key={i} viewBox="0 0 24 24" width="16" height="16" className="drop-shadow" fill={i < n ? THEME.gold : "#E6E6E6"}>
          <path d="M12 3l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 18.9 6.2 21l1.1-6.5L2.6 9.8l6.5-.9L12 3z" />
        </svg>
      ))}
    </div>
  );
}

// Clamp review text: preview vs expanded (no defaults)
function ReviewText({ text = "", expanded, onToggle }) {
  const PREVIEW = 160;
  const isLong = text.length > PREVIEW;
  const shown = expanded || !isLong ? text : text.slice(0, PREVIEW) + "…";

  // If there’s literally no review, render nothing
  if (!text) return null;

  return (
    <p className="text-sm sm:text-base text-black/80 leading-relaxed">
      {shown}{" "}
      {isLong && (
        <button onClick={onToggle} className="inline font-semibold underline-offset-2 hover:underline" style={{ color: THEME.gold }}>
          {expanded ? "Read less" : "Read more"}
        </button>
      )}
    </p>
  );
}

export default function TestimonialCarousel({ auto = true, interval = 6000 }) {
  const [items, setItems] = useState([]);     // real testimonials
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [expanded, setExpanded] = useState({});
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const touch = useRef({ x: 0 });

  // Fetch real testimonials (keeps Home.jsx unchanged)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const { data } = await PUBLICAPI.get("/public/testimonials", { params: { activeOnly: true } });
        if (!mounted) return;

        const arr = Array.isArray(data?.items) ? data.items : [];

        // Strict: only keep items that have at least a name OR a review (so we don't show empties)
        const clean = arr.filter((t) => (t?.name && t.name.trim() !== "") || (t?.review && t.review.trim() !== ""));

        setItems(clean);
      } catch (e) {
        console.error(e);
        if (mounted) setErr("Could not load testimonials.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Autoplay (only if we actually have items)
  useEffect(() => {
    if (!auto || items.length === 0) return;
    const id = setInterval(() => !paused && next(), interval);
    return () => clearInterval(id);
  }, [index, paused, auto, interval, items.length]);

  function next() { setIndex((i) => (i + 1) % items.length); }
  function prev() { setIndex((i) => (i - 1 + items.length) % items.length); }
  function onTouchStart(e) { touch.current.x = e.touches[0].clientX; }
  function onTouchEnd(e) {
    const dx = e.changedTouches[0].clientX - touch.current.x;
    if (Math.abs(dx) > 40) (dx < 0 ? next() : prev());
  }

  // If loading or no items, don’t render a placeholder — just return null (no defaults)
  if (loading || err || items.length === 0) return null;

  return (
    <section
      className="relative w-full"
      style={{ fontFamily: THEME.font, background: THEME.bg }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Header (unchanged style) */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 pt-12 sm:pt-16 md:pt-20 text-center">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight" style={{ color: THEME.brown }}>
          Loved by <span style={{ color: THEME.gold }}>Travellers</span>
        </h2>
        <p className="mt-3 text-sm sm:text-base md:text-lg text-black/70 max-w-2xl mx-auto">
          Real stories from our convoys — slightly Google-style, fully Trippens energy.
        </p>
        <div className="mx-auto mt-6 h-[3px] w-40 rounded-full overflow-hidden">
          <div className="h-full w-full animate-[slide_1.6s_ease-in-out_infinite]" style={{ background: `linear-gradient(90deg, transparent, ${THEME.gold}, transparent)` }} />
        </div>
      </div>

      {/* Carousel (unchanged style) */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-10 sm:py-12 md:py-14">
        <div
          className="relative overflow-hidden rounded-[28px]"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          style={{
            boxShadow: "0 24px 60px rgba(0,0,0,0.08)",
            border: "1px solid rgba(0,0,0,0.06)",
            background: "rgba(255,255,255,0.65)",
            backdropFilter: "blur(8px)",
          }}
        >
          {/* Track */}
          <div className="flex transition-transform duration-700 ease-out" style={{ transform: `translateX(-${index * 100}%)` }}>
            {items.map((t, i) => (
              <div key={t.id || i} className="min-w-full p-5 sm:p-7 md:p-10">
                <div className="relative bg-white rounded-3xl p-5 sm:p-7 md:p-8">
                  <span className="pointer-events-none absolute inset-0 rounded-3xl" style={{ boxShadow: `inset 0 0 0 2px ${THEME.gold}22` }} />

                  {/* Header row */}
                  <div className="flex items-center gap-4">
                    {/* Photo (only if provided) */}
                    {t.photo && t.photo.trim() !== "" ? (
                      <div className="relative">
                        <img
                          src={t.photo}
                          alt={t.name || "Traveller"}
                          loading="lazy"
                          decoding="async"
                          className="h-14 w-14 sm:h-16 sm:w-16 rounded-full object-cover shadow-md"
                          onError={(e) => { e.currentTarget.style.display = "none"; }}
                        />
                        <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full ring-2 ring-white" style={{ background: THEME.gold }} />
                      </div>
                    ) : null}

                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        {t.name ? (
                          <h3 className="text-base sm:text-lg md:text-xl font-bold" style={{ color: THEME.brown }}>
                            {t.name}
                          </h3>
                        ) : null}
                        {/* Stars appear only if your API later adds a numeric rating */}
                        {/* <Stars n={t.rating} /> */}
                      </div>
                      {t.tour ? (
                        <p className="text-xs sm:text-sm text-black/60 mt-0.5">
                          Reviewed about: <span className="font-medium" style={{ color: THEME.brown }}>{t.tour}</span>
                        </p>
                      ) : null}
                    </div>

                    {/* Chip stays (style element) */}
                    <div
                      className="hidden sm:inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold shadow"
                      style={{ background: THEME.gold, color: THEME.text }}
                    >
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none">
                        <path d="M5 12h14M13 6l6 6-6 6" stroke={THEME.text} strokeWidth="1.8" strokeLinecap="round" />
                      </svg>
                      Verified review
                    </div>
                  </div>

                  {/* Review */}
                  <div className="mt-4 sm:mt-5 md:mt-6">
                    <ReviewText
                      text={t.review || ""}
                      expanded={!!expanded[i]}
                      onToggle={() => setExpanded((s) => ({ ...s, [i]: !s[i] }))}
                    />
                  </div>

                  {/* Soft gold accent line */}
                  <div className="mt-5 h-[2px] w-full rounded-full" style={{ background: `linear-gradient(90deg, transparent, ${THEME.gold}, transparent)` }} />
                </div>
              </div>
            ))}
          </div>

          {/* Controls */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-2 sm:px-3 md:px-4">
            <button onClick={prev} className="pointer-events-auto grid place-items-center h-10 w-10 md:h-12 md:w-12 rounded-full bg-black/30 hover:bg-black/45 transition" aria-label="Previous review">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
                <path d="M15 19L8 12l7-7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button onClick={next} className="pointer-events-auto grid place-items-center h-10 w-10 md:h-12 md:w-12 rounded-full bg-black/30 hover:bg-black/45 transition" aria-label="Next review">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
                <path d="M9 5l7 7-7 7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          {/* Dots */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className="relative h-2.5 w-7 rounded-full overflow-hidden"
                aria-label={`Go to review ${i + 1}`}
                style={{ background: "rgba(0,0,0,0.12)" }}
              >
                <span className="absolute left-0 top-0 h-full transition-all" style={{ width: i === index ? "100%" : "0%", background: THEME.gold }} />
              </button>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slide {
          0% { transform: translateX(-60%); }
          50% { transform: translateX(0%); }
          100% { transform: translateX(60%); }
        }
      `}</style>
    </section>
  );
}

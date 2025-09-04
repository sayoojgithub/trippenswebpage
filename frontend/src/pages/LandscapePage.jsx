// src/pages/LandscapePage.jsx
import React, { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PUBLICAPI from "../apipublic";

const THEME = {
  bg: "#F7F7F7",
  brown: "#854836",
  gold: "#FFB22C",
  text: "#000000",
  font: "Poppins, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
};

const inr = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

// reveal that re-runs when deps change (same behavior as CategoryPage)
function useReveal(refSelector = "[data-reveal]", deps = []) {
  const rootRef = useRef(null);
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const els = root.querySelectorAll(refSelector);
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("reveal-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("reveal-in");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.15 }
    );
    els.forEach((el) => !el.classList.contains("reveal-in") && io.observe(el));
    return () => io.disconnect();
  }, deps);
  return rootRef;
}

// —— TourCard IDENTICAL to CategoryPage's card (with image section) ——
function TourCard({ t }) {
  function handleMove(e) {
    const card = e.currentTarget;
    const r = card.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    card.style.transform = `perspective(900px) rotateX(${py * -6}deg) rotateY(${px * 10}deg) translateY(-2px)`;
  }
  function handleLeave(e) {
    e.currentTarget.style.transform = "perspective(900px) rotateX(0) rotateY(0)";
  }
  const imgSrc =
    t.img ||
    "https://images.unsplash.com/photo-1476610182048-b716b8518aae?q=80&w=1400&auto=format&fit=crop";
  const backup =
    t.backup ||
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1400&auto=format&fit=crop";

  return (
    <article
      className="group relative overflow-hidden rounded-3xl bg-white will-change-transform"
      data-reveal
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{
        boxShadow: "0 20px 50px rgba(0,0,0,0.10)",
        border: "1px solid rgba(0,0,0,0.06)",
        transition: "transform 200ms ease, box-shadow 250ms ease",
      }}
    >
      <span
        className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ boxShadow: `inset 0 0 0 2px ${THEME.gold}` }}
      />
      <div className="relative h-72 sm:h-72 md:h-72 overflow-hidden">
        <img
          src={imgSrc}
          loading="lazy"
          onError={(e) => (e.currentTarget.src = backup)}
          alt={t.title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        {typeof t.priceInr === "number" && t.priceInr >= 0 && (
          <div
            className="absolute right-3 bottom-3 rounded-xl px-3 py-1.5 text-xs font-semibold shadow"
            style={{ background: THEME.gold, color: THEME.text }}
          >
            {inr(t.priceInr)}
          </div>
        )}
        <div
          className="absolute left-3 bottom-3 rounded-xl px-3 py-1.5 text-xs font-semibold shadow text-white"
          style={{ background: `${THEME.brown}cc` }}
        >
          {t.days}D / {t.nights}N
        </div>
      </div>
      <div className="p-4 sm:p-5 md:p-6">
        <h3
          className="text-base sm:text-lg md:text-xl font-semibold leading-tight line-clamp-2"
          style={{ color: THEME.brown }}
          title={t.title}
        >
          {t.title}
        </h3>
        <div className="mt-4 flex items-center justify-between">
          <Link
            to={`/tours/${t.id}`}
            className="relative inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition"
            style={{ background: THEME.gold, color: THEME.text }}
          >
            Learn more
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M13 6l6 6-6 6" stroke={THEME.text} strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <span
              className="pointer-events-none absolute -inset-1 rounded-2xl blur-md opacity-40 group-hover:opacity-70 transition"
              style={{ background: `radial-gradient(60% 60% at 50% 50%, ${THEME.gold}77, transparent)` }}
            />
          </Link>
          <div
            className="h-2 w-20 rounded-full"
            style={{ background: `linear-gradient(90deg, ${THEME.gold}, ${THEME.gold}55, transparent)` }}
          />
        </div>
      </div>
      <div className="pointer-events-none absolute -inset-8 opacity-0 group-hover:opacity-70 transition-opacity">
        <div className="absolute -top-4 left-6 h-2 w-2 rounded-full animate-pulse" style={{ background: `${THEME.gold}aa` }} />
        <div className="absolute top-8 right-10 h-1.5 w-1.5 rounded-full animate-[pulse_2s_ease-in-out_infinite]" style={{ background: `${THEME.gold}88` }} />
        <div className="absolute bottom-6 left-10 h-1.5 w-1.5 rounded-full animate-[pulse_2.8s_ease-in-out_infinite]" style={{ background: `${THEME.gold}66` }} />
      </div>
    </article>
  );
}

export default function LandscapePage() {
  const { landscape } = useParams(); // e.g., "Mountain"
  const [loading, setLoading] = useState(true);
  const [tours, setTours] = useState([]);
  const [error, setError] = useState("");
  const rootRef = useReveal("[data-reveal]", [landscape, tours.length]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError("");
        const { data } = await PUBLICAPI.get(`/public/landscapes/${encodeURIComponent(landscape)}`, {
          params: { activeOnly: true },
        });
        if (!mounted) return;
        setTours(Array.isArray(data?.tours) ? data.tours : []);
      } catch (e) {
        console.error(e);
        if (mounted) setError("Could not load tours for this landscape.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [landscape]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, [landscape]);

  // Adapt the API tour into the same shape CategoryPage expects
  const adaptTour = (tour) => ({
    id: tour._id,
    title: tour.tourName,
    days: tour.days,
    nights: tour.nights ?? 0,
    priceInr: typeof tour.tripCost === "number" ? tour.tripCost : null,
    img:
      tour.mainImageUrl ||
      "https://images.unsplash.com/photo-1476610182048-b716b8518aae?q=80&w=1400&auto=format&fit=crop",
    backup:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1400&auto=format&fit=crop",
  });

  return (
    <section ref={rootRef} className="relative" style={{ fontFamily: THEME.font, background: THEME.bg }}>
      {loading ? (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 pt-12 sm:pt-16 md:pt-20 text-center" data-reveal>
          <div className="text-black/70">Loading tours…</div>
        </div>
      ) : error ? (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 pt-12 sm:pt-16 md:pt-20 text-center" data-reveal>
          <div className="text-red-600 font-medium">{error}</div>
        </div>
      ) : (
        <>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 pt-12 sm:pt-16 md:pt-20 text-center" data-reveal>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight" style={{ color: THEME.brown }}>
              {decodeURIComponent(landscape)} <span style={{ color: THEME.gold }}>Tours</span>
            </h1>
          </div>

          {/* GRID identical to CategoryPage */}
          <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-10 sm:py-12 md:py-14">
            {tours.length > 0 ? (
              <div className="grid gap-6 sm:gap-7 md:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 ">
                {tours.map((tour) => (
                  <TourCard key={tour._id} t={adaptTour(tour)} />
                ))}
              </div>
            ) : (
              <div className="text-center text-black/70" data-reveal>
                No tours found for this landscape yet.
              </div>
            )}
          </div>
        </>
      )}

      <style>{`
        [data-reveal]{
          opacity:0;
          transform: translateY(16px) scale(.98);
          transition: opacity .6s ease, transform .6s cubic-bezier(.2,.8,.2,1);
        }
        .reveal-in{
          opacity:1;
          transform: translateY(0) scale(1);
        }
      `}</style>
    </section>
  );
}

// WonderTours.jsx (simplified + price badge)
import React, { useEffect, useRef, useState } from "react";
import PUBLICAPI from "../apipublic";
import { Link } from "react-router-dom"; // ⬅ add


const THEME = {
  bg: "#F7F7F7",
  brown: "#854836",
  gold: "#FFB22C",
  text: "#000000",
  font: "Poppins, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
};

// INR formatter
const inr = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

function TourCard({ t, categoryId }) {
  // tilt-on-mouse
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
      data-category-id={categoryId}
      data-tour-id={t.id}
      style={{
        boxShadow: "0 20px 50px rgba(0,0,0,0.10)",
        border: "1px solid rgba(0,0,0,0.06)",
        transition: "transform 200ms ease, box-shadow 250ms ease",
      }}
    >
      {/* Gold sheen border on hover */}
      <span
        className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ boxShadow: `inset 0 0 0 2px ${THEME.gold}` }}
      />

      {/* Image */}
      <div className="relative h-72 sm:h-72 md:h-72 overflow-hidden">
        <img
          src={imgSrc}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = backup;
          }}
          alt={t.title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
        />
        {/* gradient for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        {/* Price badge (shows if priceInr is a number >= 0) */}
        {typeof t.priceInr === "number" && t.priceInr >= 0 && (
          <div
            className="absolute right-3 bottom-3 rounded-xl px-3 py-1.5 text-xs font-semibold shadow"
            style={{ background: THEME.gold, color: THEME.text }}
          >
            {inr(t.priceInr)}
          </div>
        )}

        {/* Duration badge */}
        <div
          className="absolute left-3 bottom-3 rounded-xl px-3 py-1.5 text-xs font-semibold shadow text-white"
          style={{ background: `${THEME.brown}cc` }}
        >
          {t.days}D / {t.nights}N
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 md:p-6">
        <h3
          className="text-base sm:text-lg md:text-xl font-semibold leading-tight line-clamp-2"
          style={{ color: THEME.brown }}
          title={t.title}
        >
          {t.title}
        </h3>

        {/* Actions */}
        <div className="mt-4 flex items-center justify-between">
          <a
            href={`/tours/${t.id}`}
            className="relative inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition"
            style={{ background: `${THEME.gold}`, color: THEME.text }}
            data-tour-id={t.id}
          >
            Learn more
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M13 6l6 6-6 6" stroke={THEME.text} strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <span
              className="pointer-events-none absolute -inset-1 rounded-2xl blur-md opacity-40 group-hover:opacity-70 transition"
              style={{ background: `radial-gradient(60% 60% at 50% 50%, ${THEME.gold}77, transparent)` }}
            />
          </a>

          {/* subtle meta accent */}
          <div
            className="h-2 w-20 rounded-full"
            style={{ background: `linear-gradient(90deg, ${THEME.gold}, ${THEME.gold}55, transparent)` }}
          />
        </div>
      </div>

      {/* floating sand specks */}
      <div className="pointer-events-none absolute -inset-8 opacity-0 group-hover:opacity-70 transition-opacity">
        <div className="absolute -top-4 left-6 h-2 w-2 rounded-full animate-pulse" style={{ background: `${THEME.gold}aa` }} />
        <div
          className="absolute top-8 right-10 h-1.5 w-1.5 rounded-full animate-[pulse_2s_ease-in-out_infinite]"
          style={{ background: `${THEME.gold}88` }}
        />
        <div
          className="absolute bottom-6 left-10 h-1.5 w-1.5 rounded-full animate-[pulse_2.8s_ease-in-out_infinite]"
          style={{ background: `${THEME.gold}66` }}
        />
      </div>
    </article>
  );
}

export default function WonderTours() {
  const sectionRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]); // [{_id,name,highlightedTours:[...]}]
  const [error, setError] = useState("");

  // Simple fetch on mount
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError("");
        const { data } = await PUBLICAPI.get("/public/with-highlighted-tours", {
          params: { limit: 3, activeOnly: true },
        });
        setCategories(Array.isArray(data?.categories) ? data.categories : []);
      } catch (e) {
        console.error(e);
        setError("Could not load tours. Please try again.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Simple reveal: observe whenever categories change
  useEffect(() => {
    const root = sectionRef.current;
    if (!root) return;

    const els = root.querySelectorAll("[data-reveal]");
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("reveal-in"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("reveal-in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [categories.length]);

  // adapt backend → UI while keeping visuals
  const adaptTour = (tour) => ({
    id: tour._id,
    title: tour.tourName,
    days: tour.days,
    nights: tour.nights ?? 0,
    priceInr:
      typeof tour.tripCost === "number" ? tour.tripCost : null, // expects tripCost from backend
    img:
      tour.mainImageUrl ||
      "https://images.unsplash.com/photo-1476610182048-b716b8518aae?q=80&w=1400&auto=format&fit=crop",
    backup:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1400&auto=format&fit=crop",
  });

  return (
    <section
      ref={sectionRef}
      className="relative"
      style={{ fontFamily: THEME.font, background: THEME.bg }}
    >
      {/* header */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 pt-12 sm:pt-16 md:pt-20">
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight">
            Adventures you’ll <span style={{ color: THEME.gold }}>never forget</span>
          </h2>
          <p className="mt-3 text-sm sm:text-base md:text-lg text-black/70 max-w-2xl mx-auto">
            Hand-picked routes, stunning stays and drive-captain support. Choose your next epic.
          </p>
        </div>

        {/* animated sand underline */}
        <div className="mx-auto mt-6 h-[3px] w-40 rounded-full overflow-hidden">
          <div
            className="h-full w-full animate-[slide_1.6s_ease-in-out_infinite]"
            style={{ background: `linear-gradient(90deg, transparent, ${THEME.gold}, transparent)` }}
          />
        </div>
      </div>

      {/* content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-10 sm:py-12 md:py-14">
        {loading && (
          <div className="text-center text-black/70" data-reveal>
            Loading tours…
          </div>
        )}

        {error && !loading && (
          <div className="text-center text-red-600 font-medium" data-reveal>
            {error}
          </div>
        )}

        {!loading &&
          !error &&
          categories.map((cat) => {
            const tours = (cat.highlightedTours ?? []).slice(0, 3);
            if (tours.length === 0) return null; // skip empty categories
            return (
              <div
                key={cat._id}
                className="mb-12 sm:mb-14 md:mb-16"
                data-reveal
                data-category-id={cat._id}
              >
                <h3
                  className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 text-center"
                  style={{ color: THEME.gold }}
                  title={cat.name}
                >
                  {cat.name}
                </h3>

                <div className="grid gap-6 sm:gap-7 md:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {tours.map((t) => (
                    <TourCard key={t._id} t={adaptTour(t)} categoryId={cat._id} />
                  ))}
                </div>

                {/* optional: view all in category */}
                {/* <div className="mt-6 flex items-center justify-center">
                  <a
                    href={`/categories/${cat._id}`}
                    className="relative group inline-flex items-center gap-3 px-6 md:px-8 py-3 md:py-3.5 rounded-2xl font-semibold shadow-lg active:scale-[0.98] transition-transform"
                    style={{ background: THEME.gold, color: THEME.text }}
                    data-category-id={cat._id}
                  >
                    View all in {cat.name}
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12h14M13 6l6 6-6 6" stroke={THEME.text} strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                    <span
                      className="absolute -inset-1 rounded-3xl blur-md opacity-50 group-hover:opacity-90 transition"
                      style={{ background: `radial-gradient(60% 60% at 50% 50%, ${THEME.gold}77, transparent)` }}
                    />
                  </a>
                </div> */}
                <div className="mt-6 flex items-center justify-center">
  {/* use Link instead of <a href> */}
  <Link
    to={`/categories/${cat._id}`}
    className="relative group inline-flex items-center gap-3 px-6 md:px-8 py-3 md:py-3.5 rounded-2xl font-semibold shadow-lg active:scale-[0.98] transition-transform"
    style={{ background: THEME.gold, color: THEME.text }}
    data-category-id={cat._id}
  >
    {/* View all in {cat.name} */}Explore all tours
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M5 12h14M13 6l6 6-6 6" stroke={THEME.text} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
    <span
      className="absolute -inset-1 rounded-3xl blur-md opacity-50 group-hover:opacity-90 transition"
      style={{ background: `radial-gradient(60% 60% at 50% 50%, ${THEME.gold}77, transparent)` }}
    />
  </Link>
</div>

                
              </div>
            );
          })}

        {/* bottom CTA stripe */}
        {/* <div className="mt-10 sm:mt-12 flex items-center justify-center">
          <a
            href="#"
            className="relative group inline-flex items-center gap-3 px-6 md:px-8 py-3 md:py-3.5 rounded-2xl font-semibold shadow-lg active:scale-[0.98] transition-transform"
            style={{ background: THEME.gold, color: THEME.text }}
          >
            Explore all tours
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M13 6l6 6-6 6" stroke={THEME.text} strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <span
              className="absolute -inset-1 rounded-3xl blur-md opacity-50 group-hover:opacity-90 transition"
              style={{ background: `radial-gradient(60% 60% at 50% 50%, ${THEME.gold}77, transparent)` }}
            />
          </a>
        </div> */}
      </div>

      {/* keyframes (inline) */}
      <style>{`
        @keyframes slide { 
          0% { transform: translateX(-60%); } 
          50% { transform: translateX(0%); } 
          100% { transform: translateX(60%); } 
        }
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

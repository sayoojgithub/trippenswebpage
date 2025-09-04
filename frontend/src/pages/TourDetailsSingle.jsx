// src/components/TourDetailsSingle.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
// import TestimonialCarousel from "./TestimonialCarousel";
// import EnquiryForm from "./EnquiryForm";
import PUBLICAPI from "../apipublic";

const THEME = {
  bg: "#F7F7F7",
  brown: "#854836",
  gold: "#FFB22C",
  text: "#000000",
  font: "Poppins, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
};

// —— Reveal with deps + fallback ——
function useReveal(selector = "[data-reveal]", deps = []) {
  const ref = useRef(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const els = root.querySelectorAll(selector);

    // Fallback: if IO missing/blocked, reveal everything
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
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
      { threshold: 0.12 }
    );

    els.forEach((el) => {
      if (!el.classList.contains("reveal-in")) io.observe(el);
    });

    return () => io.disconnect();
  // IMPORTANT: rerun when content changes
  }, deps);

  return ref;
}

const inr = (n) =>
  typeof n === "number"
    ? new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }).format(n)
    : null;

const splitChips = (s) =>
  s ? String(s).split(/[,/|]/g).map((x) => x.trim()).filter(Boolean) : [];

const titleCase = (s) =>
  String(s || "").toLowerCase().replace(/\b\w/g, (m) => m.toUpperCase());

const formatUpcomingDates = (arr = []) =>
  arr
    .filter(Boolean)
    .map((iso) => {
      const d = new Date(iso);
      if (isNaN(d)) return null;
      const nowY = new Date().getFullYear();
      return d.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        ...(d.getFullYear() !== nowY ? { year: "numeric" } : {}),
      });
    })
    .filter(Boolean);

export default function TourDetailsSingle() {
  const { tourId } = useParams();
  const [loading, setLoading] = useState(true);
  const [tour, setTour] = useState(null);
  const [error, setError] = useState("");

  // Build derived arrays first so we can pass stable deps to useReveal
  const [mosaicImages, setMosaicImages] = useState([]);
  const [itineraryDays, setItineraryDays] = useState([]);
  const [faqItems, setFaqItems] = useState([]);
  const [upcomingChips, setUpcomingChips] = useState([]);

  // Rerun reveal when any of these counts change or when tour id changes
  const rootRef = useReveal("[data-reveal]", [
    tour?._id,
    mosaicImages.length,
    itineraryDays.length,
    faqItems.length,
    upcomingChips.length,
    loading,
    error,
  ]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError("");
        const { data } = await PUBLICAPI.get(`/public/tours/${tourId}`, {
          params: { activeOnly: true },
        });
        if (!mounted) return;
        setTour(data?.tour ?? null);
      } catch (e) {
        console.error(e);
        if (mounted) setError("Could not load this tour.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [tourId]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [tourId]);

  // Derive view-model pieces whenever tour changes (no defaults; skip empties)
  useEffect(() => {
    if (!tour) {
      setMosaicImages([]);
      setItineraryDays([]);
      setFaqItems([]);
      setUpcomingChips([]);
      return;
    }

    // images (show only real urls)
    const imgs = [
      // tour.mainImageUrl,
      ...(Array.isArray(tour.subImageUrls) ? tour.subImageUrls : []),
    ].filter((u) => typeof u === "string" && u.trim() !== "");
    setMosaicImages(imgs.slice(0, 5));

    // itinerary mapping
    const days = Array.isArray(tour.itinerary)
      ? tour.itinerary
          .filter((s) => typeof s?.day === "number")
          .sort((a, b) => a.day - b.day)
          .map((s) => {
            let location = "";
            if (s?.title?.includes("·")) {
              const parts = s.title.split("·");
              location = parts[1]?.trim() || "";
            }
            return {
              day: s.day,
              title: s.title || `Day ${s.day}`,
              location,
              image: (s.imageUrl || "").trim() || null,
              desc: (s.description || "").trim() || null,
            };
          })
      : [];
    setItineraryDays(days);

    // faqs
    const faqs = Array.isArray(tour.faqs)
      ? tour.faqs
          .map((f) => ({ q: (f?.q || "").trim(), a: (f?.a || "").trim() }))
          .filter((f) => f.q || f.a)
      : [];
    setFaqItems(faqs);

    // upcoming date chips
    setUpcomingChips(formatUpcomingDates(tour.upcomingDates || []));
  }, [tour]);

  // guards for “don’t use defaults”: only show non-empty / meaningful values
  const showDuration = typeof tour?.days === "number" || typeof tour?.nights === "number";
  const showCost = typeof tour?.tripCost === "number" && tour.tripCost > 0;
  const showTripStyle = !!(tour?.tripStyle && splitChips(tour.tripStyle).length);
  const showVehicle = !!(tour?.vehicle && tour.vehicle.trim());
  const showDistance = !!(tour?.drivingDistance && tour.drivingDistance.trim());
  const showLandscapes = Array.isArray(tour?.landscapes) && tour.landscapes.length > 0;
  const showActivity = !!(tour?.activity && splitChips(tour.activity).length);
  const showUpcoming = upcomingChips.length > 0;
  const showRouteMap = !!(tour?.routeMapUrl && tour.routeMapUrl.trim());

  return (
    <section
      ref={rootRef}
      className="relative w-full"
      style={{
        fontFamily: THEME.font,
        background: THEME.bg,
        minHeight: "60vh",
      }}
    >
      {loading && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 pt-16 text-center" data-reveal>
          <div className="text-black/70">Loading tour…</div>
        </div>
      )}

      {!loading && error && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 pt-16 text-center" data-reveal>
          <div className="text-red-600 font-medium">{error}</div>
        </div>
      )}

      {!loading && !error && tour && (
        <>
          {/* Back */}
          <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 pt-6" data-reveal>
            <Link
              to={-1}
              className="inline-flex items-center gap-2 text-sm"
              style={{ color: THEME.brown }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              Back
            </Link>
          </div>

          {/* ——— Mosaic ——— */}
          {(tour.tourName || mosaicImages.length > 0) && (
            <section className="relative w-full" data-reveal>
              <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 pt-6">
                {tour.tourName && (
                  <h2
                    className="text-2xl sm:text-3xl md:text-4xl font-extrabold leading-tight"
                    style={{ color: THEME.brown }}
                  >
                    {tour.tourName} <span style={{ color: THEME.gold }}>•</span>
                  </h2>
                )}
                <p className="mt-1 text-black/75 text-sm sm:text-base md:text-lg max-w-3xl">
                  {[
                    typeof tour.days === "number" ? `${tour.days}D` : null,
                    typeof tour.nights === "number" ? `${tour.nights}N` : null,
                    showVehicle ? tour.vehicle : null,
                    showTripStyle ? splitChips(tour.tripStyle)[0] : null,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>

              {mosaicImages.length > 0 && (
                <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 pb-6">
                  <div className="grid grid-cols-12 gap-4 sm:gap-5 md:gap-6">
                    {/* Left big card */}
                    <div className="col-span-12 lg:col-span-7">
                      <div className="h-[44vh] sm:h-[48vh] md:h-[52vh] min-h-[280px] max-h-[600px]">
                        {mosaicImages[0] && (
                          <figure
                            className="group relative h-full w-full overflow-hidden rounded-2xl bg-white"
                            style={{
                              boxShadow: "0 14px 36px rgba(0,0,0,0.12)",
                              border: "1px solid rgba(0,0,0,0.06)",
                            }}
                          >
                            <span
                              className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"
                              style={{ boxShadow: `inset 0 0 0 2px ${THEME.gold}` }}
                            />
                            <img
                              src={mosaicImages[0]}
                              alt="trip-main"
                              loading="lazy"
                              decoding="async"
                              referrerPolicy="no-referrer"
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                              onError={(e) => (e.currentTarget.style.display = "none")}
                            />
                            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/30 via-black/10 to-transparent" />
                          </figure>
                        )}
                      </div>
                    </div>

                    {/* Right 2x2 grid */}
                    <div className="col-span-12 lg:col-span-5">
                      <div className="grid grid-cols-2 grid-rows-2 gap-4 sm:gap-5 md:gap-6 h-[44vh] sm:h-[48vh] md:h-[52vh] min-h-[280px] max-h-[600px]">
                        {mosaicImages.slice(1, 5).map((src, i) =>
                          src ? (
                            <figure
                              key={i}
                              className="group relative h-full w-full overflow-hidden rounded-2xl bg-white"
                              style={{
                                boxShadow: "0 14px 36px rgba(0,0,0,0.12)",
                                border: "1px solid rgba(0,0,0,0.06)",
                              }}
                            >
                              <span
                                className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"
                                style={{ boxShadow: `inset 0 0 0 2px ${THEME.gold}` }}
                              />
                              <img
                                src={src}
                                alt={`trip-${i + 1}`}
                                loading="lazy"
                                decoding="async"
                                referrerPolicy="no-referrer"
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                                onError={(e) => (e.currentTarget.style.display = "none")}
                              />
                              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/30 via-black/10 to-transparent" />
                            </figure>
                          ) : null
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* ——— Trip Details ——— */}
          {(showDuration ||
            showCost ||
            showTripStyle ||
            showVehicle ||
            showDistance ||
            showLandscapes ||
            showActivity ||
            showUpcoming ||
            showRouteMap) && (
            <section className="relative w-full select-none" data-reveal>
              <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 pt-10 sm:pt-12 md:pt-16">
                <h2
                  className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight"
                  style={{ color: THEME.brown }}
                >
                  Trip <span style={{ color: THEME.gold }}>Details</span>
                </h2>
                <p className="mt-3 text-sm sm:text-base md:text-lg text-black/70 max-w-2xl">
                  Everything you need at a glance — crafted for the open road.
                </p>
                <div className="mt-6 h-[3px] w-40 rounded-full overflow-hidden">
                  <div
                    className="h-full w-full animate-[slide_1.6s_ease-in-out_infinite]"
                    style={{ background: `linear-gradient(90deg, transparent, ${THEME.gold}, transparent)` }}
                  />
                </div>
              </div>

              <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-10 md:py-12">
                <div
                  className="rounded-3xl p-5 sm:p-7 md:p-9 backdrop-blur-md"
                  style={{
                    background: "rgba(255,255,255,0.65)",
                    border: "1px solid rgba(0,0,0,0.06)",
                    boxShadow: "0 24px 60px rgba(0,0,0,0.10)",
                  }}
                >
                  {showDuration && (
                    <>
                      <Row
                        icon={Icon.clock}
                        label="Duration"
                        value={[
                          typeof tour.days === "number" ? `${tour.days} Days` : null,
                          typeof tour.nights === "number" ? `${tour.nights} Nights` : null,
                        ].filter(Boolean).join(" / ")}
                      />
                      <Divider />
                    </>
                  )}

                  {showCost && (
                    <>
                      <Row icon={Icon.rupee} label="Trip Cost" value={inr(tour.tripCost)} />
                      <Divider />
                    </>
                  )}

                  {showTripStyle && (
                    <>
                      <Row icon={Icon.style} label="Trip Style" chips={splitChips(tour.tripStyle)} />
                      <Divider />
                    </>
                  )}

                  {showVehicle && (
                    <>
                      <Row icon={Icon.car} label="Vehicle" value={tour.vehicle} />
                      <Divider />
                    </>
                  )}

                  {showDistance && (
                    <>
                      <Row icon={Icon.road} label="Driving Distance" value={tour.drivingDistance} />
                      <Divider />
                    </>
                  )}

                  {showLandscapes && (
                    <>
                      <Row icon={Icon.landscape} label="Landscapes" chips={tour.landscapes.map(titleCase)} />
                      <Divider />
                    </>
                  )}

                  {showActivity && (
                    <>
                      <Row icon={Icon.activity} label="Activities" chips={splitChips(tour.activity)} />
                      <Divider />
                    </>
                  )}

                  {showUpcoming && <Row icon={Icon.calendar} label="Upcoming Dates" chips={upcomingChips} />}
                </div>
              </div>

              {showRouteMap && (
                <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 pb-10 sm:pb-14 md:pb-16">
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold" style={{ color: THEME.brown }}>
                      Route map
                    </h3>
                    <span
                      className="hidden sm:inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
                      style={{ background: THEME.gold, color: THEME.text }}
                    >
                      <span className="inline-block">{Icon.mapPin}</span>
                      Highlights
                    </span>
                  </div>

                  <div
                    className="relative rounded-3xl overflow-hidden"
                    style={{
                      background: "rgba(255,255,255,0.7)",
                      border: "1px solid rgba(0,0,0,0.06)",
                      boxShadow: "0 28px 70px rgba(0,0,0,0.12)",
                    }}
                  >
                    <span
                      className="pointer-events-none absolute inset-0 rounded-3xl"
                      style={{ boxShadow: `inset 0 0 0 2px ${THEME.gold}33` }}
                    />
                    <img
                      src={tour.routeMapUrl}
                      alt="Route map"
                      loading="lazy"
                      decoding="async"
                      referrerPolicy="no-referrer"
                      className="w-full h-[38vh] sm:h-[44vh] md:h-[50vh] object-cover transition-transform duration-700 hover:scale-[1.03]"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/25 via-black/10 to-transparent" />
                    <div
                      className="absolute left-3 bottom-3 sm:left-4 sm:bottom-4 flex items-center gap-2 rounded-2xl px-3 py-1.5 text-xs sm:text-sm font-semibold shadow backdrop-blur-sm"
                      style={{ background: "rgba(255,255,255,0.85)", color: THEME.brown }}
                    >
                       route preview
                    </div>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* ——— Itinerary ——— */}
          {itineraryDays.length > 0 && (
            <section className="relative w-full select-none" data-reveal>
              <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 pt-10 sm:pt-12 md:pt-16">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight" style={{ color: THEME.brown }}>
                  TOUR ITINERARY <span style={{ color: THEME.gold }}>•</span>
                </h2>
                <p className="mt-3 text-sm sm:text-base md:text-lg text-black/70 max-w-2xl">
                  Follow the dotted route — stop by stop — and open each day to peek into the journey.
                </p>
                <div className="mt-6 h-[3px] w-40 rounded-full overflow-hidden">
                  <div
                    className="h-full w-full animate-[slide_1.6s_ease-in-out_infinite]"
                    style={{ background: `linear-gradient(90deg, transparent, ${THEME.gold}, transparent)` }}
                  />
                </div>
              </div>

              <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-10 md:py-12">
                <div className="relative">
                  {/* dotted spine */}
                  <div
                    className="pointer-events-none absolute left-2 sm:left-3 md:left-4 lg:left-6 top-0 bottom-0 w-[2px]"
                    style={{
                      background: `repeating-linear-gradient(to bottom, ${THEME.brown}, ${THEME.brown} 8px, transparent 8px, transparent 18px)`,
                      animation: "routeFlow 8s linear infinite",
                      opacity: 0.55,
                      borderRadius: "2px",
                    }}
                  />
                  <div className="space-y-4 sm:space-y-5 md:space-y-6">
                    {itineraryDays.map((item, i) => (
                      <ItineraryRow key={`${item.day}-${i}`} item={item} />
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ——— FAQs ——— */}
          {faqItems.length > 0 && (
            <section className="w-full py-16 px-4 md:px-10 lg:px-20 bg-[#F7F7F7]" data-reveal>
              <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold">
                  Frequently Asked <span style={{ color: THEME.gold }}>Questions</span>
                </h2>
                <p className="mt-3 text-gray-700 text-sm sm:text-base md:text-lg max-w-2xl mx-auto">
                  Here are some of the most common questions travelers ask before booking with us.
                </p>
              </div>

              <div className="max-w-4xl mx-auto flex flex-col gap-5">
                {faqItems.map((faq, i) => (
                  <FAQCard key={i} faq={faq} />
                ))}
              </div>
            </section>
          )}

          {/* CTA */}
          {/* <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 my-12" data-reveal>
            <div className="rounded-2xl border border-black/5 bg-white p-5 flex items-center justify-between gap-4">
              <div>
                <div className="text-lg font-semibold">Ready to enquire/book?</div>
                <div className="text-sm text-black/70">
                  Share your dates and group size—we’ll confirm availability.
                </div>
              </div>
              <Link
                to={`/enquire?tourId=${encodeURIComponent(tour._id)}`}
                className="rounded-xl px-4 py-2 font-semibold"
                style={{ background: THEME.gold, color: THEME.text }}
              >
                Enquire Now
              </Link>
            </div>
          </div> */}

          {/* keyframes (style preserved) */}
          <style>{`
            @keyframes slide { 0% { transform: translateX(-60%); } 50% { transform: translateX(0%); } 100% { transform: translateX(60%); } }
            @keyframes routeFlow { 0% { background-position-y: 0; } 100% { background-position-y: 180px; } }
            [data-reveal]{ opacity:0; transform: translateY(12px) scale(.985); transition: opacity .5s ease, transform .5s cubic-bezier(.2,.8,.2,1); }
            .reveal-in{ opacity:1; transform: translateY(0) scale(1); }
          `}</style>
        </>
      )}
    </section>
  );
}

/* ————————————————— atoms ————————————————— */

function Row({ icon, label, value, chips }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-3">
      <div className="flex items-center gap-3">
        <span className="shrink-0">{icon}</span>
        <span className="text-sm font-semibold" style={{ color: THEME.brown }}>{label}</span>
      </div>
      {value && <div className="text-sm sm:text-base text-black/80">{value}</div>}
      {Array.isArray(chips) && chips.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {chips.map((c, i) => (
            <span
              key={i}
              className="inline-flex items-center rounded-full px-2.5 py-1 text-xs sm:text-sm font-medium"
              style={{ background: "rgba(255,178,44,0.16)", color: THEME.brown, border: "1px solid rgba(133,72,54,0.25)" }}
            >
              {c}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function Divider() {
  return (
    <div className="my-2">
      <div className="h-[2px] w-full rounded-full" style={{ background: `linear-gradient(90deg, transparent, ${THEME.gold}, transparent)` }} />
    </div>
  );
}

const Icon = {
  clock: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
      <circle cx="12" cy="12" r="9" stroke={THEME.brown} strokeWidth="1.6" />
      <path d="M12 7v6l4 2" stroke={THEME.brown} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  rupee: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
      <path d="M7 6h10M7 10h10M7 6c3 0 5 2 5 4s-2 4-5 4h6l4 4" stroke={THEME.brown} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  style: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
      <path d="M4 7h16M4 12h16M4 17h10" stroke={THEME.brown} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  car: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
      <path d="M3 13l2-6h14l2 6v5h-2a2 2 0 1 1-4 0H9a2 2 0 1 1-4 0H3v-5Z" stroke={THEME.brown} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 13h10" stroke={THEME.brown} strokeWidth="1.6" />
    </svg>
  ),
  road: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
      <path d="M9 21l3-18m3 18L12 3" stroke={THEME.brown} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M12 6v3m0 3v3m0 3v3" stroke={THEME.gold} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  landscape: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
      <path d="M3 17l5-6 4 5 3-4 6 5H3Z" stroke={THEME.brown} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="18" cy="7" r="2" fill={THEME.gold} />
    </svg>
  ),
  activity: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
      <path d="M3 12h4l2 6 4-12 2 6h6" stroke={THEME.brown} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  calendar: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
      <rect x="3" y="5" width="18" height="16" rx="2" stroke={THEME.brown} strokeWidth="1.6" />
      <path d="M16 3v4M8 3v4M3 9h18" stroke={THEME.brown} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  mapPin: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
      <path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12Z" stroke={THEME.brown} strokeWidth="1.6" />
      <circle cx="12" cy="10" r="2.5" stroke={THEME.gold} strokeWidth="1.6" />
    </svg>
  ),
};

function ItineraryRow({ item }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      {/* pin */}
      <div className="absolute left-0 top-[14px] -translate-x-1/2 lg:-translate-x-1/3">
        <div
          className="grid place-items-center h-6 w-6 rounded-full"
          style={{ background: "#fff", boxShadow: "0 6px 14px rgba(0,0,0,0.12)", border: `2px solid ${THEME.gold}` }}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
            <path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12Z" fill={THEME.gold} opacity=".9" />
            <circle cx="12" cy="10" r="2.3" fill={THEME.brown} />
          </svg>
        </div>
      </div>

      {/* card */}
      <div
        className="ml-9 sm:ml-10 md:ml-12 lg:ml-14 rounded-2xl bg-white/90 backdrop-blur-md border overflow-hidden group"
        style={{ borderColor: "rgba(0,0,0,0.08)", boxShadow: "0 16px 44px rgba(0,0,0,0.10)", transition: "transform 200ms ease" }}
      >
        <button
          onClick={() => setOpen((p) => !p)}
          className="w-full flex items-center justify-between gap-3 px-4 sm:px-5 md:px-6 py-3 sm:py-4 text-left"
          aria-expanded={open}
          data-reveal
        >
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-semibold tracking-wide" style={{ color: THEME.gold }}>
              DAY {String(item.day).padStart(2, "0")}{item.location ? ` · ${item.location}` : ""}
            </p>
            {item.title && (
              <h4 className="truncate text-base sm:text-lg md:text-xl font-extrabold" style={{ color: THEME.brown }}>
                {item.title}
              </h4>
            )}
          </div>
          <span className="shrink-0 grid place-items-center h-9 w-9 rounded-xl" style={{ background: THEME.gold, color: THEME.text, boxShadow: "0 8px 20px rgba(0,0,0,0.18)" }}>
            <svg viewBox="0 0 24 24" width="18" height="18" style={{ transform: `rotate(${open ? 45 : 0}deg)`, transition: "transform 260ms ease" }}>
              <path d="M12 5v14M5 12h14" stroke={THEME.text} strokeWidth="2" strokeLinecap="round" />
            </svg>
          </span>
        </button>

        <div style={{ maxHeight: open ? "1000px" : 0, transition: "max-height 420ms cubic-bezier(.2,.8,.2,1)", overflow: "hidden" }}>
          <div className="px-4 sm:px-5 md:px-6 pb-4 sm:pb-5 md:pb-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-6">
              {item.image && (
                <div className="md:col-span-2">
                  <div className="relative rounded-2xl overflow-hidden" style={{ background: "#fff", boxShadow: "0 30px 80px rgba(0,0,0,.15)", border: "1px solid rgba(0,0,0,.06)" }}>
                    <span className="absolute -left-1 -top-1 h-6 w-10 rotate-[-12deg]" style={{ background: THEME.gold, opacity: 0.9, borderRadius: "6px" }} />
                    <span className="absolute -right-1 -bottom-1 h-6 w-10 rotate-[12deg]" style={{ background: THEME.gold, opacity: 0.9, borderRadius: "6px" }} />
                    <img
                      src={item.image}
                      alt={item.title || `Day ${item.day}`}
                      loading="lazy"
                      decoding="async"
                      referrerPolicy="no-referrer"
                      className="block w-full h-52 sm:h-60 md:h-64 object-cover"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  </div>
                </div>
              )}

              {item.desc && (
                <div className={item.image ? "md:col-span-3" : "md:col-span-5"}>
                  <p className="text-sm sm:text-base md:text-lg text-black/80 leading-relaxed">{item.desc}</p>
                  {/* <div className="mt-3 flex flex-wrap gap-2">
                    {["Convoy", "Local food", "Photo ops"].map((tag, i) => (
                      <span key={i} className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium" style={{ background: "rgba(255,178,44,0.14)", color: THEME.brown, border: "1px solid rgba(133,72,54,0.25)" }}>
                        {tag}
                      </span>
                    ))}
                  </div> */}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FAQCard({ faq }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="w-full rounded-2xl shadow-lg overflow-hidden transition-all duration-300" style={{ background: "rgba(255,255,255,0.7)", backdropFilter: "blur(12px)", border: `1px solid ${THEME.gold}44` }}>
      <button onClick={() => setOpen((p) => !p)} className="w-full flex justify-between items-center px-6 py-4 text-left font-semibold" style={{ color: THEME.brown }}>
        <span>{faq.q || "Question"}</span>
        <span className="transition-transform duration-300 text-xl" style={{ color: THEME.gold }}>
          {open ? "−" : "+"}
        </span>
      </button>
      <div className={`px-6 pb-4 text-sm md:text-base transition-all duration-500 ${open ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"} overflow-hidden`} style={{ color: THEME.text }}>
        {faq.a || "—"}
      </div>
    </div>
  );
}


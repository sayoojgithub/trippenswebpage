// VideoShowcase.jsx — Animated YouTube section (Desert Theme)
// Colors: bg #F7F7F7, brown #854836, gold #FFB22C, text #000, font: Poppins

import React, { useEffect, useRef, useState } from "react";

const THEME = {
  bg: "#F7F7F7",
  brown: "#854836",
  gold: "#FFB22C",
  text: "#000000",
  font: "Poppins, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
};

// --- Utils ---
function getYouTubeId(url = "") {
  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be") return u.pathname.replace("/", "");
    if (u.hostname.includes("youtube.com")) return u.searchParams.get("v");
    return null;
  } catch {
    return null;
  }
}
const ytThumbMax = (id) => `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`;
const ytThumbHQ = (id) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
const ytEmbed = (id) =>
  `https://www.youtube.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;

// --- Reveal on scroll hook ---
function useReveal(selector = "[data-reveal]") {
  const ref = useRef(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const els = root.querySelectorAll(selector);
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("reveal-in");
        });
      },
      { threshold: 0.15 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return ref;
}

// --- Video Thumb / Player (UPDATED as requested) ---
// --- Video Thumb / Player (FIXED title below video) ---
function VideoCard({ url, title, sub, featured = false }) {
  const id = getYouTubeId(url);
  const [play, setPlay] = useState(false);
  const [thumb, setThumb] = useState(ytThumbMax(id));
  const ratio = featured ? "aspect-[16/9]" : "aspect-[16/9]";

  return (
    <article data-reveal>
      {/* Video box */}
      <div
        className={`group relative overflow-hidden rounded-3xl ${ratio} bg-white`}
        style={{
          boxShadow: "0 24px 60px rgba(0,0,0,0.10)",
          border: "1px solid rgba(0,0,0,0.06)",
          willChange: "transform",
          transition: "transform 200ms ease, box-shadow 250ms ease",
        }}
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width - 0.5;
          const py = (e.clientY - r.top) / r.height - 0.5;
          e.currentTarget.style.transform = `perspective(1000px) rotateX(${py * -2.2}deg) rotateY(${px * 3.2}deg)`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "perspective(1000px) rotateX(0) rotateY(0)";
        }}
      >
        {play ? (
          <iframe
            className="absolute inset-0 h-full w-full rounded-3xl"
            src={ytEmbed(id)}
            title={title}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />
        ) : (
          <img
            src={thumb}
            alt={title}
            onError={() => setThumb(ytThumbHQ(id))}
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
        )}

        {/* Gold ring */}
        <span
          className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ boxShadow: `inset 0 0 0 2px ${THEME.gold}` }}
        />

        {/* Play button */}
        {!play && (
          <button
            onClick={() => setPlay(true)}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 group/play"
            aria-label="Play video"
          >
            <span
              className="grid place-items-center h-16 w-16 sm:h-18 sm:w-18 md:h-20 md:w-20 rounded-full shadow-xl transition-transform group-hover:scale-105"
              style={{ background: THEME.gold, color: THEME.text }}
            >
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none">
                <path d="M8 5v14l11-7z" fill={THEME.text} />
              </svg>
            </span>
          </button>
        )}
      </div>

      {/* TEXT BELOW video */}
      <div className="relative mt-4 px-2 sm:px-3 md:px-4 pb-4 text-center">
        <div
          className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs md:text-sm font-semibold mb-3 shadow"
          style={{ background: `${THEME.gold}`, color: THEME.text }}
        >
          Trippens · YouTube
        </div>
        <h3
          className={`font-extrabold leading-tight ${
            featured ? "text-2xl sm:text-3xl md:text-4xl" : "text-lg sm:text-xl md:text-2xl"
          }`}
          style={{ color: THEME.brown }}
        >
          {title}
        </h3>
        {sub && (
          <p className="mt-2 text-black/80 text-sm sm:text-base md:text-lg max-w-3xl mx-auto">
            {sub}
          </p>
        )}
      </div>
    </article>
  );
}


export default function VideoShowCase() {
  const rootRef = useReveal();

  // Your videos (first is featured)
  const VIDEOS = [
    {
      url: "https://youtu.be/rIxUbcuy3l8?si=PzOBQACWMwUFkuWa",
      title: "First Official Trippens Expedition · Nepal + Bhutan + Northeast India",
      sub: "2 countries, Northeast India, 8 travellers, 2 cars · non-stop drive — a milestone that defined our spirit of road adventures.",
      featured: true,
    },
    {
      url: "https://youtu.be/LEEwD2rQiHE?si=GmbnLNusLagECsZ1",
      title: "Kerala → Kashmir Road Trip · Monthly Signature Drive",
      sub: "Coast to the crown of India — our much-loved monthly expedition.",
    },
    {
      url: "https://youtu.be/ae5ZNEYYmlI?si=z0cdzu4xgQIEpy-o",
      title: "Kerala → Kashmir Road Trip · Highlights",
      sub: "A taste of the landscapes and convoy energy you’ll feel on the road.",
    },
  ];

  return (
    <section
      ref={rootRef}
      className="relative w-full"
      style={{ fontFamily: THEME.font, background: THEME.bg }}
    >
      {/* header */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 pt-12 sm:pt-16 md:pt-20 text-center">
        <h2
          className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight"
          style={{ color: THEME.brown }}
        >
          Road Films from <span style={{ color: THEME.gold }}>Trippens</span>
        </h2>
        <p className="mt-3 text-sm sm:text-base md:text-lg text-black/70 max-w-2xl mx-auto">
          Stories from the road — rugged passes, warm people, and convoy camaraderie. Press play.
        </p>
        {/* animated underline */}
        <div className="mx-auto mt-6 h-[3px] w-40 rounded-full overflow-hidden">
          <div
            className="h-full w-full animate-[slide_1.6s_ease-in-out_infinite]"
            style={{
              background: `linear-gradient(90deg, transparent, ${THEME.gold}, transparent)`,
            }}
          />
        </div>
      </div>

      {/* Featured + Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-10 sm:py-12 md:py-14">
        {/* Featured */}
        <div className="mb-8 md:mb-12">
          <VideoCard {...VIDEOS[0]} />
        </div>

        {/* Others */}
        <div className="grid gap-6 sm:gap-7 md:gap-8 grid-cols-1 sm:grid-cols-2">
          <VideoCard {...VIDEOS[1]} />
          <VideoCard {...VIDEOS[2]} />
        </div>

        {/* CTA */}
        <div className="flex justify-center mt-10 sm:mt-12">
          <a
            href="https://www.youtube.com/@yourchannel"
            target="_blank"
            rel="noreferrer"
            className="relative group inline-flex items-center gap-3 px-6 md:px-8 py-3 md:py-3.5 rounded-2xl font-semibold shadow-lg active:scale-[0.98] transition-transform"
            style={{ background: THEME.gold, color: THEME.text }}
          >
            Explore our YouTube
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M13 6l6 6-6 6" stroke={THEME.text} strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <span
              className="absolute -inset-1 rounded-3xl blur-md opacity-50 group-hover:opacity-90 transition"
              style={{ background: `radial-gradient(60% 60% at 50% 50%, ${THEME.gold}77, transparent)` }}
            />
          </a>
        </div>
      </div>

      {/* keyframes & reveal styles */}
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

// AboutUs.jsx — Non-typical "About" section with desert theme, animations, and responsive layout
// Colors: bg #F7F7F7, brown #854836, gold #FFB22C, text #000, font: Poppins
// Includes: heading with gold highlight, expanded tagline, India Book of Records block (with image),
//           Google-like rating widget, and a long "Our Story" paragraph.

import React from "react";

const THEME = {
  bg: "#F7F7F7",
  brown: "#854836",
  gold: "#FFB22C",
  text: "#000000",
  font: "Poppins, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
};

// India Book of Records image from official page (for demo / can replace with your local asset)
// Source: https://indiabookofrecords.in/trippens-appreciation/
import IBR_IMAGE from "../assets/ibr_holderrr.jpg";

export default function AboutUs() {
  return (
    <section
      className="relative"
      style={{ fontFamily: THEME.font, background: THEME.bg }}
    >
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:py-16 md:py-20">
        {/* Header */}
        <header className="relative">
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-extrabold leading-tight text-center md:text-left">
            Welcome to {" "}
            <span className="relative inline-block">
              <span className="relative z-10" style={{ color: THEME.gold }}>Trippens</span>
              {/* gold underline sweep */}
              <span className="absolute left-0 right-0 -bottom-1 h-2 rounded-full opacity-80" style={{ background: THEME.gold }} />
            </span>
          </h2>
          <p className="mt-3 md:mt-4 text-sm sm:text-base md:text-lg max-w-3xl text-black/80 md:text-black/70">
            <span className="font-semibold" style={{ color: THEME.brown }}>India’s first all‑India by‑road trip tour operator</span> — crafting immersive routes, authentic stays and unforgettable moments across the subcontinent.
          </p>
        </header>

        {/* Split content: IBR + copy */}
        <div className="mt-8 md:mt-12 grid gap-6 md:gap-8 md:grid-cols-2">
          {/* IBR Card */}
          <div
            className="relative overflow-hidden rounded-3xl backdrop-blur-md shadow-2xl"
            style={{ background: "rgba(255,255,255,0.6)", border: "1px solid rgba(0,0,0,0.06)" }}
          >
            <div className="aspect-[16/10] sm:aspect-[16/9] md:aspect-[5/3] overflow-hidden">
              <img src={IBR_IMAGE} alt="India Book of Records – Trippens Appreciation" className="h-full w-full object-cover" />
            </div>

            <div className="p-5 sm:p-6 md:p-7">
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold flex items-center gap-3">
                <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: THEME.gold }} />
                <span style={{ color: THEME.brown }}>India Book of Records</span>
              </h3>
              <p className="mt-2 text-sm sm:text-base text-black/80">
                Recognised for an epic Kerala–Ladakh–Kerala expedition: <span className="font-medium" style={{ color: THEME.brown }}>8,600 km</span> across <span className="font-medium" style={{ color: THEME.brown }}>16 states</span> in <span className="font-medium" style={{ color: THEME.brown }}>22 days</span>, reaching <span className="font-medium" style={{ color: THEME.brown }}>Khardung La</span>. The appreciation cites our founding in <span className="font-medium" style={{ color: THEME.brown }}>2017</span> and base in <span className="font-medium" style={{ color: THEME.brown }}>Thrissur, Kerala</span>.
              </p>
              <a
                href="https://indiabookofrecords.in/trippens-appreciation/"
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-2 text-sm font-semibold"
                style={{ color: THEME.brown }}
              >
                Read the official post
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
              </a>
            </div>
          </div>

          {/* Copy + Google-like rating */}
          <div className="flex flex-col justify-between">
            <div>
              <h3 className="text-lg sm:text-xl font-semibold" style={{ color: THEME.brown }}>Who we are</h3>
              <p className="mt-2 text-sm sm:text-base text-black/80 leading-relaxed">
                We design road trips that feel personal, safe and wildly memorable. From high‑altitude passes to quiet coastal roads, we plan every leg with local knowledge, seasoned drive captains and carefully vetted stays.
              </p>

              {/* Google-like rating widget */}
              <div
                className="mt-4 sm:mt-6 inline-flex items-center gap-3 rounded-2xl px-4 py-3 shadow-lg"
                style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.06)" }}
              >
                {/* G logo style dot */}
                <span className="grid place-items-center h-8 w-8 rounded-full" style={{ background: THEME.gold, color: THEME.text, boxShadow: "0 8px 20px rgba(0,0,0,0.12)" }}>G</span>
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-lg" style={{ color: THEME.brown }}>4.9</strong>
                    {/* stars */}
                    <div className="flex">
                      {[0,1,2,3,4].map(i => (
                        <svg key={i} viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
                          <path d="M12 3l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 18.9 6.2 21l1.1-6.5L2.6 9.8l6.5-.9L12 3z" fill={THEME.gold} stroke="rgba(0,0,0,0.15)"/>
                        </svg>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-black/60">Google reviews from happy travellers</p>
                </div>
              </div>
            </div>

            {/* Our Story */}
            <div className="mt-6 sm:mt-8">
              <h3 className="text-lg sm:text-xl font-semibold" style={{ color: THEME.brown }}>Our story</h3>
              <p className="mt-2 text-sm sm:text-base text-black/80 leading-relaxed">
                <span style={{ color: THEME.gold, fontWeight: 600 }}>Trippens</span> began as a passion for adventure tours and officially launched in <span style={{ color: THEME.gold, fontWeight: 600 }}>2017</span>. We specialise in curated <span style={{ color: THEME.gold, fontWeight: 600 }}>drive tours</span> across borders and have successfully explored <span style={{ color: THEME.gold, fontWeight: 600 }}>seven countries</span>. Today, we operate properties in <span style={{ color: THEME.gold, fontWeight: 600 }}>Kashmir</span>, <span style={{ color: THEME.gold, fontWeight: 600 }}>Thailand</span> and <span style={{ color: THEME.gold, fontWeight: 600 }}>Manali</span>, and craft <span style={{ color: THEME.gold, fontWeight: 600 }}>luxury tour packages</span> to destinations almost everywhere. We are proud to be recognised as the <span style={{ color: THEME.gold, fontWeight: 600 }}>first all‑India by‑road trip tour operator</span> and to have received an appreciation from the <span style={{ color: THEME.gold, fontWeight: 600 }}>India Book of Records</span> for our nationwide expedition. Our operations span multiple locations with active offices in <span style={{ color: THEME.gold, fontWeight: 600 }}>Thailand</span> and our head office in <span style={{ color: THEME.gold, fontWeight: 600 }}>Thrissur</span>.
              </p>
            </div>
          </div>
        </div>

        {/* subtle sand wave divider */}
        <div className="mt-12 sm:mt-16 h-[3px] w-full" style={{ background: `linear-gradient(90deg, transparent, ${THEME.gold}, transparent)` }} />
      </div>
    </section>
  );
}

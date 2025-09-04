// ContactHero.jsx — Full-screen contact page (desert theme, animated)
// Theme: bg #F7F7F7, brown #854836, gold #FFB22C, text #000, font: Poppins

import React, { useEffect, useRef } from "react";

const THEME = {
  bg: "#F7F7F7",
  brown: "#854836",
  gold: "#FFB22C",
  text: "#000000",
  font: "Poppins, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
};

const SOCIALS = {
  facebook: "https://www.facebook.com/share/19fQocwZ2w/?mibextid=wwXIfr",
  instagram: "https://www.instagram.com/trippens_?igsh=YzkybTdhNThzYzF1",
  twitter: "https://x.com/trippens9?s=21",
  youtube: "https://www.youtube.com/@trippens318",
  whatsapp: "#",
};

const PHONES = [
  "+91 8606131909",
  "+91 9895666909",
  "+91 04872383104",
  "+91 04872384104",
];

function useReveal(selector = "[data-reveal]") {
  const ref = useRef(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const els = root.querySelectorAll(selector);
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e, i) => {
          if (e.isIntersecting) {
            e.target.style.transitionDelay = `${Math.min(i * 70, 400)}ms`;
            e.target.classList.add("reveal-in");
          }
        }),
      { threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return ref;
}

function PhoneCard({ number }) {
  const clean = number.replace(/\s/g, "");
  return (
    <a
      href={`tel:${clean}`}
      className="group relative flex items-center gap-3 rounded-2xl p-4 sm:p-5 bg-white/90 backdrop-blur-md"
      data-reveal
      style={{
        border: "1px solid rgba(0,0,0,0.06)",
        boxShadow: "0 20px 50px rgba(0,0,0,0.10)",
        transition: "transform 200ms ease, box-shadow 220ms ease",
      }}
    >
      {/* gold ring on hover */}
      <span
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ boxShadow: `inset 0 0 0 2px ${THEME.gold}` }}
      />
      <span
        className="grid place-items-center h-11 w-11 rounded-xl shrink-0"
        style={{
          background: THEME.gold,
          color: THEME.text,
          boxShadow: "0 10px 24px rgba(0,0,0,0.18)",
        }}
      >
        {/* phone icon */}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M22 16.92v2a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.18 2 2 0 0 1 4.11 2h2a2 2 0 0 1 2 1.72c.12.9.3 1.77.57 2.6a2 2 0 0 1-.45 2.11L7.1 9.91a16 16 0 0 0 6 6l1.48-1.12a2 2 0 0 1 2.11-.45c.83.27 1.7.45 2.6.57A2 2 0 0 1 22 16.92z"
            stroke={THEME.brown}
            strokeWidth="1.6"
          />
        </svg>
      </span>
      <div>
        <p className="text-xs text-black/60">Call us</p>
        <p className="text-base sm:text-lg font-semibold" style={{ color: THEME.brown }}>
          {number}
        </p>
      </div>
    </a>
  );
}

function SocialIcon({ label, href, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className="group inline-grid place-items-center h-11 w-11 rounded-full"
      style={{
        background: "rgba(255,255,255,0.95)",
        boxShadow: "0 12px 28px rgba(0,0,0,0.15)",
        transition: "transform 180ms ease, box-shadow 220ms ease",
      }}
      data-reveal
    >
      <span className="transition-transform group-hover:scale-110">{children}</span>
    </a>
  );
}

export default function ContactSplit({
  addressLines = [
    "Trippens HQ",
    "High Road, Thrissur, Kerala 680001",
    "India",
  ],
  phones = PHONES,
  socials = SOCIALS,
}) {
  const rootRef = useReveal();

  return (
    <section
      ref={rootRef}
      className="relative w-full min-h-[92vh] flex items-center"
      style={{ fontFamily: THEME.font, background: THEME.bg }}
    >
      {/* soft topo-like lines (very low opacity) */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "radial-gradient(1100px 300px at 0% 0%, #000 1px, transparent 1px), radial-gradient(900px 240px at 100% 100%, #000 1px, transparent 1px)",
          backgroundSize: "22px 22px, 26px 26px",
        }}
      />

      {/* container */}
      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-10 sm:py-12">
        {/* header */}
        <div className="text-center mb-8 sm:mb-10" data-reveal>
          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight"
            style={{ color: THEME.brown }}
          >
            Contact <span style={{ color: THEME.gold }}>Trippens</span>
          </h1>
          <p className="mt-2 text-sm sm:text-base md:text-lg text-black/70">
            We’re here to plan your next <span style={{ color: THEME.gold, fontWeight: 600 }}>adventure</span>.
          </p>
          <div className="mx-auto mt-5 h-[3px] w-44 rounded-full overflow-hidden">
            <div
              className="h-full w-full animate-[slide_1.6s_ease-in-out_infinite]"
              style={{ background: `linear-gradient(90deg, transparent, ${THEME.gold}, transparent)` }}
            />
          </div>
        </div>

        {/* content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">
          {/* LEFT — Address & Socials */}
          <aside
            className="rounded-3xl p-6 sm:p-7 md:p-8 backdrop-blur-md flex flex-col justify-between"
            style={{
              background: "rgba(255,255,255,0.72)",
              border: "1px solid rgba(0,0,0,0.06)",
              boxShadow: "0 28px 70px rgba(0,0,0,0.12)",
              minHeight: "56vh",
            }}
            data-reveal
          >
            <div>
              <h3 className="text-xl sm:text-2xl font-extrabold" style={{ color: THEME.brown }}>
                Head Office <span style={{ color: THEME.gold }}>•</span>
              </h3>
              <div className="mt-3 text-sm sm:text-base text-black/85 space-y-1">
                {addressLines.map((l, i) => (
                  <p key={i}>{l}</p>
                ))}
              </div>

              {/* socials */}
              <div className="mt-6">
                <p className="text-xs font-semibold tracking-wide mb-2" style={{ color: THEME.brown }}>
                  Follow us
                </p>
                <div className="flex items-center gap-3 flex-wrap">
                  <SocialIcon label="Facebook" href={socials.facebook}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M14 9h3V6h-3a4 4 0 0 0-4 4v3H7v3h3v6h3v-6h3l1-3h-4v-3a1 1 0 0 1 1-1Z" fill={THEME.brown} />
                    </svg>
                  </SocialIcon>
                  <SocialIcon label="Instagram" href={socials.instagram}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <rect x="3" y="3" width="18" height="18" rx="5" stroke={THEME.brown} strokeWidth="1.6" />
                      <circle cx="12" cy="12" r="3.5" stroke={THEME.brown} strokeWidth="1.6" />
                      <circle cx="17.5" cy="6.5" r="1" fill={THEME.brown} />
                    </svg>
                  </SocialIcon>
                  <SocialIcon label="Twitter / X" href={socials.twitter}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M4 4l8 9.5L9 20l5-4.5L20 20l-8-9.5L15 4l-5 4.5L4 4z" stroke={THEME.brown} strokeWidth="1.4"/>
                    </svg>
                  </SocialIcon>
                  <SocialIcon label="YouTube" href={socials.youtube}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <rect x="3" y="6" width="18" height="12" rx="3" stroke={THEME.brown} strokeWidth="1.6" />
                      <path d="M10 9l6 3-6 3V9z" fill={THEME.brown} />
                    </svg>
                  </SocialIcon>
                  <SocialIcon label="WhatsApp" href={socials.whatsapp}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M20 11.5A8.5 8.5 0 1 1 11.5 3 8.5 8.5 0 0 1 20 11.5Z" stroke={THEME.brown} strokeWidth="1.5"/>
                      <path d="M8.5 8.7c0 3.2 2.6 5.8 5.8 5.8h.3l1.2.7c.2.1.5-.1.4-.4l-.7-1.2v-.3c0-3.2-2.6-5.8-5.8-5.8h-.2" stroke={THEME.brown} strokeWidth="1.5"/>
                    </svg>
                  </SocialIcon>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <span
                className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
                style={{ background: THEME.gold, color: THEME.text }}
              >
                India’s 1st all-India by road tour operator
              </span>
            </div>
          </aside>

          {/* RIGHT — Phone grid */}
          <div
            className="rounded-3xl p-6 sm:p-7 md:p-8 backdrop-blur-md"
            style={{
              background: "rgba(255,255,255,0.65)",
              border: "1px solid rgba(0,0,0,0.06)",
              boxShadow: "0 28px 70px rgba(0,0,0,0.12)",
              minHeight: "56vh",
            }}
          >
            <h3 className="text-xl sm:text-2xl font-extrabold mb-4 sm:mb-6" style={{ color: THEME.brown }}>
              Call our team <span style={{ color: THEME.gold }}>directly</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
              {phones.map((p, i) => (
                <PhoneCard key={i} number={p} />
              ))}
            </div>

            {/* subtle note */}
            <p className="mt-5 text-xs sm:text-sm text-black/60">
              Available 9:00–19:00 IST · WhatsApp replies usually within 30 minutes.
            </p>
          </div>
        </div>
      </div>

      {/* keyframes */}
      <style>{`
        @keyframes slide { 
          0% { transform: translateX(-60%); } 
          50% { transform: translateX(0%); } 
          100% { transform: translateX(60%); } 
        }
        [data-reveal]{
          opacity:0;
          transform: translateY(16px) scale(.985);
          transition: opacity .55s ease, transform .55s cubic-bezier(.2,.8,.2,1);
        }
        .reveal-in{ opacity:1; transform: translateY(0) scale(1); }
      `}</style>
    </section>
  );
}

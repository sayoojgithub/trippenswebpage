// Footer.jsx — Creative desert-themed footer (responsive + no top gap)
// Theme: #F7F7F7 bg, #854836 brown, #FFB22C gold, Poppins
import React, { useEffect, useRef } from "react";

const THEME = {
  bg: "#F7F7F7",
  brown: "#854836",
  gold: "#FFB22C",
  text: "#000000",
  font: "Poppins, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
};

// NEW: your phone list
const PHONES = [
  "+91 8606131909",
  "+91 9895666909",
  "+91 04872383104",
  "+91 04872384104",
];

const EMAIL = "trippensholidays@gmail.com";

function useReveal(selector = "[data-reveal]") {
  const ref = useRef(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const els = root.querySelectorAll(selector);
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("reveal-in")),
      { threshold: 0.1 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return ref;
}

function SocialIcon({ label, href, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className="group inline-grid place-items-center h-10 w-10 rounded-full"
      style={{
        background: "rgba(255,255,255,0.9)",
        boxShadow: "0 10px 24px rgba(0,0,0,0.15)",
        transition: "transform 200ms ease, box-shadow 220ms ease",
      }}
    >
      <span className="group-hover:scale-110 transition-transform">{children}</span>
    </a>
  );
}

export default function Footer({ logoSrc = "/logo.png" }) {
  const rootRef = useReveal();
  const waNumber = PHONES[0]?.replace(/\s/g, "").replace(/^\+/, "") || "919999999999";

  return (
    <footer
      ref={rootRef}
      className="relative w-full"
      style={{ fontFamily: THEME.font, background: THEME.bg }}
    >
      {/* Wavy gold top divider — no extra space above */}
      <div className="relative h-10 overflow-hidden leading-[0]">
        <svg className="block w-full h-full" viewBox="0 0 1200 120" preserveAspectRatio="none" aria-hidden="true">
          <path
            d="M0,0V46.29c47.71,22.2,103.93,35.88,162,42C317.44,101,474,90,630,70S944.67,26,1100,35c50,3,70,9,100,20V0Z"
            fill={THEME.gold}
            fillOpacity="0.35"
          />
        </svg>
      </div>

      {/* Glassy main panel */}
      <section className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 md:px-8">
        <div
          className="rounded-[24px] p-6 sm:p-8 md:p-10 backdrop-blur-md"
          style={{
            background: "rgba(255,255,255,0.65)",
            border: "1px solid rgba(0,0,0,0.06)",
            boxShadow: "0 30px 80px rgba(0,0,0,0.12)",
          }}
        >
          {/* Top row: brand + quick actions (responsive stack) */}
          <div className="flex flex-col gap-6 md:gap-8 lg:flex-row lg:items-center" data-reveal>
            {/* Brand */}
            <div className="flex items-center gap-3">
              <img
                src={logoSrc}
                alt="Trippens logo"
                className="h-12 w-12 object-contain"
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
              <div>
                <h3 className="text-2xl sm:text-3xl font-extrabold" style={{ color: THEME.brown }}>
                  Trippens
                </h3>
                <p className="text-sm text-black/70">
                  India’s{" "}
                  <span style={{ color: THEME.gold, fontWeight: 600 }}>1st all-India by road</span>{" "}
                  trip tour operator
                </p>
              </div>
            </div>

            {/* Callouts — now renders ALL phones + email + WhatsApp in same style */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 w-full">
              {/* Phone cards (mapped) */}
              {PHONES.map((num, i) => {
                const tel = num.replace(/\s/g, "");
                return (
                  <a
                    key={i}
                    href={`tel:${tel}`}
                    className="group flex items-center gap-3 rounded-2xl px-4 py-3"
                    style={{
                      background: "rgba(255,255,255,0.9)",
                      border: "1px solid rgba(0,0,0,0.06)",
                      boxShadow: "0 14px 30px rgba(0,0,0,0.10)",
                    }}
                  >
                    <span
                      className="grid place-items-center h-9 w-9 rounded-xl"
                      style={{
                        background: THEME.gold,
                        color: THEME.text,
                        boxShadow: "0 6px 14px rgba(0,0,0,0.15)",
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M22 16.92v2a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.18 2 2 0 0 1 4.11 2h2a2 2 0 0 1 2 1.72c.12.9.3 1.77.57 2.6a2 2 0 0 1-.45 2.11L7.1 9.91a16 16 0 0 0 6 6l1.48-1.12a2 2 0 0 1 2.11-.45c.83.27 1.7.45 2.6.57A2 2 0 0 1 22 16.92z"
                          stroke={THEME.brown}
                          strokeWidth="1.5"
                        />
                      </svg>
                    </span>
                    <div>
                      <p className="text-xs text-black/60">Talk to us</p>
                      <p className="text-sm font-semibold" style={{ color: THEME.brown }}>
                        {num}
                      </p>
                    </div>
                  </a>
                );
              })}

              {/* Email */}
              <a
                href={`mailto:${EMAIL}`}
                className="group flex items-center gap-3 rounded-2xl px-4 py-3"
                style={{
                  background: "rgba(255,255,255,0.9)",
                  border: "1px solid rgba(0,0,0,0.06)",
                  boxShadow: "0 14px 30px rgba(0,0,0,0.10)",
                }}
              >
                <span
                  className="grid place-items-center h-9 w-9 rounded-xl"
                  style={{
                    background: THEME.gold,
                    color: THEME.text,
                    boxShadow: "0 6px 14px rgba(0,0,0,0.15)",
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M4 4h16a2 2 0 0 1 2 2v1l-10 7L2 7V6a2 2 0 0 1 2-2Zm18 5-10 7L2 9v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9Z"
                      stroke={THEME.brown}
                      strokeWidth="1.5"
                    />
                  </svg>
                </span>
                <div>
                  <p className="text-xs text-black/60">Mail us</p>
                  <p className="text-sm font-semibold" style={{ color: THEME.brown }}>
                    {EMAIL}
                  </p>
                </div>
              </a>

              {/* WhatsApp (uses first number) */}
              <a
                href={`https://wa.me/${waNumber}`}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center gap-3 rounded-2xl px-4 py-3"
                style={{
                  background: "rgba(255,255,255,0.9)",
                  border: "1px solid rgba(0,0,0,0.06)",
                  boxShadow: "0 14px 30px rgba(0,0,0,0.10)",
                }}
              >
                <span
                  className="grid place-items-center h-9 w-9 rounded-xl"
                  style={{
                    background: THEME.gold,
                    color: THEME.text,
                    boxShadow: "0 6px 14px rgba(0,0,0,0.15)",
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M20 11.5A8.5 8.5 0 1 1 11.5 3 8.5 8.5 0 0 1 20 11.5Z" stroke={THEME.brown} strokeWidth="1.5" />
                    <path d="M8.5 8.7c0 3.2 2.6 5.8 5.8 5.8h.3l1.2.7c.2.1.5-.1.4-.4l-.7-1.2v-.3c0-3.2-2.6-5.8-5.8-5.8h-.2" stroke={THEME.brown} strokeWidth="1.5" />
                  </svg>
                </span>
                <div>
                  <p className="text-xs text-black/60">Chat on WhatsApp</p>
                  <p className="text-sm font-semibold" style={{ color: THEME.brown }}>
                    {PHONES[0]}
                  </p>
                </div>
              </a>
            </div>
          </div>

          {/* Middle: links + newsletter (responsive grids) */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8" data-reveal>
            <div>
              <h4 className="text-sm font-bold mb-3" style={{ color: THEME.brown }}>Explore</h4>
              <ul className="space-y-2 text-sm text-black/80">
                <li><a href="#" className="hover:underline">All Tours</a></li>
                <li><a href="#" className="hover:underline">Adventure</a></li>
                <li><a href="#" className="hover:underline">International</a></li>
                <li><a href="#" className="hover:underline">Luxury</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold mb-3" style={{ color: THEME.brown }}>Company</h4>
              <ul className="space-y-2 text-sm text-black/80">
                <li><a href="#" className="hover:underline">About</a></li>
                <li><a href="#" className="hover:underline">Awards</a></li>
                <li><a href="#" className="hover:underline">Careers</a></li>
                <li><a href="#" className="hover:underline">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold mb-3" style={{ color: THEME.brown }}>Support</h4>
              <ul className="space-y-2 text-sm text-black/80">
                <li><a href="#" className="hover:underline">FAQs</a></li>
                <li><a href="#" className="hover:underline">Terms</a></li>
                <li><a href="#" className="hover:underline">Privacy</a></li>
                <li><a href="#" className="hover:underline">Refunds</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold mb-3" style={{ color: THEME.brown }}>Newsletter</h4>
              <p className="text-sm text-black/70 mb-3">Get fresh routes and convoy dates.</p>
              <form onSubmit={(e) => e.preventDefault()} className="flex flex-col sm:flex-row items-stretch gap-2">
                <input
                  type="email"
                  required
                  placeholder="Your email"
                  className="flex-1 rounded-xl px-3 py-2 text-sm outline-none"
                  style={{ background: "rgba(255,255,255,0.95)", border: "1px solid rgba(0,0,0,0.08)" }}
                />
                <button
                  type="submit"
                  className="relative inline-flex justify-center items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold"
                  style={{ background: THEME.gold, color: THEME.text, boxShadow: "0 10px 24px rgba(0,0,0,0.15)" }}
                >
                  Join
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12h14M13 6l6 6-6 6" stroke={THEME.text} strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </button>
              </form>
            </div>
          </div>

          {/* Socials + badges */}
          <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-6" data-reveal>
            <div className="flex items-center gap-3">
              <SocialIcon label="YouTube" href="https://youtube.com/">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="6" width="18" height="12" rx="3" stroke={THEME.brown} strokeWidth="1.6" />
                  <path d="M10 9l6 3-6 3V9z" fill={THEME.brown} />
                </svg>
              </SocialIcon>
              <SocialIcon label="Instagram" href="https://instagram.com/">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="18" height="18" rx="5" stroke={THEME.brown} strokeWidth="1.6" />
                  <circle cx="12" cy="12" r="3.5" stroke={THEME.brown} strokeWidth="1.6" />
                  <circle cx="17.5" cy="6.5" r="1" fill={THEME.brown} />
                </svg>
              </SocialIcon>
              <SocialIcon label="Facebook" href="https://facebook.com/">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M14 9h3V6h-3a4 4 0 0 0-4 4v3H7v3h3v6h3v-6h3l1-3h-4v-3a1 1 0 0 1 1-1Z" fill={THEME.brown} />
                </svg>
              </SocialIcon>
              <SocialIcon label="WhatsApp" href={`https://wa.me/${waNumber}`}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M20 11.5A8.5 8.5 0 1 1 11.5 3 8.5 8.5 0 0 1 20 11.5Z" stroke={THEME.brown} strokeWidth="1.5"/>
                  <path d="M8.5 8.7c0 3.2 2.6 5.8 5.8 5.8h.3l1.2.7c.2.1.5-.1.4-.4l-.7-1.2v-.3c0-3.2-2.6-5.8-5.8-5.8h-.2" stroke={THEME.brown} strokeWidth="1.5"/>
                </svg>
              </SocialIcon>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs sm:text-sm text-black/70">Recognised by</span>
              <span
                className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs sm:text-sm font-semibold"
                style={{ background: THEME.gold, color: THEME.text }}
              >
                India Book of Records
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M12 3l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 18.9 6.2 21l1.1-6.5L2.6 9.8l6.5-.9L12 3z" fill={THEME.text}/>
                </svg>
              </span>
            </div>
          </div>

          {/* Bottom line */}
          <div className="mt-8 md:mt-10 pt-6 border-t" style={{ borderColor: "rgba(0,0,0,0.08)" }} data-reveal>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-black/70">
              <p>
                © {new Date().getFullYear()} <span style={{ color: THEME.brown, fontWeight: 600 }}>Trippens</span>. All rights reserved.
              </p>
              <div className="flex items-center gap-4">
                <a href="#" className="hover:underline">Privacy</a>
                <a href="#" className="hover:underline">Terms</a>
                <a href="#" className="hover:underline">Refunds</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* subtle shimmer */}
      <div className="h-[3px] w-full mt-6">
        <div
          className="h-full w-40 mx-auto rounded-full animate-[slide_1.6s_ease-in-out_infinite]"
          style={{ background: `linear-gradient(90deg, transparent, ${THEME.gold}, transparent)` }}
        />
      </div>

      {/* reveal keyframes */}
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
    </footer>
  );
}

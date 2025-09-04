import React from "react";

export default function TopBar({
  phone1 = "+91 8606131909",
  phone2 = "+91 9895666909",
  socials = {
    facebook: "https://www.facebook.com/share/19fQocwZ2w/?mibextid=wwXIfr",
    instagram: "https://www.instagram.com/trippens_?igsh=YzkybTdhNThzYzF1",
    twitter: "https://x.com/trippens9?s=21",
    youtube: "https://www.youtube.com/@trippens318",
  },
}) {
  const THEME = {
    bgBrown: "#854836",
    gold: "#FFB22C",
    font: "Poppins, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
  };

  // Slightly smaller padding on tiny screens; comfy on md+
  const iconLinkBase =
    "group inline-flex items-center justify-center rounded-full p-1.5 sm:p-2 md:p-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";
  const iconClass =
    "h-4 w-4 md:h-[18px] md:w-[18px] transition-transform duration-200 group-hover:-translate-y-[1px]";
  const linkBase =
    "inline-flex items-center gap-2 text-[11px] sm:text-xs md:text-sm font-medium leading-none transition-colors duration-150";

  return (
    <div
      className="w-full overflow-x-hidden"
      style={{
        fontFamily: THEME.font,
        background: THEME.bgBrown,
        color: THEME.gold,
      }}
    >
      <div className="max-w-screen-xl mx-auto px-3 md:px-4">
        {/* One line, no wrap; tighter gap on small screens */}
        <div className="min-h-10 md:min-h-11 py-1.5 flex flex-nowrap items-center justify-between gap-x-2 sm:gap-x-3">
          {/* Phones — never truncate, never wrap */}
          <div className="flex items-center gap-2 sm:gap-3 md:gap-5 whitespace-nowrap shrink-0">
            <a
              href={`tel:${phone1.replace(/\s+/g, "")}`}
              className={`${linkBase} shrink-0`}
              style={{ color: THEME.gold }}
              title={phone1}
            >
              <span className="hidden sm:inline">Call:</span>
              <span className="whitespace-nowrap underline-offset-2 hover:underline">
                {phone1}
              </span>
            </a>

            <span
              className="hidden sm:inline-block text-[10px] sm:text-xs opacity-50 shrink-0"
              aria-hidden
            >
              |
            </span>

            {/* Hide the alt number below md to keep everything in view */}
            <a
              href={`tel:${phone2.replace(/\s+/g, "")}`}
              className={`${linkBase} hidden md:inline-flex shrink-0`}
              style={{ color: THEME.gold }}
              title={phone2}
            >
              <span className="hidden md:inline">Alt:</span>
              <span className="whitespace-nowrap underline-offset-2 hover:underline">
                {phone2}
              </span>
            </a>
          </div>

          {/* Socials — keep IG + WhatsApp at all sizes; hide others on small */}
          <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2.5 whitespace-nowrap">
            {/* Facebook (hide < sm) */}
            <a
              href={socials.facebook}
              target="_blank"
              rel="noreferrer noopener"
              aria-label="Facebook"
              className={`${iconLinkBase} hidden sm:inline-flex`}
              style={{ color: THEME.gold }}
              title="Facebook"
            >
              <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
                <path d="M13 10.2V8.5c0-.7.5-1.3 1.2-1.3H15V5h-1.3C12 5 11 6 11 7.2v3H9v2.2h2V19h2V12.2h1.7L15 10.2h-2z" strokeWidth="1.3" />
              </svg>
            </a>

            {/* Instagram (always visible) */}
            <a
              href={socials.instagram}
              target="_blank"
              rel="noreferrer noopener"
              aria-label="Instagram"
              className={iconLinkBase}
              style={{ color: THEME.gold }}
              title="Instagram"
            >
              <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
                <rect x="4" y="4" width="16" height="16" rx="4" strokeWidth="1.3" />
                <circle cx="12" cy="12" r="3.5" strokeWidth="1.3" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
              </svg>
            </a>

            {/* X / Twitter (hide < sm) */}
            <a
              href={socials.twitter}
              target="_blank"
              rel="noreferrer noopener"
              aria-label="X"
              className={`${iconLinkBase} hidden sm:inline-flex`}
              style={{ color: THEME.gold }}
              title="X (Twitter)"
            >
              <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
                <path d="M4 4l8 9.5L9 20l5-6 6 6-8-9.5L15 4 9 10 4 4z" strokeWidth="1.3" />
              </svg>
            </a>

            {/* YouTube (hide < md) */}
            <a
              href={socials.youtube}
              target="_blank"
              rel="noreferrer noopener"
              aria-label="YouTube"
              className={`${iconLinkBase} hidden md:inline-flex`}
              style={{ color: THEME.gold }}
              title="YouTube"
            >
              <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
                <rect x="3" y="7" width="18" height="10" rx="3" strokeWidth="1.3" />
                <path d="M11 10l4 2-4 2v-4z" fill="currentColor" />
              </svg>
            </a>

            {/* WhatsApp (ALWAYS visible + has highest priority) */}
            <a
              href={"https://wa.me/918606131909?text=Hi%20Trippens%20Team%2C%20I%27d%20like%20to%20enquire."}
              target="_blank"
              rel="noreferrer noopener"
              aria-label="WhatsApp"
              className={`${iconLinkBase} shrink-0`}
              style={{ color: THEME.gold }}
              title="WhatsApp"
            >
              <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
                <path d="M12 21a8.9 8.9 0 01-4.3-1.1L4 20l.9-3.5A9 9 0 1112 21z" strokeWidth="1.3" />
                <path d="M8.8 10.6c.3 1 1.6 2.7 3 3.3 1.1.5 1.6.5 2.2 0 .2-.2.5-.6.6-.9.1-.3 0-.5-.2-.7l-1-.7c-.2-.2-.4-.2-.7 0l-.4.3c-.2.2-.4.2-.7.1-.6-.2-1.3-.9-1.6-1.5-.1-.3 0-.5.1-.7l.3-.4c.1-.3.1-.5-.1-.7l-.7-1c-.2-.3-.5-.3-.8-.2-.3.1-.7.4-.9.6-.5.6-.5 1.2-.1 2.1z" strokeWidth="1.1" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Thin accent line (gold) */}
      <div
        className="h-[2px] w-full"
        style={{
          background: `linear-gradient(90deg, transparent, ${THEME.gold}, transparent)`,
        }}
      />
    </div>
  );
}

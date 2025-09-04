// EnquiryForm.jsx — route-aware prefill/lock on /tours/:tourId + popup + WA
import React, { useMemo, useState, useEffect } from "react";
import { useLocation, useParams, matchPath } from "react-router-dom";
import PUBLICAPI from "../apipublic";

const THEME = {
  bg: "#F7F7F7",
  brown: "#854836",
  gold: "#FFB22C",
  text: "#000000",
  font: "Poppins, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
};

function Label({ children }) {
  return <label className="text-xs font-semibold tracking-wide" style={{ color: THEME.brown }}>{children}</label>;
}
function FieldWrap({ children }) {
  return (
    <div
      className="rounded-xl px-3.5 py-2.5 focus-within:ring-2"
      style={{
        background: "rgba(255,255,255,0.92)",
        border: "1px solid rgba(0,0,0,0.08)",
        boxShadow: "0 10px 24px rgba(0,0,0,0.10)",
        ringColor: THEME.gold,
      }}
    >
      {children}
    </div>
  );
}
function IconArrow() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden>
      <path d="M5 12h14M13 6l6 6-6 6" stroke={THEME.text} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function Popup({ open, type = "info", message, onClose }) {
  if (!open) return null;
  const border = type === "error" ? "#e11d48" : type === "success" ? "#16a34a" : THEME.gold;
  const title = type === "error" ? "Something went wrong" : type === "success" ? "All set!" : "Heads up";
  return (
    <div className="fixed inset-0 z-[80] grid place-items-center p-4" style={{ background: "rgba(0,0,0,0.3)" }}>
      <div
        className="relative w-full max-w-md rounded-2xl p-5 sm:p-6"
        style={{ background: "rgba(255,255,255,0.96)", border: `2px solid ${border}`, boxShadow: "0 30px 80px rgba(0,0,0,0.25)" }}
        role="alertdialog"
        aria-live="assertive"
      >
        <div className="flex items-start gap-3">
          <span className="mt-1 inline-block h-3 w-3 rounded-full" style={{ background: border }} />
          <div className="flex-1">
            <h3 className="text-base sm:text-lg font-bold" style={{ color: THEME.brown }}>{title}</h3>
            <p className="mt-1 text-sm text-black/80" style={{ whiteSpace: "pre-line" }}>{message}</p>
          </div>
          <button onClick={onClose} className="ml-2 rounded-full p-1.5 hover:bg-black/5 active:scale-95" aria-label="Close">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
              <path d="M6 6l12 12M18 6L6 18" stroke="#111" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="mt-4 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-xl font-semibold active:scale-[0.98]" style={{ background: THEME.gold, color: THEME.text }}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

function WhatsAppFab({ phoneNumber }) {
  if (!phoneNumber) return null;
  const onClick = () => {
    const to = String(phoneNumber).replace(/[^\d]/g, "");
    window.open(`https://wa.me/${to}`, "_blank", "noopener,noreferrer");
  };
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Chat on WhatsApp"
      className="fixed right-3 bottom-3 sm:right-5 sm:bottom-5 grid place-items-center rounded-full shadow-xl active:scale-[0.98] transition"
      style={{ width: 56, height: 56, background: THEME.gold, color: THEME.text, boxShadow: "0 16px 44px rgba(0,0,0,0.18)", zIndex: 60 }}
    >
      <svg viewBox="0 0 32 32" width="22" height="22" fill="none" aria-hidden>
        <path d="M16 3C9.4 3 4 8.4 4 15c0 2.3.7 4.4 1.9 6.2L4 28l7-1.8c1.7 1 3.7 1.6 5.9 1.6 6.6 0 12-5.4 12-12S22.6 3 16 3Z" stroke={THEME.text} strokeWidth="1.2" fill="transparent" />
        <path d="M21.2 18.4c-.2.5-1.2 1.1-1.7 1.1-.4 0-.9.2-3-1-2.6-1.4-4.3-4.1-4.5-4.3-.2-.2-1.1-1.4-1.1-2.6 0-1.1.6-1.6.8-1.8.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.5.2.5.8 2 .8 2.1.1.1.1.3 0 .5-.1.2-.2.4-.3.5-.2.2-.4.4-.2.7.2.4 1 1.6 2.2 2.6 1.5 1.2 2.7 1.5 3.1 1.7.4.2.6.1.8-.1.2-.2 1-.9 1.2-1.2.2-.3.5-.2.8-.1.3.1 1.9.9 2.2 1.1.3.2.5.3.5.5 0 .3-.2 1.1-.4 1.6Z" fill={THEME.text} />
      </svg>
    </button>
  );
}

export default function EnquiryForm({
  onSubmitForm,
  whatsappNumber = "+918606131909",
  defaultMessagePrefix = "New enquiry via Trippens",
  tourTitleProp, // optional: pass from TourDetailsSingle
}) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [popup, setPopup] = useState({ open: false, type: "info", message: "" });
  const showPopup = (type, message) => setPopup({ open: true, type, message });

  // Detect /tours/:tourId and handle prefill/clear
  const location = useLocation();
  const params = useParams();
  const tourMatch = matchPath({ path: "/tours/:tourId", end: true }, location.pathname);
  const isTourPage = Boolean(tourMatch && tourMatch.params?.tourId);

  const [tourTitle, setTourTitle] = useState(tourTitleProp || "");
  const [lockedByRoute, setLockedByRoute] = useState(false);

  // Prefill/lock on tour page; clear when leaving tour page if we set it
  useEffect(() => {
    let active = true;

    async function hydrate() {
      if (isTourPage) {
        // prefer prop
        if (tourTitleProp) {
          if (!active) return;
          setTourTitle(tourTitleProp);
          setMsg(`Enquiry for ${tourTitleProp}`);
          setLockedByRoute(true);
          return;
        }
        const tourId = params?.tourId || tourMatch?.params?.tourId;
        if (!tourId) return;
        try {
          const { data } = await PUBLICAPI.get(`/public/tours/${encodeURIComponent(tourId)}`);
          const name = data?.tour?.tourName || "";
          if (!active) return;
          if (name) {
            setTourTitle(name);
            setMsg(`Enquiry for ${name}`);
            setLockedByRoute(true);
          }
        } catch (e) {
          // ignore
        }
      } else {
        // leaving the tour page
        if (lockedByRoute) {
          setMsg("");            // clear only what we auto-set
          setLockedByRoute(false);
          setTourTitle("");
        }
      }
    }

    hydrate();
    return () => { active = false; };
    // include pathname so it reacts to navigation
  }, [isTourPage, location.pathname, params?.tourId, tourTitleProp]); // eslint-disable-line

  const valid = useMemo(() => {
    const errs = [];
    if (!fullName.trim()) errs.push("Full name is mandatory.");
    if (!phone.trim()) errs.push("Phone is mandatory.");
    if (!/^\S+@\S+\.\S+$/.test(email)) errs.push("Enter a valid email.");
    if (!msg.trim()) errs.push("Message is mandatory.");
    return { ok: errs.length === 0, errs };
  }, [fullName, phone, email, msg]);

  const buildWhatsAppMessage = () => [
    defaultMessagePrefix,
    tourTitle ? `Tour: ${tourTitle}` : null,
    `Name: ${fullName}`,
    `Phone: +91 ${phone}`,
    `Email: ${email}`,
    `Message: ${msg || "-"}`,
    "(Submitted via website)",
  ].filter(Boolean).join("\n");

  // async function handleEmailSubmit(e) {
  //   e.preventDefault();
  //   if (!valid.ok) { showPopup("error", valid.errs.join("\n")); return; }
  //   const payload = { fullName, phone: `+91${phone}`, email, message: msg, source: "website" };
  //   try {
  //     setSubmitting(true);
  //     onSubmitForm?.(payload);
  //     await PUBLICAPI.post(`/public/enquiries`, payload);
  //     showPopup("success", "Thanks! We’ve received your enquiry by email. Our team will reach out soon.");
  //     setFullName(""); setPhone(""); setEmail("");
  //     // keep the locked text if still on a tour page; otherwise clear
  //     setMsg(lockedByRoute ? `Enquiry for ${tourTitle || tourTitleProp || ""}` : "");
  //   } catch {
  //     showPopup("error", "Sorry, we couldn’t submit your enquiry by email. Please try again later.");
  //   } finally {
  //     setSubmitting(false);
  //   }
  // }

  // function handleWhatsAppSubmit(e) {
  //   e.preventDefault();
  //   if (!valid.ok) { showPopup("error", valid.errs.join("\n")); return; }
  //   const to = String(whatsappNumber).replace(/[^\d]/g, "");
  //   const text = buildWhatsAppMessage();
  //   window.open(`https://wa.me/${to}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  // }
 async function handleEmailSubmit(e) {
    e.preventDefault();
    if (!valid.ok) { showPopup("error", valid.errs.join("\n")); return; }
    const payload = {
      fullName,
      phone: `+91${phone}`,
      email,
      message: msg,
    };
    try {
      setSubmitting(true);
      onSubmitForm?.(payload);
      await PUBLICAPI.post(`/public/enquiries/email`, payload);
      showPopup("success", "Thanks! We’ve received your enquiry by email. Our team will reach out soon.");
      setFullName(""); setPhone(""); setEmail("");
      setMsg(lockedByRoute ? `Enquiry for ${tourTitle || tourTitleProp || ""}` : "");
    } catch {
      showPopup("error", "Sorry, we couldn’t submit your enquiry by email. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleWhatsAppSubmit(e) {
    e.preventDefault();
    if (!valid.ok) { showPopup("error", valid.errs.join("\n")); return; }

    const savePayload = {
      fullName,
      phone: `+91${phone}`,
      email,
      message: msg,
    };
    // Best-effort: save as WhatsApp enquiry
    PUBLICAPI.post(`/public/enquiries/whatsapp`, savePayload).catch(() => { /* ignore */ });

    const to = String(whatsappNumber).replace(/[^\d]/g, "");
    const text = buildWhatsAppMessage();
    window.open(`https://wa.me/${to}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  }
  const lockMessage = lockedByRoute; // read-only only when we locked via route

  return (
    <section className="relative w-full" style={{ fontFamily: THEME.font, background: THEME.bg }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-10">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold" style={{ color: THEME.brown }}>
            Quick <span style={{ color: THEME.gold }}>Enquiry</span>
          </h2>
          <p className="mt-2 text-sm sm:text-base text-black/70">
            Tell us a bit, and we’ll plan your next <span style={{ color: THEME.gold, fontWeight: 600 }}>adventure</span>.
          </p>
          <div className="mx-auto mt-4 h-[3px] w-36 rounded-full overflow-hidden">
            <div className="h-full w-full animate-[slide_1.6s_ease-in-out_infinite]"
                 style={{ background: `linear-gradient(90deg, transparent, ${THEME.gold}, transparent)` }} />
          </div>
        </div>

        <form onSubmit={(e) => e.preventDefault()} className="rounded-3xl p-5 sm:p-6 md:p-7 backdrop-blur-md"
          style={{ background: "rgba(255,255,255,0.72)", border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 24px 60px rgba(0,0,0,0.10)" }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            <div>
              <Label>Full name</Label>
              <FieldWrap>
                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="e.g., Arjun Kumar"
                  className="w-full bg-transparent outline-none text-sm sm:text-base" />
              </FieldWrap>
            </div>

            <div>
              <Label>Phone</Label>
              <FieldWrap>
                <div className="flex items-center gap-2">
                  <input type="tel" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Your phone number"
                    className="w-full bg-transparent outline-none text-sm sm:text-base" />
                </div>
              </FieldWrap>
            </div>

            <div>
              <Label>Email address</Label>
              <FieldWrap>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
                  className="w-full bg-transparent outline-none text-sm sm:text-base" />
              </FieldWrap>
            </div>

            <div className="sm:col-span-2 lg:col-span-3">
              <Label>Message {lockMessage && <span className="text-[11px] text-black/60">(prefilled from tour)</span>}</Label>
              <FieldWrap>
                {lockMessage ? (
                  <input type="text" readOnly aria-readonly="true" value={msg}
                    className="w-full bg-white/60 cursor-not-allowed outline-none text-sm sm:text-base" />
                ) : (
                  <textarea rows={3} value={msg} onChange={(e) => setMsg(e.target.value)}
                    placeholder="Tell us dates, group size, or a special plan…"
                    className="w-full bg-transparent outline-none text-sm sm:text-base resize-y min-h-[72px] max-h-[160px]" />
                )}
              </FieldWrap>
            </div>
          </div>

          <div className="mt-5 sm:mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-[11px] sm:text-xs text-black/60">
              By submitting, you agree to our <a href="#" className="underline" style={{ color: THEME.brown }}>terms</a>.
            </p>

            <div className="flex items-center gap-3">
              <button onClick={handleEmailSubmit} disabled={submitting}
                className="relative group inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2.5 rounded-2xl font-semibold shadow-lg active:scale-[0.98] transition-transform text-sm sm:text-base disabled:opacity-60"
                style={{ background: THEME.gold, color: THEME.text }}>
                {submitting ? "Submitting…" : "Submit via Email"}
                <span className="relative -mr-0.5"><IconArrow /></span>
                <span className="absolute -inset-1 rounded-3xl blur-md opacity-50 group-hover:opacity-90 transition"
                  style={{ background: `radial-gradient(60% 60% at 50% 50%, ${THEME.gold}77, transparent)` }} />
                <span className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none" aria-hidden>
                  <span className="absolute -left-1/3 top-0 h-full w-1/3 bg-white/40 -skew-x-12 transform -translate-x-[120%] group-hover:translate-x-[320%] transition duration-700" />
                </span>
              </button>

              <button onClick={handleWhatsAppSubmit}
                className="relative group inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2.5 rounded-2xl font-semibold shadow-lg active:scale-[0.98] transition-transform text-sm sm:text-base"
                style={{ background: THEME.gold, color: THEME.text }}>
                Send on WhatsApp
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" className="relative">
                  <path d="M12 2a10 10 0 0 0-8.7 15L2 22l5-1.3A10 10 0 1 0 12 2Z" fill="currentColor" opacity=".12"/>
                  <path d="M16.2 13.8c-.1.4-.9 1-1.3 1-.3 0-.7.2-2.3-.8-2-1.1-3.3-3.2-3.4-3.3-.1-.1-.8-1.1-.8-2.1 0-.9.5-1.3.6-1.4.2-.1.4-.2.6-.2h.4c.2 0 .3 0 .5.4.1.4.6 1.6.6 1.7 0 .1 0 .2 0 .4 0 .1-.1.3-.2.4-.1.1-.3.3-.1.5.1.3.8 1.3 1.7 2.1 1.2 1 2.1 1.2 2.4 1.4.3.1.5.1.6-.1.2-.2.8-.7.9-.9.2-.2.4-.2.6-.1.3.1 1.5.8 1.7.9.2.1.4.2.4.4 0 .2-.2.9-.3 1.2Z" fill={THEME.text}/>
                </svg>
                <span className="absolute -inset-1 rounded-3xl blur-md opacity-40 group-hover:opacity-80 transition"
                  style={{ background: `radial-gradient(60% 60% at 50% 50%, ${THEME.gold}66, transparent)` }} />
              </button>
            </div>
          </div>
        </form>
      </div>

      <WhatsAppFab phoneNumber={whatsappNumber} />

      <style>{`
        @keyframes slide { 0% { transform: translateX(-60%); } 50% { transform: translateX(0%); } 100% { transform: translateX(60%); } }
      `}</style>

      <Popup open={popup.open} type={popup.type} message={popup.message} onClose={() => setPopup((p) => ({ ...p, open: false }))} />
    </section>
  );
}

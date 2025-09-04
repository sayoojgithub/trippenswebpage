// frontend/src/pages/Admin/AdminLogin.jsx
import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api";
import { AuthContext } from "../../context/AuthContext";

const AdminLogin = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 }); // for 3D hover
  const navigate = useNavigate();
  const { fetchUser } = useContext(AuthContext);

  const isSuccess = /successful/i.test(message);

  const handleChange = (e) => {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/admin/loginAdmin", formData);
      setMessage(res.data.message || "Login successful ✅");
      await fetchUser();
      setShowModal(true);
      // trigger confetti reflow via key re-mount handled below
      setConfettiKey((k) => k + 1);
    } catch (err) {
      setMessage(err.response?.data?.message || "Invalid credentials ❌");
      setShowModal(true);
    }
  };

  const handleModalOk = () => {
    setShowModal(false);
    if (isSuccess) navigate("/adminDashboard");
  };

  // 3D mouse tilt within card
  const onMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const tiltX = (py - 0.5) * -10; // rotation around X
    const tiltY = (px - 0.5) * 10;  // rotation around Y
    setTilt({ x: tiltX, y: tiltY });
  };

  const onMouseLeave = () => setTilt({ x: 0, y: 0 });

  // simple confetti (CSS only) on success
  const [confettiKey, setConfettiKey] = useState(0);

  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800/60 backdrop-blur-md rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] ring-1 ring-white/10">
        <h2 className="text-2xl font-extrabold text-center text-white tracking-tight">
          Admin Login
        </h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="group">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 text-white bg-gray-800/70 border border-gray-700/70 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/70 focus:border-transparent placeholder-gray-400 transition"
            />
          </div>
          <div className="group">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 text-white bg-gray-800/70 border border-gray-700/70 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/70 focus:border-transparent placeholder-gray-400 transition"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2.5 font-semibold text-white rounded-xl bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 active:scale-[0.99] transition shadow-[0_10px_30px_-10px_rgba(0,0,0,0.7)]"
          >
            Login
          </button>
        </form>
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          aria-modal="true"
          role="dialog"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={handleModalOk}
          />

          {/* Neon parallax glows */}
          <div
            aria-hidden
            className={`pointer-events-none absolute -z-0 left-16 top-24 h-80 w-80 rounded-full blur-3xl opacity-40 ${
              isSuccess ? "bg-emerald-500/40" : "bg-rose-500/40"
            }`}
            style={{ transform: "translateZ(0)" }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -z-0 right-16 bottom-24 h-64 w-64 rounded-full blur-3xl opacity-25 bg-indigo-500/40"
            style={{ transform: "translateZ(0)" }}
          />

          {/* 3D Stage */}
          <div
            className="relative z-10 w-full max-w-md"
            style={{ perspective: "1200px", transformStyle: "preserve-3d" }}
            onMouseMove={onMouseMove}
            onMouseLeave={onMouseLeave}
          >
            {/* Outer glow ring */}
            <div
              className={`absolute -inset-6 rounded-3xl opacity-40 blur-2xl ${
                isSuccess ? "bg-emerald-500/30" : "bg-rose-500/30"
              }`}
              aria-hidden
              style={{ transform: "translateZ(-40px)" }}
            />

            {/* 3D Card Wrapper with gradient edge */}
            <div
              className="relative p-[2px] rounded-3xl bg-[conic-gradient(from_180deg_at_50%_50%,rgba(255,255,255,.25)_0deg,rgba(255,255,255,.06)_120deg,transparent_240deg,rgba(255,255,255,.25)_360deg)] shadow-[0_35px_120px_-35px_rgba(0,0,0,0.85)]"
              style={{
                transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateZ(0)`,
                transformStyle: "preserve-3d",
                transition: "transform 120ms ease-out",
              }}
            >
              {/* Card face */}
              <div className="relative rounded-3xl bg-gray-950/90 ring-1 ring-white/10 p-7 overflow-hidden">
                {/* Moving shine */}
                <div
                  className="pointer-events-none absolute -top-1/2 left-1/2 h-[140%] w-[140%] -translate-x-1/2 rotate-12 opacity-10"
                  style={{
                    background:
                      "radial-gradient(closest-side, rgba(255,255,255,0.9), rgba(255,255,255,0) 60%)",
                    animation: "sweep 4.5s linear infinite",
                  }}
                  aria-hidden
                />

                {/* Header */}
                <div className="flex items-start gap-4">
                  <div
                    className={`relative inline-flex h-14 w-14 items-center justify-center rounded-2xl ${
                      isSuccess
                        ? "bg-emerald-600/90 ring-emerald-300/60"
                        : "bg-rose-600/90 ring-rose-300/60"
                    } ring-1 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.7)]`}
                    style={{ transform: "translateZ(30px)" }}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className={`h-7 w-7 text-white ${
                        isSuccess ? "tick-anim" : "shake-anim"
                      }`}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      {isSuccess ? (
                        <path d="M20 6 9 17l-5-5" />
                      ) : (
                        <>
                          <circle cx="12" cy="12" r="9" />
                          <path d="M12 8v5" />
                          <path d="M12 16h.01" />
                        </>
                      )}
                    </svg>
                    <span
                      className={`absolute inset-0 rounded-2xl blur-[10px] ${
                        isSuccess ? "bg-emerald-400/60" : "bg-rose-400/60"
                      } opacity-60`}
                      aria-hidden
                    />
                  </div>

                  <div className="flex-1" style={{ transform: "translateZ(20px)" }}>
                    <h3 className="text-white font-semibold tracking-tight text-xl">
                      {isSuccess ? "Welcome back, Admin" : "Heads up"}
                    </h3>
                    <p className="mt-1 text-gray-300 text-sm leading-relaxed">
                      {message}
                    </p>
                  </div>
                </div>

                {/* Divider */}
                <div
                  className="mt-6 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"
                  style={{ transform: "translateZ(10px)" }}
                />

                {/* Buttons */}
                <div
                  className="mt-5 flex justify-end gap-2"
                  style={{ transform: "translateZ(25px)" }}
                >
                  <button
                    onClick={handleModalOk}
                    className={`px-5 py-2.5 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-950 transition shadow-[0_10px_30px_-10px_rgba(0,0,0,0.8)] ${
                      isSuccess
                        ? "bg-gradient-to-r from-emerald-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-white"
                        : "bg-gray-800 hover:bg-gray-700 text-gray-100"
                    }`}
                    autoFocus
                    style={{ transform: "translateZ(30px)" }}
                  >
                    OK
                  </button>
                </div>

                {/* Confetti on success */}
                {isSuccess && (
                  <ConfettiBurst key={confettiKey} />
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Keyframes & 3D helpers */}
      <style>{`
        @keyframes tick { 0% { stroke-dasharray: 0 100; } 100% { stroke-dasharray: 100 0; } }
        .tick-anim { stroke-dasharray: 100 0; animation: tick .6s ease-out; }
        @keyframes shake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-2px); } 75% { transform: translateX(2px); } }
        .shake-anim { animation: shake .4s ease-in-out; }
        @keyframes sweep { 
          0% { transform: translate(-50%, -60%) rotate(12deg); } 
          100% { transform: translate(-50%, 30%) rotate(12deg); } 
        }
      `}</style>
    </div>
  );
};

export default AdminLogin;

/** Tiny CSS-only confetti component (no libraries). */
const ConfettiBurst = () => {
  // Create 24 confetti pieces with random positions/rotations via CSS variables
  const pieces = new Array(24).fill(0);
  return (
    <div className="pointer-events-none absolute inset-0 overflow-visible" aria-hidden>
      {pieces.map((_, i) => (
        <span
          key={i}
          className="absolute confetti"
          style={{
            left: `${50 + (Math.random() * 40 - 20)}%`,
            top: `${15 + Math.random() * 10}%`,
            '--tx': `${-60 + Math.random() * 120}px`,
            '--ty': `${60 + Math.random() * 120}px`,
            '--rz': `${Math.random() * 360}deg`,
            background: randomConfettiColor(),
          }}
        />
      ))}
      <style>{`
        .confetti {
          width: 8px;
          height: 12px;
          border-radius: 2px;
          opacity: 0;
          transform: translate3d(0,0,0) rotate(0);
          animation: confetti-fall 900ms ease-out forwards;
          display: inline-block;
        }
        @keyframes confetti-fall {
          0% {
            opacity: 0;
            transform: translate3d(0,0,0) rotate(0);
          }
          15% {
            opacity: 1;
          }
          100% {
            transform: translate3d(var(--tx), var(--ty), 0) rotate(var(--rz));
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

// Simple helper to vary confetti colors
function randomConfettiColor() {
  const palette = [
    "linear-gradient(180deg,#34d399,#10b981)",
    "linear-gradient(180deg,#60a5fa,#6366f1)",
    "linear-gradient(180deg,#f472b6,#ec4899)",
    "linear-gradient(180deg,#f59e0b,#f97316)",
    "linear-gradient(180deg,#22d3ee,#06b6d4)",
  ];
  return palette[Math.floor(Math.random() * palette.length)];
}

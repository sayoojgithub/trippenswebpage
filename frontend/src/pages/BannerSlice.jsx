// BannerSlice.jsx — Full-width banner slice (35% screen height) with clean overlay
import React from "react";

const THEME = {
  bg: "#F7F7F7",
  brown: "#854836",
  gold: "#FFB22C",
  text: "#000000",
  font: "Poppins, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
};

export default function BannerSlice({
  image = "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=80",
  title = "Find Your Next Frontier",
  description = "Sunrise drives, night skies, and roads that write stories.",
}) {
  return (
    <section
      className="relative w-full h-[35vh] min-h-[220px]"
      style={{ fontFamily: THEME.font, background: THEME.bg }}
    >
      <img src={image} alt={title} className="absolute inset-0 h-full w-full object-cover" />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(0deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.45) 50%, rgba(0,0,0,0.15) 100%)",
        }}
      />
      <div className="relative h-full flex items-end">
        <div className="w-full px-4 sm:px-6 md:px-8 pb-6 sm:pb-8 md:pb-10">
          <h3 className="text-white font-extrabold leading-tight text-2xl sm:text-3xl md:text-4xl drop-shadow-md">
            {title}
          </h3>
          {description ? (
            <p className="mt-2 text-white/85 text-sm sm:text-base md:text-lg max-w-2xl">
              {description}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}

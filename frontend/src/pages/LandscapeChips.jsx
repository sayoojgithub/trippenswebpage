// LandscapeChips.jsx
import React, { useState } from "react";
import {
  Mountain,
  Umbrella,
  Waves,
  Trees,
  Snowflake,
  Sparkles,
  Landmark,
  Castle,
  Wheat,
  Flame,
  Feather,
  DoorOpen,
  TreePalm,
  Droplets,
} from "lucide-react";

const THEME = {
  bg: "#F7F7F7",
  brown: "#854836",
  gold: "#FFB22C",
  text: "#000000",
  font: "Poppins, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
};

const ALL_ITEMS = [
  { key: "Mountain", icon: Mountain },
  { key: "Beaches", icon: Umbrella },
  { key: "Forest", icon: Trees },
  { key: "Snow", icon: Snowflake },
  { key: "Leisure", icon: Sparkles },
  { key: "Cultural", icon: Landmark },
  { key: "Archaeological", icon: Castle },
  { key: "Rural", icon: Wheat },
  { key: "Volcanic", icon: Flame },
  { key: "Tribal", icon: Feather },
  { key: "Cave", icon: DoorOpen },
  { key: "Mangrove", icon: TreePalm },
  { key: "Waterfalls", icon: Droplets },
];

const MAIN = [
  "Mountain",
  "Beaches",
  "Forest",
  "Snow",
  "Waterfalls",
  "Cultural",
  "Leisure",
  "Rural",
];

function Chip({ label, Icon, onClick }) {
  return (
    <button
      onClick={onClick}
      className="group flex flex-col items-center gap-2 transition hover:-translate-y-[2px] active:translate-y-0"
      style={{ fontFamily: THEME.font }}
    >
      {/* Round icon */}
      <span
        className="grid place-items-center h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 rounded-full transition 
                   ring-0 group-hover:ring-4"
        style={{
          color: THEME.gold,
          background: `${THEME.gold}14`,
          boxShadow: "0 6px 16px rgba(0,0,0,0.1)",
        }}
      >
        <Icon size={22} strokeWidth={2} />
      </span>
      {/* Label */}
      <span
        className="text-[11px] sm:text-xs md:text-sm font-medium transition-colors text-center"
        style={{ color: THEME.brown }}
      >
        {label}
      </span>
    </button>
  );
}

function ShowMoreButton({ expanded, onClick }) {
  return (
    <button
      onClick={onClick}
      className="relative group inline-flex items-center gap-3 px-5 py-2.5 sm:px-6 sm:py-3 rounded-2xl font-semibold
                 shadow-lg active:scale-[0.98] transition-transform"
      style={{
        fontFamily: THEME.font,
        color: THEME.text,
        background: THEME.gold,
        boxShadow: "0 12px 30px rgba(0,0,0,0.15)",
      }}
    >
      <span className="relative text-sm sm:text-base">
        {expanded ? "Show less" : "Show more landscapes"}
      </span>
    </button>
  );
}

export default function LandscapeChips({ onSelect }) {
  const [expanded, setExpanded] = useState(false);

  const visible = expanded
    ? ALL_ITEMS
    : ALL_ITEMS.filter((i) => MAIN.includes(i.key));

  return (
    <section
      className="w-full pt-10 sm:pt-12 md:pt-16"
      style={{ fontFamily: THEME.font, background: THEME.bg }}
    >
      <div className="mx-auto w-full max-w-6xl px-4">
        {/* Flexbox centered icons */}
        <div className="flex flex-wrap justify-center gap-6 sm:gap-8">
          {visible.map(({ key, icon: Icon }) => (
            <Chip key={key} label={key} Icon={Icon} onClick={() => onSelect?.(key)} />
          ))}
        </div>

        {/* Show more */}
        <div className="flex justify-center mt-8 sm:mt-10">
          <ShowMoreButton
            expanded={expanded}
            onClick={() => setExpanded((s) => !s)}
          />
        </div>
      </div>
    </section>
  );
}

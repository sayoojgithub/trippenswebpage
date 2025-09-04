import React, { useState,useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api";
import AddCategory from "./AddCategory";
import AddHeroCarousel from "./AddHeroCarousel";
import AddLandscape from "./AddLandscape";
import AddTestimonial from "./AddTestimonial";
import AddTour from "./AddTour";
import AddAward from "./AddAward";
import AddTeamMember from "./AddTeamMember";
import AddContact from "./AddContact";
import HighlightTour from "./HighlightTour";
import EnquiredClients from "./EnquiredClients";
import {
  ArrowLeft,
  ArrowRight,
  Tag,
  Compass,
  Image as ImageIcon,
  Mountain,
  Sparkles,
  LogOut,
  Loader2,
  Star,
  MessageCircle,
  Award,
  Users,
  Phone,
} from "lucide-react";
import { AuthContext } from "../../context/AuthContext";

const tabData = [
  { label: "ADD CATEGORY", icon: Tag },
  { label: "ADD HERO CAROUSEL", icon: ImageIcon },
  // { label: "ADD LANDSCAPE", icon: Mountain },
  { label: "ADD TOUR", icon: Compass },
  { label: "HIGHLIGHT TOUR", icon: Star },
  { label: "ADD TESTIMONIAL", icon: MessageCircle },
  { label: "ADD AWARDS", icon: Award },
  { label: "ADD TEAM MEMBERS", icon: Users },
  { label: "ADD CONTACT", icon: Phone },
  { label:"ENQUIRED CLIENTS", icon: Phone},
];

export default function AdminDashboard() {
  const { setRole, setUserId } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState(0);
  const [loggingOut, setLoggingOut] = useState(false);
  const scrollRef = useRef(null);
  const navigate = useNavigate();
  

  const scrollTabs = (direction) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -180 : 180,
      behavior: "smooth",
    });
  };

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await API.post("/admin/logout");
      setRole(null);
      setUserId(null);
      navigate("/adminLogin");
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setLoggingOut(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return <AddCategory />;
      case 1:
        return <AddHeroCarousel/>;
      // case 2:
      //   return <AddLandscape/>
      case 2:
        return <AddTour/>
      case 3:
        return <HighlightTour/>
      case 4:
        return <AddTestimonial/>
      case 5:
        return <AddAward/>
      case 6:
        return <AddTeamMember/>
      case 7:
        return <AddContact/>
      case 8:
        return <EnquiredClients/>
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 text-gray-100">
      {/* Page Header */}
      <div className="mx-auto max-w-[120rem] px-4 md:px-8 pt-8">
        <div className="relative overflow-hidden rounded-3xl ring-1 ring-white/10 bg-[radial-gradient(1100px_500px_at_-10%_-10%,rgba(99,102,241,0.18),transparent),radial-gradient(900px_400px_at_110%_20%,rgba(16,185,129,0.18),transparent)]">
          <div className="absolute -inset-1 opacity-30 [mask-image:radial-gradient(closest-side,white,transparent)] pointer-events-none">
            <div className="absolute -inset-1 bg-gradient-to-tr from-white/10 via-white/5 to-transparent animate-pulse" />
          </div>
          <div className="p-6 md:p-10 flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                Admin Dashboard
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <button
                className="hidden sm:inline-flex items-center gap-2 rounded-xl px-3 py-2 bg-gray-800/70 hover:bg-gray-700 ring-1 ring-white/10"
              >
                <Sparkles className="h-4 w-4" /> Quick Actions
              </button>

              {/* Logout */}
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="inline-flex items-center gap-2 rounded-xl px-3 py-2 bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 ring-1 ring-white/10 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.8)] disabled:opacity-70"
                aria-label="Logout"
              >
                {loggingOut ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <LogOut className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">{loggingOut ? "Logging out…" : "Logout"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="mx-auto max-w-[120rem] px-4 md:px-8 mt-8 pb-12">
        <div className="relative rounded-3xl bg-gray-900/70 ring-1 ring-white/10 shadow-[0_25px_90px_-35px_rgba(0,0,0,0.9)] p-6 md:p-8">
          {/* subtle ambient glows */}
          <div
            className="pointer-events-none absolute -z-10 -top-12 -right-10 h-52 w-52 rounded-full blur-3xl opacity-30 bg-indigo-500/40"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -z-10 bottom-0 left-0 h-64 w-64 rounded-full blur-3xl opacity-25 bg-emerald-500/40"
            aria-hidden
          />

          {/* Tabs Row */}
          <div className="w-full flex items-center gap-3">
            {/* Scroll Left */}
            <button
              type="button"
              onClick={() => scrollTabs("left")}
              className="inline-flex items-center justify-center rounded-full p-2 bg-gray-800/80 text-white hover:bg-gray-700 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500"
              aria-label="Scroll tabs left"
            >
              <ArrowLeft size={18} />
            </button>

            {/* Track */}
            <div className="flex-1 rounded-2xl bg-gray-950/60 ring-1 ring-white/10 shadow-inner overflow-hidden">
              <div ref={scrollRef} className="flex overflow-x-auto no-scrollbar">
                {tabData.map((tab, idx) => {
                  const ActiveIcon = tab.icon;
                  const isActive = activeTab === idx;
                  return (
                    <button
                      key={tab.label}
                      onClick={() => setActiveTab(idx)}
                      className={`relative flex items-center gap-2 px-6 md:px-8 py-4 font-semibold text-[15px] md:text-[17px] whitespace-nowrap transition
                        ${isActive ? "text-white" : "text-gray-300 hover:text-white"}`}
                      style={{ flex: "0 0 auto" }}
                    >
                      {/* Active background pill */}
                      <span
                        className={`absolute inset-0 mx-2 my-2 rounded-xl transition-opacity
                          ${isActive ? "opacity-100 bg-gradient-to-r from-emerald-600/80 to-indigo-600/80" : "opacity-0"}`}
                        aria-hidden
                      />
                      <span className="relative inline-flex items-center gap-2">
                        <ActiveIcon size={18} />
                        {tab.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Scroll Right */}
            <button
              type="button"
              onClick={() => scrollTabs("right")}
              className="inline-flex items-center justify-center rounded-full p-2 bg-gray-800/80 text-white hover:bg-gray-700 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500"
              aria-label="Scroll tabs right"
            >
              <ArrowRight size={18} />
            </button>
          </div>

          {/* Divider */}
          <div className="mt-6 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          {/* Tab Content Shell */}
          <div className="mt-6">
            <div className="relative overflow-hidden rounded-2xl bg-gray-950/60 ring-1 ring-white/10 p-8">
              <div className="absolute -inset-1 opacity-20 [mask-image:radial-gradient(closest-side,white,transparent)] pointer-events-none">
                <div className="absolute -inset-1 bg-gradient-to-tr from-white/5 via-white/0 to-transparent animate-pulse" />
              </div>

              {/* Render actual content here */}
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>

      {/* Utilities */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

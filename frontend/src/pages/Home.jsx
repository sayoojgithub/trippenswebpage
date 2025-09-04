
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import HeroCarouselResponsive from "./HeroCarouselResponsive";
import LandscapeChips from "./LandscapeChips";
import AboutUs from "./AboutUs";
import WonderTours from "./WonderTours";
import VideoShowCase from "./VideoShowCase";
import PUBLICAPI from "../apipublic";

const Home = () => {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const { data } = await PUBLICAPI.get("/public/hero-carousel", { params: { activeOnly: true } });
        if (!mounted) return;
        const items = Array.isArray(data?.slides) ? data.slides : [];
        const clean = items.filter((s) => typeof s?.src === "string" && s.src.trim() !== "");
        const aligned = clean.map((s, i) => ({
          ...s,
          align: i % 3 === 0 ? "left" : i % 3 === 1 ? "center" : "right",
        }));
        setSlides(aligned);
      } catch (e) {
        console.error(e);
        if (mounted) setErr("Could not load hero slides.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // 🔗 CTA → navigate to category
  const handleHeroCta = (slide) => {
    if (slide?.categoryId) {
      navigate(`/categories/${slide.categoryId}`);
    }
  };
  const handleSelectLandscape = (key) => {
    // key is like "Mountain", "Beaches", etc.
    navigate(`/landscapes/${encodeURIComponent(key)}`);
  };

  return (
    <div>
      {!loading && slides.length > 0 && (
        <HeroCarouselResponsive
          slides={slides}
          auto
          interval={5000}
          onCtaClick={handleHeroCta}
        />
      )}
      <LandscapeChips onSelect={handleSelectLandscape} />
      {/* <AboutUs /> */}
      <div id="about">
      <AboutUs />
    </div>
      <WonderTours />
      <VideoShowCase/>
     
    </div>
  );
};

export default Home;



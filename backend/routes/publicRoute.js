import express from "express";
import {
  getCategoriesWithHighlightedTours,
  getCategoryWithAllTours,
  getTourById,
  getHeroCarouselSlides,
  getPublicTestimonials,
  getToursByLandscape,
   submitEnquiry,
  // submitEmailEnquiry,
  submitWhatsappEnquiry
} from "../controllers/publicController.js";

const router = express.Router();

router.get("/with-highlighted-tours", getCategoriesWithHighlightedTours);
router.get("/categories/:categoryId", getCategoryWithAllTours);
router.get("/tours/:tourId", getTourById);
router.get("/hero-carousel", getHeroCarouselSlides);
router.get("/testimonials", getPublicTestimonials);
router.get("/landscapes/:landscape", getToursByLandscape);
router.post("/enquiries/email", submitEnquiry);
// router.post("/enquiries/email", submitEmailEnquiry);
router.post("/enquiries/whatsapp", submitWhatsappEnquiry);


export default router;

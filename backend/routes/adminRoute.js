import express from "express";
import { verifyUser } from "../middleware/auth.js";
import {
  registerAdmin,
  loginAdmin,
  getMe,
  logout,
  createCategory,
  listCategories,
  updateCategoryStatus,
  updateCategory,
  createHeroSlide,
  listHeroSlides,
  updateHeroImage,
  updateHeroStatus,
  createLandscape,
  listLandscapes,
  updateLandscapeStatus,
  updateLandscape,
  createTour,
  listTours,
  getTourById,
  updateTour,
  updateTourStatus,
  createTestimonial,
  getTestimonials,
  getTestimonialById,
  updateTestimonialStatus,
  updateTestimonial,
  createAward,
  getAwards,
  updateAwardStatus,
  getAwardById,
  updateAward,
  createTeamMember,
  getTeamMembers,
  updateTeamMemberStatus,
  getTeamMemberById,
  updateTeamMember,
  getContact,
  upsertContact,
  updateContactById,
  getToursWithFilters,
  updateTourHighlightStatus,
  listEnquiries,
  getCategoriesWithHighlightedTours
} from "../controllers/adminController.js";

const router = express.Router();

router.post("/registerAdmin", registerAdmin);
router.post("/loginAdmin", loginAdmin);
router.get("/me", getMe);
router.post("/logout", logout);
router.post("/categories",verifyUser, createCategory);
router.get("/categories",verifyUser, listCategories);
router.patch("/categories/:id/status",verifyUser, updateCategoryStatus);
router.patch("/categories/:id",verifyUser, updateCategory);
router.post("/hero-carousel",verifyUser, createHeroSlide);
router.get("/hero-carousel",verifyUser, listHeroSlides);
router.patch("/hero-carousel/:id/image",verifyUser, updateHeroImage);
router.patch("/hero-carousel/:id/status",verifyUser, updateHeroStatus);
router.post("/landscapes",verifyUser, createLandscape);
router.get("/landscapes",verifyUser, listLandscapes);
router.patch("/landscapes/:id/status",verifyUser, updateLandscapeStatus);
router.patch("/landscapes/:id",verifyUser, updateLandscape);
router.post("/tours",verifyUser, createTour);
router.get("/tours",verifyUser, listTours);
router.get("/tours/:id",verifyUser, getTourById);
router.put("/tours/:id",verifyUser, updateTour);
router.patch("/tours/:id/status",verifyUser, updateTourStatus);
router.post("/testimonials",verifyUser,createTestimonial)
router.get("/testimonials",verifyUser,getTestimonials);
router.get("/testimonials/:id",verifyUser,getTestimonialById);
router.patch("/testimonials/:id/status",verifyUser,updateTestimonialStatus);
router.patch("/testimonials/:id",verifyUser,updateTestimonial);
router.post("/awards",verifyUser,createAward);
router.get("/awards",verifyUser, getAwards);
router.patch("/awards/:id/status",verifyUser, updateAwardStatus);
router.get("/awards/:id",verifyUser, getAwardById);
router.patch("/awards/:id",verifyUser,updateAward);
router.post("/team-members",verifyUser,createTeamMember);
router.get("/team-members",verifyUser, getTeamMembers);
router.patch("/team-members/:id/status",verifyUser,updateTeamMemberStatus);
router.get("/team-members/:id",verifyUser,getTeamMemberById);
router.patch("/team-members/:id",verifyUser, updateTeamMember);
router.get("/contact",verifyUser, getContact);
router.put("/contact",verifyUser, upsertContact);
router.patch("/contact/:id",verifyUser, updateContactById);
router.get("/toursinhighlight",verifyUser, getToursWithFilters); // extends your existing list with filters
router.patch("/toursinhighlight/:id/highlight",verifyUser, updateTourHighlightStatus);
router.get("/enquiries",verifyUser, listEnquiries);

//////////////////////////////////////////////////
//  router.get("/with-highlighted-tours", getCategoriesWithHighlightedTours);



export default router;

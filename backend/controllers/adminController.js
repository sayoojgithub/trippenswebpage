import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "../models/adminModel.js";
import Category from "../models/categoryModel.js";
import HeroCarousel from "../models/heroCarouselModel.js";
import Landscape from "../models/landscapeModel.js";
import Tour from "../models/tourModel.js";
import Testimonial from "../models/testimonialModel.js";
import Award from "../models/awardModel.js";
import TeamMember from "../models/teamMemberModel.js";
import Contact from "../models/contactModel.js";
import Enquiry from "../models/enquiryModel.js"

export const registerAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const existingAdmin = await Admin.findOne();
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = new Admin({ email, password: hashedPassword });
    await newAdmin.save();

    res.status(201).json({ message: "Admin registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1) Validate input
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // 2) Find admin
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // 3) Compare password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // 4) Create JWT directly with _id and role
    const token = jwt.sign(
      { _id: admin._id, role: admin.role || "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // 5) Set HTTP-only cookie (sameSite: 'lax', non-secure for localhost/dev)
    res
      .cookie("token", token, {
        httpOnly: true,
        secure: false,        // set to true behind HTTPS in prod
        sameSite: "lax",      // per your requirement
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      })
      .status(200)
      .json({
        message: "Login successful",
        token, // optional; remove if you rely purely on cookie
        admin: {
          _id: admin._id,
          email: admin.email,
          role: admin.role || "admin",
          createdAt: admin.createdAt,
        },
      });
  } catch (error) {
    console.error("loginAdmin error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
export const getMe = async (req, res) => {
  console.log("haii")
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "Not authenticated" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.status(200).json({ role: decoded.role, userId: decoded._id });
    
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: false, // Set true in production with HTTPS
      sameSite: "lax",
    });
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Server error during logout" });
  }
};
export const createCategory = async (req, res) => {
  try {
    const { name, description = "", coverImage = "" } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Name is required" });
    }
    if (!description || !description.trim()) {
      return res.status(400).json({ message: "Description is required" });
    }
    if (!coverImage || !coverImage.trim()) {
      return res.status(400).json({ message: "Cover image is required" });
    }

    // case-insensitive uniqueness check
    const exists = await Category.findOne({
      name: { $regex: `^${name.trim()}$`, $options: "i" },
    });
    if (exists) {
      return res.status(409).json({ message: "Category name already exists" });
    }

    const category = await Category.create({
      name: name.trim(),
      description: (description || "").trim(),
      coverImage,
      // activeStatus defaults to true via schema
    });

    return res.status(201).json({ message: "Category created", category });
  } catch (err) {
    // handle duplicate key race condition nicely
    if (err?.code === 11000) {
      return res.status(409).json({ message: "Category name already exists" });
    }
    console.error("createCategory error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// GET /admin/categories?search=&page=&limit=&sort=&order=
// Defaults: page=1, limit=5, sort=createdAt, order=desc
export const listCategories = async (req, res) => {
  try {
    const {
      search = "",
      page = 1,
      limit = 5,
      sort = "createdAt",
      order = "desc",
    } = req.query;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const pageSize = Math.max(parseInt(limit, 10) || 5, 1);

    const q = {};
    if (search && search.trim()) {
      q.name = { $regex: search.trim(), $options: "i" };
    }

    const totalItems = await Category.countDocuments(q);
    const totalPages = Math.max(Math.ceil(totalItems / pageSize), 1);

    const items = await Category.find(q)
      .sort({ [sort]: order === "asc" ? 1 : -1 })
      .skip((pageNum - 1) * pageSize)
      .limit(pageSize)
      .lean();

    return res.json({
      items,
      page: pageNum,
      limit: pageSize,
      totalItems,
      totalPages,
    });
  } catch (err) {
    console.error("listCategories error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// PATCH /admin/categories/:id/status
// Body: { activeStatus: boolean }
export const updateCategoryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { activeStatus } = req.body;

    if (typeof activeStatus !== "boolean") {
      return res.status(400).json({ message: "activeStatus must be boolean" });
    }

    const doc = await Category.findByIdAndUpdate(
      id,
      { $set: { activeStatus } },
      { new: true }
    );

    if (!doc) return res.status(404).json({ message: "Category not found" });
    const tourResult = await Tour.updateMany(
      { category: id },
      { $set: { categoryStatus: activeStatus } }
    );
     

    return res.json({ message: "Status updated", category: doc });
  } catch (err) {
    console.error("updateCategoryStatus error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
export const updateCategory = async (req, res) => {
  try {
    const updates = {};
    const { name, description, coverImage } = req.body;

    // If you later want to allow renaming safely:
    if (typeof name === "string") {
      const trimmed = name.trim();
      if (!trimmed) return res.status(400).json({ message: "Name cannot be empty" });
      
      const conflict = await Category.findOne({
        _id: { $ne: req.params.id },
        name: { $regex: `^${trimmed}$`, $options: "i" },
      });
      if (conflict) return res.status(409).json({ message: "Category name already exists" });
      updates.name = trimmed;
    }

  if (typeof description === "string") {
      const trimmed = description.trim();
      if (!trimmed) {
        return res.status(400).json({ message: "Description is required" });
      }
      updates.description = trimmed;
    } else {
      return res.status(400).json({ message: "Description is required" });
    }

    
    if (typeof coverImage === "string") {
      const trimmed = coverImage.trim();
      if (!trimmed) {
        return res.status(400).json({ message: "Cover image is required" });
      }
      updates.coverImage = trimmed;
    } else {
      return res.status(400).json({ message: "Cover image is required" });
    }

    const doc = await Category.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true }
    );
    if (!doc) return res.status(404).json({ message: "Category not found" });

    res.json({ message: "Category updated", category: doc });
  } catch (err) {
    if (err?.code === 11000) return res.status(409).json({ message: "Category name already exists" });
    console.error("updateCategory error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const createHeroSlide = async (req, res) => {
  try {
    const { categoryId, imageUrl } = req.body;
    if (!categoryId) return res.status(400).json({ message: "categoryId is required" });
    if (!imageUrl) return res.status(400).json({ message: "imageUrl is required" });

    const cat = await Category.findById(categoryId).lean();
    if (!cat) return res.status(404).json({ message: "Category not found" });
    //  const exists = await HeroCarousel.findOne({ category: categoryId });
    // if (exists) {
    //   return res
    //     .status(409)
    //     .json({ message: "This category already has a hero carousel slide" });
    // }

    const doc = await HeroCarousel.create({
      category: categoryId,
      imageUrl,
      // activeStatus default true
    });

    res.status(201).json({ message: "Hero slide created", slide: doc });
  } catch (err) {
    console.error("createHeroSlide error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /admin/hero-carousel?search=&page=&limit=5
// search by category name (case-insensitive)
export const listHeroSlides = async (req, res) => {
  try {
    const { search = "", page = 1, limit = 5, sort = "createdAt", order = "desc" } = req.query;
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const pageSize = Math.max(parseInt(limit, 10) || 5, 1);

    const pipeline = [
      { $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category"
        }
      },
      { $unwind: "$category" },
    ];

    if (search && search.trim()) {
      pipeline.push({
        $match: { "category.name": { $regex: search.trim(), $options: "i" } }
      });
    }

    const countPipeline = [...pipeline, { $count: "total" }];
    const totalAgg = await HeroCarousel.aggregate(countPipeline);
    const totalItems = totalAgg[0]?.total || 0;
    const totalPages = Math.max(Math.ceil(totalItems / pageSize), 1);

    pipeline.push({ $sort: { [sort]: order === "asc" ? 1 : -1 } });
    pipeline.push({ $skip: (pageNum - 1) * pageSize });
    pipeline.push({ $limit: pageSize });
    pipeline.push({
      $project: {
        imageUrl: 1,
        activeStatus: 1,
        createdAt: 1,
        category: { _id: "$category._id", name: "$category.name" },
      }
    });

    const items = await HeroCarousel.aggregate(pipeline);

    res.json({ items, page: pageNum, limit: pageSize, totalItems, totalPages });
  } catch (err) {
    console.error("listHeroSlides error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// PATCH /admin/hero-carousel/:id/image  { imageUrl }
export const updateHeroImage = async (req, res) => {
  try {
    const { imageUrl } = req.body;
    if (!imageUrl) return res.status(400).json({ message: "imageUrl is required" });

    const doc = await HeroCarousel.findByIdAndUpdate(
      req.params.id,
      { $set: { imageUrl } },
      { new: true }
    ).populate("category", "name");
    if (!doc) return res.status(404).json({ message: "Slide not found" });

    res.json({ message: "Hero image updated", slide: doc });
  } catch (err) {
    console.error("updateHeroImage error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// (Optional) PATCH /admin/hero-carousel/:id/status { activeStatus: boolean }
export const updateHeroStatus = async (req, res) => {
  try {
    const { activeStatus } = req.body;
    if (typeof activeStatus !== "boolean")
      return res.status(400).json({ message: "activeStatus must be boolean" });

    const doc = await HeroCarousel.findByIdAndUpdate(
      req.params.id,
      { $set: { activeStatus } },
      { new: true }
    ).populate("category", "name");
    if (!doc) return res.status(404).json({ message: "Slide not found" });

    res.json({ message: "Status updated", slide: doc });
  } catch (err) {
    console.error("updateHeroStatus error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
export const createLandscape = async (req, res) => {
  try {
    const { name, description = "", coverImage = "" } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Name is required" });
    }

    // case-insensitive uniqueness check
    const exists = await Landscape.findOne({
      name: { $regex: `^${name.trim()}$`, $options: "i" },
    });
    if (exists) {
      return res.status(409).json({ message: "Landscape name already exists" });
    }

    const landscape = await Landscape.create({
      name: name.trim(),
      description: (description || "").trim(),
      coverImage,
      // activeStatus defaults to true via schema
    });

    return res.status(201).json({ message: "Landscape created", landscape });
  } catch (err) {
    // handle duplicate key race condition nicely
    if (err?.code === 11000) {
      return res.status(409).json({ message: "Landscape name already exists" });
    }
    console.error("createLandscape error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};


export const listLandscapes = async (req, res) => {
  try {
    const {
      search = "",
      page = 1,
      limit = 5,
      sort = "createdAt",
      order = "desc",
    } = req.query;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const pageSize = Math.max(parseInt(limit, 10) || 5, 1);

    const q = {};
    if (search && search.trim()) {
      q.name = { $regex: search.trim(), $options: "i" };
    }

    const totalItems = await Landscape.countDocuments(q);
    const totalPages = Math.max(Math.ceil(totalItems / pageSize), 1);

    const items = await Landscape.find(q)
      .sort({ [sort]: order === "asc" ? 1 : -1 })
      .skip((pageNum - 1) * pageSize)
      .limit(pageSize)
      .lean();

    return res.json({
      items,
      page: pageNum,
      limit: pageSize,
      totalItems,
      totalPages,
    });
  } catch (err) {
    console.error("listLandscapes error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};


export const updateLandscapeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { activeStatus } = req.body;

    if (typeof activeStatus !== "boolean") {
      return res.status(400).json({ message: "activeStatus must be boolean" });
    }

    const doc = await Landscape.findByIdAndUpdate(
      id,
      { $set: { activeStatus } },
      { new: true }
    );

    if (!doc) return res.status(404).json({ message: "Landscape not found" });

    return res.json({ message: "Status updated", category: doc });
  } catch (err) {
    console.error("updateLandscapeStatus error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
export const updateLandscape = async (req, res) => {
  try {
    const updates = {};
    const { name, description, coverImage } = req.body;

    // If you later want to allow renaming safely:
    if (typeof name === "string") {
      const trimmed = name.trim();
      if (!trimmed) return res.status(400).json({ message: "Name cannot be empty" });
     
      const conflict = await Landscape.findOne({
        _id: { $ne: req.params.id },
        name: { $regex: `^${trimmed}$`, $options: "i" },
      });
      if (conflict) return res.status(409).json({ message: "Landscape name already exists" });
      updates.name = trimmed;
    }

    if (typeof description === "string") updates.description = description.trim();
    if (typeof coverImage === "string") updates.coverImage = coverImage;

    const doc = await Landscape.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true }
    );
    if (!doc) return res.status(404).json({ message: "Landscape not found" });

    res.json({ message: "Landscape updated", category: doc });
  } catch (err) {
    if (err?.code === 11000) return res.status(409).json({ message: "Landscape name already exists" });
    console.error("updateLandscape error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
export const createTour = async (req, res) => {
  try {
    const {
      tourName,
      categoryId,
      days,
      nights,
      tripCost,
      tripStyle,
      vehicle,
      drivingDistance,
      landscapes,
      activity,
      upcomingDates,
      mainImageUrl,
      subImageUrls = [],
      routeMapUrl,
      itinerary = [],
      faqs = [],
    } = req.body;
    const tour = await Tour.create({
      tourName: tourName.trim(),
      category: categoryId,
      days: Number(days),
      nights: Number(nights) || 0,
      tripCost: Number(tripCost) || 0,
      tripStyle: tripStyle?.trim() || "",
      vehicle: vehicle?.trim() || "",
      drivingDistance: drivingDistance?.trim() || "",
      landscapes: Array.isArray(landscapes) ? landscapes : [],
      activity: activity?.trim() || "",
      upcomingDates: (upcomingDates || []).map((d) => new Date(d)),
      mainImageUrl: mainImageUrl || "",
      subImageUrls,
      routeMapUrl: routeMapUrl || "",
      itinerary: (itinerary || []).map((s) => ({
        day: Number(s.day),
        title: s.title || "",
        description: s.description || "",
        imageUrl: s.imageUrl || "",
      })),
      faqs: (faqs || []).map((f) => ({ q: f.q || "", a: f.a || "" })),
    });

    res.status(201).json({ success: true, item: tour });
  } catch (err) {
    console.error("createTour error:", err);
    res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};
// export const createTour = async (req, res) => {
//   try {
//     const {
//       tourName,
//       categoryId,
//       days,
//       nights,
//       tripCost,
//       tripStyle,
//       vehicle,
//       drivingDistance,
//       landscapes,
//       activity,
//       upcomingDates,
//       mainImageUrl,
//       subImageUrls,
//       routeMapUrl,
//       itinerary,
//       faqs,
//     } = req.body;

//     const isNonEmpty = (v) => typeof v === "string" && v.trim().length > 0;

//     // ---- Required fields ----
//     if (!isNonEmpty(tourName)) {
//       return res.status(400).json({ message: "tourName is required" });
//     }
//     if (!isNonEmpty(categoryId)) {
//       return res.status(400).json({ message: "categoryId is required" });
//     }

//     // Category must exist
//     const category = await Category.findById(categoryId).select("activeStatus");
//     if (!category) {
//       return res.status(404).json({ message: "Category not found" });
//     }

//     // days: required number >= 1
//     const d = Number(days);
//     if (!Number.isFinite(d) || d < 1) {
//       return res.status(400).json({ message: "days is required and must be a number ≥ 1" });
//     }

//     // nights: required and must equal days - 1
//     const n = Number(nights);
//     if (!Number.isFinite(n)) {
//       return res.status(400).json({ message: "nights is required and must be a number" });
//     }
//     if (n !== d - 1) {
//       return res.status(400).json({ message: "nights must be exactly days - 1" });
//     }

//     // landscapes: required, non-empty array with allowed values
//     const allowedLandscapes = ["mountain", "beach", "rural", "desert", "forest", "urban"];
//     if (!Array.isArray(landscapes) || landscapes.length === 0) {
//       return res.status(400).json({ message: "landscapes is required and must be a non-empty array" });
//     }
//     const badLandscape = landscapes.find((v) => !allowedLandscapes.includes(String(v)));
//     if (badLandscape) {
//       return res.status(400).json({
//         message: `Invalid landscape value: "${badLandscape}". Allowed: ${allowedLandscapes.join(", ")}`,
//       });
//     }

//     // mainImageUrl: required
//     if (!isNonEmpty(mainImageUrl)) {
//       return res.status(400).json({ message: "mainImageUrl is required" });
//     }

//     // subImageUrls: required, exactly 5 non-empty strings
//     if (!Array.isArray(subImageUrls) || subImageUrls.length !== 5) {
//       return res.status(400).json({ message: "subImageUrls must be an array of exactly 5 image URLs" });
//     }
//     const hasEmptySub = subImageUrls.some((u) => !isNonEmpty(u));
//     if (hasEmptySub) {
//       return res.status(400).json({ message: "All 5 subImageUrls must be non-empty strings" });
//     }

//     // upcomingDates: ensure valid dates if provided
//     const parsedDates = Array.isArray(upcomingDates)
//       ? upcomingDates.map((d, i) => {
//           const t = new Date(d);
//           if (isNaN(t.getTime())) {
//             throw new Error(`Invalid date in upcomingDates at index ${i}`);
//           }
//           return t;
//         })
//       : [];

//     // itinerary: if provided, each step must have day >=1, title & description non-empty
//     const sanitizedItinerary = Array.isArray(itinerary)
//       ? itinerary.map((s, i) => {
//           const dayNum = Number(s?.day);
//           const title = String(s?.title ?? "").trim();
//           const description = String(s?.description ?? "").trim();
//           const imageUrl = String(s?.imageUrl ?? "").trim();

//           if (!Number.isFinite(dayNum) || dayNum < 1) {
//             throw new Error(`itinerary[${i}].day must be a number ≥ 1`);
//           }
//           if (!title) {
//             throw new Error(`itinerary[${i}].title is required`);
//           }
//           if (!description) {
//             throw new Error(`itinerary[${i}].description is required`);
//           }

//           return { day: dayNum, title, description, imageUrl };
//         })
//       : [];

//     // faqs: if provided, each must have q and a non-empty
//     const sanitizedFaqs = Array.isArray(faqs)
//       ? faqs.map((f, i) => {
//           const q = String(f?.q ?? "").trim();
//           const a = String(f?.a ?? "").trim();
//           if (!q) throw new Error(`faqs[${i}].q is required`);
//           if (!a) throw new Error(`faqs[${i}].a is required`);
//           return { q, a };
//         })
//       : [];

//     // Build doc
//     const doc = await Tour.create({
//       tourName: tourName.trim(),
//       category: categoryId,
//       days: d,
//       nights: n,
//       tripCost: Number(tripCost) || 0,
//       tripStyle: isNonEmpty(tripStyle) ? tripStyle.trim() : "",
//       vehicle: isNonEmpty(vehicle) ? vehicle.trim() : "",
//       drivingDistance: isNonEmpty(drivingDistance) ? drivingDistance.trim() : "",
//       landscapes,
//       activity: isNonEmpty(activity) ? activity.trim() : "",
//       upcomingDates: parsedDates,
//       mainImageUrl: mainImageUrl.trim(),
//       subImageUrls: subImageUrls.map((u) => u.trim()),
//       routeMapUrl: isNonEmpty(routeMapUrl) ? routeMapUrl.trim() : "",
//       itinerary: sanitizedItinerary,
//       faqs: sanitizedFaqs,
//       // keep tour's categoryStatus in sync at creation time
//       categoryStatus: !!category.activeStatus,
//     });

//     return res.status(201).json({ success: true, item: doc });
//   } catch (err) {
//     console.error("createTour error:", err);
//     return res.status(400).json({ message: err.message || "Invalid payload" });
//   }
// };

export const listTours = async (req, res) => {
  try {
    const { search = "", page = 1, limit = 5 } = req.query;
    const pageNum = Math.max(1, Number(page) || 1);
    const pageSize = Math.min(50, Math.max(1, Number(limit) || 5));
    const skip = (pageNum - 1) * pageSize;

    const filter = {};
    if (search.trim()) {
      const regex = new RegExp(search.trim(), "i");

      // find categories that match
      const categories = await Category.find({ name: regex }).select("_id");
      const categoryIds = categories.map((c) => c._id);

      filter.$or = [{ tourName: regex }, { category: { $in: categoryIds } }];
    }

    const [items, totalItems] = await Promise.all([
      Tour.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .populate("category", "name"),
      Tour.countDocuments(filter),
    ]);
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

    res.json({ items, totalItems, totalPages, page: pageNum });
  } catch (err) {
    console.error("listTours error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


export const getTourById = async (req, res) => {
  try {
    const { id } = req.params;
   
    const item = await Tour.findById(id).populate("category", "name");
    if (!item) return res.status(404).json({ message: "Tour not found" });

    res.json({ item });
  } catch (err) {
    console.error("getTourById error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};



// PUT /admin/tours/:id
export const updateTour = async (req, res) => {
  try {
    const { id } = req.params;
   

    const {
      tourName,
      categoryId,
      days,
      nights,
      tripCost,
      tripStyle,
      vehicle,
      drivingDistance,
      landscapes,
      activity,
      upcomingDates,
      mainImageUrl,
      subImageUrls = [],
      routeMapUrl,
      itinerary = [],
      faqs = [],
    } = req.body;

    if (subImageUrls.length > 5) {
      return res.status(400).json({ message: "Sub images must be 5 or fewer" });
    }

    const update = {
      ...(tourName != null && { tourName: tourName.trim() }),
      ...(categoryId && { category: categoryId }),
      ...(days != null && { days: Number(days) }),
      ...(nights != null && { nights: Number(nights) }),
      ...(tripCost != null && { tripCost: Number(tripCost) }),
      ...(tripStyle != null && { tripStyle: String(tripStyle).trim() }),
      ...(vehicle != null && { vehicle: String(vehicle).trim() }),
      ...(drivingDistance != null && { drivingDistance: String(drivingDistance).trim() }),
      ...(landscapes && { landscapes }),
      ...(activity != null && { activity: String(activity).trim() }),
      ...(upcomingDates && { upcomingDates: upcomingDates.map((d) => new Date(d)) }),
      ...(mainImageUrl != null && { mainImageUrl }),
      ...(routeMapUrl != null && { routeMapUrl }),
      ...(subImageUrls && { subImageUrls }),
      ...(itinerary && {
        itinerary: itinerary.map((s) => ({
          day: Number(s.day),
          title: s.title || "",
          description: s.description || "",
          imageUrl: s.imageUrl || "",
        })),
      }),
      ...(faqs && { faqs: faqs.map((f) => ({ q: f.q || "", a: f.a || "" })) }),
    };

    const item = await Tour.findByIdAndUpdate(id, update, { new: true }).populate(
      "category",
      "name"
    );
    if (!item) return res.status(404).json({ message: "Tour not found" });

    res.json({ success: true, item });
  } catch (err) {
    console.error("updateTour error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
// export const updateTour = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const {
//       tourName,
//       categoryId,
//       days,
//       nights,
//       tripCost,
//       tripStyle,
//       vehicle,
//       drivingDistance,
//       landscapes,
//       activity,
//       upcomingDates,
//       mainImageUrl,
//       subImageUrls,
//       routeMapUrl,
//       itinerary,
//       faqs,
//     } = req.body;

//     const isNonEmptyStr = (v) => typeof v === "string" && v.trim().length > 0;

//     // 1) Load existing tour to validate cross-field rules (days/nights, etc.)
//     const existing = await Tour.findById(id).select(
//       "days nights category"
//     );
//     if (!existing) return res.status(404).json({ message: "Tour not found" });

//     // 2) Figure out the effective values (existing merged with incoming)
//     const effDays =
//       days != null ? Number(days) : Number(existing.days);
//     const effNights =
//       nights != null ? Number(nights) : Number(existing.nights);

//     // 3) Validate days/nights if either provided
//     if (days != null) {
//       if (!Number.isFinite(effDays) || effDays < 1) {
//         return res
//           .status(400)
//           .json({ message: "days must be a number ≥ 1" });
//       }
//     }
//     if (nights != null) {
//       if (!Number.isFinite(effNights) || effNights < 0) {
//         return res
//           .status(400)
//           .json({ message: "nights must be a non-negative number" });
//       }
//     }
//     // If either field is being changed, enforce nights === days - 1 on the effective values
//     if (days != null || nights != null) {
//       if (effNights !== effDays - 1) {
//         return res
//           .status(400)
//           .json({ message: "nights must be exactly days - 1" });
//       }
//     }

//     // 4) Validate category if updating
//     const update = {};
//     if (categoryId) {
//       const cat = await Category.findById(categoryId).select("activeStatus");
//       if (!cat) {
//         return res.status(404).json({ message: "Category not found" });
//       }
//       update.category = categoryId;
//       // mirror category's status when category changes
//       update.categoryStatus = !!cat.activeStatus;
//     }

//     // 5) Validate tourName if provided
//     if (tourName != null) {
//       if (!isNonEmptyStr(tourName)) {
//         return res
//           .status(400)
//           .json({ message: "tourName cannot be empty" });
//       }
//       update.tourName = tourName.trim();
//     }

//     // 6) Validate landscapes if provided
//     if (landscapes != null) {
//       if (!Array.isArray(landscapes) || landscapes.length === 0) {
//         return res.status(400).json({
//           message: "landscapes must be a non-empty array",
//         });
//       }
//       const allowed = [
//         "mountain",
//         "beach",
//         "rural",
//         "desert",
//         "forest",
//         "urban",
//       ];
//       const bad = landscapes.find((v) => !allowed.includes(String(v)));
//       if (bad) {
//         return res.status(400).json({
//           message: `Invalid landscape value: "${bad}". Allowed: ${allowed.join(
//             ", "
//           )}`,
//         });
//       }
//       update.landscapes = landscapes;
//     }

//     // 7) Validate upcomingDates if provided
//     if (upcomingDates != null) {
//       if (!Array.isArray(upcomingDates)) {
//         return res
//           .status(400)
//           .json({ message: "upcomingDates must be an array" });
//       }
//       const parsed = upcomingDates.map((d, i) => {
//         const t = new Date(d);
//         if (isNaN(t.getTime())) {
//           throw new Error(`Invalid date in upcomingDates at index ${i}`);
//         }
//         return t;
//       });
//       update.upcomingDates = parsed;
//     }

//     // 8) Validate mainImageUrl if provided
//     if (mainImageUrl != null) {
//       if (!isNonEmptyStr(mainImageUrl)) {
//         return res
//           .status(400)
//           .json({ message: "mainImageUrl cannot be empty" });
//       }
//       update.mainImageUrl = mainImageUrl.trim();
//     }

//     // 9) Validate subImageUrls if provided (exactly 5, all non-empty)
//     if (subImageUrls != null) {
//       if (!Array.isArray(subImageUrls) || subImageUrls.length !== 5) {
//         return res.status(400).json({
//           message: "subImageUrls must be an array of exactly 5 image URLs",
//         });
//       }
//       const hasEmpty = subImageUrls.some((u) => !isNonEmptyStr(u));
//       if (hasEmpty) {
//         return res
//           .status(400)
//           .json({ message: "All 5 subImageUrls must be non-empty strings" });
//       }
//       update.subImageUrls = subImageUrls.map((u) => u.trim());
//     }

//     // 10) Validate routeMapUrl if provided
//     if (routeMapUrl != null) {
//       update.routeMapUrl = isNonEmptyStr(routeMapUrl)
//         ? routeMapUrl.trim()
//         : "";
//     }

//     // 11) Validate itinerary if provided (title & description required, day ≥ 1)
//     if (itinerary != null) {
//       if (!Array.isArray(itinerary)) {
//         return res
//           .status(400)
//           .json({ message: "itinerary must be an array" });
//       }
//       const mapped = itinerary.map((s, i) => {
//         const dayNum = Number(s?.day);
//         const title = String(s?.title ?? "").trim();
//         const description = String(s?.description ?? "").trim();
//         const imageUrl = String(s?.imageUrl ?? "").trim();

//         if (!Number.isFinite(dayNum) || dayNum < 1) {
//           throw new Error(`itinerary[${i}].day must be a number ≥ 1`);
//         }
//         if (!title) throw new Error(`itinerary[${i}].title is required`);
//         if (!description)
//           throw new Error(`itinerary[${i}].description is required`);

//         return { day: dayNum, title, description, imageUrl };
//       });
//       update.itinerary = mapped;
//     }

//     // 12) Validate faqs if provided (q & a required)
//     if (faqs != null) {
//       if (!Array.isArray(faqs)) {
//         return res.status(400).json({ message: "faqs must be an array" });
//       }
//       const mapped = faqs.map((f, i) => {
//         const q = String(f?.q ?? "").trim();
//         const a = String(f?.a ?? "").trim();
//         if (!q) throw new Error(`faqs[${i}].q is required`);
//         if (!a) throw new Error(`faqs[${i}].a is required`);
//         return { q, a };
//       });
//       update.faqs = mapped;
//     }

//     // 13) Simple scalar fields
//     if (days != null) update.days = effDays;
//     if (nights != null) update.nights = effNights;

//     if (tripCost != null) update.tripCost = Number(tripCost) || 0;
//     if (tripStyle != null) update.tripStyle = String(tripStyle).trim();
//     if (vehicle != null) update.vehicle = String(vehicle).trim();
//     if (drivingDistance != null)
//       update.drivingDistance = String(drivingDistance).trim();
//     if (activity != null) update.activity = String(activity).trim();

//     // 14) Save
//     const item = await Tour.findByIdAndUpdate(id, update, {
//       new: true,
//     }).populate("category", "name");

//     return res.json({ success: true, item });
//   } catch (err) {
//     console.error("updateTour error:", err);
//     return res.status(400).json({ message: err.message || "Invalid payload" });
//   }
// };

// PATCH /admin/tours/:id/status
export const updateTourStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { activeStatus } = req.body;

    
    if (typeof activeStatus !== "boolean") {
      return res.status(400).json({ message: "activeStatus must be boolean" });
    }

    const item = await Tour.findByIdAndUpdate(
      id,
      { activeStatus: !!activeStatus },
      { new: true }
    );
    if (!item) return res.status(404).json({ message: "Tour not found" });

    res.json({ success: true, item });
  } catch (err) {
    console.error("updateTourStatus error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// DELETE /admin/tours/:id  (optional)
export const deleteTour = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }
    const del = await Tour.findByIdAndDelete(id);
    if (!del) return res.status(404).json({ message: "Tour not found" });
    res.json({ success: true });
  } catch (err) {
    console.error("deleteTour error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const createTestimonial = async (req, res, next) => {
  try {
    const { clientName, clientImage = "", tourName = "", review = "" } = req.body;
    if (!clientName || !clientName.trim()) {
      return res.status(400).json({ message: "Client name is required" });
    }
     if (!tourName || !tourName.trim()) {
      return res.status(400).json({ message: "Tour name is required" });
    }
     if (!review || !review.trim()) {
      return res.status(400).json({ message: "Review is required" });
    }
      if (!clientImage || !clientImage.trim()) {
      return res.status(400).json({ message: "Client image is required" });
    }

    const created = await Testimonial.create({
      clientName: clientName?.trim(),
      clientImage: clientImage?.trim(),
      tourName: tourName?.trim(),
      review: review?.trim(),
    });

    res.status(201).json({ message: "Testimonial created", testimonial: created });
  } catch (err) {
    next(err);
  }
};

export const getTestimonials = async (req, res, next) => {
  try {
    const { search = "", page = 1, limit = 5, sort = "-createdAt" } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const perPage = Math.max(1, Math.min(100, parseInt(limit, 10) || 5));

    const q = search ? { clientName: { $regex: search.trim(), $options: "i" } } : {};

    const [items, totalItems] = await Promise.all([
      Testimonial.find(q).sort(sort).skip((pageNum - 1) * perPage).limit(perPage).lean(),
      Testimonial.countDocuments(q),
    ]);

    res.json({
      items,
      totalItems,
      totalPages: Math.max(1, Math.ceil(totalItems / perPage)),
      page: pageNum,
      limit: perPage,
    });
  } catch (err) {
    next(err);
  }
};


export const getTestimonialById = async (req, res, next) => {
  try {
    const doc = await Testimonial.findById(req.params.id).lean();
    if (!doc) return res.status(404).json({ message: "Testimonial not found" });
    res.json({ testimonial: doc });
  } catch (err) {
    next(err);
  }
};
export const updateTestimonialStatus = async (req, res, next) => {
  try {
    const { activeStatus } = req.body;
    const updated = await Testimonial.findByIdAndUpdate(
      req.params.id,
      { activeStatus: !!activeStatus },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Testimonial not found" });
    res.json({ message: "Status updated", testimonial: updated });
  } catch (err) {
    next(err);
  }
};
export const updateTestimonial = async (req, res, next) => {
  try {
    const { clientName, clientImage, tourName, review, activeStatus } = req.body;
    if (!clientName || !clientName.trim()) {
      return res.status(400).json({ message: "Client name is required" });
    }
     if (!tourName || !tourName.trim()) {
      return res.status(400).json({ message: "Tour name is required" });
    }
     if (!review || !review.trim()) {
      return res.status(400).json({ message: "Review is required" });
    }
      if (!clientImage || !clientImage.trim()) {
      return res.status(400).json({ message: "Client image is required" });
    }

    const update = {};
    if (typeof clientName !== "undefined") update.clientName = clientName?.trim();
    if (typeof clientImage !== "undefined") update.clientImage = clientImage?.trim();
    if (typeof tourName !== "undefined") update.tourName = tourName?.trim();
    if (typeof review !== "undefined") update.review = review?.trim();
    if (typeof activeStatus !== "undefined") update.activeStatus = !!activeStatus;

    const updated = await Testimonial.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });

    if (!updated) return res.status(404).json({ message: "Testimonial not found" });
    res.json({ message: "Testimonial updated", testimonial: updated });
  } catch (err) {
    next(err);
  }
};

export const createAward = async (req, res, next) => {
  try {
    const { name, image = "" } = req.body;
     if (!name || !name.trim()) {
      return res.status(400).json({ message: "Award name is required" });
    }
    if (!image || !image.trim()) {
      return res.status(400).json({ message: "Award image is required" });
    }

    const created = await Award.create({
      name: name?.trim(),
      image: image?.trim(),
    });

    res.status(201).json({ message: "Award created", award: created });
  } catch (err) {
    next(err);
  }
};
export const getAwards = async (req, res, next) => {
  try {
    const { search = "", page = 1, limit = 5, sort = "-createdAt" } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const perPage = Math.max(1, Math.min(100, parseInt(limit, 10) || 5));

    const q = search
      ? { name: { $regex: search.trim(), $options: "i" } }
      : {};

    const [items, totalItems] = await Promise.all([
      Award.find(q)
        .sort(sort)
        .skip((pageNum - 1) * perPage)
        .limit(perPage)
        .lean(),
      Award.countDocuments(q),
    ]);

    // build pagination response inline
    const totalPages = Math.max(1, Math.ceil(totalItems / perPage));

    res.json({
      items,
      totalItems,
      totalPages,
      page: pageNum,
      limit: perPage,
    });
  } catch (err) {
    next(err);
  }
};

export const updateAwardStatus = async (req, res, next) => {
  try {
    const { activeStatus } = req.body;
    const updated = await Award.findByIdAndUpdate(
      req.params.id,
      { activeStatus: !!activeStatus },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Award not found" });
    res.json({ message: "Status updated", award: updated });
  } catch (err) {
    next(err);
  }
};

export const getAwardById = async (req, res, next) => {
  try {
    const doc = await Award.findById(req.params.id).lean();
    if (!doc) return res.status(404).json({ message: "Award not found" });
    res.json({ award: doc });
  } catch (err) {
    next(err);
  }
};
export const updateAward = async (req, res, next) => {
  try {
    const { name, image, activeStatus } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Award name is required" });
    }
    if (!image || !image.trim()) {
      return res.status(400).json({ message: "Award image is required" });
    }

    const update = {};
    if (typeof name !== "undefined") update.name = name?.trim();
    if (typeof image !== "undefined") update.image = image?.trim();
    if (typeof activeStatus !== "undefined") update.activeStatus = !!activeStatus;

    const updated = await Award.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });

    if (!updated) return res.status(404).json({ message: "Award not found" });
    res.json({ message: "Award updated", award: updated });
  } catch (err) {
    next(err);
  }
};

export const createTeamMember = async (req, res, next) => {
  try {
    const { name, post = "", description = "", image = "" } = req.body;
      if (!name || !name.trim()) {
      return res.status(400).json({ message: "Name is required" });
    }
    if (!post || !post.trim()) {
      return res.status(400).json({ message: "Post is required" });
    }
    if (!description || !description.trim()) {
      return res.status(400).json({ message: "Description is required" });
    }
    if (!image || !image.trim()) {
      return res.status(400).json({ message: "Image is required" });
    }

    const created = await TeamMember.create({
      name: name?.trim(),
      post: post?.trim(),
      description: description?.trim(),
      image: image?.trim(),
    });

    res.status(201).json({ message: "Team member created", member: created });
  } catch (err) {
    next(err);
  }
};
export const getTeamMembers = async (req, res, next) => {
  try {
    const { search = "", page = 1, limit = 5, sort = "-createdAt" } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const perPage = Math.max(1, Math.min(100, parseInt(limit, 10) || 5));

    const q = search
      ? { name: { $regex: search.trim(), $options: "i" } }
      : {};

    const [items, totalItems] = await Promise.all([
      TeamMember.find(q)
        .sort(sort)
        .skip((pageNum - 1) * perPage)
        .limit(perPage)
        .lean(),
      TeamMember.countDocuments(q),
    ]);

    res.json({
      items,
      totalItems,
      totalPages: Math.max(1, Math.ceil(totalItems / perPage)),
      page: pageNum,
      limit: perPage,
    });
  } catch (err) {
    next(err);
  }
};
export const updateTeamMemberStatus = async (req, res, next) => {
  try {
    const { activeStatus } = req.body;
    const updated = await TeamMember.findByIdAndUpdate(
      req.params.id,
      { activeStatus: !!activeStatus },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Team member not found" });
    res.json({ message: "Status updated", member: updated });
  } catch (err) {
    next(err);
  }
};


export const getTeamMemberById = async (req, res, next) => {
  try {
    const doc = await TeamMember.findById(req.params.id).lean();
    if (!doc) return res.status(404).json({ message: "Team member not found" });
    res.json({ member: doc });
  } catch (err) {
    next(err);
  }
};
export const updateTeamMember = async (req, res, next) => {
  try {
    const { name, post, description, image, activeStatus } = req.body;
      if (!name || !name.trim()) {
      return res.status(400).json({ message: "Name is required" });
    }
    if (!post || !post.trim()) {
      return res.status(400).json({ message: "Post is required" });
    }
    if (!description || !description.trim()) {
      return res.status(400).json({ message: "Description is required" });
    }
    if (!image || !image.trim()) {
      return res.status(400).json({ message: "Image is required" });
    }

    const update = {};
    if (typeof name !== "undefined") update.name = name?.trim();
    if (typeof post !== "undefined") update.post = post?.trim();
    if (typeof description !== "undefined") update.description = description?.trim();
    if (typeof image !== "undefined") update.image = image?.trim();
    if (typeof activeStatus !== "undefined") update.activeStatus = !!activeStatus;

    const updated = await TeamMember.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });

    if (!updated) return res.status(404).json({ message: "Team member not found" });
    res.json({ message: "Team member updated", member: updated });
  } catch (err) {
    next(err);
  }
};

export const getContact = async (req, res, next) => {
  try {
    const contact = await Contact.findOne().lean();
    if (!contact) return res.status(404).json({ message: "No contact found" });
    res.json({ contact });
  } catch (err) {
    next(err);
  }
};

// PUT /admin/contact  -> upsert the single contact
export const upsertContact = async (req, res, next) => {
  try {
    const { addresses = [], landline = "", email = "" } = req.body;

    // Basic sanitization/trim
    const sanitizedAddresses = (addresses || []).map((p) => ({
      address: (p.address || "").trim(),
      phone: (p.phone || "").trim(),
    }));

    const update = {
      addresses: sanitizedAddresses,
      landline: landline?.trim(),
      email: email?.trim(),
    };

    const contact = await Contact.findOneAndUpdate(
      {},
      update,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json({ message: "Contact saved", contact });
  } catch (err) {
    next(err);
  }
};

// PATCH /admin/contact/:id  -> update by id (optional)
export const updateContactById = async (req, res, next) => {
  try {
    const { addresses, landline, email } = req.body;

    const update = {};
    if (typeof addresses !== "undefined") {
      update.addresses = (addresses || []).map((p) => ({
        address: (p.address || "").trim(),
        phone: (p.phone || "").trim(),
      }));
    }
    if (typeof landline !== "undefined") update.landline = landline?.trim();
    if (typeof email !== "undefined") update.email = email?.trim();

    const updated = await Contact.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ message: "Contact not found" });
    res.json({ message: "Contact updated", contact: updated });
  } catch (err) {
    next(err);
  }
};

function buildPagedResponse({ items, totalItems, page, limit }) {
  const totalPages = Math.max(1, Math.ceil((totalItems || 0) / (limit || 1)));
  return { items, totalItems, totalPages, page, limit };
}


export const getToursWithFilters = async (req, res, next) => {
  try {
    const {
      search = "",
      categoryId = "",
      highlighted = "",
      page = 1,
      limit = 10,
      sort = "-createdAt",
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const perPage = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));

    const q = {};
    if (search) q.tourName = { $regex: search.trim(), $options: "i" };
    if (categoryId) q.category = categoryId;
    if (String(highlighted).toLowerCase() === "true") q.highlightStatus = true;

    const [items, totalItems] = await Promise.all([
      Tour.find(q)
        .populate("category", "name activeStatus")
        .sort(sort)
        .skip((pageNum - 1) * perPage)
        .limit(perPage)
        .lean(),
      Tour.countDocuments(q),
    ]);

    return res.json(buildPagedResponse({ items, totalItems, page: pageNum, limit: perPage }));
  } catch (err) {
    next(err);
  }
};


export const updateTourHighlightStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { highlightStatus } = req.body;

    if (typeof highlightStatus !== "boolean") {
      return res.status(400).json({ message: "highlightStatus must be boolean" });
    }

    const tour = await Tour.findById(id);
    if (!tour) return res.status(404).json({ message: "Tour not found" });

    // If turning ON highlight — enforce max 3 per category
    if (highlightStatus === true) {
      const highlighted = await Tour.find({
        _id: { $ne: tour._id },
        category: tour.category,
        highlightStatus: true,
      })
        .select("tourName")
        .lean();

      if (highlighted.length >= 3) {
        return res.status(409).json({
          message: "This category already has 3 highlighted tours.",
          highlightedTours: highlighted, // [{_id,tourName}]
        });
      }
    }

    tour.highlightStatus = !!highlightStatus;
    await tour.save();

    // return populated minimal for table
    const item = await Tour.findById(tour._id)
      .populate("category", "name activeStatus")
      .lean();

    return res.json({ success: true, item });
  } catch (err) {
    console.error("updateTourHighlightStatus error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export async function getCategoriesWithHighlightedTours(req, res) {
  try {
    const limit = Math.max(parseInt(req.query.limit ?? "3", 10), 1);
    const activeOnly = (req.query.activeOnly ?? "true") !== "false";

    const categoryMatch = activeOnly ? { activeStatus: true } : {};

    const categories = await Category.aggregate([
      { $match: categoryMatch },
      { $sort: { name: 1 } },
      {
        $lookup: {
          from: Tour.collection.name, // "tours"
          let: { catId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$category", "$$catId"] },
                ...(activeOnly ? { activeStatus: true, categoryStatus: true } : {}),
                highlightStatus: true,
              },
            },
            { $sort: { createdAt: -1 } },
            { $limit: limit },
            {
              $project: {
                _id: 1,
                tourName: 1,
                days: 1,
                nights: 1,
                mainImageUrl: 1,
              },
            },
          ],
          as: "highlightedTours",
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          coverImage: 1,
          activeStatus: 1,
          highlightedTours: 1,
        },
      },
    ]);

    res.json({ categories });
  } catch (err) {
    console.error("getCategoriesWithHighlightedTours error:", err);
    res.status(500).json({ message: "Failed to load categories with highlighted tours." });
  }
}

function parseRange({ from, to }) {
  const range = {};
  if (from || to) {
    range.createdAt = {};
    if (from) range.createdAt.$gte = new Date(`${from}T00:00:00.000Z`);
    if (to)   range.createdAt.$lte = new Date(`${to}T23:59:59.999Z`);
  }
  return range;
}

export async function listEnquiries(req, res) {
  try {
    const {
      page = 1,
      limit = 10,
      channel,               // email | whatsapp (optional)
      from,                  // YYYY-MM-DD (optional)
      to,                    // YYYY-MM-DD (optional)
      search,                // free text: name/phone/email/message (optional)
      sort = "-createdAt",   // default newest first
    } = req.query;

    const q = { ...parseRange({ from, to }) };

    if (channel && ["email", "whatsapp"].includes(channel)) {
      q.channel = channel;
    }

    if (search?.trim()) {
      const s = String(search).trim();
      q.$or = [
        { fullName: { $regex: s, $options: "i" } },
        { email:    { $regex: s, $options: "i" } },
        { phone:    { $regex: s, $options: "i" } },
        { message:  { $regex: s, $options: "i" } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const lim = Math.min(200, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * lim;

    const [items, totalItems] = await Promise.all([
      Enquiry.find(q)
        .sort(sort)
        .skip(skip)
        .limit(lim)
        .lean()
        .select("fullName phone email message channel createdAt"),
      Enquiry.countDocuments(q),
    ]);

    const totalPages = Math.max(1, Math.ceil(totalItems / lim));

    res.json({
      ok: true,
      items,
      totalItems,
      totalPages,
      page: pageNum,
      limit: lim,
    });
  } catch (err) {
    console.error("listEnquiries error:", err);
    res.status(500).json({ ok: false, message: "Failed to load enquiries." });
  }
}
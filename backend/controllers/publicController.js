// controllers/category.controller.js
import Category from "../models/categoryModel.js";
import Tour from "../models/tourModel.js";
import HeroCarousel from "../models/heroCarouselModel.js";
import Testimonial from "../models/testimonialModel.js";
import Enquiry from "../models/enquiryModel.js";
import nodemailer from "nodemailer";

import mongoose from "mongoose";

function mask(v) {
  if (!v) return v;
  return v.length > 8 ? v.slice(0, 2) + '***' + v.slice(-2) : '***';
}

const host = process.env.SMTP_HOST;
const port = Number(process.env.SMTP_PORT || 465);
const user = process.env.SMTP_USER;
const pass = (process.env.SMTP_PASS || '').replace(/\s+/g, ''); // strip spaces
const from = process.env.EMAIL_FROM;
const to   = process.env.EMAIL_TO;

console.log('[mail cfg]', { host, port, user, pass: mask(pass), from, to });

const transporter = nodemailer.createTransport({
  host: host || 'smtp.gmail.com',
  port: port || 465,
  secure: true,                 // 465 requires secure: true
  auth: { user, pass },
  // Optional: if IPv6 causes trouble
  family: 4,                    // force IPv4 DNS results
  // Optional: helpful during debugging
  logger: true,
  debug: true,
  tls: { servername: 'smtp.gmail.com' },
});
export async function submitEnquiry(req, res) {
  try {
    const { fullName, phone, email, message, source } = req.body || {};

    const errs = [];
    if (!fullName?.trim()) errs.push('Full name required');
    if (!/^\+?\d{10,15}$/.test(String(phone || ''))) errs.push('Valid phone required (include country code)');
    if (!/^\S+@\S+\.\S+$/.test(String(email || ''))) errs.push('Valid email required');
    if (errs.length) return res.status(400).json({ message: errs.join(', ') });
    const saved = await Enquiry.create({
      fullName: fullName.trim(),
      phone: String(phone).trim(),
      email: String(email).trim().toLowerCase(),
      message: (message || '').trim(),
      channel: "email",
    });
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT || 465),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: (process.env.SMTP_PASS || '').replace(/\s+/g, ''),
      },
      family: 4,
      tls: { servername: 'smtp.gmail.com' },
    });

    const html = `
      <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;">
        <h2 style="margin:0 0 8px">New Enquiry</h2>
        <p style="margin:0 0 16px;color:#555">Source: ${escapeHtml(source || 'website')}</p>
        <table cellspacing="0" cellpadding="8" style="border-collapse:collapse;border:1px solid #eee">
          <tr><td><b>Name</b></td><td>${escapeHtml(fullName)}</td></tr>
          <tr><td><b>Phone</b></td><td>${escapeHtml(phone)}</td></tr>
          <tr><td><b>Email</b></td><td>${escapeHtml(email)}</td></tr>
          <tr><td><b>Message</b></td><td>${escapeHtml(message || '-')}</td></tr>
        </table>
        <p style="margin-top:16px;color:#999;font-size:12px">Sent ${new Date().toISOString()}</p>
      </div>
    `;

    // await transporter.sendMail({
    //   from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    //   to: process.env.EMAIL_TO || process.env.SMTP_USER,
    //   replyTo: email,
    //   subject: `New Enquiry: ${fullName}`,
    //   html,
    // });
//     await transporter.sendMail({
//   from: process.env.EMAIL_FROM || process.env.SMTP_USER,
//   to: process.env.EMAIL_TO || process.env.SMTP_USER,
//   cc: email,                                          // ← customer gets a copy
//   replyTo: { name: fullName, address: email },        // ← replies target customer
//   subject: `New Enquiry: ${fullName}`,
//   html,
// });
// 1) Internal (to you)
await transporter.sendMail({
  from: process.env.EMAIL_FROM || process.env.SMTP_USER,
  to: process.env.EMAIL_TO || process.env.SMTP_USER,     // ideally NOT the same as SMTP_USER (see note below)
  subject: `New Enquiry: ${fullName}`,
  replyTo: { name: fullName, address: email },           // staff clicks Reply → writes to customer
  html,
});

// 2) Auto-ack to customer
await transporter.sendMail({
  from: process.env.EMAIL_FROM || process.env.SMTP_USER, // keep it your identity (avoid spoofing)
  to: email,                                             // customer
  subject: `Thanks, ${fullName.split(' ')[0] || ''} — we received your enquiry`,
  text: `Hi ${fullName},\n\nThanks for reaching out to Trippens! ...`, // or html
  // (optional) replyTo: 'trippensinfo@gmail.com'  // ensures their reply comes back to you
});


    return res.json({ ok: true });
  } catch (err) {
    console.error('submitEnquiry error:', err);
    return res.status(500).json({ message: 'Could not send enquiry email.' });
  }
}


function escapeHtml(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
// function mask(v) {
//   if (!v) return v;
//   return v.length > 8 ? v.slice(0, 2) + '***' + v.slice(-2) : '***';
// }
// function escapeHtml(str = "") {
//   return String(str)
//     .replace(/&/g, "&amp;")
//     .replace(/</g, "&lt;")
//     .replace(/>/g, "&gt;")
//     .replace(/"/g, "&quot;")
//     .replace(/'/g, "&#039;");
// }

// // Mailer config (kept compatible with your setup)
// const host = process.env.SMTP_HOST || "smtp.gmail.com";
// const port = Number(process.env.SMTP_PORT || 465);
// const user = process.env.SMTP_USER;
// const pass = (process.env.SMTP_PASS || "").replace(/\s+/g, "");
// const from = process.env.EMAIL_FROM || process.env.SMTP_USER;
// const to   = process.env.EMAIL_TO   || process.env.SMTP_USER;

// console.log("[mail cfg]", { host, port, user, pass: mask(pass), from, to });

// const transporter = nodemailer.createTransport({
//   host,
//   port,
//   secure: true,             // 465 -> secure
//   auth: { user, pass },
//   family: 4,                // force IPv4
//   logger: true,
//   debug: true,
//   tls: { servername: "smtp.gmail.com" },
// });

// const EMAIL_RE = /^\S+@\S+\.\S+$/;

// export async function submitEmailEnquiry(req, res) {
//   try {
//     const { fullName, phone, email, message } = req.body || {};
//     const errs = [];
//     if (!fullName?.trim()) errs.push("Full name required");
//     if (!/^\+?\d{10,15}$/.test(String(phone || ""))) errs.push("Valid phone required (include country code)");
//     if (!EMAIL_RE.test(String(email || ""))) errs.push("Valid email required");
//     if (!message?.trim()) errs.push("Message required");
//     if (errs.length) return res.status(400).json({ ok: false, message: errs.join(", ") });

//     // Save to DB with channel = email
//     const doc = await Enquiry.create({
//       fullName: fullName.trim(),
//       phone: String(phone).trim(),
//       email: String(email).trim().toLowerCase(),
//       message: message.trim(),
//       channel: "email",
//     });

//     // Build HTML for internal email
//     const html = `
//       <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;">
//         <h2 style="margin:0 0 8px">New Enquiry (Email)</h2>
//         <table cellspacing="0" cellpadding="8" style="border-collapse:collapse;border:1px solid #eee">
//           <tr><td><b>Name</b></td><td>${escapeHtml(fullName)}</td></tr>
//           <tr><td><b>Phone</b></td><td>${escapeHtml(phone)}</td></tr>
//           <tr><td><b>Email</b></td><td>${escapeHtml(email)}</td></tr>
//           <tr><td><b>Message</b></td><td>${escapeHtml(message)}</td></tr>
//           <tr><td><b>Channel</b></td><td>Email</td></tr>
//           <tr><td><b>Received</b></td><td>${doc.createdAt.toISOString()}</td></tr>
//         </table>
//       </div>
//     `;

//     // 1) Internal notification
//     await transporter.sendMail({
//       from,
//       to,
//       subject: `New Enquiry: ${fullName}`,
//       replyTo: { name: fullName, address: email },
//       html,
//     });

//     // 2) Auto-acknowledgement to customer
//     const firstName = fullName.split(" ")[0] || fullName;
//     await transporter.sendMail({
//       from,
//       to: email,
//       subject: `Thanks, ${firstName} — we received your enquiry`,
//       text:
// `Hi ${firstName},

// Thanks for reaching out to Trippens! We’ve received your enquiry and our team will contact you shortly.

// — Team Trippens`,
//     });

//     return res.status(201).json({ ok: true, enquiryId: doc._id, createdAt: doc.createdAt, channel: doc.channel });
//   } catch (err) {
//     console.error("submitEmailEnquiry error:", err);
//     return res.status(500).json({ ok: false, message: "Could not process email enquiry." });
//   }
// }

export async function submitWhatsappEnquiry(req, res) {
  try {
    const { fullName, phone, email, message } = req.body || {};

    // Save to DB with channel = whatsapp
    const doc = await Enquiry.create({
      fullName: fullName.trim(),
      phone: String(phone).trim(),
      email: String(email).trim().toLowerCase(),
      message: message.trim(),
      channel: "whatsapp",
    });

    // No mail is necessary for WhatsApp route, but you can notify internally if you want:
    // await transporter.sendMail({ ... })

    return res.status(201).json({ ok: true, enquiryId: doc._id, createdAt: doc.createdAt, channel: doc.channel });
  } catch (err) {
    console.error("submitWhatsappEnquiry error:", err);
    return res.status(500).json({ ok: false, message: "Could not process WhatsApp enquiry." });
  }
}
export const  getCategoriesWithHighlightedTours = async(req, res) => {
    console.log("wooww")
  try {
    const limit = Math.max(parseInt(req.query.limit ?? "3", 10), 1);
    const activeOnly = (req.query.activeOnly ?? "true") !== "false";

    const categoryMatch = activeOnly ? { activeStatus: true } : {};

    const categories = await Category.aggregate([
      { $match: categoryMatch },
      { $sort: { createdAt: -1 } },
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
                tripCost:1
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
    console.log(categories)
  } catch (err) {
    console.error("getCategoriesWithHighlightedTours error:", err);
    res.status(500).json({ message: "Failed to load categories with highlighted tours." });
  }
}
export async function getCategoryWithAllTours(req, res) {
  try {
    const { categoryId } = req.params;                // 👈 match FE
    const activeOnly = (req.query.activeOnly ?? "true") !== "false";

    if (!mongoose.isValidObjectId(categoryId)) {
      return res.status(400).json({ message: "Invalid category id" });
    }

    const category = await Category.findById(categoryId)
      .select("_id name description coverImage activeStatus")
      .lean();

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const match = {
      category: categoryId,                            // Mongoose will cast
      ...(activeOnly ? { activeStatus: true, categoryStatus: true } : {}),
    };

    const tours = await Tour.find(match)
      .sort({ createdAt: -1 })
      .select("_id tourName days nights mainImageUrl tripCost")
      .lean();

    res.json({ category, tours });
  } catch (err) {
    console.error("getCategoryWithAllTours error:", err);
    res.status(500).json({ message: "Failed to load category and tours." });
  }
}
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export async function getTourById(req, res) {
  try {
    const { tourId } = req.params;
    const { activeOnly } = req.query;

    if (!isValidObjectId(tourId)) return res.status(400).json({ message: "Invalid tour id." });

    const match = { _id: tourId };
    if (String(activeOnly) === "true") {
      match.activeStatus = true;
      match.categoryStatus = true;
    }

    const tour = await Tour.findOne(match)
      .select(
        "_id tourName days nights tripCost tripStyle vehicle drivingDistance landscapes activity " +
        "upcomingDates mainImageUrl subImageUrls routeMapUrl itinerary faqs"
      )
      .lean();

    if (!tour) return res.status(404).json({ message: "Tour not found." });
    return res.json({ tour });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error." });
  }
}

export async function getHeroCarouselSlides(req, res) {
  try {
    const { activeOnly = "true" } = req.query;

    const match = {};
    if (String(activeOnly) === "true") {
      match.activeStatus = true;
    }

    const pipeline = [
      { $match: match },
      {
        $lookup: {
          from: Category.collection.name,
          localField: "category",
          foreignField: "_id",
          as: "cat",
        },
      },
      { $unwind: "$cat" },
      // if activeOnly, category must be active too
      ...(String(activeOnly) === "true" ? [{ $match: { "cat.activeStatus": true } }] : []),
      { $sort: { createdAt: -1 } },
      {
        $project: {
          _id: 1,
          imageUrl: 1,
          categoryId: "$cat._id",
          categoryName: "$cat.name",
          categoryDescription: { $ifNull: ["$cat.description", ""] },
        },
      },
    ];

    const slides = await HeroCarousel.aggregate(pipeline).exec();

    // return exact fields the frontend expects to map without defaults
    return res.json({
      slides: slides.map((s) => ({
        id: s._id,
        src: s.imageUrl,
        title: s.categoryName || "",
        subtitle: s.categoryDescription || "",
        categoryId: s.categoryId,
      })),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error." });
  }
}

export async function getPublicTestimonials(req, res) {
  try {
    const { activeOnly = "true", limit } = req.query;

    const match = {};
    if (String(activeOnly) === "true") match.activeStatus = true;

    const query = Testimonial.find(match)
      .select("_id clientName clientImage tourName review createdAt")
      .sort({ createdAt: -1 });

    if (limit && !Number.isNaN(Number(limit))) {
      query.limit(Number(limit));
    }

    const rows = await query.lean().exec();

    // Normalize to frontend shape, no defaults
    const items = rows.map((t) => ({
      id: t._id,
      name: t.clientName || "",
      photo: t.clientImage || "",
      tour: t.tourName || "",
      review: t.review || "",
    }));

    return res.json({ items });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error." });
  }
}
const LANDSCAPES = [
  "Mountain",
  "Beaches",
  "Forest",
  "Snow",
  "Leisure",
  "Cultural",
  "Archaeological",
  "Rural",
  "Volcanic",
  "Tribal",
  "Cave",
  "Mangrove",
  "Waterfalls",
];

function normalizeLandscape(value = "") {
  const v = String(value).trim().toLowerCase();
  const found = LANDSCAPES.find((x) => x.toLowerCase() === v);
  return found || null;
}


export async function getToursByLandscape(req, res) {
  try {
    const { landscape } = req.params;
    const activeOnly = String(req.query.activeOnly || "false").toLowerCase() === "true";

    const normalized = normalizeLandscape(landscape);
    if (!normalized) {
      return res.status(400).json({ message: "Invalid landscape value." });
    }

    const query = {
      landscapes: normalized,
      ...(activeOnly ? { activeStatus: true, categoryStatus: true } : {}),
    };

    const tours = await Tour.find(query)
      .select("_id tourName days nights tripCost mainImageUrl subImageUrls")
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      landscape: normalized,
      count: tours.length,
      tours,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to fetch tours for this landscape." });
  }
}
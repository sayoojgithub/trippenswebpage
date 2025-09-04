// models/tour.model.js
import mongoose from "mongoose";

const { Schema } = mongoose;

const ItineraryStepSchema = new Schema(
  {
    day: { type: Number, required: true, min: 1 },
    title: { type: String, trim: true, default: "" },
    description: { type: String, trim: true, default: "" },
    imageUrl: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

const FaqSchema = new Schema(
  {
    q: { type: String, trim: true, default: "" },
    a: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

const TourSchema = new Schema(
  {
    // relations
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },

    // basics
    tourName: { type: String, required: true, trim: true },
    days: { type: Number, required: true, min: 1 },
    nights: { type: Number, default: 0, min: 0 },

    // meta
    tripCost: { type: Number, default: 0, min: 0 },
    tripStyle: { type: String, trim: true, default: "" },
    vehicle: { type: String, trim: true, default: "" },
    drivingDistance: { type: String, trim: true, default: "" },

    // tags
    landscapes: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) =>
          arr.every((v) =>
            [
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
            ].includes(String(v))
          ),
        message: "Invalid landscape value.",
      },
    },
    activity: { type: String, trim: true, default: "" },

    // dates
    upcomingDates: { type: [Date], default: [] },

    // images
    mainImageUrl: { type: String, trim: true, default: "" },
    subImageUrls: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => arr.length <= 5,
        message: "Sub images must be 5 or fewer.",
      },
    },
    routeMapUrl: { type: String, trim: true, default: "" },

    // itinerary & faq
    itinerary: { type: [ItineraryStepSchema], default: [] },
    faqs: { type: [FaqSchema], default: [] },

    // status
    activeStatus: { type: Boolean, default: true },
    categoryStatus: { type: Boolean, default: true },
    highlightStatus: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Tour", TourSchema);

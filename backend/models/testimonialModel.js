import mongoose from "mongoose";

const TestimonialSchema = new mongoose.Schema(
  {
    clientName: {
      type: String,
      trim: true,
      maxlength: 120,
    },
    clientImage: {
      type: String, // Cloudinary URL
      default: "",
      trim: true,
    },
    tourName: {
      type: String,
      default: "",
      trim: true,
    },
    review: {
      type: String,
      default: "",
      trim: true,
    },
    activeStatus: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);



export default mongoose.model("Testimonial", TestimonialSchema);

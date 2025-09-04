import mongoose from "mongoose";

const AwardSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, },
    image: { type: String, default: "", trim: true }, // Cloudinary URL
    activeStatus: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

export default mongoose.model("Award", AwardSchema);
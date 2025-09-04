import mongoose from "mongoose";

const TeamMemberSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, },
    post: { type: String, default: "", trim: true },
    description: { type: String, default: "", trim: true },
    image: { type: String, default: "", trim: true }, // Cloudinary URL
    activeStatus: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);


export default mongoose.model("TeamMember", TeamMemberSchema);

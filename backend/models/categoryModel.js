
import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,         
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    coverImage: {
      type: String,
      trim: true,
      default: "",
    },
    activeStatus: {
      type: Boolean,
      default: true,         
      index: true,
    },
  },
  { timestamps: true }
);



export default mongoose.model("Category", CategorySchema);

import mongoose from "mongoose";

const AddressPairSchema = new mongoose.Schema(
  {
    address: { type: String, trim: true, default: "" },
    phone: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

const ContactSchema = new mongoose.Schema(
  {
    addresses: { type: [AddressPairSchema], default: [] }, // [{ address, phone }]
    landline: { type: String, trim: true, default: "" },
    email: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Contact", ContactSchema);

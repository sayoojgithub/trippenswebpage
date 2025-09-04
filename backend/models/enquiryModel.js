import mongoose from "mongoose";

export const CHANNELS = ["email", "whatsapp"];

const EnquirySchema = new mongoose.Schema(
  {
    fullName: { type: String,},
    phone:    { type: String,},  
    email:    { type: String,},
    message:  { type: String,},
    channel:  { type: String, enum: CHANNELS, },             
  },
  { timestamps: true } // createdAt is your enquiry date/time
);



export default mongoose.model("Enquiry", EnquirySchema);


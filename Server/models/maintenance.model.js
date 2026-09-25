import mongoose from "mongoose";

const maintenanceSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    preferredDate: { type: Date },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed"],
      default: "Pending",
    },
    sellerAcceptedAt: Date,
    adminAcceptedAt: Date,
    scheduledAt: Date,
  },
  { timestamps: true },
);

export default mongoose.model("Maintenance", maintenanceSchema);

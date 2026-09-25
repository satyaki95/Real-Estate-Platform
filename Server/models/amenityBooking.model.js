import mongoose from "mongoose";

const amenityBookingSchema = new mongoose.Schema(
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
    amenity: { type: String, required: true, trim: true },
    startAt: { type: Date, required: true },
    endAt: { type: Date, required: true },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Checked In", "Completed", "Cancelled"],
      default: "Pending",
    },
    checkedInAt: Date,
    checkedOutAt: Date,
  },
  { timestamps: true },
);

export default mongoose.model("AmenityBooking", amenityBookingSchema);

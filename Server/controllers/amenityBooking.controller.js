import AmenityBooking from "../models/amenityBooking.model.js";
import Property from "../models/property.model.js";

const populateBooking = (query) =>
  query
    .populate("property", "title city area amenities")
    .populate("buyer", "name email phone")
    .populate("seller", "name email phone")
    .sort({ createdAt: -1 });

export const createBooking = async (req, res) => {
  try {
    const { propertyId, amenity, startAt, endAt } = req.body;
    const start = new Date(startAt);
    const end = new Date(endAt);
    if (
      !amenity ||
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime()) ||
      end <= start
    ) {
      return res.status(400).json({
        success: false,
        message: "Provide a valid amenity and time range",
      });
    }
    const property = await Property.findById(propertyId);
    if (!property)
      return res
        .status(404)
        .json({ success: false, message: "Property not found" });
    const conflict = await AmenityBooking.exists({
      property: property._id,
      amenity,
      status: { $ne: "Cancelled" },
      startAt: { $lt: end },
      endAt: { $gt: start },
    });
    if (conflict)
      return res.status(409).json({
        success: false,
        message: "That amenity is already booked for this time",
      });
    const booking = await AmenityBooking.create({
      property: property._id,
      buyer: req.user._id,
      seller: property.seller,
      amenity,
      startAt: start,
      endAt: end,
    });
    const populated = await populateBooking(
      AmenityBooking.findById(booking._id),
    );
    res.status(201).json({ success: true, booking: populated });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create amenity booking",
    });
  }
};

export const listBookings = async (req, res) => {
  try {
    const filter =
      req.user.role === "buyer"
        ? { buyer: req.user._id }
        : req.user.role === "seller"
          ? { seller: req.user._id }
          : {};
    const bookings = await populateBooking(AmenityBooking.find(filter));
    res.json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to load amenity bookings",
    });
  }
};

export const updateBooking = async (req, res) => {
  try {
    const booking = await AmenityBooking.findById(req.params.id);
    if (!booking)
      return res
        .status(404)
        .json({ success: false, message: "Amenity booking not found" });
    const canUpdate =
      req.user.role === "admin" ||
      (req.user.role === "seller" &&
        booking.seller.toString() === req.user._id.toString());
    if (!canUpdate)
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    if (req.body.status) booking.status = req.body.status;
    if (req.body.status === "Checked In") booking.checkedInAt = new Date();
    if (req.body.status === "Completed") booking.checkedOutAt = new Date();
    await booking.save();
    const populated = await populateBooking(
      AmenityBooking.findById(booking._id),
    );
    const io = req.app.get("io");
    [booking.buyer, booking.seller].forEach((id) =>
      io?.to(`user:${id}`).emit("bookingUpdated", populated),
    );
    io?.to("role:admin").emit("bookingUpdated", populated);
    res.json({ success: true, booking: populated });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update amenity booking",
    });
  }
};

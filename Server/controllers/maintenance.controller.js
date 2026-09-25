import Maintenance from "../models/maintenance.model.js";
import Property from "../models/property.model.js";

// Attach related property and user details to maintenance records before returning them.
const populateRequest = (query) =>
  query
    .populate("property", "title city area")
    .populate("buyer", "name email phone")
    .populate("seller", "name email phone")
    .sort({ createdAt: -1 });

// Create a maintenance request tied to a property and the buyer/seller involved.
export const createMaintenance = async (req, res) => {
  try {
    const { propertyId, title, description, preferredDate } = req.body;
    const property = await Property.findById(propertyId);
    if (!property)
      return res
        .status(404)
        .json({ success: false, message: "Property not found" });
    const request = await Maintenance.create({
      property: property._id,
      buyer: req.user._id,
      seller: property.seller,
      title,
      description,
      preferredDate,
    });
    const populated = await populateRequest(Maintenance.findById(request._id));
    res.status(201).json({ success: true, request: populated });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create maintenance request",
    });
  }
};

// Return maintenance requests for the current buyer or seller and populate related records.
export const listMaintenance = async (req, res) => {
  try {
    const filter =
      req.user.role === "buyer"
        ? { buyer: req.user._id }
        : req.user.role === "seller"
          ? { seller: req.user._id }
          : {};
    const requests = await populateRequest(Maintenance.find(filter));
    res.json({ success: true, requests });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to load maintenance requests",
    });
  }
};

// Update the status or schedule of a maintenance request and notify the involved users.
export const updateMaintenance = async (req, res) => {
  try {
    const request = await Maintenance.findById(req.params.id);
    if (!request)
      return res
        .status(404)
        .json({ success: false, message: "Maintenance request not found" });
    const canUpdate =
      req.user.role === "admin" ||
      (req.user.role === "seller" &&
        request.seller.toString() === req.user._id.toString());
    if (!canUpdate)
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    const { status, scheduledAt } = req.body;
    if (status) request.status = status;
    if (scheduledAt) request.scheduledAt = scheduledAt;
    if (req.user.role === "seller") request.sellerAcceptedAt = new Date();
    if (req.user.role === "admin") request.adminAcceptedAt = new Date();
    await request.save();
    const populated = await populateRequest(Maintenance.findById(request._id));
    const io = req.app.get("io");
    [request.buyer, request.seller].forEach((id) =>
      io?.to(`user:${id}`).emit("maintenanceUpdated", populated),
    );
    io?.to("role:admin").emit("maintenanceUpdated", populated);
    res.json({ success: true, request: populated });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update maintenance request",
    });
  }
};

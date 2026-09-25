import Wishlist from "../models/wishlist.model.js";

// Save a property to the current user's wishlist if it is not already present.
export const addWishlist = async (req, res) => {
  try {
    const propertyId = req.params.propertyId;

    const existing = await Wishlist.findOne({
      user: req.user._id,
      property: propertyId,
    });

    if (existing) {
      return res.status(200).json({
        success: true,
        message: "Property is already in the wishlist",
      });
    }

    await Wishlist.create({
      user: req.user._id,
      property: propertyId,
    });

    res
      .status(201)
      .json({ success: true, message: "Property added to wishlist" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error adding property to wishlist",
      error,
    });
  }
};

// Fetch the current user's saved properties with the property details populated.
export const getWishlist = async (req, res) => {
  try {
    const data = await Wishlist.find({ user: req.user._id }).populate(
      "property",
    );
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error retrieving wishlist",
      error,
    });
  }
};

// Remove a property from the user's wishlist and return a confirmation response.
export const removeWishlist = async (req, res) => {
  try {
    const propertyId = req.params.propertyId;
    const result = await Wishlist.findOneAndDelete({
      user: req.user._id,
      property: propertyId,
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Property not found in wishlist",
      });
    }

    res.status(200).json({
      success: true,
      message: "Property removed from wishlist",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Error removing property from wishlist",
    });
  }
};

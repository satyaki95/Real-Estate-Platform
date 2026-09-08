import Wishlist from "../models/wishlist.model.js";

// to add a property to the wishlist
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

// to get the property that is in the wishlist
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

// to remove a property from the wishlist
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

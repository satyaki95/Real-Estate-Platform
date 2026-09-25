import express from "express";
import { authorize, protect } from "../middlewares/auth.middleware.js";
import {
  createBooking,
  listBookings,
  updateBooking,
} from "../controllers/amenityBooking.controller.js";

const router = express.Router();
router.use(protect);
router.post("/", authorize("buyer"), createBooking);
router.get("/", authorize("buyer", "seller", "admin"), listBookings);
router.patch("/:id", authorize("seller", "admin"), updateBooking);
export default router;

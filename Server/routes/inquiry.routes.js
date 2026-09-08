import express from "express";
import { authorize, protect } from "../middlewares/auth.middleware.js";
import {
  getSellerInquiries,
  markInquiryAsRead,
  sendInquiry,
} from "../controllers/inquiry.controller.js";

const inquiryRouter = express.Router();

inquiryRouter.post("/", protect, authorize("buyer"), sendInquiry);
inquiryRouter.get("/seller", protect, authorize("seller"), getSellerInquiries);

inquiryRouter.patch("/:id/read", protect, markInquiryAsRead);

export default inquiryRouter;

import express from "express";
import { authorize, protect } from "../middlewares/auth.middleware.js";
import {
  createMaintenance,
  listMaintenance,
  updateMaintenance,
} from "../controllers/maintenance.controller.js";

const router = express.Router();
router.use(protect);
router.post("/", authorize("buyer"), createMaintenance);
router.get("/", authorize("buyer", "seller", "admin"), listMaintenance);
router.patch("/:id", authorize("seller", "admin"), updateMaintenance);
export default router;

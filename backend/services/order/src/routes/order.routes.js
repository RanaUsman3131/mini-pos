import express from "express";
import {
  createOrder,
  getAllOrders,
  getOrderById,
  completeOrder,
} from "../controllers/order.controller.js";

const router = express.Router();

router.post("/", createOrder);
router.get("/", getAllOrders);
router.get("/:id", getOrderById);
router.patch("/:id/complete", completeOrder);

export default router;

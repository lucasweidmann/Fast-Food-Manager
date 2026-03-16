import { Router } from "express";

import {
  getOrders,
  createOrder,
  updateOrderStatus,
  getOrdersByUser,
  getOrdersByCustomer,
} from "../controllers/orderController.js";

const router = Router();

router.get("/", getOrders);
router.get("/user/:userId", getOrdersByUser);
router.get("/customer/:customerName", getOrdersByCustomer);
router.post("/", createOrder);
router.patch("/:id/status", updateOrderStatus);

export default router;

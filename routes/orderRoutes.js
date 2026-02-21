const express = require("express");
const router = express.Router();

const {
  createOrder,
  getOrders,
  getOrdersByUserPhone,
  updateOrderStatus,
  getOrderById,
  cancelOrderByCustomer   // 👈 ADD THIS
} = require("../controllers/orderController");


const { protect } = require("../middleware/authMiddleware");
const {
  requireStaffOrAdmin,
} = require("../middleware/roleMiddleware");

/* ===============================
   CUSTOMER ROUTES
================================ */

// Place order
router.post("/", createOrder);

// Get orders by phone
router.get("/user/:phone", getOrdersByUserPhone);

// Get single order (MUST come after /user route)
router.get("/:id", getOrderById);

router.put("/:id/cancel", cancelOrderByCustomer);



/* ===============================
   ADMIN / STAFF ROUTES
================================ */

router.get("/", protect, requireStaffOrAdmin, getOrders);
router.put("/:id/status", protect, requireStaffOrAdmin, updateOrderStatus);

module.exports = router;

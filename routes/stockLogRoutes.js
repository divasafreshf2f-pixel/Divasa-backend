const express = require("express");
const router = express.Router();

const StockLog = require("../models/StockLog");
const { protect } = require("../middleware/authMiddleware");
const { requireAdmin } = require("../middleware/roleMiddleware");

// GET ALL STOCK LOGS (ADMIN ONLY)
router.get("/", protect, requireAdmin, async (req, res) => {
  try {
    const logs = await StockLog.find()
      .populate("productId", "name category")
      .populate("variantId", "name")
      .populate("orderId", "_id")
      .sort({ createdAt: -1 });

    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// GET STOCK LOGS BY PRODUCT ID (ADMIN)
router.get(
  "/product/:productId",
  protect,
  requireAdmin,
  async (req, res) => {
    try {
      // STEP 1: always filter by product
      const filter = {
        productId: req.params.productId,
      };

      // STEP 2: if variantId is sent, ALSO filter by variant
      if (req.query.variantId) {
        filter.variantId = req.query.variantId;
      }

      // STEP 3: fetch matching logs
      const logs = await StockLog.find(filter)
        .sort({ createdAt: -1 });

      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);





module.exports = router;

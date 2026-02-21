const mongoose = require("mongoose");

const stockLogSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    variantId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },

    type: {
      type: String,
      enum: ["INCREASE", "DECREASE"],
      required: true,
    },

    reason: {
      type: String,
      enum: [
        "order_packed",
        "order_cancelled",
        "manual_add",
        "manual_remove",
      ],
      required: true,
    },

    // ✅ NEW FIELDS (THIS IS THE KEY)
    oldStock: {
      type: Number,
      required: true,
    },
    newStock: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("StockLog", stockLogSchema);

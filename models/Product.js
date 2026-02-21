const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },

    image: {
      type: String,
    },
    
    variants: [
      {
        name: String, // eg: 1 Kg, 500g, 250ml
        price: Number,
        stock: {
          type: Number,
          default: 0, // stock per variant
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);

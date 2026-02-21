const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    otp: {
      type: String,
    },
    otpExpiry: {
      type: Date,
    },
   isVerified: {
      type: Boolean,
      default: false,
    },
    favorites: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Customer", customerSchema);

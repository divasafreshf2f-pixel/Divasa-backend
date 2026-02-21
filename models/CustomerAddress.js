const mongoose = require("mongoose");

const customerAddressSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: true,
      index: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    flatNo: {
      type: String,
      required: true,
    },
    landmark: {
      type: String,
    },
    buildingType: {
      type: String,
      enum: ["Society", "Independent house", "Office"],
      default: "Society",
    },
    addressType: {
      type: String,
      enum: ["Home", "Work", "Others"],
      default: "Home",
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CustomerAddress", customerAddressSchema);

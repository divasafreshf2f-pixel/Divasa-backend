const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema({
  freeDeliveryMinAmount: {
    type: Number,
    default: 500
  }
});

module.exports = mongoose.model("Settings", settingsSchema);

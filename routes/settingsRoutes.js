const express = require("express");
const Settings = require("../models/Settings");

const router = express.Router();

// GET settings
router.get("/", async (req, res) => {
  try {
    let settings = await Settings.findOne();

    if (!settings) {
      settings = await Settings.create({
        freeDeliveryMinAmount: 500
      });
    }

    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch settings" });
  }
});

// UPDATE settings
router.put("/", async (req, res) => {
  try {
    const { freeDeliveryMinAmount } = req.body;

    let settings = await Settings.findOne();

    if (!settings) {
      settings = await Settings.create({ freeDeliveryMinAmount });
    } else {
      settings.freeDeliveryMinAmount = freeDeliveryMinAmount;
      await settings.save();
    }

    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: "Failed to update settings" });
  }
});

module.exports = router;

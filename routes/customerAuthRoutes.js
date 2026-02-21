const express = require("express");
const router = express.Router();
const Customer = require("../models/Customer");

// 🔹 Generate Random 6 Digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// 🔹 SEND OTP
router.post("/send-otp", async (req, res) => {
  try {
    const phone = req.body.phone.trim();


    if (!phone) {
      return res.status(400).json({ message: "Phone number required" });
    }

    let customer = await Customer.findOne({ phone });

    const otp = generateOTP();
    const expiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    if (!customer) {
      customer = new Customer({
        phone,
        otp,
        otpExpiry: expiry,
        isVerified: false,
      });
    } else {
      customer.otp = otp;
      customer.otpExpiry = expiry;
      customer.isVerified = false;
    }

    await customer.save();

    // ⚠️ TEMPORARY — Return OTP for testing
    res.json({
      message: "OTP sent successfully",
      otp, // REMOVE THIS WHEN SMS API ADDED
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// 🔹 VERIFY OTP
router.post("/verify-otp", async (req, res) => {
  try {
    const phone = req.body.phone.trim();
const otp = req.body.otp;


    const customer = await Customer.findOne({ phone });

    if (!customer) {
      return res.status(400).json({ message: "Customer not found" });
    }

    // Normalize values
const enteredOtp = otp.toString().trim();
const storedOtp = customer.otp?.toString().trim();

if (storedOtp !== enteredOtp) {
  return res.status(400).json({ message: "Invalid OTP" });
}


    if (customer.otpExpiry < new Date()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    customer.isVerified = true;
    customer.otp = null;
    customer.otpExpiry = null;

    await customer.save();

   const jwt = require("jsonwebtoken");

const token = jwt.sign(
  { customerId: customer._id },
  process.env.JWT_SECRET,
  { expiresIn: "7d" }
);

res.json({
  message: "Login successful",
  token,
  customer: {
    id: customer._id,
    phone: customer.phone
  }
});


  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

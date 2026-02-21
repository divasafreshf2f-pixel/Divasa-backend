const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const User = require("../models/User");

dotenv.config();

async function createUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    const adminPassword = "admin123";
const staffPassword = "staff123";

    // Remove old users if they exist
    await User.deleteMany({
      email: { $in: ["admin@divasa.in", "staff@divasa.in"] },
    });

    // Create fresh users with REQUIRED fields
    await User.create([
      {
        name: "Divasa Admin",
        email: "admin@divasa.in",
        password: adminPassword,
        role: "admin",
      },
      {
        name: "Divasa Staff",
        email: "staff@divasa.in",
        password: staffPassword,
        role: "staff",
      },
    ]);

    console.log("✅ Admin & Staff users created successfully");
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

createUsers();

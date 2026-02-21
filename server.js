const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

/* ---------------- MIDDLEWARE ---------------- */

app.use(express.json()); // 🔥 MUST be before routes
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Cache-Control",
      "Pragma",
    ],
  })
);

/* ---------------- STATIC ---------------- */

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
console.log("Uploads folder exposed:", path.join(__dirname, "uploads"));

/* ---------------- ROUTES ---------------- */

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/stock-logs", require("./routes/stockLogRoutes"));
app.use("/api/settings", require("./routes/settingsRoutes"));
app.use("/api/customer", require("./routes/customerAuthRoutes"));
app.use("/api/addresses", require("./routes/customerAddressRoutes"));



/* ---------------- SERVER ---------------- */

app.get("/", (req, res) => {
  res.status(200).send("Divasa Backend Running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
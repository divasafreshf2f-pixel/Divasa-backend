const express = require("express");
const router = express.Router();
const productCtrl = require("../controllers/productController");

router.post("/toggle-favorite", productCtrl.toggleFavorite);
router.get("/favorites/:phone", productCtrl.getFavorites);

const Product = require("../models/Product");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/products");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      Date.now() + "-" + file.originalname.replace(/\s+/g, "")
    );
  },
});

const upload = multer({ storage });



// ✅ PUBLIC PRODUCTS (customer website)
router.get("/", async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ CREATE PRODUCT (admin)
router.post("/", upload.single("image"), async (req, res) => {

  try {
        console.log("Uploaded file:", req.file);

    const { name, category, variants } = req.body;

    if (!name || !category || !variants || variants.length === 0) {
      return res.status(400).json({ message: "Invalid product data" });
    }

    let parsedVariants = JSON.parse(variants);

// Auto-generate weight variants for vegetables & fruits
if (
  (category?.toLowerCase() === "vegetable" ||
   category?.toLowerCase() === "fruits") &&
  parsedVariants.length === 1
) {
  const baseVariant = parsedVariants[0];
  const basePrice = Number(baseVariant.price);
  const baseStock = Number(baseVariant.stock || 0);

  parsedVariants = [
    {
      name: "250g",
      price: Number((basePrice * 0.25).toFixed(2)),
      stock: baseStock,
    },
    {
      name: "500g",
      price: Number((basePrice * 0.5).toFixed(2)),
      stock: baseStock,
    },
    {
      name: "750g",
      price: Number((basePrice * 0.75).toFixed(2)),
      stock: baseStock,
    },
    {
      name: "1 Kg",
      price: basePrice,
      stock: baseStock,
    },
  ];
}

const product = new Product({
  name,
  category,
  variants: parsedVariants,
  image: req.file ? `/uploads/products/${req.file.filename}` : null,
});



    await product.save();

    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ UPDATE PRODUCT IMAGE
router.put("/:productId/image", upload.single("image"), async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    product.image = `/uploads/products/${req.file.filename}`;
    await product.save();

    res.json({
      message: "Image updated",
      image: product.image,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Image update failed" });
  }
});

// ✅ REMOVE PRODUCT IMAGE
router.put("/:productId/image/remove", async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.image = null;
    await product.save();

    res.json({
      message: "Image removed successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to remove image" });
  }
});



// ✅ UPDATE PRODUCT VARIANT (price / stock)
router.put("/:productId/variants/:variantId", async (req, res) => {
  try {
    const { productId, variantId } = req.params;
    const { price, stock } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const variant = product.variants.id(variantId);
    if (!variant) {
      return res.status(404).json({ message: "Variant not found" });
    }

    if (price !== undefined) variant.price = price;
    if (stock !== undefined) variant.stock = stock;

    await product.save();

    res.json({ message: "Variant updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});






// ✅ DELETE PRODUCT (admin)
router.delete("/:productId", async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await Product.findByIdAndDelete(productId);

    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete product" });
  }
});

// ✅ SOFT DELETE PRODUCT (admin)
router.put("/:productId/deactivate", async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.isActive = false;
    await product.save();

    res.json({ message: "Product deactivated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ RESTORE PRODUCT (admin)
router.put("/:productId/activate", async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.isActive = true;
    await product.save();

    res.json({ message: "Product restored successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


module.exports = router;

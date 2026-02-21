const createProduct = async (req, res) => {
  try {
    let { name, category, image, variants } = req.body;

    // Convert variants string to array if needed

    // Ensure variants is array
if (!variants) {
  variants = [];
}

if (typeof variants === "string") {
  try {
    variants = JSON.parse(variants);
  } catch (err) {
    console.log("Variants JSON parse failed");
    variants = [];
  }
}

console.log("Final variants after parsing:", variants);
console.log("Length:", variants.length);


console.log("Incoming variants:", variants);


    // Auto-generate weight variants for vegetables & fruits
   if (
  (category?.toLowerCase() === "vegetable" ||
   category?.toLowerCase() === "fruits") &&
  variants.length === 1
)
 {
      const baseVariant = variants[0];

      const basePrice = Number(baseVariant.price);
      const baseStock = Number(baseVariant.stock || 0);

      variants = [
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

    const product = await Product.create({
      name,
      category,
      image,
      variants,
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// FAVORITES LOGIC
const Customer = require("../models/Customer");

exports.toggleFavorite = async (req, res) => {
  try {
    const { productId, phone } = req.body;
    const customer = await Customer.findOne({ phone });
    if (!customer) return res.status(404).json({ message: "User not found" });

    const favIndex = customer.favorites.indexOf(productId);
    if (favIndex === -1) {
      customer.favorites.push(productId);
    } else {
      customer.favorites.splice(favIndex, 1);
    }
    await customer.save();
    res.json({ success: true, favorites: customer.favorites });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getFavorites = async (req, res) => {
  try {
    const customer = await Customer.findOne({ phone: req.params.phone }).populate("favorites");
    res.json(customer ? customer.favorites : []);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
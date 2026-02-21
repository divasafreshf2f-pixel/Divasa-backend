const Order = require("../models/Order");
const Product = require("../models/Product");
const StockLog = require("../models/StockLog");

/* ===============================
   CREATE ORDER (UNCHANGED)
================================ */
exports.createOrder = async (req, res) => {
  try {
    const { customerName, customerPhone, customerAddress, items } = req.body;

const normalizePhone = (phone) =>
  phone.replace(/\D/g, "").slice(-10);

const cleanPhone = normalizePhone(customerPhone);


if (
  !customerName ||
  !customerPhone ||
  !customerAddress ||
  !items?.length
)
   

{
  return res.status(400).json({ message: "Missing required fields" });
}


    let orderItems = [];
    let totalAmount = 0;

    for (const item of items) {
      const { productId, variantId, quantity } = item;

      if (!productId || !variantId || !quantity) {
        return res.status(400).json({ message: "Invalid item data" });
      }

      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      const variant = product.variants.id(variantId);
      if (!variant) {
        return res.status(404).json({ message: "Variant not found" });
      }

      if (variant.stock < quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.name} (${variant.name})`,
        });
      }

      const itemTotal = variant.price * quantity;
      totalAmount += itemTotal;

const normalizePhone = (phone) => {
  return phone.replace(/\D/g, "").slice(-10);
};

const cleanPhone = normalizePhone(req.body.customerPhone);


      orderItems.push({
        productId,
        variantId,
        quantity,
        price: variant.price, // already stored
      });
    }

  

const order = await Order.create({
  customerName,
  customerPhone: cleanPhone,   // 🔥 store only 10 digits
  customerAddress,
  items: orderItems,
  totalAmount,
  status: "new",
});


    res.status(201).json(order);
  } catch (error) {
    console.error("ORDER ERROR:", error);
    res.status(500).json({ message: "Failed to place order" });
  }
};

/* ===============================
   GET ALL ORDERS (SAFE ENHANCED)
================================ */
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("items.productId", "name category")
      .populate("items.variantId", "name price type")
      .sort({ createdAt: -1 });

    const enrichedOrders = orders.map((order) => {
      const enrichedItems = order.items.map((item) => {
        const product = item.productId;
        const variant = item.variantId;

        return {
          ...item.toObject(),

          // ✅ what frontend already expects
          productName: product?.name || "",
          variantLabel: variant?.name || "", // "1 kg", "250 ml", "Bowl"
          unit: resolveUnit(product?.category, variant?.type),
          subtotal: item.price * item.quantity,
        };
      });

      return {
        ...order.toObject(),
        items: enrichedItems,
        itemsCount: enrichedItems.reduce(
          (sum, i) => sum + i.quantity,
          0
        ),
      };
    });

    res.json(enrichedOrders);
  } catch (error) {
    console.error("FETCH ORDERS ERROR:", error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

/* ===============================
   GET ORDERS BY USER PHONE
================================ */
exports.getOrdersByUserPhone = async (req, res) => {
  try {
    const normalizePhone = (phone) =>
      phone.replace(/\D/g, "").slice(-10);

    const cleanPhone = normalizePhone(req.params.phone);

    const orders = await Order.find({
      customerPhone: cleanPhone,
    })
      .populate("items.productId")
      .populate("items.variantId")
      .sort({ createdAt: -1 });

    const enrichedOrders = orders.map((order) => {
      const enrichedItems = order.items.map((item) => {
        const product = item.productId;

        return {
          ...item.toObject(),
          productName: product?.name || "",
          productImage: product?.image || null,
          subtotal: item.price * item.quantity,
        };
      });

      return {
        ...order.toObject(),
        items: enrichedItems,
      };
    });

    res.json(enrichedOrders);
  } catch (error) {
    console.error("USER ORDER FETCH ERROR:", error);
    res.status(500).json({ message: "Failed to fetch user orders" });
  }
};






/* ===============================
   UPDATE ORDER STATUS (UNCHANGED)
================================ */
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const validTransitions = {
  new: ["packed", "cancelled"],  // ✅ allow cancel here
  packed: ["out_for_delivery", "cancelled"],
  out_for_delivery: ["delivered"],
};


    if (order.status === "cancelled" || order.status === "delivered") {
      return res.status(400).json({ message: "Order cannot be updated" });
    }

    if (!validTransitions[order.status]?.includes(status)) {
      return res.status(400).json({ message: "Invalid status transition" });
    }

    if (order.status === "new" && status === "packed") {
      for (const item of order.items) {
        const product = await Product.findById(item.productId);
if (!product) {
  console.error("Product not found for stock update");
  continue;
}

const variant = product.variants.id(item.variantId);
if (!variant) {
  console.error("Variant not found for stock update");
  continue;
}

const oldStock = variant.stock;
variant.stock += item.quantity;


const newStock = variant.stock;

await product.save();

await StockLog.create({
  productId: item.productId,
  variantId: item.variantId,
  orderId: order._id,
  type: "DECREASE",
  quantity: item.quantity,
  reason: "order_packed",
  oldStock,
  newStock,
});

      }
    }

    if (order.status === "packed" && status === "cancelled") {
      for (const item of order.items) {
        const product = await Product.findById(item.productId);
if (!product) {
  console.error("Product not found for stock update");
  continue;
}

const variant = product.variants.id(item.variantId);
if (!variant) {
  console.error("Variant not found for stock update");
  continue;
}

const oldStock = variant.stock;
variant.stock += item.quantity;  // ✅ correct

const newStock = variant.stock;

await product.save();

await StockLog.create({
  productId: item.productId,
  variantId: item.variantId,
  orderId: order._id,
  type: "INCREASE",
  quantity: item.quantity,
  reason: "order_cancelled",
  oldStock,
  newStock,
});

      }
    }

    order.status = status;
    await order.save({ validateBeforeSave: false });


    res.json(order);
  } catch (error) {
    console.error("STATUS UPDATE ERROR:", error);
    res.status(500).json({ message: "Failed to update order status" });
  }
};


/* ===============================
   GET SINGLE ORDER BY ID (FIXED)
================================ */
exports.getOrderById = async (req, res) => {
  try {
    // 1. Populate the main Product data
    const order = await Order.findById(req.params.id).populate("items.productId");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const enrichedItems = order.items.map((item) => {
      const product = item.productId;
      
      // 2. FIND THE VARIANT NAME (e.g., 250g, 1kg)
      // Since variants are stored inside the Product, we find the one that matches our variantId
      const variantData = product?.variants?.find(
        (v) => v._id.toString() === item.variantId.toString()
      );

      return {
        ...item.toObject(),
        productName: product?.name || "Product",
        productImage: product?.image || null,
        // 🔥 This is the fix! It gets the "250g" or "1kg" label
        variantName: variantData ? variantData.name : "Unit", 
        subtotal: item.price * item.quantity,
      };
    });

    res.json({
      ...order.toObject(),
      items: enrichedItems,
    });
  } catch (error) {
    console.error("GET ORDER BY ID ERROR:", error);
    res.status(500).json({ message: "Failed to fetch order" });
  }
};





/* ===============================
   UNIT RESOLVER (SAFE HELPER)
================================ */
function resolveUnit(category, variantType) {
  if (!category) return "";

  const map = {
    vegetable: { weight: "kg / g" },
    fruits: { weight: "kg / g" },
    juice: { volume: "ml / ltr" },
    "fruit salad": { container: "cup / bowl / box" },
    "health meal": { unit: "meal" },
    "solar dry powders": { weight: "kg / g" },
    subscription: { subscription: "weekly / monthly" },
  };

  return map[category]?.[variantType] || "";
}

/* ===============================
   CUSTOMER CANCEL ORDER
================================ */
exports.cancelOrderByCustomer = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Only allow cancel if order is still NEW
    if (order.status !== "new") {
      return res.status(400).json({
        message: "Only new orders can be cancelled",
      });
    }

    order.status = "cancelled";
    await order.save();

    res.json({ message: "Order cancelled successfully" });

  } catch (error) {
    console.error("CUSTOMER CANCEL ERROR:", error);
    res.status(500).json({ message: "Cancel failed" });
  }
};

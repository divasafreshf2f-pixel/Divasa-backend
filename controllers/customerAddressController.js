const CustomerAddress = require("../models/CustomerAddress");

/* ===============================
   ADD ADDRESS
================================ */
exports.addAddress = async (req, res) => {
  try {
    const {
      phone,
      fullName,
      flatNo,
      landmark,
      buildingType,
      addressType,
      isDefault,
    } = req.body;

    if (!phone || !fullName || !flatNo) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (isDefault) {
      await CustomerAddress.updateMany(
        { phone },
        { isDefault: false }
      );
    }

    const address = await CustomerAddress.create({
      phone,
      fullName,
      flatNo,
      landmark,
      buildingType,
      addressType,
      isDefault: isDefault || false,
    });

    res.status(201).json(address);
  } catch (err) {
    console.error("ADD ADDRESS ERROR:", err);
    res.status(500).json({ message: "Failed to add address" });
  }
};



/* ===============================
   GET ALL ADDRESSES BY PHONE
================================ */
exports.getAddressesByPhone = async (req, res) => {
  try {
    const { phone } = req.params;

    const addresses = await CustomerAddress.find({ phone })
      .sort({ isDefault: -1, createdAt: -1 });

    res.json(addresses);
  } catch (err) {
    console.error("FETCH ADDRESS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch addresses" });
  }
};

/* ===============================
   DELETE ADDRESS
================================ */
exports.deleteAddress = async (req, res) => {
  try {
    await CustomerAddress.findByIdAndDelete(req.params.id);
    res.json({ message: "Address deleted" });
  } catch (err) {
    console.error("DELETE ADDRESS ERROR:", err);
    res.status(500).json({ message: "Failed to delete address" });
  }
};

/* ===============================
   SET DEFAULT ADDRESS
================================ */
exports.setDefaultAddress = async (req, res) => {
  try {
    const address = await CustomerAddress.findById(req.params.id);

    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    // Remove default from other addresses
    await CustomerAddress.updateMany(
      { phone: address.phone },
      { isDefault: false }
    );

    address.isDefault = true;
    await address.save();

    res.json({ message: "Default address updated" });
  } catch (err) {
    console.error("SET DEFAULT ERROR:", err);
    res.status(500).json({ message: "Failed to update default" });
  }
};
/* ===============================
   UPDATE ADDRESS
================================ */
exports.updateAddress = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await CustomerAddress.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Address not found" });
    }

    res.json(updated);
  } catch (err) {
    console.error("UPDATE ADDRESS ERROR:", err);
    res.status(500).json({ message: "Failed to update address" });
  }
};


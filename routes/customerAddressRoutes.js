const express = require("express");
const router = express.Router();
const controller = require("../controllers/customerAddressController");

router.post("/", controller.addAddress);
router.get("/:phone", controller.getAddressesByPhone);
router.delete("/:id", controller.deleteAddress);
router.put("/default/:id", controller.setDefaultAddress);
router.put("/:id", controller.updateAddress); // 👈 ADD THIS


module.exports = router;

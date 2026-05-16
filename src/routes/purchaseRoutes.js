const express = require("express");

const purchaseController = require("../controllers/purchaseController");
const {
  requireLogin,
  requireClient
} = require("../middleware/authMiddleware");

const router = express.Router();

router.use(requireLogin, requireClient);

router.get("/", purchaseController.index);
router.post("/cart/add", purchaseController.addToCart);
router.post("/cart/update", purchaseController.updateCartItem);
router.post("/cart/remove", purchaseController.removeCartItem);
router.post("/checkout", purchaseController.checkout);

module.exports = router;

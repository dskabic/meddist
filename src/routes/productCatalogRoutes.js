const express = require("express");

const productCatalogController = require("../controllers/productCatalogController");
const {
  requireLogin,
  requireClient
} = require("../middleware/authMiddleware");

const router = express.Router();

router.use(requireLogin, requireClient);

router.get("/", productCatalogController.index);

module.exports = router;
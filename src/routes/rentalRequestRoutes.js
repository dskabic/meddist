const express = require("express");

const rentalRequestController = require("../controllers/rentalRequestController");
const {
  requireLogin,
  requireClient
} = require("../middleware/authMiddleware");

const router = express.Router();

router.use(requireLogin, requireClient);

router.get("/", rentalRequestController.index);

router.get("/create", rentalRequestController.createForm);
router.post("/create", rentalRequestController.create);

router.get("/:id", rentalRequestController.details);

module.exports = router;
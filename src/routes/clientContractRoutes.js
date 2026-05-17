const express = require("express");

const clientContractController = require("../controllers/clientContractController");
const {
  requireLogin,
  requireClient
} = require("../middleware/authMiddleware");

const router = express.Router();

router.use(requireLogin, requireClient);

router.get("/", clientContractController.index);
router.post("/:id/cancel", clientContractController.cancel);
router.get("/:id", clientContractController.details);

module.exports = router;

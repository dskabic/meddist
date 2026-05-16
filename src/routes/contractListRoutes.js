const express = require("express");

const contractListController = require("../controllers/contractListController");
const {
  requireLogin,
  requireWorkerRole
} = require("../middleware/authMiddleware");

const router = express.Router();

router.use(
  requireLogin,
  requireWorkerRole("Djelatnik za narudžbe", "Administrator")
);

router.get("/", contractListController.index);
router.get("/:id", contractListController.details);

module.exports = router;
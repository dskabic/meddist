const express = require("express");

const workerPurchaseController = require("../controllers/workerPurchaseController");
const {
  requireLogin,
  requireWorkerRole
} = require("../middleware/authMiddleware");

const router = express.Router();

router.use(
  requireLogin,
  requireWorkerRole("Djelatnik za narudžbe", "Administrator")
);

router.get("/", workerPurchaseController.index);
router.get("/:id", workerPurchaseController.details);
router.post("/:id/reject", workerPurchaseController.reject);
router.post("/:id/ship", workerPurchaseController.ship);
router.post("/:id/deliver", workerPurchaseController.deliver);

module.exports = router;

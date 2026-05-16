const express = require("express");

const workerRentalRequestController = require("../controllers/workerRentalRequestController");
const {
  requireLogin,
  requireWorkerRole
} = require("../middleware/authMiddleware");

const router = express.Router();

router.use(
  requireLogin,
  requireWorkerRole("Djelatnik za narudžbe", "Administrator")
);

router.get("/", workerRentalRequestController.index);

router.post("/:id/reject", workerRentalRequestController.reject);

router.get("/:id/create-contract", workerRentalRequestController.createContractForm);
router.post("/:id/create-contract", workerRentalRequestController.createContract);

module.exports = router;
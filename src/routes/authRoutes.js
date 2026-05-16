const express = require("express");

const authController = require("../controllers/authController");
const {
  requireLogin,
  requireClient,
  requireWorkerRole
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/login", authController.chooseLogin);

router.get("/login/client", authController.clientLoginForm);
router.post("/login/client", authController.clientLogin);

router.get("/login/worker", authController.workerLoginForm);
router.post("/login/worker", authController.workerLogin);

router.post("/logout", authController.logout);

router.get(
  "/client/dashboard",
  requireLogin,
  requireClient,
  authController.clientDashboard
);

router.get(
  "/worker/orders",
  requireLogin,
  requireWorkerRole("Djelatnik za narudžbe", "Administrator"),
  authController.ordersDashboard
);

router.get(
  "/worker/warehouse",
  requireLogin,
  requireWorkerRole("Djelatnik skladišta", "Administrator"),
  authController.warehouseDashboard
);

router.get(
  "/worker/service",
  requireLogin,
  requireWorkerRole("Servisni djelatnik", "Administrator"),
  authController.serviceDashboard
);

router.get(
  "/worker/admin",
  requireLogin,
  requireWorkerRole("Administrator"),
  authController.adminDashboard
);

module.exports = router;
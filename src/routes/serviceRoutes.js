const express = require("express");

const serviceController = require("../controllers/serviceController");
const {
  requireLogin,
  requireWorkerRole
} = require("../middleware/authMiddleware");

const router = express.Router();

router.use(
  requireLogin,
  requireWorkerRole("Servisni djelatnik", "Administrator")
);

router.get("/", serviceController.index);

router.get("/create", serviceController.createForm);
router.post("/create", serviceController.create);

router.get("/:id/edit", serviceController.editForm);
router.post("/:id/edit", serviceController.update);

router.post("/:id/delete", serviceController.remove);

router.post("/:id/finish", serviceController.finishService);

module.exports = router;
const express = require("express");

const equipmentController = require("../controllers/equipmentController");
const {
  requireLogin,
  requireWorkerRole
} = require("../middleware/authMiddleware");

const router = express.Router();

router.use(
  requireLogin,
  requireWorkerRole("Djelatnik skladišta", "Administrator")
);

router.get("/", equipmentController.index);

router.get("/create", equipmentController.createForm);
router.post("/create", equipmentController.create);

router.get("/:id/edit", equipmentController.editForm);
router.post("/:id/edit", equipmentController.update);

router.post("/:id/delete", equipmentController.remove);

module.exports = router;
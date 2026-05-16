const equipmentService = require("../models/services/equipmentService");

async function index(req, res) {
  try {
    const search = req.query.search || "";
    const equipment = await equipmentService.getAllEquipment(search);

    res.render("equipment/index", {
      equipment,
      search
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
}

function createForm(req, res) {
  res.render("equipment/create", {
    errors: [],
    formData: {
      name: "",
      manufacturer: "",
      type: "UREDAJ",
      serialNumber: "",
      availabilityStatus: "Dostupan",
      lotNumber: "",
      currentStock: "",
      defaultRentalPricePerDay: "",
      defaultUnitPrice: ""
    }
  });
}

async function create(req, res) {
  try {
    await equipmentService.createEquipment(req.body);
    res.redirect("/worker/warehouse/equipment");
  } catch (error) {
    res.render("equipment/create", {
      errors: error.validationErrors || [error.message],
      formData: req.body
    });
  }
}

async function editForm(req, res) {
  try {
    const equipment = await equipmentService.getEquipmentById(req.params.id);

    res.render("equipment/edit", {
      errors: [],
      equipment
    });
  } catch (error) {
    res.status(404).send(error.message);
  }
}

async function update(req, res) {
  try {
    await equipmentService.updateEquipment(req.params.id, req.body);
    res.redirect("/worker/warehouse/equipment");
  } catch (error) {
    const equipment = {
      id: req.params.id,
      name: req.body.name,
      manufacturer: req.body.manufacturer,
      type: req.body.type,
      serial_number: req.body.serialNumber,
      availability_status: req.body.availabilityStatus,
      lot_number: req.body.lotNumber,
      current_stock: req.body.currentStock,
      default_rental_price_per_day: req.body.defaultRentalPricePerDay,
      default_unit_price: req.body.defaultUnitPrice
    };

    res.render("equipment/edit", {
      errors: error.validationErrors || [error.message],
      equipment
    });
  }
}

async function remove(req, res) {
  try {
    await equipmentService.deleteEquipment(req.params.id);
    res.redirect("/worker/warehouse/equipment");
  } catch (error) {
    res.status(500).send(error.message);
  }
}

module.exports = {
  index,
  createForm,
  create,
  editForm,
  update,
  remove
};
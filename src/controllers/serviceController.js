const serviceService = require("../models/services/serviceService");

async function index(req, res) {
  try {
    const search = req.query.search || "";
    const services = await serviceService.getAllServices(search);

    res.render("services/index", {
      services,
      search
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
}

async function createForm(req, res) {
  try {
    const devices = await serviceService.getDevicesForDropdown();

    res.render("services/create", {
      errors: [],
      devices,
      formData: {
        serviceDate: new Date().toISOString().slice(0, 10),
        description: "",
        equipmentId: ""
      }
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
}

async function create(req, res) {
  try {
    await serviceService.createServiceRecord(req.body);
    res.redirect("/worker/service/records");
  } catch (error) {
    const devices = await serviceService.getDevicesForDropdown();

    res.render("services/create", {
      errors: error.validationErrors || [error.message],
      devices,
      formData: req.body
    });
  }
}

async function editForm(req, res) {
  try {
    const service = await serviceService.getServiceById(req.params.id);
    const devices = await serviceService.getDevicesForDropdown();

    res.render("services/edit", {
      errors: [],
      service,
      devices
    });
  } catch (error) {
    res.status(404).send(error.message);
  }
}

async function update(req, res) {
  try {
    await serviceService.updateServiceRecord(req.params.id, req.body);
    res.redirect("/worker/service/records");
  } catch (error) {
    const devices = await serviceService.getDevicesForDropdown();

    const service = {
      id: req.params.id,
      service_date: req.body.serviceDate,
      description: req.body.description,
      equipment_id: Number(req.body.equipmentId)
    };

    res.render("services/edit", {
      errors: error.validationErrors || [error.message],
      service,
      devices
    });
  }
}

async function remove(req, res) {
  try {
    await serviceService.deleteServiceRecord(req.params.id);
    res.redirect("/worker/service/records");
  } catch (error) {
    res.status(500).send(error.message);
  }
}

async function finishService(req, res) {
  try {
    await serviceService.finishService(req.params.id);
    res.redirect("/worker/service/records");
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
  remove,
  finishService
};
const workerRentalRequestService = require("../models/services/workerRentalRequestService");

async function index(req, res) {
  try {
    const search = req.query.search || "";
    const requests = await workerRentalRequestService.getAllRentalRequests(search);

    res.render("workerRentalRequests/index", {
      requests,
      search
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
}

async function reject(req, res) {
  try {
    await workerRentalRequestService.rejectRentalRequest(
      req.params.id,
      req.session.user.id
    );

    res.redirect("/worker/orders/rental-requests");
  } catch (error) {
    res.status(400).send(error.message);
  }
}

async function createContractForm(req, res) {
  try {
    const { request, clients, devices } =
      await workerRentalRequestService.getContractFormData(req.params.id);

    res.render("workerRentalRequests/createContract", {
      request,
      clients,
      devices,
      errors: [],
      formData: null
    });
  } catch (error) {
    res.status(404).send(error.message);
  }
}

async function createContract(req, res) {
  try {
    await workerRentalRequestService.createContractFromRequest(
      req.params.id,
      req.session.user.id,
      req.body
    );

    res.redirect("/worker/orders/rental-requests");
  } catch (error) {
    const { request, clients, devices } =
      await workerRentalRequestService.getContractFormData(req.params.id);

    res.render("workerRentalRequests/createContract", {
      request,
      clients,
      devices,
      errors: error.validationErrors || [error.message],
      formData: req.body
    });
  }
}

module.exports = {
  index,
  reject,
  createContractForm,
  createContract
};
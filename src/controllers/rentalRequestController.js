const rentalRequestService = require("../models/services/rentalRequestService");

async function index(req, res) {
  try {
    const requests = await rentalRequestService.getClientRentalRequests(
      req.session.user.id
    );

    res.render("rentalRequests/index", {
      requests
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
}

async function createForm(req, res) {
  try {
    const devices = await rentalRequestService.getAvailableDevices();

    res.render("rentalRequests/create", {
      errors: [],
      devices,
      formData: {
        desiredStartDate: "",
        desiredReturnDate: "",
        equipmentId: [],
        pricePerDay: []
      }
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
}

async function create(req, res) {
  try {
    await rentalRequestService.createRentalRequest(
      req.body,
      req.session.user.id
    );

    res.redirect("/client/rental-requests");
  } catch (error) {
    const devices = await rentalRequestService.getAvailableDevices();

    res.render("rentalRequests/create", {
      errors: error.validationErrors || [error.message],
      devices,
      formData: req.body
    });
  }
}

async function details(req, res) {
  try {
    const request = await rentalRequestService.getRentalRequestById(
      req.params.id,
      req.session.user
    );

    res.render("rentalRequests/details", {
      request
    });
  } catch (error) {
    res.status(404).send(error.message);
  }
}

module.exports = {
  index,
  createForm,
  create,
  details
};
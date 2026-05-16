const workerRentalRequestRepository = require("../../infrastructure/repositories/workerRentalRequestRepository");
const contractRepository = require("../../infrastructure/repositories/contractRepository");
const korisnikRepository = require("../../infrastructure/repositories/korisnikRepository");
const contractValidator = require("../validators/contractValidator");

async function getAllRentalRequests(search) {
  return workerRentalRequestRepository.findAll(search);
}

async function getRentalRequestById(id) {
  const request = await workerRentalRequestRepository.findById(id);

  if (!request) {
    throw new Error("Zahtjev za najam nije pronađen.");
  }

  return request;
}

async function getContractFormData(requestId) {
  const request = await getRentalRequestById(requestId);
  const clients = await korisnikRepository.findAll();
  const devices = await workerRentalRequestRepository.findAvailableDevices();

  return {
    request,
    clients,
    devices
  };
}

async function rejectRentalRequest(id, workerId) {
  const success = await workerRentalRequestRepository.reject(id, workerId);

  if (!success) {
    throw new Error("Zahtjev nije moguće odbiti. Možda više nije u statusu 'Zaprimljen'.");
  }
}

async function createContractFromRequest(requestId, workerId, formData) {
  const request = await getRentalRequestById(requestId);

  if (request.status !== "Zaprimljen") {
    const error = new Error("Ugovor se može kreirati samo za zahtjev u statusu Zaprimljen.");
    error.validationErrors = [error.message];
    throw error;
  }

  const validation = contractValidator.validateContractCreation(formData);

  if (!validation.isValid) {
    const error = new Error("Validacija nije uspješna.");
    error.validationErrors = validation.errors;
    throw error;
  }

  return contractRepository.createFromContractForm(
    requestId,
    workerId,
    formData
  );
}

module.exports = {
  getAllRentalRequests,
  getRentalRequestById,
  getContractFormData,
  rejectRentalRequest,
  createContractFromRequest
};
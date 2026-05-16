const RentalRequest = require("../entities/RentalRequest");
const RentalRequestItem = require("../entities/RentalRequestItem");

const rentalRequestValidator = require("../validators/rentalRequestValidator");
const rentalRequestRepository = require("../../infrastructure/repositories/rentalRequestRepository");

function parseItemsFromForm(body) {
  const items = [];

  const equipmentIds = Array.isArray(body.equipmentId)
    ? body.equipmentId
    : [body.equipmentId];

  for (const equipmentId of equipmentIds) {
    if (!equipmentId) {
      continue;
    }

    items.push(
      new RentalRequestItem({
        equipmentId: Number(equipmentId)
      })
    );
  }

  return items;
}

function mapFormToRentalRequest(body, clientId) {
  return new RentalRequest({
    clientId,
    desiredStartDate: body.desiredStartDate,
    desiredReturnDate: body.desiredReturnDate,
    status: "Zaprimljen",
    items: parseItemsFromForm(body)
  });
}

async function getAvailableDevices() {
  return rentalRequestRepository.findAvailableDevices();
}

async function getClientRentalRequests(clientId) {
  return rentalRequestRepository.findByClientId(clientId);
}

async function getRentalRequestById(id, currentUser) {
  const request = await rentalRequestRepository.findById(id);

  if (!request) {
    throw new Error("Zahtjev za najam nije pronađen.");
  }

  if (currentUser.type === "client" && Number(request.client_id) !== Number(currentUser.id)) {
    throw new Error("Nemate pravo pristupa ovom zahtjevu.");
  }

  return request;
}

async function createRentalRequest(formData, clientId) {
  const rentalRequest = mapFormToRentalRequest(formData, clientId);

  const validation = rentalRequestValidator.validateRentalRequest(rentalRequest);

  if (!validation.isValid) {
    const error = new Error("Validacija nije uspješna.");
    error.validationErrors = validation.errors;
    throw error;
  }

  for (const item of rentalRequest.items) {
    const device = await rentalRequestRepository.findDeviceById(item.equipmentId);

    if (!device) {
      const error = new Error("Odabrani uređaj ne postoji.");
      error.validationErrors = ["Odabrani uređaj ne postoji."];
      throw error;
    }

    if (["Na servisu", "Nedostupan"].includes(device.availability_status)) {
      const error = new Error("Uređaj nije dostupan.");
      error.validationErrors = [
        `Uređaj ${device.name} (${device.serial_number}) nije dostupan za najam.`
      ];
      throw error;
    }

    const isAvailableForPeriod = await rentalRequestRepository.isDeviceAvailableForPeriod(
      item.equipmentId,
      rentalRequest.desiredStartDate,
      rentalRequest.desiredReturnDate
    );

    if (!isAvailableForPeriod) {
      const error = new Error("Uređaj je već rezerviran u odabranom terminu.");
      error.validationErrors = [
        `Uređaj ${device.name} (${device.serial_number}) već je rezerviran u periodu od ${rentalRequest.desiredStartDate} do ${rentalRequest.desiredReturnDate}.`
      ];
      throw error;
    }
  }

  return rentalRequestRepository.create(rentalRequest);
}

module.exports = {
  getAvailableDevices,
  getClientRentalRequests,
  getRentalRequestById,
  createRentalRequest
};

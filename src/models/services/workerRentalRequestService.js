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

  const equipmentIds = Array.isArray(formData.equipmentId)
    ? formData.equipmentId
    : [formData.equipmentId];

  for (const equipmentId of equipmentIds) {
    if (!equipmentId) {
      continue;
    }

    const device = await workerRentalRequestRepository.findDeviceById(Number(equipmentId));

    if (!device) {
      const error = new Error("Odabrani uređaj ne postoji.");
      error.validationErrors = ["Odabrani uređaj ne postoji."];
      throw error;
    }

    if (["Na servisu", "Nedostupan"].includes(device.availability_status)) {
      const error = new Error("Uređaj nije dostupan za ugovor.");
      error.validationErrors = [
        `Uređaj ${device.name} (${device.serial_number}) nije dostupan za najam.`
      ];
      throw error;
    }

    const isAvailableForPeriod = await workerRentalRequestRepository.isDeviceAvailableForPeriod(
      Number(equipmentId),
      formData.rentalStartDate,
      formData.expectedReturnDate
    );

    if (!isAvailableForPeriod) {
      const error = new Error("Uređaj je već rezerviran u odabranom terminu.");
      error.validationErrors = [
        `Uređaj ${device.name} (${device.serial_number}) već je rezerviran u periodu od ${formData.rentalStartDate} do ${formData.expectedReturnDate}.`
      ];
      throw error;
    }
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

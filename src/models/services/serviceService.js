const ServiceRecord = require("../entities/ServiceRecord");
const serviceValidator = require("../validators/serviceValidator");
const serviceRepository = require("../../infrastructure/repositories/serviceRepository");

function mapFormToServiceRecord(data) {
  return new ServiceRecord({
    id: data.id || null,
    serviceDate: data.serviceDate,
    description: data.description ? data.description.trim() : "",
    equipmentId: Number(data.equipmentId)
  });
}

async function getAllServices(search) {
  return serviceRepository.findAll(search);
}

async function getServiceById(id) {
  const service = await serviceRepository.findById(id);

  if (!service) {
    throw new Error("Servis nije pronađen.");
  }

  return service;
}

async function getDevicesForDropdown(currentEquipmentId = null) {
  return serviceRepository.findAvailableDevices(currentEquipmentId);
}

async function createServiceRecord(formData) {
  const serviceRecord = mapFormToServiceRecord(formData);

  const validation = serviceValidator.validateServiceRecord(serviceRecord);

  if (!validation.isValid) {
    const error = new Error("Validacija nije uspješna.");
    error.validationErrors = validation.errors;
    throw error;
  }

  const device = await serviceRepository.findDeviceById(serviceRecord.equipmentId);

  if (!device) {
    const error = new Error("Odabrani uređaj ne postoji.");
    error.validationErrors = ["Odabrani uređaj ne postoji."];
    throw error;
  }

  if (device.availability_status === "Iznajmljen") {
    const error = new Error("Uređaj je trenutno iznajmljen.");
    error.validationErrors = [
      "Uređaj koji je trenutno iznajmljen ne može se poslati na servis."
    ];
    throw error;
  }

  const openService = await serviceRepository.findOpenServiceByEquipmentId(
    serviceRecord.equipmentId
  );

  if (openService) {
    const error = new Error("Za uređaj već postoji aktivni servis.");
    error.validationErrors = [
      "Za odabrani uređaj već postoji servis koji još nije završen."
    ];
    throw error;
  }

  return serviceRepository.create(serviceRecord);
}

async function updateServiceRecord(id, formData) {
  const serviceRecord = mapFormToServiceRecord({
    ...formData,
    id
  });

  const validation = serviceValidator.validateServiceRecord(serviceRecord);

  if (!validation.isValid) {
    const error = new Error("Validacija nije uspješna.");
    error.validationErrors = validation.errors;
    throw error;
  }

  const device = await serviceRepository.findDeviceById(serviceRecord.equipmentId);

  if (!device) {
    const error = new Error("Odabrani uređaj ne postoji.");
    error.validationErrors = ["Odabrani uređaj ne postoji."];
    throw error;
  }

  const openService = await serviceRepository.findOpenServiceByEquipmentId(
    serviceRecord.equipmentId,
    Number(id)
  );

  if (openService) {
    const error = new Error("Za uređaj već postoji aktivni servis.");
    error.validationErrors = [
      "Za odabrani uređaj već postoji servis koji još nije završen."
    ];
    throw error;
  }

  return serviceRepository.update(id, serviceRecord);
}

async function deleteServiceRecord(id) {
  return serviceRepository.remove(id);
}

async function finishService(id) {
  return serviceRepository.finishService(id);
}

module.exports = {
  getAllServices,
  getServiceById,
  getDevicesForDropdown,
  createServiceRecord,
  updateServiceRecord,
  deleteServiceRecord,
  finishService
};

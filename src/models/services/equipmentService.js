const Equipment = require("../entities/Equipment");
const equipmentValidator = require("../validators/equipmentValidator");
const equipmentRepository = require("../../infrastructure/repositories/equipmentRepository");

function mapFormToEquipment(data) {
  return new Equipment({
    id: data.id || null,
    name: data.name ? data.name.trim() : "",
    manufacturer: data.manufacturer ? data.manufacturer.trim() : null,
    type: data.type,
    serialNumber: data.serialNumber ? data.serialNumber.trim() : null,
    availabilityStatus: data.availabilityStatus || "Dostupan",
    lotNumber: data.lotNumber ? data.lotNumber.trim() : null,
    currentStock:
      data.currentStock !== undefined && data.currentStock !== ""
        ? Number(data.currentStock)
        : null,
    defaultRentalPricePerDay:
      data.defaultRentalPricePerDay !== undefined && data.defaultRentalPricePerDay !== ""
        ? Number(data.defaultRentalPricePerDay)
        : null,
    defaultUnitPrice:
      data.defaultUnitPrice !== undefined && data.defaultUnitPrice !== ""
        ? Number(data.defaultUnitPrice)
        : null
  });
}

async function getAllEquipment(search) {
  return equipmentRepository.findAll(search);
}

async function getEquipmentById(id) {
  const equipment = await equipmentRepository.findById(id);

  if (!equipment) {
    throw new Error("Artikl nije pronađen.");
  }

  return equipment;
}

async function createEquipment(formData) {
  const equipment = mapFormToEquipment(formData);
  const validation = equipmentValidator.validateEquipment(equipment);

  if (!validation.isValid) {
    const error = new Error("Validacija nije uspješna.");
    error.validationErrors = validation.errors;
    throw error;
  }

  return equipmentRepository.create(equipment);
}

async function updateEquipment(id, formData) {
  const equipment = mapFormToEquipment({
    ...formData,
    id
  });

  const validation = equipmentValidator.validateEquipment(equipment);

  if (!validation.isValid) {
    const error = new Error("Validacija nije uspješna.");
    error.validationErrors = validation.errors;
    throw error;
  }

  return equipmentRepository.update(id, equipment);
}

async function deleteEquipment(id) {
  return equipmentRepository.softDelete(id);
}

module.exports = {
  getAllEquipment,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  deleteEquipment
};
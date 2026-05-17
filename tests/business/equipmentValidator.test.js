const equipmentValidator = require("../../src/models/validators/equipmentValidator");
const Equipment = require("../../src/models/entities/Equipment");

describe("EquipmentValidator", () => {
  test("rejects device without serial number", () => {
    const equipment = new Equipment({
      name: "EKG uređaj",
      manufacturer: "MedTech",
      type: "UREDAJ",
      serialNumber: "",
      availabilityStatus: "Dostupan",
      defaultRentalPricePerDay: 50
    });

    const result = equipmentValidator.validateEquipment(equipment);

    expect(result.isValid).toBe(false);
  });

  test("rejects device with invalid rental price", () => {
    const equipment = new Equipment({
      name: "EKG uređaj",
      manufacturer: "MedTech",
      type: "UREDAJ",
      serialNumber: "SN-001",
      availabilityStatus: "Dostupan",
      defaultRentalPricePerDay: 0
    });

    const result = equipmentValidator.validateEquipment(equipment);

    expect(result.isValid).toBe(false);
  });

  test("rejects consumable material with zero stock", () => {
    const equipment = new Equipment({
      name: "Rukavice",
      manufacturer: "MedSupply",
      type: "POTROSNI_MATERIJAL",
      lotNumber: "LOT-001",
      currentStock: 0,
      defaultUnitPrice: 2.5
    });

    const result = equipmentValidator.validateEquipment(equipment);

    expect(result.isValid).toBe(false);
  });

  test("accepts valid device", () => {
    const equipment = new Equipment({
      name: "EKG uređaj",
      manufacturer: "MedTech",
      type: "UREDAJ",
      serialNumber: "SN-001",
      availabilityStatus: "Dostupan",
      defaultRentalPricePerDay: 50
    });

    const result = equipmentValidator.validateEquipment(equipment);

    expect(result.isValid).toBe(true);
  });
});
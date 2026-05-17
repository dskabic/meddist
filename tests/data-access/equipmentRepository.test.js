const equipmentRepository = require("../../src/infrastructure/repositories/equipmentRepository");
const Equipment = require("../../src/models/entities/Equipment");

const {
  clearDatabase,
  closeDatabase
} = require("../helpers/testDb");

describe("EquipmentRepository", () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  test("creates and finds device", async () => {
    const equipment = new Equipment({
      name: "EKG uređaj",
      manufacturer: "MedTech",
      type: "UREDAJ",
      serialNumber: "SN-REPO-001",
      availabilityStatus: "Dostupan",
      defaultRentalPricePerDay: 50
    });

    const created = await equipmentRepository.create(equipment);

    expect(created).not.toBeNull();
    expect(created.id).toBeDefined();

    const found = await equipmentRepository.findById(created.id);

    expect(found.name).toBe("EKG uređaj");
    expect(found.type).toBe("UREDAJ");
    expect(found.serial_number).toBe("SN-REPO-001");
  });

  test("creates and finds consumable material", async () => {
    const equipment = new Equipment({
      name: "Medicinske rukavice",
      manufacturer: "MedSupply",
      type: "POTROSNI_MATERIJAL",
      lotNumber: "LOT-REPO-001",
      currentStock: 100,
      defaultUnitPrice: 2.5
    });

    const created = await equipmentRepository.create(equipment);

    expect(created).not.toBeNull();

    const found = await equipmentRepository.findById(created.id);

    expect(found.name).toBe("Medicinske rukavice");
    expect(found.type).toBe("POTROSNI_MATERIJAL");
    expect(Number(found.current_stock)).toBe(100);
  });
});
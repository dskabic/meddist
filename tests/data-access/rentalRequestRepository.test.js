const rentalRequestRepository = require("../../src/infrastructure/repositories/rentalRequestRepository");
const RentalRequest = require("../../src/models/entities/RentalRequest");
const RentalRequestItem = require("../../src/models/entities/RentalRequestItem");

const {
  clearDatabase,
  seedBasicUsers,
  seedDevice,
  closeDatabase
} = require("../helpers/testDb");

describe("RentalRequestRepository", () => {
  beforeEach(async () => {
    await clearDatabase();
    await seedBasicUsers();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  test("creates rental request with items and reads it back", async () => {
    const deviceId = await seedDevice();

    const rentalRequest = new RentalRequest({
      clientId: 1,
      desiredStartDate: "2026-06-01",
      desiredReturnDate: "2026-06-10",
      status: "Zaprimljen",
      items: [
        new RentalRequestItem({
          equipmentId: deviceId
        })
      ]
    });

    const created = await rentalRequestRepository.create(rentalRequest);

    expect(created).not.toBeNull();
    expect(created.id).toBeDefined();
    expect(created.items.length).toBe(1);
    expect(Number(created.items[0].equipment_id)).toBe(Number(deviceId));
  });

  test("finds available devices", async () => {
    await seedDevice();

    const devices = await rentalRequestRepository.findAvailableDevices();

    expect(devices.length).toBe(1);
    expect(devices[0].availability_status).toBe("Dostupan");
  });
});
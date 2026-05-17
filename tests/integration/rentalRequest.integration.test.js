const rentalRequestService = require("../../src/models/services/rentalRequestService");
const rentalRequestRepository = require("../../src/infrastructure/repositories/rentalRequestRepository");

const {
  clearDatabase,
  seedBasicUsers,
  seedDevice,
  closeDatabase
} = require("../helpers/testDb");

describe("Rental request integration", () => {
  beforeEach(async () => {
    await clearDatabase();
    await seedBasicUsers();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  test("client creates rental request and it is saved with items", async () => {
    const deviceId = await seedDevice();

    const created = await rentalRequestService.createRentalRequest(
      {
        desiredStartDate: "2026-06-01",
        desiredReturnDate: "2026-06-10",
        equipmentId: [String(deviceId)]
      },
      1
    );

    const found = await rentalRequestRepository.findById(created.id);

    expect(found).not.toBeNull();
    expect(found.status).toBe("Zaprimljen");
    expect(found.items.length).toBe(1);
    expect(Number(found.items[0].equipment_id)).toBe(Number(deviceId));
  });

  test("service rejects invalid rental request", async () => {
    await expect(
      rentalRequestService.createRentalRequest(
        {
          desiredStartDate: "2026-06-10",
          desiredReturnDate: "2026-06-01",
          equipmentId: []
        },
        1
      )
    ).rejects.toThrow("Validacija nije uspješna.");
  });
  test("does not create rental request with invalid dates", async () => {
  const deviceId = await seedDevice();

  await expect(
    rentalRequestService.createRentalRequest(
      {
        desiredStartDate: "2026-06-10",
        desiredReturnDate: "2026-06-01",
        equipmentId: [String(deviceId)]
      },
      1
    )
  ).rejects.toThrow("Validacija nije uspješna.");
});
});
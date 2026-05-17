const rentalRequestService = require("../../src/models/services/rentalRequestService");
const workerRentalRequestService = require("../../src/models/services/workerRentalRequestService");

const {
  pool,
  clearDatabase,
  seedBasicUsers,
  seedDevice,
  closeDatabase
} = require("../helpers/testDb");

describe("Contract creation integration", () => {
  beforeEach(async () => {
    await clearDatabase();
    await seedBasicUsers();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  test("worker creates contract from rental request", async () => {
    const deviceId = await seedDevice();

    const rentalRequest = await rentalRequestService.createRentalRequest(
      {
        desiredStartDate: "2026-06-01",
        desiredReturnDate: "2026-06-10",
        equipmentId: [String(deviceId)]
      },
      1
    );

    await workerRentalRequestService.createContractFromRequest(
      rentalRequest.id,
      1,
      {
        clientId: "1",
        rentalStartDate: "2026-06-01",
        expectedReturnDate: "2026-06-10",
        equipmentId: [String(deviceId)],
        pricePerDay: ["70"]
      }
    );

    const contractResult = await pool.query(
      `
      SELECT *
      FROM Ugovor_o_najmu
      WHERE ID_Zahtjeva = $1
      `,
      [rentalRequest.id]
    );

    expect(contractResult.rowCount).toBe(1);

    const contractId = contractResult.rows[0].id_ugovora;

    const itemResult = await pool.query(
      `
      SELECT *
      FROM Stavka_ugovora
      WHERE ID_Ugovora = $1
      `,
      [contractId]
    );

    expect(itemResult.rowCount).toBe(1);
    expect(Number(itemResult.rows[0].ugovorena_cijena_po_danu)).toBe(70);

    const requestResult = await pool.query(
      `
      SELECT Status
      FROM Zahtjev_za_najam
      WHERE ID_Zahtjeva = $1
      `,
      [rentalRequest.id]
    );

    expect(requestResult.rows[0].status).toBe("Odobren");
  });
  test("does not create rental request when device is already reserved in overlapping period", async () => {
  const deviceId = await seedDevice();

  const firstRentalRequest = await rentalRequestService.createRentalRequest(
    {
      desiredStartDate: "2026-06-01",
      desiredReturnDate: "2026-06-10",
      equipmentId: [String(deviceId)]
    },
    1
  );

  await workerRentalRequestService.createContractFromRequest(
    firstRentalRequest.id,
    1,
    {
      clientId: "1",
      rentalStartDate: "2026-06-01",
      expectedReturnDate: "2026-06-10",
      equipmentId: [String(deviceId)],
      pricePerDay: ["70"]
    }
  );

  await expect(
    rentalRequestService.createRentalRequest(
      {
        desiredStartDate: "2026-06-05",
        desiredReturnDate: "2026-06-12",
        equipmentId: [String(deviceId)]
      },
      1
    )
  ).rejects.toThrow("Uređaj je već rezerviran u odabranom terminu.");
});
});
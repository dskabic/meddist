const workerRentalRequestService = require("../../src/models/services/workerRentalRequestService");
const workerRentalRequestRepository = require("../../src/infrastructure/repositories/workerRentalRequestRepository");
const contractRepository = require("../../src/infrastructure/repositories/contractRepository");
const korisnikRepository = require("../../src/infrastructure/repositories/korisnikRepository");

jest.mock("../../src/infrastructure/repositories/workerRentalRequestRepository");
jest.mock("../../src/infrastructure/repositories/contractRepository");
jest.mock("../../src/infrastructure/repositories/korisnikRepository");

describe("WorkerRentalRequestService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("createContractFromRequest should reject overlapping rental period", async () => {
    workerRentalRequestRepository.findById.mockResolvedValue({
      id: 9,
      status: "Zaprimljen"
    });
    workerRentalRequestRepository.findDeviceById.mockResolvedValue({
      id: 1,
      name: "Respirator",
      serial_number: "SER-001",
      availability_status: "Dostupan"
    });
    workerRentalRequestRepository.isDeviceAvailableForPeriod.mockResolvedValue(false);

    await expect(
      workerRentalRequestService.createContractFromRequest(9, 3, {
        clientId: "1",
        rentalStartDate: "2026-06-10",
        expectedReturnDate: "2026-06-20",
        equipmentId: "1",
        pricePerDay: "200"
      })
    ).rejects.toThrow("Uređaj je već rezerviran u odabranom terminu.");

    expect(contractRepository.createFromContractForm).not.toHaveBeenCalled();
  });

  test("createContractFromRequest should allow non-overlapping contract creation", async () => {
    workerRentalRequestRepository.findById.mockResolvedValue({
      id: 9,
      status: "Zaprimljen"
    });
    workerRentalRequestRepository.findDeviceById.mockResolvedValue({
      id: 1,
      name: "Respirator",
      serial_number: "SER-001",
      availability_status: "Iznajmljen"
    });
    workerRentalRequestRepository.isDeviceAvailableForPeriod.mockResolvedValue(true);
    contractRepository.createFromContractForm.mockResolvedValue(21);

    const result = await workerRentalRequestService.createContractFromRequest(9, 3, {
      clientId: "1",
      rentalStartDate: "2026-06-10",
      expectedReturnDate: "2026-06-20",
      equipmentId: "1",
      pricePerDay: "200"
    });

    expect(result).toBe(21);
    expect(contractRepository.createFromContractForm).toHaveBeenCalledWith(9, 3, {
      clientId: "1",
      rentalStartDate: "2026-06-10",
      expectedReturnDate: "2026-06-20",
      equipmentId: "1",
      pricePerDay: "200"
    });
  });
});

const rentalRequestService = require("../../src/models/services/rentalRequestService");
const rentalRequestRepository = require("../../src/infrastructure/repositories/rentalRequestRepository");

jest.mock("../../src/infrastructure/repositories/rentalRequestRepository");

describe("RentalRequestService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("createRentalRequest should allow future request when device is not overlapping", async () => {
    rentalRequestRepository.findDeviceById.mockResolvedValue({
      id: 1,
      name: "Respirator",
      serial_number: "SER-001",
      availability_status: "Iznajmljen"
    });
    rentalRequestRepository.isDeviceAvailableForPeriod.mockResolvedValue(true);
    rentalRequestRepository.create.mockResolvedValue({ id: 14 });

    const result = await rentalRequestService.createRentalRequest(
      {
        desiredStartDate: "2026-06-10",
        desiredReturnDate: "2026-06-20",
        equipmentId: "1"
      },
      1
    );

    expect(result).toEqual({ id: 14 });
    expect(rentalRequestRepository.create).toHaveBeenCalled();
  });

  test("createRentalRequest should reject overlapping rental period", async () => {
    rentalRequestRepository.findDeviceById.mockResolvedValue({
      id: 1,
      name: "Respirator",
      serial_number: "SER-001",
      availability_status: "Dostupan"
    });
    rentalRequestRepository.isDeviceAvailableForPeriod.mockResolvedValue(false);

    await expect(
      rentalRequestService.createRentalRequest(
        {
          desiredStartDate: "2026-06-10",
          desiredReturnDate: "2026-06-20",
          equipmentId: "1"
        },
        1
      )
    ).rejects.toThrow("Uređaj je već rezerviran u odabranom terminu.");

    expect(rentalRequestRepository.create).not.toHaveBeenCalled();
  });
});

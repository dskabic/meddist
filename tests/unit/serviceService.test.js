const serviceService = require("../../src/models/services/serviceService");
const serviceRepository = require("../../src/infrastructure/repositories/serviceRepository");

jest.mock("../../src/infrastructure/repositories/serviceRepository");

describe("ServiceService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("createServiceRecord should reject when an active service already exists for the device", async () => {
    serviceRepository.findDeviceById.mockResolvedValue({
      id: 3,
      name: "Infuzijska pumpa",
      availability_status: "Na servisu"
    });
    serviceRepository.findOpenServiceByEquipmentId.mockResolvedValue({
      id: 12,
      equipment_id: 3
    });

    await expect(
      serviceService.createServiceRecord({
        serviceDate: "2026-05-17",
        description: "Kontrola ispravnosti",
        equipmentId: "3"
      })
    ).rejects.toThrow("Za uređaj već postoji aktivni servis.");

    expect(serviceRepository.create).not.toHaveBeenCalled();
  });

  test("createServiceRecord should persist when there is no active service for the device", async () => {
    serviceRepository.findDeviceById.mockResolvedValue({
      id: 3,
      name: "Infuzijska pumpa",
      availability_status: "Dostupan"
    });
    serviceRepository.findOpenServiceByEquipmentId.mockResolvedValue(null);
    serviceRepository.create.mockResolvedValue({ id: 18 });

    const result = await serviceService.createServiceRecord({
      serviceDate: "2026-05-17",
      description: "Kontrola ispravnosti",
      equipmentId: "3"
    });

    expect(result).toEqual({ id: 18 });
    expect(serviceRepository.create).toHaveBeenCalled();
  });
});

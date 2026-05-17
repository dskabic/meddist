jest.mock("../../src/config/db", () => ({
  query: jest.fn(),
  connect: jest.fn()
}));

const pool = require("../../src/config/db");
const serviceRepository = require("../../src/infrastructure/repositories/serviceRepository");

describe("ServiceRepository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("findOpenServiceByEquipmentId should return active service for device", async () => {
    pool.query.mockResolvedValue({
      rows: [{ id: 11, equipment_id: 4 }]
    });

    const result = await serviceRepository.findOpenServiceByEquipmentId(4);

    expect(result).toEqual({ id: 11, equipment_id: 4 });
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining("Datum_Zavrsetka IS NULL"),
      [4, null]
    );
  });

  test("finishService should close record and set device available when no active services remain", async () => {
    const mockClient = {
      query: jest.fn(),
      release: jest.fn()
    };

    pool.connect.mockResolvedValue(mockClient);
    mockClient.query
      .mockResolvedValueOnce()
      .mockResolvedValueOnce({
        rows: [{
          id: 7,
          equipment_id: 2,
          service_date: "2026-05-16",
          finished_date: null
        }]
      })
      .mockResolvedValueOnce()
      .mockResolvedValueOnce({ rows: [{ open_count: "0" }] })
      .mockResolvedValueOnce()
      .mockResolvedValueOnce();

    await serviceRepository.finishService(7);

    expect(mockClient.query).toHaveBeenCalledWith(
      expect.stringContaining("SET Datum_Zavrsetka = GREATEST(CURRENT_DATE, Datum_Izdavanja)"),
      [7]
    );
    expect(mockClient.query).toHaveBeenCalledWith(
      expect.stringContaining("SET Status_Raspolozivosti = 'Dostupan'"),
      [2]
    );
    expect(mockClient.query).toHaveBeenCalledWith("COMMIT");
  });

  test("finishService should not change device status when another active service remains", async () => {
    const mockClient = {
      query: jest.fn(),
      release: jest.fn()
    };

    pool.connect.mockResolvedValue(mockClient);
    mockClient.query
      .mockResolvedValueOnce()
      .mockResolvedValueOnce({
        rows: [{
          id: 7,
          equipment_id: 2,
          service_date: "2026-05-16",
          finished_date: null
        }]
      })
      .mockResolvedValueOnce()
      .mockResolvedValueOnce({ rows: [{ open_count: "1" }] })
      .mockResolvedValueOnce();

    await serviceRepository.finishService(7);

    expect(mockClient.query).not.toHaveBeenCalledWith(
      expect.stringContaining("SET Status_Raspolozivosti = 'Dostupan'"),
      [2]
    );
    expect(mockClient.query).toHaveBeenCalledWith("COMMIT");
  });
});

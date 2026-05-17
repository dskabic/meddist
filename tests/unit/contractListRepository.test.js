jest.mock("../../src/config/db", () => ({
  query: jest.fn(),
  connect: jest.fn()
}));

const pool = require("../../src/config/db");
const contractListRepository = require("../../src/infrastructure/repositories/contractListRepository");

describe("ContractListRepository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("cancelByClient should set cancelled statuses in contract and request", async () => {
    const mockClient = {
      query: jest.fn(),
      release: jest.fn()
    };

    pool.connect.mockResolvedValue(mockClient);
    mockClient.query
      .mockResolvedValueOnce()
      .mockResolvedValueOnce({
        rows: [{
          id: 18,
          request_id: 7,
          status: "Na čekanju potvrde korisnika",
          rental_start_date: "2099-06-10",
          can_cancel: true
        }]
      })
      .mockResolvedValueOnce()
      .mockResolvedValueOnce()
      .mockResolvedValueOnce();

    pool.query
      .mockResolvedValueOnce({
        rows: [{
          id: 18,
          contract_date: "2026-05-17",
          rental_start_date: "2099-06-10",
          expected_return_date: "2099-06-20",
          status: "Otkazan od klijenta",
          request_id: 7,
          client_id: 1,
          client_name: "KBC Zagreb",
          client_oib: "12345678901",
          client_street: "Ulica 1",
          client_city: "Zagreb",
          client_postal_code: "10000",
          client_email: "kbc@test.hr",
          worker_id: 3,
          worker_name: "Ivan Horvat",
          worker_role: "Djelatnik za narudžbe",
          worker_email: "ivan@test.hr"
        }]
      })
      .mockResolvedValueOnce({ rows: [] });

    const result = await contractListRepository.cancelByClient(18, 1);

    expect(result.status).toBe("Otkazan od klijenta");
    expect(mockClient.query).toHaveBeenCalledWith(
      expect.stringContaining("SET Status = $2"),
      [18, "Otkazan od klijenta"]
    );
    expect(mockClient.query).toHaveBeenCalledWith(
      expect.stringContaining("SET Status = 'Poništen'"),
      [7]
    );
    expect(mockClient.query).toHaveBeenCalledWith("COMMIT");
  });

  test("cancelByWorker should reject already started contract", async () => {
    const mockClient = {
      query: jest.fn(),
      release: jest.fn()
    };

    pool.connect.mockResolvedValue(mockClient);
    mockClient.query
      .mockResolvedValueOnce()
      .mockResolvedValueOnce({
        rows: [{
          id: 18,
          request_id: 7,
          status: "Na čekanju potvrde korisnika",
          rental_start_date: "2026-05-10",
          can_cancel: false
        }]
      })
      .mockResolvedValueOnce();

    await expect(
      contractListRepository.cancelByWorker(18)
    ).rejects.toThrow("Ugovor nije moguće otkazati nakon početka najma.");

    expect(mockClient.query).toHaveBeenCalledWith("ROLLBACK");
  });
});

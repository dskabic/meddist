jest.mock("../../src/config/db", () => ({
  query: jest.fn(),
  connect: jest.fn()
}));

const pool = require("../../src/config/db");
const purchaseRepository = require("../../src/infrastructure/repositories/purchaseRepository");

describe("PurchaseRepository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("createOrder should insert order and items with price from database", async () => {
    const mockClient = {
      query: jest.fn(),
      release: jest.fn()
    };

    pool.connect.mockResolvedValue(mockClient);
    mockClient.query
      .mockResolvedValueOnce()
      .mockResolvedValueOnce({ rows: [{ id_narudzbe: 15 }] })
      .mockResolvedValueOnce({ rows: [{ active: true, default_unit_price: 2.4 }] })
      .mockResolvedValueOnce()
      .mockResolvedValueOnce();

    pool.query.mockResolvedValueOnce({
      rows: [{
        id: 15,
        created_date: "2026-05-16",
        status: "U obradi",
        client_id: 1,
        worker_id: null,
        client_name: "KBC Zagreb",
        client_oib: "12345678901",
        client_city: "Zagreb",
        worker_name: null,
        invoice_id: null,
        invoice_date: null,
        invoice_total: null
      }]
    }).mockResolvedValueOnce({
      rows: [{
        article_name: "Kirurške rukavice",
        manufacturer: "Medline",
        lot_number: "LOT-10",
        quantity: 3,
        unit_price: 2.4
      }]
    });

    const result = await purchaseRepository.createOrder(1, [
      { articleId: 4, quantity: 3 }
    ]);

    expect(result.id).toBe(15);
    expect(mockClient.query).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO Narudzba_za_kupnju"),
      [1]
    );
    expect(mockClient.query).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO Stavka_narudzbe"),
      [15, 4, 3, 2.4]
    );
    expect(mockClient.query).toHaveBeenCalledWith("COMMIT");
  });

  test("shipOrder should reduce stock and mark order as Poslano", async () => {
    const mockClient = {
      query: jest.fn(),
      release: jest.fn()
    };

    pool.connect.mockResolvedValue(mockClient);
    mockClient.query
      .mockResolvedValueOnce()
      .mockResolvedValueOnce({ rows: [{ id_narudzbe: 9, status_isporuke: "U obradi" }] })
      .mockResolvedValueOnce({ rows: [{ article_id: 4, quantity: 2 }] })
      .mockResolvedValueOnce({ rows: [{ trenutna_zaliha: 8 }] })
      .mockResolvedValueOnce()
      .mockResolvedValueOnce();

    pool.query.mockResolvedValueOnce({
      rows: [{
        id: 9,
        created_date: "2026-05-16",
        status: "Poslano",
        client_id: 1,
        worker_id: 3,
        client_name: "KBC Zagreb",
        client_oib: "12345678901",
        client_city: "Zagreb",
        worker_name: "Ivan Horvat",
        invoice_id: null,
        invoice_date: null,
        invoice_total: null
      }]
    }).mockResolvedValueOnce({
      rows: [{
        article_name: "Kirurške rukavice",
        manufacturer: "Medline",
        lot_number: "LOT-10",
        quantity: 2,
        unit_price: 2.4
      }]
    });

    const result = await purchaseRepository.shipOrder(9, 3);

    expect(result.id).toBe(9);
    expect(mockClient.query).toHaveBeenCalledWith(
      expect.stringContaining("SET Trenutna_Zaliha = Trenutna_Zaliha - $2"),
      [4, 2]
    );
    expect(mockClient.query).toHaveBeenCalledWith(
      expect.stringContaining("SET Status_Isporuke = 'Poslano'"),
      [9, 3]
    );
  });
});

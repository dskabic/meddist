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

  test("shipOrder should rollback when stock is insufficient", async () => {
    const mockClient = {
      query: jest.fn(),
      release: jest.fn()
    };

    pool.connect.mockResolvedValue(mockClient);
    mockClient.query
      .mockResolvedValueOnce()
      .mockResolvedValueOnce({ rows: [{ id_narudzbe: 9, status_isporuke: "U obradi" }] })
      .mockResolvedValueOnce({ rows: [{ article_id: 4, quantity: 5 }] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce();

    await expect(
      purchaseRepository.shipOrder(9, 3)
    ).rejects.toThrow("Artikl ID 4 nema dovoljno zaliha za slanje narudžbe.");

    expect(mockClient.query).toHaveBeenCalledWith("ROLLBACK");
  });

  test("deliverOrder should create invoice and mark order as Isporučeno", async () => {
    const mockClient = {
      query: jest.fn(),
      release: jest.fn()
    };

    pool.connect.mockResolvedValue(mockClient);
    mockClient.query
      .mockResolvedValueOnce()
      .mockResolvedValueOnce({ rows: [{ id_narudzbe: 22, status_isporuke: "Poslano" }] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ total_amount: 18.4 }] })
      .mockResolvedValueOnce({ rows: [{ id_racuna: 5 }] })
      .mockResolvedValueOnce()
      .mockResolvedValueOnce();

    pool.query
      .mockResolvedValueOnce({
        rows: [{
          id: 22,
          created_date: "2026-05-16",
          status: "Isporučeno",
          client_id: 1,
          worker_id: 3,
          client_name: "KBC Zagreb",
          client_oib: "12345678901",
          client_city: "Zagreb",
          worker_name: "Ivan Horvat",
          invoice_id: 5,
          invoice_date: "2026-05-16",
          invoice_total: 18.4
        }]
      })
      .mockResolvedValueOnce({
        rows: [{
          article_name: "Kirurške rukavice",
          manufacturer: "Medline",
          lot_number: "LOT-10",
          quantity: 4,
          unit_price: 4.6
        }]
      });

    const result = await purchaseRepository.deliverOrder(22, 3);

    expect(result.invoiceId).toBe(5);
    expect(mockClient.query).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO Racun"),
      [18.4, 22]
    );
    expect(mockClient.query).toHaveBeenCalledWith(
      expect.stringContaining("SET Status_Isporuke = 'Isporučeno'"),
      [22, 3]
    );
  });

  test("deliverOrder should reuse existing invoice", async () => {
    const mockClient = {
      query: jest.fn(),
      release: jest.fn()
    };

    pool.connect.mockResolvedValue(mockClient);
    mockClient.query
      .mockResolvedValueOnce()
      .mockResolvedValueOnce({ rows: [{ id_narudzbe: 22, status_isporuke: "Poslano" }] })
      .mockResolvedValueOnce({ rows: [{ id_racuna: 11 }] })
      .mockResolvedValueOnce()
      .mockResolvedValueOnce();

    pool.query
      .mockResolvedValueOnce({
        rows: [{
          id: 22,
          created_date: "2026-05-16",
          status: "Isporučeno",
          client_id: 1,
          worker_id: 3,
          client_name: "KBC Zagreb",
          client_oib: "12345678901",
          client_city: "Zagreb",
          worker_name: "Ivan Horvat",
          invoice_id: 11,
          invoice_date: "2026-05-16",
          invoice_total: 18.4
        }]
      })
      .mockResolvedValueOnce({
        rows: [{
          article_name: "Kirurške rukavice",
          manufacturer: "Medline",
          lot_number: "LOT-10",
          quantity: 4,
          unit_price: 4.6
        }]
      });

    const result = await purchaseRepository.deliverOrder(22, 3);

    expect(result.invoiceId).toBe(11);
    expect(mockClient.query).not.toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO Racun"),
      expect.anything()
    );
  });
});

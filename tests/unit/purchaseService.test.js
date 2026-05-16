const purchaseService = require("../../src/models/services/purchaseService");
const purchaseRepository = require("../../src/infrastructure/repositories/purchaseRepository");

jest.mock("../../src/infrastructure/repositories/purchaseRepository");

describe("PurchaseService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("createPurchaseOrder should reject empty cart", async () => {
    await expect(
      purchaseService.createPurchaseOrder(1, [])
    ).rejects.toThrow("Validacija nije uspješna.");

    expect(purchaseRepository.createOrder).not.toHaveBeenCalled();
  });

  test("createPurchaseOrder should reject missing consumable", async () => {
    purchaseRepository.findConsumableById.mockResolvedValue(null);

    await expect(
      purchaseService.createPurchaseOrder(1, [{ articleId: 4, quantity: 2 }])
    ).rejects.toThrow("Odabrani artikl ne postoji.");

    expect(purchaseRepository.createOrder).not.toHaveBeenCalled();
  });

  test("createPurchaseOrder should persist validated order", async () => {
    purchaseRepository.findConsumableById.mockResolvedValue({
      id: 4,
      name: "Kirurške rukavice",
      active: true,
      default_unit_price: 1.5
    });
    purchaseRepository.createOrder.mockResolvedValue({ id: 8 });

    const result = await purchaseService.createPurchaseOrder(1, [
      { articleId: 4, quantity: 2 }
    ]);

    expect(result).toEqual({ id: 8 });
    expect(purchaseRepository.createOrder).toHaveBeenCalledWith(1, [
      { articleId: 4, quantity: 2 }
    ]);
  });

  test("rejectPurchaseOrder should fail when repository returns false", async () => {
    purchaseRepository.rejectOrder.mockResolvedValue(false);

    await expect(
      purchaseService.rejectPurchaseOrder(11, 3)
    ).rejects.toThrow("Narudžbu nije moguće odbiti. Možda više nije u obradi.");
  });
});

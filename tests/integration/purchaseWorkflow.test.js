const request = require("supertest");
const express = require("express");

const purchaseRoutes = require("../../src/routes/purchaseRoutes");
const workerPurchaseRoutes = require("../../src/routes/workerPurchaseRoutes");
const purchaseService = require("../../src/models/services/purchaseService");

jest.mock("../../src/models/services/purchaseService");

function buildApp(sessionData, routeBase, router) {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use((req, res, next) => {
    req.session = JSON.parse(JSON.stringify(sessionData));
    res.render = (view, locals) => res.status(res.statusCode || 200).json({ view, ...locals });
    next();
  });
  app.use(routeBase, router);
  return app;
}

describe("Purchase workflow routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("POST /client/purchases/checkout should create order and render success", async () => {
    purchaseService.createPurchaseOrder.mockResolvedValue({ id: 44 });
    purchaseService.getAvailableConsumables.mockResolvedValue([
      {
        id: 4,
        name: "Kirurške rukavice",
        manufacturer: "Medline",
        lot_number: "LOT-10",
        current_stock: 10,
        default_unit_price: 2.4
      }
    ]);
    purchaseService.getClientPurchaseOrders.mockResolvedValue([
      {
        id: 44,
        status: "U obradi",
        item_count: 1,
        total_amount: 4.8,
        invoice_id: null
      }
    ]);

    const app = buildApp(
      {
        user: { id: 1, type: "client", name: "KBC Zagreb" },
        cart: [{ articleId: 4, quantity: 2 }]
      },
      "/client/purchases",
      purchaseRoutes
    );

    const response = await request(app)
      .post("/client/purchases/checkout")
      .type("form");

    expect(response.status).toBe(200);
    expect(response.body.view).toBe("purchases/catalog");
    expect(response.body.success).toContain("Narudžba je uspješno zaprimljena");
    expect(purchaseService.createPurchaseOrder).toHaveBeenCalledWith(1, [
      { articleId: 4, quantity: 2 }
    ]);
  });

  test("POST /client/purchases/checkout should render validation errors", async () => {
    const error = new Error("Validacija nije uspješna.");
    error.validationErrors = ["Narudžba mora sadržavati barem jednu stavku."];
    purchaseService.createPurchaseOrder.mockRejectedValue(error);
    purchaseService.getAvailableConsumables.mockResolvedValue([]);
    purchaseService.getClientPurchaseOrders.mockResolvedValue([]);

    const app = buildApp(
      {
        user: { id: 1, type: "client", name: "KBC Zagreb" },
        cart: []
      },
      "/client/purchases",
      purchaseRoutes
    );

    const response = await request(app)
      .post("/client/purchases/checkout")
      .type("form");

    expect(response.status).toBe(400);
    expect(response.body.errors).toContain("Narudžba mora sadržavati barem jednu stavku.");
  });

  test("POST /worker/orders/purchases/:id/ship should redirect on success", async () => {
    purchaseService.shipPurchaseOrder.mockResolvedValue({ order: { id: 9 } });

    const app = buildApp(
      {
        user: { id: 3, type: "worker", role: "Djelatnik za narudžbe", name: "Ivan Horvat" }
      },
      "/worker/orders/purchases",
      workerPurchaseRoutes
    );

    const response = await request(app)
      .post("/worker/orders/purchases/9/ship")
      .type("form");

    expect(response.status).toBe(302);
    expect(response.header.location).toBe("/worker/orders/purchases/9");
    expect(purchaseService.shipPurchaseOrder).toHaveBeenCalledWith("9", 3);
  });

  test("POST /worker/orders/purchases/:id/deliver should render error state", async () => {
    purchaseService.deliverPurchaseOrder.mockRejectedValue(new Error("Narudžbu je moguće isporučiti samo ako je već poslana."));
    purchaseService.getPurchaseOrderById.mockResolvedValue({
      id: 9,
      status: "U obradi",
      total_amount: 4.8,
      items: []
    });

    const app = buildApp(
      {
        user: { id: 3, type: "worker", role: "Djelatnik za narudžbe", name: "Ivan Horvat" }
      },
      "/worker/orders/purchases",
      workerPurchaseRoutes
    );

    const response = await request(app)
      .post("/worker/orders/purchases/9/deliver")
      .type("form");

    expect(response.status).toBe(400);
    expect(response.body.view).toBe("workerPurchases/details");
    expect(response.body.errors).toContain("Narudžbu je moguće isporučiti samo ako je već poslana.");
  });
});

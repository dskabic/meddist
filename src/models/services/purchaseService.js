const purchaseRepository = require("../../infrastructure/repositories/purchaseRepository");
const purchaseValidator = require("../validators/purchaseValidator");

async function getAvailableConsumables() {
  return purchaseRepository.findAvailableConsumables();
}

async function getClientPurchaseOrders(clientId) {
  return purchaseRepository.findByClientId(clientId);
}

async function getAllPurchaseOrders(search) {
  return purchaseRepository.findAll(search);
}

async function getPurchaseOrderById(id, currentUser) {
  const order = await purchaseRepository.findById(id);

  if (!order) {
    throw new Error("Narudžba nije pronađena.");
  }

  if (currentUser.type === "client" && Number(order.client_id) !== Number(currentUser.id)) {
    throw new Error("Nemate pravo pristupa ovoj narudžbi.");
  }

  return order;
}

async function createPurchaseOrder(clientId, items) {
  const validation = purchaseValidator.validateCheckoutItems(items);

  if (!validation.isValid) {
    const error = new Error("Validacija nije uspješna.");
    error.validationErrors = validation.errors;
    throw error;
  }

  for (const item of items) {
    const consumable = await purchaseRepository.findConsumableById(item.articleId);

    if (!consumable || !consumable.active) {
      const error = new Error("Odabrani artikl ne postoji.");
      error.validationErrors = [`Artikl ID ${item.articleId} nije pronađen u aktivnom katalogu.`];
      throw error;
    }

    if (!Number.isFinite(Number(consumable.default_unit_price)) || Number(consumable.default_unit_price) <= 0) {
      const error = new Error("Odabrani artikl nema definiranu cijenu.");
      error.validationErrors = [`Artikl ${consumable.name} nema definiranu jediničnu cijenu.`];
      throw error;
    }
  }

  return purchaseRepository.createOrder(clientId, items);
}

async function rejectPurchaseOrder(orderId, workerId) {
  const success = await purchaseRepository.rejectOrder(orderId, workerId);

  if (!success) {
    throw new Error("Narudžbu nije moguće odbiti. Možda više nije u obradi.");
  }
}

async function shipPurchaseOrder(orderId, workerId) {
  return purchaseRepository.shipOrder(orderId, workerId);
}

async function deliverPurchaseOrder(orderId, workerId) {
  return purchaseRepository.deliverOrder(orderId, workerId);
}

module.exports = {
  getAvailableConsumables,
  getClientPurchaseOrders,
  getAllPurchaseOrders,
  getPurchaseOrderById,
  createPurchaseOrder,
  rejectPurchaseOrder,
  shipPurchaseOrder,
  deliverPurchaseOrder
};

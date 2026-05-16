const purchaseService = require("../models/services/purchaseService");

async function index(req, res) {
  try {
    const search = req.query.search || "";
    const orders = await purchaseService.getAllPurchaseOrders(search);

    res.render("workerPurchases/index", {
      orders,
      search
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
}

async function details(req, res) {
  try {
    const order = await purchaseService.getPurchaseOrderById(
      req.params.id,
      req.session.user
    );

    res.render("workerPurchases/details", {
      order,
      errors: []
    });
  } catch (error) {
    res.status(404).send(error.message);
  }
}

async function reject(req, res) {
  try {
    await purchaseService.rejectPurchaseOrder(req.params.id, req.session.user.id);
    res.redirect("/worker/orders/purchases");
  } catch (error) {
    res.status(400).send(error.message);
  }
}

async function ship(req, res) {
  try {
    await purchaseService.shipPurchaseOrder(req.params.id, req.session.user.id);
    res.redirect(`/worker/orders/purchases/${req.params.id}`);
  } catch (error) {
    const order = await purchaseService.getPurchaseOrderById(
      req.params.id,
      req.session.user
    );

    res.status(400).render("workerPurchases/details", {
      order,
      errors: [error.message]
    });
  }
}

async function deliver(req, res) {
  try {
    await purchaseService.deliverPurchaseOrder(req.params.id, req.session.user.id);
    res.redirect(`/worker/orders/purchases/${req.params.id}`);
  } catch (error) {
    const order = await purchaseService.getPurchaseOrderById(
      req.params.id,
      req.session.user
    );

    res.status(400).render("workerPurchases/details", {
      order,
      errors: [error.message]
    });
  }
}

module.exports = {
  index,
  details,
  reject,
  ship,
  deliver
};

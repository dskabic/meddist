const purchaseService = require("../models/services/purchaseService");
const purchaseValidator = require("../models/validators/purchaseValidator");
const cartService = require("../models/services/cartService");

function buildCartView(session, consumables) {
  const cartItems = cartService.getCart(session);
  const enrichedItems = cartItems
    .map((item) => {
      const consumable = consumables.find(
        (candidate) => Number(candidate.id) === Number(item.articleId)
      );

      if (!consumable) {
        return null;
      }

      return {
        articleId: item.articleId,
        quantity: item.quantity,
        articleName: consumable.name,
        manufacturer: consumable.manufacturer,
        lotNumber: consumable.lot_number,
        currentStock: Number(consumable.current_stock),
        unitPrice: Number(consumable.default_unit_price || 0),
        subtotal: Number(consumable.default_unit_price || 0) * Number(item.quantity)
      };
    })
    .filter(Boolean);

  return {
    items: enrichedItems,
    total: enrichedItems.reduce((sum, item) => sum + item.subtotal, 0)
  };
}

async function renderCatalog(req, res, options = {}) {
  const [consumables, orders] = await Promise.all([
    purchaseService.getAvailableConsumables(),
    purchaseService.getClientPurchaseOrders(req.session.user.id)
  ]);

  const cart = buildCartView(req.session, consumables);

  res.status(options.statusCode || 200).render("purchases/catalog", {
    consumables,
    cart,
    orders,
    errors: options.errors || [],
    success: options.success || null,
    orderCreated: options.orderCreated || null
  });
}

async function index(req, res) {
  try {
    await renderCatalog(req, res);
  } catch (error) {
    res.status(500).send(error.message);
  }
}

async function addToCart(req, res) {
  try {
    const validation = purchaseValidator.validateCartMutation(
      req.body.articleId,
      req.body.quantity
    );

    if (!validation.isValid) {
      return renderCatalog(req, res, {
        statusCode: 400,
        errors: validation.errors
      });
    }

    cartService.addItem(req.session, req.body.articleId, req.body.quantity);
    res.redirect("/client/purchases?success=cart");
  } catch (error) {
    await renderCatalog(req, res, {
      statusCode: 400,
      errors: [error.message]
    });
  }
}

async function updateCartItem(req, res) {
  try {
    const quantity = Number(req.body.quantity);

    if (!Number.isInteger(quantity) || quantity < 0) {
      throw new Error("Količina u košarici mora biti cijeli broj veći ili jednak 0.");
    }

    cartService.updateItem(req.session, req.body.articleId, quantity);
    res.redirect("/client/purchases");
  } catch (error) {
    await renderCatalog(req, res, {
      statusCode: 400,
      errors: [error.message]
    });
  }
}

async function removeCartItem(req, res) {
  try {
    cartService.removeItem(req.session, req.body.articleId);
    res.redirect("/client/purchases");
  } catch (error) {
    await renderCatalog(req, res, {
      statusCode: 400,
      errors: [error.message]
    });
  }
}

async function checkout(req, res) {
  try {
    const cartItems = cartService.getCart(req.session);
    const order = await purchaseService.createPurchaseOrder(req.session.user.id, cartItems);
    cartService.clearCart(req.session);

    await renderCatalog(req, res, {
      success: "Narudžba je uspješno zaprimljena i poslana na obradu.",
      orderCreated: order
    });
  } catch (error) {
    await renderCatalog(req, res, {
      statusCode: 400,
      errors: error.validationErrors || [error.message]
    });
  }
}

module.exports = {
  index,
  addToCart,
  updateCartItem,
  removeCartItem,
  checkout
};

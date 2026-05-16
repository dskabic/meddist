function getCart(session) {
  if (!session.cart || !Array.isArray(session.cart)) {
    session.cart = [];
  }

  return session.cart;
}

function addItem(session, articleId, quantity) {
  const cart = getCart(session);
  const existingItem = cart.find((item) => Number(item.articleId) === Number(articleId));

  if (existingItem) {
    existingItem.quantity += Number(quantity);
  } else {
    cart.push({
      articleId: Number(articleId),
      quantity: Number(quantity)
    });
  }

  session.cart = cart;
  return cart;
}

function updateItem(session, articleId, quantity) {
  const normalizedQuantity = Number(quantity);
  const cart = getCart(session)
    .map((item) => (
      Number(item.articleId) === Number(articleId)
        ? { ...item, quantity: normalizedQuantity }
        : item
    ))
    .filter((item) => item.quantity > 0);

  session.cart = cart;
  return cart;
}

function removeItem(session, articleId) {
  const cart = getCart(session).filter((item) => Number(item.articleId) !== Number(articleId));
  session.cart = cart;
  return cart;
}

function clearCart(session) {
  session.cart = [];
}

module.exports = {
  getCart,
  addItem,
  updateItem,
  removeItem,
  clearCart
};

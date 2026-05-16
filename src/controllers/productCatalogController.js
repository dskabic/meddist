const productCatalogService = require("../models/services/productCatalogService");

async function index(req, res) {
  try {
    const search = req.query.search || "";
    const products = await productCatalogService.getAvailableProducts(search);

    res.render("products/index", {
      products,
      search
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
}

module.exports = {
  index
};
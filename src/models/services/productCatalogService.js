const productCatalogRepository = require("../../infrastructure/repositories/productCatalogRepository");

async function getAvailableProducts(search) {
  return productCatalogRepository.findAvailableProducts(search);
}

module.exports = {
  getAvailableProducts
};
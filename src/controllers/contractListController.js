const contractListService = require("../models/services/contractListService");

async function index(req, res) {
  try {
    const search = req.query.search || "";
    const contracts = await contractListService.getAllContracts(search);

    res.render("contracts/index", {
      contracts,
      search
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
}

async function details(req, res) {
  try {
    const contract = await contractListService.getContractById(req.params.id);

    res.render("contracts/details", {
      contract
    });
  } catch (error) {
    res.status(404).send(error.message);
  }
}

module.exports = {
  index,
  details
};
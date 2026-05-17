const contractListService = require("../models/services/contractListService");

async function index(req, res) {
  try {
    const contracts = await contractListService.getClientContracts(req.session.user.id);

    res.render("clientContracts/index", {
      contracts
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
}

async function details(req, res) {
  try {
    const contract = await contractListService.getContractById(
      req.params.id,
      req.session.user
    );

    res.render("clientContracts/details", {
      contract,
      error: null,
      canCancel: contractListService.canCancelContract(contract)
    });
  } catch (error) {
    res.status(404).send(error.message);
  }
}

async function cancel(req, res) {
  try {
    await contractListService.cancelContractByClient(req.params.id, req.session.user);
    res.redirect(`/client/contracts/${req.params.id}`);
  } catch (error) {
    try {
      const contract = await contractListService.getContractById(
        req.params.id,
        req.session.user
      );

      res.status(400).render("clientContracts/details", {
        contract,
        error: error.message,
        canCancel: contractListService.canCancelContract(contract)
      });
    } catch (loadError) {
      res.status(404).send(loadError.message);
    }
  }
}

module.exports = {
  index,
  details,
  cancel
};

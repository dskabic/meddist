const contractListRepository = require("../../infrastructure/repositories/contractListRepository");

async function getAllContracts(search) {
  return contractListRepository.findAll(search);
}

async function getContractById(id) {
  const contract = await contractListRepository.findById(id);

  if (!contract) {
    throw new Error("Ugovor nije pronađen.");
  }

  return contract;
}

module.exports = {
  getAllContracts,
  getContractById
};
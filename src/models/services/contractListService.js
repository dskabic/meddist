const contractListRepository = require("../../infrastructure/repositories/contractListRepository");

async function getAllContracts(search) {
  return contractListRepository.findAll(search);
}

async function getClientContracts(clientId) {
  return contractListRepository.findByClientId(clientId);
}

async function getContractById(id, currentUser = null) {
  const contract = await contractListRepository.findById(id);

  if (!contract) {
    throw new Error("Ugovor nije pronađen.");
  }

  if (currentUser?.type === "client" && Number(contract.client_id) !== Number(currentUser.id)) {
    throw new Error("Nemate pravo pristupa ovom ugovoru.");
  }

  return contract;
}

function canCancelContract(contract) {
  const today = new Date().toISOString().slice(0, 10);
  const startDate = String(contract.rental_start_date).slice(0, 10);

  return (
    !["Otkazan od klijenta", "Otkazan od distributera"].includes(contract.status) &&
    startDate > today
  );
}

async function cancelContractByClient(id, currentUser) {
  const contract = await getContractById(id, currentUser);

  if (!canCancelContract(contract)) {
    throw new Error("Ugovor nije moguće otkazati nakon početka najma ili ako je već otkazan.");
  }

  return contractListRepository.cancelByClient(id, currentUser.id);
}

async function cancelContractByWorker(id) {
  const contract = await getContractById(id);

  if (!canCancelContract(contract)) {
    throw new Error("Ugovor nije moguće otkazati nakon početka najma ili ako je već otkazan.");
  }

  return contractListRepository.cancelByWorker(id);
}

module.exports = {
  getAllContracts,
  getClientContracts,
  getContractById,
  canCancelContract,
  cancelContractByClient,
  cancelContractByWorker
};

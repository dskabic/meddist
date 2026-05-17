const contractListService = require("../../src/models/services/contractListService");
const contractListRepository = require("../../src/infrastructure/repositories/contractListRepository");

jest.mock("../../src/infrastructure/repositories/contractListRepository");

describe("ContractListService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("getContractById should block access to another client's contract", async () => {
    contractListRepository.findById.mockResolvedValue({
      id: 15,
      client_id: 8
    });

    await expect(
      contractListService.getContractById(15, { type: "client", id: 1 })
    ).rejects.toThrow("Nemate pravo pristupa ovom ugovoru.");
  });

  test("cancelContractByClient should cancel future contract owned by client", async () => {
    contractListRepository.findById.mockResolvedValue({
      id: 15,
      client_id: 1,
      status: "Na čekanju potvrde korisnika",
      rental_start_date: "2099-06-10"
    });
    contractListRepository.cancelByClient.mockResolvedValue({
      id: 15,
      status: "Otkazan od klijenta"
    });

    const result = await contractListService.cancelContractByClient(
      15,
      { type: "client", id: 1 }
    );

    expect(result).toEqual({
      id: 15,
      status: "Otkazan od klijenta"
    });
    expect(contractListRepository.cancelByClient).toHaveBeenCalledWith(15, 1);
  });

  test("cancelContractByClient should reject started contract", async () => {
    contractListRepository.findById.mockResolvedValue({
      id: 15,
      client_id: 1,
      status: "Na čekanju potvrde korisnika",
      rental_start_date: "2020-06-10"
    });

    await expect(
      contractListService.cancelContractByClient(15, { type: "client", id: 1 })
    ).rejects.toThrow("Ugovor nije moguće otkazati nakon početka najma ili ako je već otkazan.");

    expect(contractListRepository.cancelByClient).not.toHaveBeenCalled();
  });

  test("cancelContractByWorker should delegate repository cancellation", async () => {
    contractListRepository.findById.mockResolvedValue({
      id: 21,
      client_id: 3,
      status: "Odobren",
      rental_start_date: "2099-07-10"
    });
    contractListRepository.cancelByWorker.mockResolvedValue({
      id: 21,
      status: "Otkazan od distributera"
    });

    const result = await contractListService.cancelContractByWorker(21);

    expect(result).toEqual({
      id: 21,
      status: "Otkazan od distributera"
    });
    expect(contractListRepository.cancelByWorker).toHaveBeenCalledWith(21);
  });
});

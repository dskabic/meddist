const rentalRequestController = require("../../src/controllers/rentalRequestController");
const rentalRequestService = require("../../src/models/services/rentalRequestService");

jest.mock("../../src/models/services/rentalRequestService");

function mockResponse() {
  const res = {};

  res.render = jest.fn();
  res.redirect = jest.fn();
  res.status = jest.fn(() => res);
  res.send = jest.fn();

  return res;
}

describe("RentalRequestController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("index renders rental request list", async () => {
    rentalRequestService.getClientRentalRequests.mockResolvedValue([
      {
        id: 1,
        status: "Zaprimljen"
      }
    ]);

    const req = {
      session: {
        user: {
          id: 1,
          type: "client"
        }
      }
    };

    const res = mockResponse();

    await rentalRequestController.index(req, res);

    expect(res.render).toHaveBeenCalledWith(
      "rentalRequests/index",
      expect.objectContaining({
        requests: expect.any(Array)
      })
    );
  });

  test("create redirects after successful creation", async () => {
    rentalRequestService.createRentalRequest.mockResolvedValue({
      id: 1
    });

    const req = {
      body: {
        desiredStartDate: "2026-06-01",
        desiredReturnDate: "2026-06-10",
        equipmentId: ["1"]
      },
      session: {
        user: {
          id: 1,
          type: "client"
        }
      }
    };

    const res = mockResponse();

    await rentalRequestController.create(req, res);

    expect(res.redirect).toHaveBeenCalledWith("/client/rental-requests");
  });

  test("create renders form with errors when service throws validation error", async () => {
    const error = new Error("Validacija nije uspješna.");
    error.validationErrors = ["Zahtjev za najam mora sadržavati barem jedan uređaj."];

    rentalRequestService.createRentalRequest.mockRejectedValue(error);
    rentalRequestService.getAvailableDevices.mockResolvedValue([]);

    const req = {
      body: {
        desiredStartDate: "2026-06-01",
        desiredReturnDate: "2026-06-10",
        equipmentId: []
      },
      session: {
        user: {
          id: 1,
          type: "client"
        }
      }
    };

    const res = mockResponse();

    await rentalRequestController.create(req, res);

    expect(res.render).toHaveBeenCalledWith(
      "rentalRequests/create",
      expect.objectContaining({
        errors: error.validationErrors
      })
    );
  });
});
const authController = require("../../src/controllers/authController");
const authService = require("../../src/models/services/authService");

jest.mock("../../src/models/services/authService");

function mockResponse() {
  const res = {};

  res.render = jest.fn();
  res.redirect = jest.fn();
  res.status = jest.fn(() => res);
  res.send = jest.fn();

  return res;
}

describe("AuthController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("clientLogin redirects client to dashboard", async () => {
    authService.loginClient.mockResolvedValue({
      id: 1,
      name: "KBC Test",
      email: "client@test.hr",
      type: "client",
      role: "Korisnik"
    });

    const req = {
      body: {
        email: "client@test.hr",
        password: "test123"
      },
      session: {}
    };

    const res = mockResponse();

    await authController.clientLogin(req, res);

    expect(req.session.user).toBeDefined();
    expect(res.redirect).toHaveBeenCalledWith("/client/dashboard");
  });

  test("workerLogin redirects order worker to orders dashboard", async () => {
    authService.loginWorker.mockResolvedValue({
      id: 1,
      name: "Test Worker",
      email: "worker@test.hr",
      type: "worker",
      role: "Djelatnik za narudžbe"
    });

    const req = {
      body: {
        email: "worker@test.hr",
        password: "test123"
      },
      session: {}
    };

    const res = mockResponse();

    await authController.workerLogin(req, res);

    expect(req.session.user).toBeDefined();
    expect(res.redirect).toHaveBeenCalledWith("/worker/orders");
  });

  test("clientLogin renders login page on error", async () => {
    authService.loginClient.mockRejectedValue(
      new Error("Invalid email or password.")
    );

    const req = {
      body: {
        email: "wrong@test.hr",
        password: "wrong"
      },
      session: {}
    };

    const res = mockResponse();

    await authController.clientLogin(req, res);

    expect(res.render).toHaveBeenCalledWith(
      "auth/clientLogin",
      expect.objectContaining({
        error: "Invalid email or password."
      })
    );
  });
});
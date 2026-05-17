const rentalRequestValidator = require("../../src/models/validators/rentalRequestValidator");
const RentalRequest = require("../../src/models/entities/RentalRequest");
const RentalRequestItem = require("../../src/models/entities/RentalRequestItem");

describe("RentalRequestValidator", () => {
  test("rejects rental request when return date is before start date", () => {
    const rentalRequest = new RentalRequest({
      clientId: 1,
      desiredStartDate: "2026-06-10",
      desiredReturnDate: "2026-06-01",
      items: [
        new RentalRequestItem({
          equipmentId: 1
        })
      ]
    });

    const result = rentalRequestValidator.validateRentalRequest(rentalRequest);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      "Datum povrata mora biti nakon datuma početka najma."
    );
  });

  test("rejects rental request without selected devices", () => {
    const rentalRequest = new RentalRequest({
      clientId: 1,
      desiredStartDate: "2026-06-01",
      desiredReturnDate: "2026-06-10",
      items: []
    });

    const result = rentalRequestValidator.validateRentalRequest(rentalRequest);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      "Zahtjev za najam mora sadržavati barem jedan uređaj."
    );
  });

  test("rejects duplicate device in same request", () => {
    const rentalRequest = new RentalRequest({
      clientId: 1,
      desiredStartDate: "2026-06-01",
      desiredReturnDate: "2026-06-10",
      items: [
        new RentalRequestItem({ equipmentId: 1 }),
        new RentalRequestItem({ equipmentId: 1 })
      ]
    });

    const result = rentalRequestValidator.validateRentalRequest(rentalRequest);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      "Isti uređaj ne može biti dodan više puta u isti zahtjev."
    );
  });

  test("accepts valid rental request", () => {
    const rentalRequest = new RentalRequest({
      clientId: 1,
      desiredStartDate: "2026-06-01",
      desiredReturnDate: "2026-06-10",
      items: [
        new RentalRequestItem({
          equipmentId: 1
        })
      ]
    });

    const result = rentalRequestValidator.validateRentalRequest(rentalRequest);

    expect(result.isValid).toBe(true);
  });
});
const contractValidator = require("../../src/models/validators/contractValidator");

describe("ContractValidator", () => {
  test("rejects contract without client", () => {
    const formData = {
      clientId: "",
      rentalStartDate: "2026-06-01",
      expectedReturnDate: "2026-06-10",
      equipmentId: ["1"],
      pricePerDay: ["50"]
    };

    const result = contractValidator.validateContractCreation(formData);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Potrebno je odabrati klijenta.");
  });

  test("rejects duplicate equipment in contract", () => {
    const formData = {
      clientId: "1",
      rentalStartDate: "2026-06-01",
      expectedReturnDate: "2026-06-10",
      equipmentId: ["1", "1"],
      pricePerDay: ["50", "60"]
    };

    const result = contractValidator.validateContractCreation(formData);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      "Isti uređaj ne može biti dodan više puta u ugovor."
    );
  });

  test("rejects invalid price", () => {
    const formData = {
      clientId: "1",
      rentalStartDate: "2026-06-01",
      expectedReturnDate: "2026-06-10",
      equipmentId: ["1"],
      pricePerDay: ["0"]
    };

    const result = contractValidator.validateContractCreation(formData);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      "Ugovorena cijena po danu mora biti veća od 0."
    );
  });

  test("accepts valid contract data", () => {
    const formData = {
      clientId: "1",
      rentalStartDate: "2026-06-01",
      expectedReturnDate: "2026-06-10",
      equipmentId: ["1"],
      pricePerDay: ["50"]
    };

    const result = contractValidator.validateContractCreation(formData);

    expect(result.isValid).toBe(true);
  });
  test("rejects contract when return date is before start date", () => {
  const formData = {
    clientId: "1",
    rentalStartDate: "2026-06-10",
    expectedReturnDate: "2026-06-01",
    equipmentId: ["1"],
    pricePerDay: ["50"]
  };

  const result = contractValidator.validateContractCreation(formData);

  expect(result.isValid).toBe(false);
});
});
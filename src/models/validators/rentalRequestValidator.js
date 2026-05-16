function validateRentalRequest(rentalRequest) {
  const errors = [];

  if (!rentalRequest.desiredStartDate) {
    errors.push("Potrebno je unijeti željeni datum početka najma.");
  }

  if (!rentalRequest.desiredReturnDate) {
    errors.push("Potrebno je unijeti željeni datum povrata.");
  }

  if (rentalRequest.desiredStartDate && rentalRequest.desiredReturnDate) {
    const startDate = new Date(rentalRequest.desiredStartDate);
    const returnDate = new Date(rentalRequest.desiredReturnDate);

    if (returnDate <= startDate) {
      errors.push("Datum povrata mora biti nakon datuma početka najma.");
    }
  }

  if (!rentalRequest.hasItems()) {
    errors.push("Zahtjev za najam mora sadržavati barem jedan uređaj.");
  }

  const selectedDeviceIds = new Set();

  for (const item of rentalRequest.items) {
    if (!item.equipmentId) {
      errors.push("Svaka stavka mora imati odabran uređaj.");
      continue;
    }

    if (selectedDeviceIds.has(Number(item.equipmentId))) {
      errors.push("Isti uređaj ne može biti dodan više puta u isti zahtjev.");
    }

    selectedDeviceIds.add(Number(item.equipmentId));

    const price = Number(item.pricePerDay);

    if (!Number.isFinite(price) || price <= 0) {
      errors.push("Cijena po danu mora biti veća od 0.");
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

module.exports = {
  validateRentalRequest
};
function validateContractCreation(formData) {
  const errors = [];

  if (!formData.clientId) {
    errors.push("Potrebno je odabrati klijenta.");
  }

  if (!formData.rentalStartDate) {
    errors.push("Potrebno je unijeti datum početka najma.");
  }

  if (!formData.expectedReturnDate) {
    errors.push("Potrebno je unijeti očekivani datum povrata.");
  }

  if (formData.rentalStartDate && formData.expectedReturnDate) {
    const startDate = new Date(formData.rentalStartDate);
    const returnDate = new Date(formData.expectedReturnDate);

    if (returnDate <= startDate) {
      errors.push("Datum povrata mora biti nakon datuma početka najma.");
    }
  }

  const equipmentIds = Array.isArray(formData.equipmentId)
    ? formData.equipmentId
    : [formData.equipmentId];

  const prices = Array.isArray(formData.pricePerDay)
    ? formData.pricePerDay
    : [formData.pricePerDay];

  const selected = new Set();
  let validItemCount = 0;

  for (let i = 0; i < equipmentIds.length; i++) {
    const equipmentId = equipmentIds[i];
    const price = prices[i];

    if (!equipmentId && !price) {
      continue;
    }

    validItemCount++;

    if (!equipmentId) {
      errors.push("Svaka stavka ugovora mora imati odabran uređaj.");
      continue;
    }

    if (selected.has(Number(equipmentId))) {
      errors.push("Isti uređaj ne može biti dodan više puta u ugovor.");
    }

    selected.add(Number(equipmentId));

    const numericPrice = Number(price);

    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      errors.push("Ugovorena cijena po danu mora biti veća od 0.");
    }
  }

  if (validItemCount === 0) {
    errors.push("Ugovor mora sadržavati barem jedan uređaj.");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

module.exports = {
  validateContractCreation
};
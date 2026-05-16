function validateServiceRecord(data) {
  const errors = [];

  if (!data.equipmentId) {
    errors.push("Potrebno je odabrati uređaj.");
  }

  if (!data.serviceDate) {
    errors.push("Potrebno je unijeti datum servisa.");
  } else {
    const selectedDate = new Date(data.serviceDate);
    const today = new Date();

    today.setHours(23, 59, 59, 999);

    if (selectedDate > today) {
      errors.push("Datum servisa ne može biti u budućnosti.");
    }
  }

  if (!data.description || data.description.trim().length < 10) {
    errors.push("Opis radova mora imati barem 10 znakova.");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

module.exports = {
  validateServiceRecord
};
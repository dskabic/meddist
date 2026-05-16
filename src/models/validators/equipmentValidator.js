function validateEquipment(data) {
  const errors = [];
  const type = data.type;

  if (!data.name || data.name.trim().length < 2) {
    errors.push("Naziv artikla mora imati barem 2 znaka.");
  }

  if (!type || !["UREDAJ", "POTROSNI_MATERIJAL"].includes(type)) {
    errors.push("Potrebno je odabrati ispravnu vrstu artikla.");
  }

  if (type === "UREDAJ") {
    if (!data.serialNumber || data.serialNumber.trim().length < 3) {
      errors.push("Serijski broj uređaja mora imati barem 3 znaka.");
    }

    const validStatuses = ["Dostupan", "Iznajmljen", "Na servisu", "Nedostupan"];

    if (!validStatuses.includes(data.availabilityStatus)) {
      errors.push("Status raspoloživosti uređaja nije ispravan.");
    }

    const price = Number(data.defaultRentalPricePerDay);

    if (!Number.isFinite(price) || price <= 0) {
      errors.push("Zadana cijena najma po danu mora biti veća od 0.");
    }
  }

  if (type === "POTROSNI_MATERIJAL") {
    if (!data.lotNumber || data.lotNumber.trim().length < 2) {
      errors.push("LOT broj mora imati barem 2 znaka.");
    }

    const stock = Number(data.currentStock);

    if (!Number.isInteger(stock) || stock < 0) {
      errors.push("Trenutna zaliha mora biti cijeli broj veći ili jednak 0.");
    }

    if (stock === 0) {
      errors.push("Potrošni materijal ne može biti unesen s početnom zalihom 0.");
    }

    const unitPrice = Number(data.defaultUnitPrice);

    if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
      errors.push("Zadana jedinična cijena mora biti veća od 0.");
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

module.exports = {
  validateEquipment
};
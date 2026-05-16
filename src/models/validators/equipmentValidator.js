function validateEquipment(data) {
  const errors = [];

  if (!data.name || data.name.trim().length < 2) {
    errors.push("Naziv artikla mora imati barem 2 znaka.");
  }

  if (!data.type || !["UREDAJ", "POTROSNI_MATERIJAL"].includes(data.type)) {
    errors.push("Potrebno je odabrati ispravnu vrstu artikla.");
  }

  if (data.type === "UREDAJ") {
    if (!data.serialNumber || data.serialNumber.trim().length < 3) {
      errors.push("Serijski broj uređaja mora imati barem 3 znaka.");
    }

    const validStatuses = ["Dostupan", "Iznajmljen", "Na servisu", "Nedostupan"];

    if (!validStatuses.includes(data.availabilityStatus)) {
      errors.push("Status raspoloživosti uređaja nije ispravan.");
    }
  }

  if (data.type === "POTROSNI_MATERIJAL") {
    if (!data.lotNumber || data.lotNumber.trim().length < 2) {
      errors.push("LOT broj mora imati barem 2 znaka.");
    }

    const stock = Number(data.currentStock);

    if (!Number.isInteger(stock) || stock < 0) {
      errors.push("Trenutna zaliha mora biti cijeli broj veći ili jednak 0.");
    }

    // Slightly more complex rule than only required/range:
    // consumable material with stock 0 should not be entered as active stock item
    if (stock === 0) {
      errors.push("Potrošni materijal ne može biti unesen s početnom zalihom 0.");
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
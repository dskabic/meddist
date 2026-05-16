class Equipment {
  constructor({
    id = null,
    name,
    manufacturer = null,
    type,
    serialNumber = null,
    availabilityStatus = null,
    lotNumber = null,
    currentStock = null,
    defaultRentalPricePerDay = null,
    defaultUnitPrice = null,
    active = true
  }) {
    this.id = id;
    this.name = name;
    this.manufacturer = manufacturer;
    this.type = type;
    this.serialNumber = serialNumber;
    this.availabilityStatus = availabilityStatus;
    this.lotNumber = lotNumber;
    this.currentStock = currentStock;
    this.defaultRentalPricePerDay = defaultRentalPricePerDay;
    this.defaultUnitPrice = defaultUnitPrice;
    this.active = active;
  }

  isDevice() {
    return this.type === "UREDAJ";
  }

  isConsumableMaterial() {
    return this.type === "POTROSNI_MATERIJAL";
  }
}

module.exports = Equipment;
class RentalRequestItem {
  constructor({
    requestId = null,
    equipmentId,
    pricePerDay
  }) {
    this.requestId = requestId;
    this.equipmentId = equipmentId;
    this.pricePerDay = pricePerDay;
  }
}

module.exports = RentalRequestItem;
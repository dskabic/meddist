class RentalRequestItem {
  constructor({
    requestId = null,
    equipmentId
  }) {
    this.requestId = requestId;
    this.equipmentId = equipmentId;
  }
}

module.exports = RentalRequestItem;
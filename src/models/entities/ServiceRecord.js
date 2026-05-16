class ServiceRecord {
  constructor({
    id = null,
    serviceDate,
    description,
    equipmentId
  }) {
    this.id = id;
    this.serviceDate = serviceDate;
    this.description = description;
    this.equipmentId = equipmentId;
  }
}

module.exports = ServiceRecord;
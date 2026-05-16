class RentalRequest {
  constructor({
    id = null,
    clientId,
    workerId = null,
    submittedDate = null,
    desiredStartDate,
    desiredReturnDate,
    status = "Zaprimljen",
    items = []
  }) {
    this.id = id;
    this.clientId = clientId;
    this.workerId = workerId;
    this.submittedDate = submittedDate;
    this.desiredStartDate = desiredStartDate;
    this.desiredReturnDate = desiredReturnDate;
    this.status = status;
    this.items = items;
  }

  hasItems() {
    return this.items.length > 0;
  }
}

module.exports = RentalRequest;
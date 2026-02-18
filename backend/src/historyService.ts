class HistoryService {
  data: any[] = [];
  counter: number = 0;

  addTrip(tripData: any): any {
    this.counter++;
    const trip = {
      id: this.counter,
      ...tripData,
      timestamp: new Date()
    };
    this.data.push(trip);
    return trip;
  }

  getAll(): any[] {
    return this.data;
  }

  getStats(): any {
    var total = 0;
    var avg = 0;

    for (var i = 0; i < this.data.length; i++) {
      total = total + this.data[i].co2;
    }

    if (this.data.length > 0) {
      avg = total / this.data.length;
    }

    return {
      totalTrips: this.data.length,
      totalCO2: total,
      averageCO2: avg,
      lastCalculation: this.data.length > 0 ? this.data[this.data.length - 1].timestamp : null
    };
  }

  clear(): void {
    this.data = [];
    this.counter = 0;
  }
}

export default new HistoryService();

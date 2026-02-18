import calculatorService from './calculatorService.js';

class CompareService {
  compare(trip1: any, trip2: any): any {
    const r1 = calculatorService.calculate(
      trip1.distance,
      trip1.transport,
      trip1.carType,
      trip1.passengers,
      trip1.country
    );

    const r2 = calculatorService.calculate(
      trip2.distance,
      trip2.transport,
      trip2.carType,
      trip2.passengers,
      trip2.country
    );

    var winner = '';
    if (r1.co2 < r2.co2) {
      winner = 'trip1';
    } else if (r2.co2 < r1.co2) {
      winner = 'trip2';
    } else {
      winner = 'equal';
    }

    return {
      trip1: { co2: r1.co2, label: r1.label },
      trip2: { co2: r2.co2, label: r2.label },
      winner: winner,
      difference: Math.abs(r1.co2 - r2.co2)
    };
  }
}

export default new CompareService();

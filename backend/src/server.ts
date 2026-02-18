import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

import calculatorService from './calculatorService.js';
import compareService from './compareService.js';
import historyService from './historyService.js';

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post('/api/calculate', (req: any, res: any) => {
  const { distance, transport, carType, passengers, country } = req.body;

  const result = calculatorService.calculate(
    distance,
    transport,
    carType,
    passengers,
    country
  );

  const trip = historyService.addTrip({
    distance,
    transport,
    carType,
    passengers,
    country,
    co2: result.co2,
    label: result.label
  });

  res.json({
    success: true,
    data: {
      co2: result.co2,
      label: result.label,
      id: trip.id
    }
  });
});

app.post('/api/compare', (req: any, res: any) => {
  const { trip1, trip2 } = req.body;

  const result = compareService.compare(trip1, trip2);

  res.json({
    success: true,
    ...result
  });
});

app.get('/api/history', (req: any, res: any) => {
  const history = historyService.getAll();
  res.json({
    success: true,
    data: history,
    count: history.length
  });
});

app.get('/api/stats', (req: any, res: any) => {
  const stats = historyService.getStats();
  res.json({
    success: true,
    ...stats
  });
});

export { app, calculatorService, compareService, historyService };

// ESM way to check if file is being run directly
const isMainModule = import.meta.url === `file://${process.argv[1]}`;

if (isMainModule) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

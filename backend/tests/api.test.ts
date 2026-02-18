// API tests with better names but still some issues
import { describe, it, expect, beforeEach } from 'vitest';
// @ts-ignore
import request from 'supertest';
import { app, historyService } from '../src/server.js';

describe('EcoTrip API', () => {
  // Clear history between tests
  beforeEach(() => {
    historyService.clear();
  });

  describe('POST /api/calculate', () => {
    it('should calculate CO2 for a bike trip', async () => {
      const response = await request(app)
        .post('/api/calculate')
        .send({
          distance: 10,
          transport: 'bike',
          carType: null,
          passengers: 1,
          country: null
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.co2).toBe(0);
      expect(response.body.data.label).toBe('GREEN');
    });

    it('should calculate CO2 for a thermal car trip', async () => {
      const response = await request(app)
        .post('/api/calculate')
        .send({
          distance: 100,
          transport: 'car',
          carType: 'thermal',
          passengers: 1,
          country: 'France'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.co2).toBe(19.2);
      expect(response.body.data.label).toBe('RED');
    });

    it('should divide CO2 by passengers for carpooling', async () => {
      const response = await request(app)
        .post('/api/calculate')
        .send({
          distance: 100,
          transport: 'car',
          carType: 'thermal',
          passengers: 4,
          country: 'France'
        });

      expect(response.status).toBe(200);
      expect(response.body.data.co2).toBe(4.8);
      expect(response.body.data.label).toBe('GREEN');
    });

    it('should save trip to history', async () => {
      await request(app)
        .post('/api/calculate')
        .send({
          distance: 50,
          transport: 'train',
          carType: null,
          passengers: 1,
          country: 'France'
        });

      const history = historyService.getAll();
      expect(history.length).toBe(1);
      expect(history[0].distance).toBe(50);
      expect(history[0].transport).toBe('train');
    });

    // Still missing: validation tests, error handling tests
  });

  describe('POST /api/compare', () => {
    it('should compare two trips and identify the greener option', async () => {
      const response = await request(app)
        .post('/api/compare')
        .send({
          trip1: {
            distance: 300,
            transport: 'car',
            carType: 'thermal',
            passengers: 1,
            country: 'France'
          },
          trip2: {
            distance: 300,
            transport: 'train',
            passengers: 1,
            country: 'France'
          }
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.winner).toBe('trip2');
      expect(response.body.trip1.co2).toBeGreaterThan(response.body.trip2.co2);
    });

    it('should calculate the CO2 difference between trips', async () => {
      const response = await request(app)
        .post('/api/compare')
        .send({
          trip1: {
            distance: 100,
            transport: 'bike',
            carType: null,
            passengers: 1,
            country: null
          },
          trip2: {
            distance: 100,
            transport: 'car',
            carType: 'thermal',
            passengers: 1,
            country: 'France'
          }
        });

      expect(response.status).toBe(200);
      expect(response.body.difference).toBe(19.2);
    });
  });

  describe('GET /api/history', () => {
    it('should return empty history initially', async () => {
      const response = await request(app).get('/api/history');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
      expect(response.body.count).toBe(0);
    });

    it('should return all saved trips', async () => {
      // Add some trips
      await request(app).post('/api/calculate').send({
        distance: 10,
        transport: 'bike',
        carType: null,
        passengers: 1,
        country: null
      });

      await request(app).post('/api/calculate').send({
        distance: 50,
        transport: 'train',
        carType: null,
        passengers: 1,
        country: 'France'
      });

      const response = await request(app).get('/api/history');

      expect(response.status).toBe(200);
      expect(response.body.count).toBe(2);
      expect(response.body.data.length).toBe(2);
    });
  });

  describe('GET /api/stats', () => {
    it('should return zero stats for empty history', async () => {
      const response = await request(app).get('/api/stats');

      expect(response.status).toBe(200);
      expect(response.body.totalTrips).toBe(0);
      expect(response.body.totalCO2).toBe(0);
      expect(response.body.averageCO2).toBe(0);
    });

    it('should calculate statistics from trip history', async () => {
      // Add trips with known CO2 values
      await request(app).post('/api/calculate').send({
        distance: 100,
        transport: 'car',
        carType: 'thermal',
        passengers: 1,
        country: 'France'
      }); // 19.2 kg

      await request(app).post('/api/calculate').send({
        distance: 10,
        transport: 'bike',
        carType: null,
        passengers: 1,
        country: null
      }); // 0 kg

      const response = await request(app).get('/api/stats');

      expect(response.status).toBe(200);
      expect(response.body.totalTrips).toBe(2);
      expect(response.body.totalCO2).toBe(19.2);
      expect(response.body.averageCO2).toBe(9.6);
    });
  });
});

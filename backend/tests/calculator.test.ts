import { describe, it, expect } from 'vitest';
import calculatorService from '../src/calculatorService.js';

describe('Calculator Service', () => {
  describe('Bike transport', () => {
    it('should return 0 CO2 for bike trips', () => {
      const result = calculatorService.calculate(10, 'bike', null, 1, null);

      expect(result.co2).toBe(0);
      expect(result.label).toBe('GREEN');
    });

    it('should return 0 CO2 for walking', () => {
      const result = calculatorService.calculate(5, 'walk', null, 1, null);

      expect(result.co2).toBe(0);
      expect(result.label).toBe('GREEN');
    });
  });

  describe('Car transport with thermal engine', () => {
    it('should calculate CO2 for thermal car with 1 passenger', () => {
      const result = calculatorService.calculate(100, 'car', 'thermal', 1, 'France');

      // Still using magic number in test - bad!
      expect(result.co2).toBe(19.2);
      expect(result.label).toBe('RED');
    });

    it('should divide CO2 by number of passengers', () => {
      const result = calculatorService.calculate(100, 'car', 'thermal', 4, 'France');

      expect(result.co2).toBe(4.8);
      expect(result.label).toBe('GREEN');
    });
  });

  describe('Car transport with electric engine', () => {
    it('should calculate lower CO2 for electric car in France', () => {
      const result = calculatorService.calculate(100, 'car', 'electric', 1, 'France');

      expect(result.co2).toBe(1.2);
      expect(result.label).toBe('GREEN');
    });

    it('should calculate higher CO2 for electric car in Poland', () => {
      const result = calculatorService.calculate(100, 'car', 'electric', 1, 'Poland');

      expect(result.co2).toBe(7.8);
      expect(result.label).toBe('ORANGE');
    });
  });

  describe('Train transport', () => {
    it('should calculate low CO2 for train in France', () => {
      const result = calculatorService.calculate(200, 'train', null, 1, 'France');

      expect(result.co2).toBe(0.64);
      expect(result.label).toBe('GREEN');
    });

    it('should calculate higher CO2 for train in Poland', () => {
      const result = calculatorService.calculate(200, 'train', null, 1, 'Poland');

      expect(result.co2).toBe(13.8);
      expect(result.label).toBe('ORANGE');
    });
  });

  describe('Bus transport', () => {
    it('should calculate CO2 for bus trips', () => {
      const result = calculatorService.calculate(100, 'bus', null, 1, null);

      expect(result.co2).toBe(10.4);
      expect(result.label).toBe('ORANGE');
    });
  });
});

import { test, expect } from '@playwright/test';

test.describe('EcoTrip Calculator - Calculate Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.title')).toContainText('EcoTrip Calculator');
  });

  test('should calculate CO2 for a bike trip', async ({ page }) => {
    await page.locator('#distance').fill('50');
    await page.locator('#transport').selectOption('bike');

    await page.locator('.button').filter({ hasText: 'Calculate' }).click();

    await expect(page.locator('#result')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('#resultCo2')).toContainText('CO2: 0.00 kg');
    await expect(page.locator('#resultLabel')).toBeVisible();
  });

  test('should calculate CO2 for a car trip with all options', async ({ page }) => {
    await page.locator('#transport').selectOption('car');

    await expect(page.locator('#carTypeSection')).toBeVisible();
    await expect(page.locator('#passengersSection')).toBeVisible();
    await expect(page.locator('#countrySection')).toBeVisible();

    await page.locator('#distance').fill('100');
    await page.locator('#carType').selectOption('thermal');
    await page.locator('#passengers').fill('2');
    await page.locator('#country').selectOption('France');

    await page.locator('.button').filter({ hasText: 'Calculate' }).click();

    const result = page.locator('#result');
    await expect(result).toBeVisible({ timeout: 10000 });

    const resultCo2 = page.locator('#resultCo2');
    const co2Text = await resultCo2.textContent();

    expect(co2Text).toMatch(/CO2: \d+\.\d+ kg/);

    const resultLabel = page.locator('#resultLabel');
    await expect(resultLabel).toBeVisible();
  });

  test('should show different emissions for electric vs thermal car', async ({ page }) => {
    await page.locator('#transport').selectOption('car');
    await page.locator('#distance').fill('100');
    await page.locator('#carType').selectOption('thermal');
    await page.locator('#passengers').fill('1');
    await page.locator('#country').selectOption('France');

    await page.locator('.button').filter({ hasText: 'Calculate' }).click();
    await expect(page.locator('#result')).toBeVisible({ timeout: 10000 });

    const thermalCo2Text = await page.locator('#resultCo2').textContent();

    await page.reload();
    await expect(page.locator('.title')).toContainText('EcoTrip Calculator');

    await page.locator('#transport').selectOption('car');
    await page.locator('#distance').fill('100');
    await page.locator('#carType').selectOption('electric');
    await page.locator('#passengers').fill('1');
    await page.locator('#country').selectOption('France');

    await page.locator('.button').filter({ hasText: 'Calculate' }).click();
    await expect(page.locator('#result')).toBeVisible({ timeout: 10000 });

    const electricCo2Text = await page.locator('#resultCo2').textContent();

    expect(thermalCo2Text).not.toBe(electricCo2Text);
  });

  test('should calculate CO2 for a train trip with country selection', async ({ page }) => {
    await page.locator('#transport').selectOption('train');

    await expect(page.locator('#countrySection')).toBeVisible();

    await page.locator('#distance').fill('200');
    await page.locator('#country').selectOption('France');

    await page.locator('.button').filter({ hasText: 'Calculate' }).click();

    const result = page.locator('#result');
    await expect(result).toBeVisible({ timeout: 10000 });

    const resultCo2 = page.locator('#resultCo2');
    await expect(resultCo2).toContainText('kg');

    const resultLabel = page.locator('#resultLabel');
    await expect(resultLabel).toBeVisible();
  });
});

import { test, expect } from '@playwright/test';

test.describe('EcoTrip Calculator - Compare Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.title')).toContainText('EcoTrip Calculator');
  });

  test('should display the compare section', async ({ page }) => {
    await expect(page.getByText('Compare Two Trips')).toBeVisible();

    await expect(page.locator('#distance1')).toBeVisible();
    await expect(page.locator('#transport1')).toBeVisible();

    await expect(page.locator('#distance2')).toBeVisible();
    await expect(page.locator('#transport2')).toBeVisible();

    await expect(page.locator('.button').filter({ hasText: 'Compare' })).toBeVisible();
  });

  test('should compare car vs bike and show bike is more ecological', async ({ page }) => {
    await page.locator('#distance1').fill('100');
    await page.locator('#transport1').selectOption('car');

    await page.locator('#distance2').fill('100');
    await page.locator('#transport2').selectOption('bike');

    await page.locator('.button').filter({ hasText: 'Compare' }).click();

    const compareResult = page.locator('#compareResult');
    await expect(compareResult).toBeVisible({ timeout: 10000 });

    const compareContent = page.locator('#compareContent');
    await expect(compareContent).toBeVisible();

    await expect(compareContent).toContainText('Trip 1:');
    await expect(compareContent).toContainText('kg CO2');

    await expect(compareContent).toContainText('Trip 2:');

    await expect(compareContent).toContainText('Trip 2 is more ecological!');
    await expect(compareContent).toContainText('Difference:');
  });

  test('should show equal emissions for identical trips', async ({ page }) => {
    await page.locator('#distance1').fill('50');
    await page.locator('#transport1').selectOption('bus');

    await page.locator('#distance2').fill('50');
    await page.locator('#transport2').selectOption('bus');

    await page.locator('.button').filter({ hasText: 'Compare' }).click();

    const compareResult = page.locator('#compareResult');
    await expect(compareResult).toBeVisible({ timeout: 10000 });

    const compareContent = page.locator('#compareContent');
    await expect(compareContent).toContainText('Both trips have equal CO2 emissions!');

    await expect(compareContent).toContainText('Difference: 0');
  });

  test('should handle comparison with zero-emission transport (bike)', async ({ page }) => {
    await page.locator('#distance1').fill('20');
    await page.locator('#transport1').selectOption('bike');

    await page.locator('#distance2').fill('20');
    await page.locator('#transport2').selectOption('walk');

    await page.locator('.button').filter({ hasText: 'Compare' }).click();

    const compareResult = page.locator('#compareResult');
    await expect(compareResult).toBeVisible({ timeout: 10000 });

    const compareContent = page.locator('#compareContent');
    await expect(compareContent).toContainText('Both trips have equal CO2 emissions!');
    await expect(compareContent).toContainText('0.00 kg CO2');
  });
});

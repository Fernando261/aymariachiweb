import { expect, test } from '@playwright/test';

for (const width of [390, 820]) {
  test(`el menú cubre la pantalla antes y después del scroll a ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 720 });
    await page.route('https://**', (route) => route.abort());
    await page.goto('/');
    const header = page.locator('.site-header');
    const menu = page.locator('#nav-principal');
    for (const scroll of [false, true]) {
      if (scroll) {
        await page.evaluate(() => window.scrollTo({ top: 480, behavior: 'instant' }));
        await expect(header).toHaveClass(/is-scrolled/);
      }
      await page.getByRole('button', { name: 'Abrir menú' }).click();
      await expect(menu).toBeVisible();
      const rect = await menu.boundingBox();
      const headerRect = await header.boundingBox();
      expect(rect?.y).toBeCloseTo(headerRect!.height, 0);
      expect(rect!.y + rect!.height).toBeCloseTo(720, 0);
      expect(rect?.width).toBe(width);
      await expect(menu).toHaveCSS('background-color', 'rgb(13, 10, 8)');
      await page.getByRole('button', { name: 'Cerrar menú' }).click();
      await expect(menu).toBeHidden();
    }
  });
}

test('el escritorio conserva los enlaces visibles al hacer scroll', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.route('https://**', (route) => route.abort());
  await page.goto('/');
  await page.evaluate(() => window.scrollTo({ top: 480, behavior: 'instant' }));
  await expect(page.locator('.site-header')).toHaveClass(/is-scrolled/);
  await expect(page.getByRole('button', { name: 'Abrir menú' })).toBeHidden();
  await expect(page.locator('#nav-principal').getByRole('link', { name: 'Opiniones' })).toBeVisible();
});

import { expect, test } from '@playwright/test';

for (const width of [320, 1440]) {
  test(`envío de reseña y listado público a ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.route('https://**', (route) => route.abort());
    await page.route('**/api/resenas', (route) => {
      if (route.request().method() === 'POST') {
        expect(route.request().postDataJSON()).toEqual({
          name: 'Ana', rating: 5, comment: 'Nos encantó la serenata.', consent: true,
        });
        return route.fulfill({ status: 201, json: { received: true } });
      }
      return route.fulfill({ json: {
        reviews: [{ id: 'public', name: 'Luis', rating: 4, comment: 'Excelente servicio.' }], nextCursor: null,
      } });
    });
    await page.goto('/#opiniones');
    const section = page.getByRole('region', { name: 'Opiniones de clientes.' });
    await expect(section.getByText('Excelente servicio.')).toBeVisible();
    await section.getByLabel('Tu nombre').fill('Ana');
    await section.getByRole('radio', { name: '5', exact: true }).check();
    await section.getByLabel('Tu comentario').fill('Nos encantó la serenata.');
    await section.getByRole('checkbox').check();
    await section.getByRole('button', { name: 'Enviar reseña' }).click();
    await expect(section.getByRole('status')).toContainText('Está pendiente de revisión.');
    await expect(section.getByText('Nos encantó la serenata.')).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

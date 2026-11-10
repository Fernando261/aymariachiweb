import { test, expect, type Page } from '@playwright/test';
import { categories } from '../src/config/mariachis';
import { fixtures } from './catalog-fixtures';

const catalog = (page: Page) => page.locator('.catalog');
async function fixtureCatalog(page: Page, number = '') {
  await page.route('**/src/config/mariachis.ts', (route) => route.fulfill({ contentType: 'text/javascript', body: `export const categories = ${JSON.stringify(categories)}; export const mariachis = ${JSON.stringify(fixtures)};` }));
  if (number) await page.route('**/src/config/site.ts', async (route) => {
    const response = await route.fetch();
    const body = (await response.text()).replace(/whatsappNumber:\s*(['"])\1/, `whatsappNumber: ${JSON.stringify(number)}`);
    await route.fulfill({ response, body });
  });
}
async function enterCategory(page: Page, label: string, keyboard = false) {
  const link = page.locator('.experience-card').filter({ has: page.getByRole('heading', { name: label, exact: true }) });
  if (keyboard) { await link.focus(); await page.keyboard.press('Enter'); } else await link.click();
  await expect(page.locator('#catalog-title')).toBeFocused();
  await expect(catalog(page).getByRole('button', { name: label, exact: true })).toHaveAttribute('aria-pressed', 'true');
}

test.beforeEach(async ({ page }) => { await page.route('https://**', (route) => route.abort()); });

for (const path of ['/', '/aymariachiweb/']) test(`build real: catálogo vacío y tres categorías ${path}`, async ({ page }) => {
  await page.goto(`http://127.0.0.1:${path === '/' ? 4181 : 4182}${path}`);
  for (const { label } of categories) {
    await enterCategory(page, label, true);
    await expect(catalog(page).getByText('Estamos preparando las opciones')).toBeVisible();
    await expect(catalog(page).getByRole('button', { name: /^Elegir Mariachi/ })).toHaveCount(0);
  }
  await expect(page.locator('.brand__logo')).toHaveJSProperty('naturalWidth', 1536);
});

for (const width of [320, 390, 1440]) test(`filtrado, cambio de grupo, resumen y WhatsApp ${width}px`, async ({ page }) => {
  await page.setViewportSize({ width, height: 900 });
  await fixtureCatalog(page, '5210000000000');
  await page.goto('/');
  const area = catalog(page);
  await enterCategory(page, 'Celebraciones', true);
  await expect(area.getByRole('button', { name: /^Elegir Mariachi/ })).toHaveCount(1);
  await expect(area.getByText('Mariachi #99', { exact: true })).toHaveCount(0);
  const specialFilter = area.getByRole('button', { name: 'Eventos especiales', exact: true });
  if (width < 900) await specialFilter.tap(); else await specialFilter.click();
  await expect(area.getByRole('button', { name: 'Elegir Mariachi #02', exact: true })).toBeVisible();
  await expect(area.getByRole('button', { name: 'Elegir Mariachi #01', exact: true })).toHaveCount(0);
  await area.getByRole('button', { name: 'Serenatas', exact: true }).click();
  await area.getByRole('button', { name: 'Elegir Mariachi #01', exact: true }).click();
  await expect(area.getByRole('heading', { name: 'Mariachi #01', exact: true })).toBeFocused();
  await expect(area.getByRole('button', { name: 'Enviar solicitud' })).toBeDisabled();
  await expect(area.getByLabel('Número de músicos').locator('option')).toHaveText(['Elige la cantidad', '3 músicos', '5 músicos']);
  await area.getByLabel('Número de músicos').selectOption('5');
  await area.getByLabel('Duración (opcional)').selectOption('60');
  await expect(area.locator('.catalog-summary')).toContainText('60 minutos');
  await area.screenshot({ path: `/tmp/w3-catalog-${width}.png` });
  const request = area.getByRole('link', { name: 'Enviar solicitud' });
  const url = new URL((await request.getAttribute('href'))!);
  expect(url.hostname).toBe('wa.me'); expect(url.pathname).toBe('/5210000000000');
  expect(url.searchParams.get('text')).toBe('¡Hola! Me gustaría solicitar una presentación de mariachi.\nCategoría: Serenatas\nMariachi: Mariachi #01 (TEST-01)\nMúsicos: 5\nDuración: 60 minutos\nQuisiera consultar disponibilidad y organizar los detalles.');
  // No se abre WhatsApp ni se envía ningún mensaje durante las pruebas.
  await area.getByRole('button', { name: 'Volver al listado' }).click();
  await expect(area.getByRole('button', { name: 'Elegir Mariachi #01', exact: true })).toBeFocused();
  await area.getByRole('button', { name: 'Elegir Mariachi #02', exact: true }).click();
  await expect(area.getByLabel('Número de músicos').locator('option')).toHaveText(['Elige la cantidad', '7 músicos']);
  await expect(area.getByLabel('Duración (opcional)')).toHaveCount(0);
  await expect(area.locator('.catalog-summary')).toContainText('Por elegir');
  await area.getByLabel('Número de músicos').selectOption('7');
  const noDuration = new URL((await area.getByRole('link', { name: 'Enviar solicitud' }).getAttribute('href'))!);
  expect(noDuration.searchParams.get('text')).not.toContain('Duración:');
  await area.getByRole('button', { name: 'Celebraciones', exact: true }).click();
  await area.getByRole('button', { name: 'Elegir Mariachi #01', exact: true }).click();
  await expect(area.getByLabel('Número de músicos')).toHaveValue('');
  await expect(area.getByLabel('Duración (opcional)')).toHaveValue('');
  await area.getByRole('button', { name: 'Todas', exact: true }).click();
  await area.getByRole('button', { name: 'Elegir Mariachi #01', exact: true }).click();
  await area.getByLabel('Número de músicos').selectOption('3');
  await expect(area.getByRole('button', { name: 'Enviar solicitud' })).toBeDisabled();
  await area.getByLabel('Tipo de ocasión').selectOption('celebraciones');
  await expect(area.getByRole('link', { name: 'Enviar solicitud' })).toBeVisible();
  await enterCategory(page, 'Serenatas', true);
  await area.getByRole('button', { name: 'Elegir Mariachi #01', exact: true }).click();
  await area.getByLabel('Número de músicos').selectOption('3');
  await enterCategory(page, 'Serenatas', true);
  await expect(area.getByRole('button', { name: 'Elegir Mariachi #01', exact: true })).toBeVisible();
  await expect(area.locator('.catalog-summary')).toHaveCount(0);
  await expect(page.locator('.contact-primary')).toHaveAttribute('href', /wa\.me\/5210000000000/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('sin número: solicitud deshabilitada y contacto existente conservado', async ({ page }) => {
  await fixtureCatalog(page);
  await page.goto('/');
  await enterCategory(page, 'Serenatas');
  await catalog(page).getByRole('button', { name: 'Elegir Mariachi #01', exact: true }).click();
  await catalog(page).getByLabel('Número de músicos').selectOption('3');
  await expect(catalog(page).getByRole('button', { name: 'Enviar solicitud' })).toBeDisabled();
  await expect(catalog(page).getByText('Las solicitudes por WhatsApp aún no están disponibles.', { exact: false })).toBeVisible();
  await expect(page.locator('a[href*="wa.me"]')).toHaveCount(0);
  await expect(page.locator('a[href="mailto:aymariachiparatodos@gmail.com"]')).toBeVisible();
});

test('teclado: filtros, selección y regreso al listado', async ({ page }) => {
  await fixtureCatalog(page);
  await page.goto('/');
  await enterCategory(page, 'Serenatas', true);
  const button = catalog(page).getByRole('button', { name: 'Celebraciones', exact: true });
  await button.focus(); await page.keyboard.press('Space');
  await expect(button).toHaveAttribute('aria-pressed', 'true');
  await catalog(page).getByRole('button', { name: 'Elegir Mariachi #01', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(catalog(page).getByRole('heading', { name: 'Mariachi #01', exact: true })).toBeFocused();
  await page.keyboard.press('Tab'); await page.keyboard.press('ArrowDown');
  await expect(catalog(page).getByLabel('Número de músicos')).toHaveValue('3');
  await catalog(page).getByRole('button', { name: 'Volver al listado' }).focus(); await page.keyboard.press('Enter');
  await expect(catalog(page).getByRole('button', { name: 'Elegir Mariachi #01', exact: true })).toBeFocused();
});

import { test, expect, type Page } from '@playwright/test';
import { demoMariachis } from '../src/config/demo-mariachis';
import { categories } from '../src/config/mariachis';
import { fixtures } from './catalog-fixtures';

const catalog = (page: Page) => page.locator('#guia .catalog');
async function fixtureCatalog(page: Page, number = '') {
  await page.route('**/src/config/mariachis.ts', (route) => route.fulfill({ contentType: 'text/javascript', body: `export const categories = ${JSON.stringify(categories)}; export const mariachis = ${JSON.stringify(fixtures)};` }));
  await fixtureWhatsApp(page, number);
}
async function fixtureWhatsApp(page: Page, number: string) {
  await page.route('**/src/config/site.ts', async (route) => {
    const response = await route.fetch();
    const body = (await response.text()).replace(/whatsappNumber:\s*(['"])\d*\1/, `whatsappNumber: ${JSON.stringify(number)}`);
    await route.fulfill({ response, body });
  });
}
async function fillEventDetails(page: Page, date = '2099-08-15') {
  const area = catalog(page);
  await area.getByLabel('Fecha del evento').fill(date);
  await area.getByLabel('Hora del evento (Guadalajara)').fill('19:30');
  await area.getByLabel('Municipio').selectOption('Zapopan');
  await area.getByLabel('Ubicación del evento').fill('Colonia Centro');
  await area.getByLabel('Zona del evento').selectOption('inside');
}
async function enterCategory(page: Page, label: string, keyboard = false) {
  const link = page.locator('.experience-card').filter({ has: page.getByRole('heading', { name: label, exact: true }) });
  if (keyboard) { await link.focus(); await page.keyboard.press('Enter'); } else await link.click();
  await expect(page.locator('#catalog-title')).toBeFocused();
  await expect(catalog(page).getByRole('button', { name: label, exact: true })).toHaveAttribute('aria-pressed', 'true');
}

test.beforeEach(async ({ page }) => { await page.route('https://**', (route) => route.abort()); });

for (const path of ['/', '/aymariachiweb/']) test(`build real: perfiles de ejemplo y trece categorías ${path}`, async ({ page }) => {
  await page.goto(`http://127.0.0.1:${path === '/' ? 4181 : 4182}${path}`);
  await expect(catalog(page).getByText('Perfiles de ejemplo', { exact: true })).toBeVisible();
  for (const [index, { id, label }] of categories.entries()) {
    if (index < 3) await enterCategory(page, label, true);
    else await catalog(page).getByRole('button', { name: label, exact: true }).click();
    const examples = demoMariachis.filter((mariachi) => mariachi.categories.includes(id));
    await expect(catalog(page).locator('.catalog-list h4')).toHaveText(examples.map(({ alias }) => alias));
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
  await expect(area.getByLabel('Servicio', { exact: true }).locator('option')).toHaveText(['Elige el servicio', 'Trío · $2,300 MXN', 'Quinteto · $3,300 MXN', 'Serenata y misa · 5 músicos · $3,800 MXN']);
  await area.getByLabel('Servicio', { exact: true }).selectOption('5');
  await fillEventDetails(page, '2000-01-01');
  await expect(area.getByRole('button', { name: 'Enviar solicitud' })).toBeDisabled();
  await fillEventDetails(page);
  await expect(area.locator('.catalog-summary')).toContainText('50 minutos');
  const request = area.getByRole('link', { name: 'Enviar solicitud' });
  const url = new URL((await request.getAttribute('href'))!);
  expect(url.hostname).toBe('wa.me'); expect(url.pathname).toBe('/5210000000000');
  expect(url.searchParams.get('text')).toBe([
    'Solicitud web · AYM-01',
    '🎺 *Ay! Mariachi Para Todos*',
    '¡Hola! Me gustaría solicitar mariachi para mi evento.',
    '',
    '🎶 *Servicio elegido*',
    'Categoría: Serenatas',
    'Mariachi: Mariachi #01 (TEST-01)',
    'Servicio: Quinteto',
    'Músicos: 5',
    'Duración: 50 minutos',
    '',
    '📍 *Datos del evento*',
    'Fecha: 2099-08-15',
    'Hora (Guadalajara): 19:30',
    'Municipio: Zapopan',
    'Ubicación: Colonia Centro',
    'Zona del evento: Dentro del Periférico',
    '',
    '💳 *Tarifa y depósito*',
    'Tarifa publicada: $3,300 MXN',
    'Depósito al confirmar: $500 MXN',
    '',
    '¿Me pueden confirmar la disponibilidad? ¡Gracias!',
  ].join('\n'));
  // No se abre WhatsApp ni se envía ningún mensaje durante las pruebas.
  await area.getByRole('button', { name: 'Volver al listado' }).click();
  await expect(area.getByRole('button', { name: 'Elegir Mariachi #01', exact: true })).toBeFocused();
  await area.getByRole('button', { name: 'Elegir Mariachi #02', exact: true }).click();
  await expect(area.getByLabel('Servicio', { exact: true }).locator('option')).toHaveText(['Elige el servicio', 'Sexteto · $3,800 MXN']);
  await expect(area.locator('.catalog-summary')).toContainText('Por elegir');
  await area.getByLabel('Servicio', { exact: true }).selectOption('6');
  await expect(area.getByRole('link', { name: 'Enviar solicitud' })).toBeVisible();
  await area.getByRole('button', { name: 'Celebraciones', exact: true }).click();
  await area.getByRole('button', { name: 'Elegir Mariachi #01', exact: true }).click();
  await expect(area.getByLabel('Servicio', { exact: true })).toHaveValue('');
  await area.getByRole('button', { name: 'Todas', exact: true }).click();
  await area.getByRole('button', { name: 'Elegir Mariachi #01', exact: true }).click();
  await area.getByLabel('Servicio', { exact: true }).selectOption('3');
  await expect(area.getByRole('button', { name: 'Enviar solicitud' })).toBeDisabled();
  await area.getByLabel('Tipo de ocasión').selectOption('celebraciones');
  await expect(area.getByRole('link', { name: 'Enviar solicitud' })).toBeVisible();
  await enterCategory(page, 'Serenatas', true);
  await area.getByRole('button', { name: 'Elegir Mariachi #01', exact: true }).click();
  await area.getByLabel('Servicio', { exact: true }).selectOption('3');
  await enterCategory(page, 'Serenatas', true);
  await expect(area.getByRole('button', { name: 'Elegir Mariachi #01', exact: true })).toBeVisible();
  await expect(area.locator('.catalog-summary')).toHaveCount(0);
  await expect(page.locator('.contact-primary')).toHaveAttribute('href', /wa\.me\/5210000000000/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('perfiles de ejemplo: WhatsApp prepara una consulta de disponibilidad', async ({ page }) => {
  await fixtureWhatsApp(page, '5210000000000');
  await page.goto('/');
  await enterCategory(page, 'Serenatas');
  const area = catalog(page);
  await area.getByRole('button', { name: 'Elegir Mariachi #01', exact: true }).click();
  await area.getByLabel('Servicio', { exact: true }).selectOption('4');
  await fillEventDetails(page);
  await area.getByLabel('Ubicación del evento').fill('   ');
  await expect(area.getByRole('button', { name: 'Enviar solicitud' })).toBeDisabled();
  await area.getByLabel('Ubicación del evento').fill('Colonia Centro');
  const request = area.getByRole('link', { name: 'Enviar solicitud' });
  const url = new URL((await request.getAttribute('href'))!);
  expect(url.hostname).toBe('wa.me');
  expect(url.pathname).toBe('/5210000000000');
  expect(url.searchParams.get('text')).toContain('Referencia ilustrativa: Mariachi #01 (ejemplo)');
  expect(url.searchParams.get('text')).toContain('Servicio: Cuarteto\nMúsicos: 4\nDuración: 50 minutos');
  expect(url.searchParams.get('text')).toContain('💳 *Tarifa y depósito*\nTarifa publicada: $2,800 MXN');
});

test('sin número: solicitud deshabilitada y contacto existente conservado', async ({ page }) => {
  await fixtureCatalog(page);
  await page.goto('/');
  await enterCategory(page, 'Serenatas');
  await catalog(page).getByRole('button', { name: 'Elegir Mariachi #01', exact: true }).click();
  await catalog(page).getByLabel('Servicio', { exact: true }).selectOption('3');
  await fillEventDetails(page);
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
  await expect(catalog(page).getByLabel('Servicio', { exact: true })).toHaveValue('3');
  await catalog(page).getByRole('button', { name: 'Volver al listado' }).focus(); await page.keyboard.press('Enter');
  await expect(catalog(page).getByRole('button', { name: 'Elegir Mariachi #01', exact: true })).toBeFocused();
});

test('Serenata y misa fuera del Periférico aplica el mínimo y deja el total por cotizar', async ({ page }) => {
  await page.goto('/');
  const area = catalog(page);
  await area.getByRole('button', { name: 'Misas', exact: true }).click();
  await area.getByRole('button', { name: 'Elegir Mariachi #01', exact: true }).click();
  await area.getByLabel('Servicio', { exact: true }).selectOption('serenata-misa');
  await fillEventDetails(page);
  await area.getByLabel('Zona del evento').selectOption('outside');
  const summary = area.locator('.catalog-summary');
  await expect(summary).toContainText('Serenata y misa · 5 músicos');
  await expect(summary).toContainText('2 horas (mínimo)');
  await expect(summary).toContainText('$3,800 MXN');
  await expect(summary).toContainText('Por cotizar');
  const url = new URL((await area.getByRole('link', { name: 'Enviar solicitud' }).getAttribute('href'))!);
  expect(url.pathname).toBe('/523348265069');
  expect(url.searchParams.get('text')).toContain('Duración: 2 horas (mínimo)');
  expect(url.searchParams.get('text')).toContain('💳 *Tarifa y depósito*\nTarifa publicada: $3,800 MXN\nTotal del servicio: por cotizar\nDepósito al confirmar: $500 MXN');
  await area.getByRole('button', { name: 'Celebraciones', exact: true }).click();
  await area.getByRole('button', { name: 'Elegir Mariachi #01', exact: true }).click();
  await expect(area.getByLabel('Servicio', { exact: true }).locator('option[value="serenata-misa"]')).toHaveCount(0);
  await expect(area.getByRole('button', { name: 'Enviar solicitud' })).toBeDisabled();
});

for (const width of [320, 1440]) {
  test(`solicitud de ingreso de mariachi desde la navegación a ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    if (width === 320) await page.getByRole('button', { name: 'Abrir menú' }).click();
    await page.getByRole('navigation', { name: 'Navegación principal' }).getByRole('link', { name: 'Únete', exact: true }).click();
    await expect(page).toHaveURL(/#unete$/);
    if (width === 320) await expect(page.getByRole('button', { name: 'Abrir menú' })).toHaveAttribute('aria-expanded', 'false');

    const section = page.getByRole('region', { name: 'Únete con tu mariachi.' });
    const name = section.getByLabel('Nombre del grupo');
    const count = section.getByLabel('Cantidad de elementos');
    const submit = 'Enviar solicitud para unirme';
    await expect(section.getByRole('button', { name: submit })).toBeDisabled();
    await name.fill('   ');
    await count.fill('7');
    await expect(section.getByRole('button', { name: submit })).toBeDisabled();
    await name.fill('  Mariachi Sol & Luna  ');
    for (const invalid of ['0', '-2', '2.5']) {
      await count.fill(invalid);
      await expect(section.getByRole('button', { name: submit })).toBeDisabled();
    }
    await count.fill('7');
    const link = section.getByRole('link', { name: submit });
    const url = new URL((await link.getAttribute('href'))!);
    expect(url.origin).toBe('https://wa.me');
    expect(url.pathname).toBe('/523348265069');
    expect(url.searchParams.get('text')).toBe([
      'Solicitud de grupo · AYM-02',
      '🎺 *Ay! Mariachi Para Todos*',
      '¡Hola! Queremos unir nuestro mariachi al catálogo.',
      '',
      '🎶 *Datos del grupo*',
      'Nombre del grupo: Mariachi Sol & Luna',
      'Cantidad de elementos: 7',
      '',
      '📎 *Datos que compartiremos en este chat*',
      '• Número de tarjeta o CLABE para recibir pagos',
      '• Foto formal del grupo completo',
      '• Video del grupo completo tocando en vivo',
      '',
      '¿Nos pueden indicar el siguiente paso para completar la solicitud? ¡Gracias!',
    ].join('\n'));
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

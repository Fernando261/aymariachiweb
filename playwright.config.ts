import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  workers: 2,
  use: {
    baseURL: 'http://127.0.0.1:4180',
    reducedMotion: 'reduce',
    hasTouch: true,
    launchOptions: { executablePath: process.env.CHROMIUM_PATH || undefined, args: ['--no-sandbox'] },
  },
  webServer: [
    { command: 'npm run dev -- --port 4180 --strictPort', url: 'http://127.0.0.1:4180', reuseExistingServer: !process.env.CI },
    { command: 'npm run preview -- --base /aymariachiweb/ --port 4182 --strictPort', url: 'http://127.0.0.1:4182/aymariachiweb/', reuseExistingServer: !process.env.CI },
    { command: 'npm run preview -- --port 4181 --strictPort', url: 'http://127.0.0.1:4181', reuseExistingServer: !process.env.CI },
  ],
});

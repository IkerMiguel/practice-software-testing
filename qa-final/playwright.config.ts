import { defineConfig, devices } from '@playwright/test';
import { TARGET, BASE_URL, API_URL } from './config/env';

/**
 * Configuración propia de qa-final (independiente del playwright.config.ts de la raíz).
 * Cada TARGET escribe su reporte y sus artefactos en carpetas separadas, para que la
 * evidencia de sprint5 y la de with-bugs no se sobrescriban.
 */
export default defineConfig({
  testDir: './tests',
  // La BD es compartida y algunos casos cambian estado (p. ej. bloqueo de cuenta):
  // se ejecuta en serie para que los resultados sean reproducibles.
  fullyParallel: false,
  workers: 1,
  // Sin reintentos: un FAIL debe quedar registrado tal como ocurrió.
  retries: 0,
  forbidOnly: !!process.env.CI,
  timeout: 60_000,
  expect: { timeout: 10_000 },

  outputDir: `test-results/${TARGET}`,
  reporter: [
    ['list'],
    ['html', { outputFolder: `reports/${TARGET}/html`, open: 'never' }],
    ['json', { outputFile: `reports/${TARGET}/results.json` }],
  ],
  metadata: { target: TARGET, baseURL: BASE_URL, apiURL: API_URL },

  use: {
    testIdAttribute: 'data-test',
    baseURL: BASE_URL,
    screenshot: 'on',
    trace: 'on',
    video: 'retain-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },

  projects: [
    {
      // Casos de interfaz (caja negra) en Chromium.
      name: 'ui',
      testMatch: ['ui/**/*.spec.ts'],
      use: { ...devices['Desktop Chrome'], baseURL: BASE_URL },
    },
    {
      // Casos de API (caja blanca con la fixture `request`): baseURL apunta a la API.
      name: 'api',
      testMatch: ['api/**/*.spec.ts'],
      use: { baseURL: API_URL, extraHTTPHeaders: { Accept: 'application/json' } },
    },
  ],
});

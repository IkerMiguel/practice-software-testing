import { test, expect } from '@playwright/test';
import { API_URL } from '../../config/env';

/**
 * ENV-000: verificación del entorno (Fase 1). NO es uno de los 10 casos del examen;
 * solo confirma que la UI y la API del TARGET elegido responden antes de ejecutar la suite.
 */
test.describe('ENV-000 Verificación del entorno', { tag: '@smoke' }, () => {
  test('ENV-000a API /status responde 200 con la versión de la aplicación', async ({ request }) => {
    const response = await request.get(`${API_URL}/status`);

    // Esperado: la API responde HTTP 200 (ruta GET /status en <sprint>/API/routes/api.php)
    expect(response.status()).toBe(200);
    // Esperado: el cuerpo JSON incluye la clave "version"
    expect(await response.json()).toHaveProperty('version');
  });

  test('ENV-000b la página de inicio carga el catálogo y el enlace Sign in', async ({ page }) => {
    await page.goto('/');

    // Esperado: el menú muestra el enlace de inicio de sesión (data-test="nav-sign-in")
    await expect(page.getByTestId('nav-sign-in')).toBeVisible();
    // Esperado: el catálogo muestra al menos un producto (data-test="product-name"), lo que prueba que la UI obtuvo datos de la API
    await expect(page.getByTestId('product-name').first()).toBeVisible();
  });
});

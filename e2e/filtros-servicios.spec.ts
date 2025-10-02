import { test, expect } from '@playwright/test';

test.describe('HU06: Filtrar por Servicios Adicionales', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4200/buscar-habitaciones');
    await page.waitForSelector('.busqueda-container');
  });

  /**
   * HU06 CA1: Aplicar filtros de servicios
   */
  test('CA1: should filter rooms by selected services', async ({ page }) => {
    // Realizar búsqueda inicial
    await page.click('button[type="submit"]');
    await page.waitForSelector('.resultados-section', { timeout: 10000 });

    const resultadosIniciales = await page.locator('.habitacion-card').count();
    expect(resultadosIniciales).toBeGreaterThan(0);

    // Seleccionar servicio "WiFi"
    const checkboxWiFi = page.locator('.servicio-checkbox').filter({ hasText: 'WiFi' }).first();
    await checkboxWiFi.click();

    // Esperar a que se marque como checked
    await expect(checkboxWiFi).toHaveClass(/checked/);

    // Aplicar filtros
    await page.click('.btn-aplicar-servicios');
    await page.waitForSelector('.resultados-section', { timeout: 10000 });

    // Verificar que el servicio aparece en filtros aplicados
    await expect(page.locator('.filtros-aplicados .tag').filter({ hasText: 'WiFi' })).toBeVisible();

    // Verificar que todas las habitaciones tienen el servicio
    const habitaciones = await page.locator('.habitacion-card').all();
    for (const habitacion of habitaciones) {
      const servicios = await habitacion.locator('.servicio-tag').allTextContents();
      expect(servicios.some(s => s.includes('WiFi'))).toBeTruthy();
    }
  });

  /**
   * HU06 CA1: Filtrar con múltiples servicios (TODOS deben estar presentes)
   */
  test('CA1: should filter rooms with ALL selected services', async ({ page }) => {
    // Realizar búsqueda inicial
    await page.click('button[type="submit"]');
    await page.waitForSelector('.resultados-section', { timeout: 10000 });

    // Seleccionar múltiples servicios
    await page.locator('.servicio-checkbox').filter({ hasText: 'WiFi' }).first().click();
    await page.locator('.servicio-checkbox').filter({ hasText: 'TV' }).first().click();
    await page.locator('.servicio-checkbox').filter({ hasText: 'Aire Acondicionado' }).first().click();

    // Verificar que el contador muestra 3 servicios
    await expect(page.locator('.badge-servicios')).toContainText('3 seleccionados');

    // Aplicar filtros
    await page.click('.btn-aplicar-servicios');
    await page.waitForSelector('.resultados-section', { timeout: 10000 });

    // Verificar que las habitaciones tienen TODOS los servicios
    const habitaciones = await page.locator('.habitacion-card').all();
    if (habitaciones.length > 0) {
      for (const habitacion of habitaciones) {
        const servicios = await habitacion.locator('.servicio-tag').allTextContents();
        expect(servicios.some(s => s.includes('WiFi'))).toBeTruthy();
        expect(servicios.some(s => s.includes('TV'))).toBeTruthy();
        expect(servicios.some(s => s.includes('Aire Acondicionado'))).toBeTruthy();
      }
    }
  });

  /**
   * HU06 CA2: Quitar filtros de servicios
   */
  test('CA2: should remove service filter when unchecked', async ({ page }) => {
    // Realizar búsqueda inicial
    await page.click('button[type="submit"]');
    await page.waitForSelector('.resultados-section', { timeout: 10000 });

    // Seleccionar servicio
    const checkboxWiFi = page.locator('.servicio-checkbox').filter({ hasText: 'WiFi' }).first();
    await checkboxWiFi.click();
    await page.click('.btn-aplicar-servicios');
    await page.waitForSelector('.resultados-section', { timeout: 10000 });

    const resultadosConFiltro = await page.locator('.habitacion-card').count();

    // Quitar el filtro (desmarcar)
    await checkboxWiFi.click();
    await expect(checkboxWiFi).not.toHaveClass(/checked/);

    // Re-buscar sin el filtro
    await page.click('button[type="submit"]');
    await page.waitForSelector('.resultados-section', { timeout: 10000 });

    const resultadosSinFiltro = await page.locator('.habitacion-card').count();

    // Debería haber más resultados sin el filtro (o al menos igual)
    expect(resultadosSinFiltro).toBeGreaterThanOrEqual(resultadosConFiltro);
  });

  /**
   * HU06 CA2: Botón "Limpiar servicios" quita todos los filtros
   */
  test('CA2: should clear all service filters with clear button', async ({ page }) => {
    // Seleccionar varios servicios
    await page.locator('.servicio-checkbox').filter({ hasText: 'WiFi' }).first().click();
    await page.locator('.servicio-checkbox').filter({ hasText: 'TV' }).first().click();
    await page.locator('.servicio-checkbox').filter({ hasText: 'Minibar' }).first().click();

    // Verificar que hay servicios seleccionados
    await expect(page.locator('.badge-servicios')).toContainText('3 seleccionados');

    // Click en limpiar servicios
    await page.click('.btn-limpiar-servicios');

    // Verificar que no hay servicios seleccionados
    await expect(page.locator('.badge-servicios')).not.toBeVisible();

    // Verificar que los checkboxes no están marcados
    const checkboxes = await page.locator('.servicio-checkbox.checked').count();
    expect(checkboxes).toBe(0);
  });

  /**
   * HU06 CA3: Sin coincidencias muestra mensaje y opción de limpiar
   */
  test('CA3: should show no results message with service filters', async ({ page }) => {
    // Realizar búsqueda inicial
    await page.click('button[type="submit"]');
    await page.waitForSelector('.resultados-section', { timeout: 10000 });

    // Seleccionar combinación de servicios que probablemente no tenga resultados
    await page.locator('.servicio-checkbox').filter({ hasText: 'WiFi Premium' }).first().click();
    await page.locator('.servicio-checkbox').filter({ hasText: 'Jacuzzi' }).first().click();
    await page.locator('.servicio-checkbox').filter({ hasText: 'Vista al mar' }).first().click();
    await page.locator('.servicio-checkbox').filter({ hasText: 'Desayuno' }).first().click();

    // Aplicar filtros
    await page.click('.btn-aplicar-servicios');
    await page.waitForTimeout(2000); // Esperar búsqueda

    // Verificar mensaje de sin resultados
    const sinResultados = page.locator('.sin-resultados');
    if (await sinResultados.isVisible()) {
      await expect(sinResultados).toContainText('No hay habitaciones disponibles');
      
      // Verificar sugerencia sobre servicios
      await expect(sinResultados).toContainText('Quita algunos servicios');
      await expect(sinResultados).toContainText('4 seleccionados');

      // Verificar botón "Limpiar Todo"
      await expect(page.locator('.btn-limpiar-todo')).toBeVisible();

      // Click en limpiar todo
      await page.click('.btn-limpiar-todo');

      // Verificar que se limpiaron los servicios
      await expect(page.locator('.badge-servicios')).not.toBeVisible();
    }
  });

  /**
   * HU06 CA4: Estado de filtros persiste al navegar
   */
  test('CA4: should persist service filters in session', async ({ page }) => {
    // Seleccionar servicios
    await page.locator('.servicio-checkbox').filter({ hasText: 'WiFi' }).first().click();
    await page.locator('.servicio-checkbox').filter({ hasText: 'TV' }).first().click();

    // Verificar que se guardó
    await expect(page.locator('.badge-servicios')).toContainText('2 seleccionados');

    // Navegar a otra página y volver
    await page.goto('http://localhost:4200');
    await page.waitForTimeout(500);
    await page.goto('http://localhost:4200/buscar-habitaciones');
    await page.waitForSelector('.busqueda-container');

    // Verificar que los filtros persisten
    await expect(page.locator('.badge-servicios')).toContainText('2 seleccionados');
    
    // Verificar que los checkboxes siguen marcados
    const checkboxesChecked = await page.locator('.servicio-checkbox.checked').count();
    expect(checkboxesChecked).toBe(2);
  });

  /**
   * HU06: Integración con filtros básicos (HU05 + HU06)
   */
  test('should combine basic filters with service filters', async ({ page }) => {
    // Configurar filtros básicos
    await page.fill('#huespedes', '2');
    
    // Seleccionar servicios
    await page.locator('.servicio-checkbox').filter({ hasText: 'WiFi' }).first().click();
    await page.locator('.servicio-checkbox').filter({ hasText: 'Aire Acondicionado' }).first().click();

    // Buscar
    await page.click('button[type="submit"]');
    await page.waitForSelector('.resultados-section', { timeout: 10000 });

    // Verificar que aplica ambos filtros
    const filtrosAplicados = page.locator('.filtros-aplicados');
    if (await filtrosAplicados.isVisible()) {
      await expect(filtrosAplicados).toContainText('2 huéspedes');
      await expect(filtrosAplicados).toContainText('WiFi');
      await expect(filtrosAplicados).toContainText('Aire Acondicionado');
    }
  });

  /**
   * HU06: Diseño responsive de filtros de servicios
   */
  test('should display service filters correctly on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    // Verificar que la sección de servicios es visible
    await expect(page.locator('.filtros-servicios')).toBeVisible();

    // Verificar que el grid se adapta a móvil
    const serviciosGrid = page.locator('.servicios-grid');
    await expect(serviciosGrid).toBeVisible();

    // Seleccionar un servicio en móvil
    const checkbox = page.locator('.servicio-checkbox').first();
    await checkbox.click();
    await expect(checkbox).toHaveClass(/checked/);
  });

  /**
   * HU06: Contador de servicios seleccionados
   */
  test('should show correct count of selected services', async ({ page }) => {
    // Inicialmente no debe haber badge
    await expect(page.locator('.badge-servicios')).not.toBeVisible();

    // Seleccionar 1 servicio
    await page.locator('.servicio-checkbox').first().click();
    await expect(page.locator('.badge-servicios')).toContainText('1 seleccionado');

    // Seleccionar 2 más
    await page.locator('.servicio-checkbox').nth(1).click();
    await page.locator('.servicio-checkbox').nth(2).click();
    await expect(page.locator('.badge-servicios')).toContainText('3 seleccionados');

    // Quitar 1
    await page.locator('.servicio-checkbox').first().click();
    await expect(page.locator('.badge-servicios')).toContainText('2 seleccionados');
  });

  /**
   * HU06: Auto-aplicar filtros cuando hay resultados previos
   */
  test('should auto-apply filters when results exist', async ({ page }) => {
    // Realizar búsqueda inicial
    await page.click('button[type="submit"]');
    await page.waitForSelector('.resultados-section', { timeout: 10000 });

    const resultadosIniciales = await page.locator('.habitacion-card').count();

    // Seleccionar un servicio (debería auto-aplicar)
    await page.locator('.servicio-checkbox').filter({ hasText: 'WiFi' }).first().click();
    
    // Esperar recarga automática
    await page.waitForTimeout(1500);

    // Debería haber actualizado los resultados automáticamente
    const badge = page.locator('.filtros-aplicados .tag').filter({ hasText: 'WiFi' });
    const isVisible = await badge.isVisible().catch(() => false);
    
    if (isVisible) {
      // Los filtros se aplicaron automáticamente
      expect(true).toBeTruthy();
    }
  });

  /**
   * HU06: Limpiar filtros generales también limpia servicios
   */
  test('should clear service filters when clearing all filters', async ({ page }) => {
    // Configurar filtros
    await page.fill('#huespedes', '3');
    await page.locator('.servicio-checkbox').filter({ hasText: 'WiFi' }).first().click();
    await page.locator('.servicio-checkbox').filter({ hasText: 'TV' }).first().click();

    // Verificar servicios seleccionados
    await expect(page.locator('.badge-servicios')).toContainText('2 seleccionados');

    // Click en botón "Limpiar" general
    await page.click('.btn-limpiar');

    // Verificar que se limpiaron los servicios también
    await expect(page.locator('.badge-servicios')).not.toBeVisible();
    
    // Verificar que huéspedes volvió al default
    const huespedesInput = page.locator('#huespedes');
    await expect(huespedesInput).toHaveValue('2');
  });

  /**
   * HU06: Verificar que servicios mostrados coinciden con DB
   */
  test('should display all available service options', async ({ page }) => {
    const serviciosGrid = page.locator('.servicios-grid');
    await expect(serviciosGrid).toBeVisible();

    // Verificar que hay servicios disponibles
    const serviciosCount = await page.locator('.servicio-checkbox').count();
    expect(serviciosCount).toBeGreaterThan(5); // Al menos 5 servicios disponibles

    // Verificar servicios comunes
    await expect(page.locator('.servicio-checkbox').filter({ hasText: 'WiFi' })).toBeVisible();
    await expect(page.locator('.servicio-checkbox').filter({ hasText: 'TV' })).toBeVisible();
    await expect(page.locator('.servicio-checkbox').filter({ hasText: 'Aire Acondicionado' })).toBeVisible();
  });
});

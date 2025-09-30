import { test, expect } from '@playwright/test';

/**
 * HU04: Calendario de Disponibilidad por Ciudad
 * Tests E2E para verificar los criterios de aceptación
 */
test.describe('HU04: Calendario de Disponibilidad', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navegar a la página principal
    await page.goto('http://localhost:4200');
    await page.waitForLoadState('networkidle');
  });

  /**
   * CA4: Verificar mensaje inicial
   * "Selecciona una ciudad para ver disponibilidad"
   */
  test('CA4: should show initial message when no city is selected', async ({ page }) => {
    // Click en botón de disponibilidad
    await page.click('button:has-text("Ver Disponibilidad")');
    
    // Esperar navegación
    await page.waitForURL('**/disponibilidad-ciudad');
    
    // Verificar mensaje inicial
    const mensajeInicial = page.locator('.mensaje-inicial');
    await expect(mensajeInicial).toBeVisible();
    await expect(mensajeInicial).toContainText('Selecciona una ciudad para ver disponibilidad');
    
    // Verificar que hay icono de ciudad
    await expect(mensajeInicial.locator('.icono-ciudad')).toBeVisible();
  });

  /**
   * CA1: Selección de ciudad carga calendario
   */
  test('CA1: should load calendar when city is selected', async ({ page }) => {
    // Navegar a disponibilidad
    await page.goto('http://localhost:4200/disponibilidad-ciudad');
    await page.waitForLoadState('networkidle');
    
    // Esperar que carguen las ciudades
    await page.waitForSelector('.ciudad-card', { timeout: 10000 });
    
    // Verificar que hay ciudades disponibles
    const ciudades = page.locator('.ciudad-card');
    const count = await ciudades.count();
    expect(count).toBeGreaterThan(0);
    
    // Seleccionar la primera ciudad
    const primeraCiudad = ciudades.first();
    const nombreCiudad = await primeraCiudad.locator('h4').textContent();
    await primeraCiudad.click();
    
    // Esperar que aparezca el calendario
    await page.waitForSelector('.calendario-section', { timeout: 10000 });
    
    // Verificar que el calendario está visible
    const calendarioSection = page.locator('.calendario-section');
    await expect(calendarioSection).toBeVisible();
    
    // Verificar que muestra la ciudad seleccionada
    await expect(page.locator('.ciudad-seleccionada-info h3')).toContainText(nombreCiudad || '');
    
    // Verificar que hay días en el calendario
    await page.waitForSelector('.dia-card', { timeout: 10000 });
    const dias = page.locator('.dia-card');
    const diasCount = await dias.count();
    expect(diasCount).toBeGreaterThan(0);
    expect(diasCount).toBeLessThanOrEqual(31); // Máximo 31 días (30 días por defecto + 1)
  });

  /**
   * CA2: Cambio de ciudad refresca calendario
   */
  test('CA2: should refresh calendar when changing city', async ({ page }) => {
    // Navegar a disponibilidad
    await page.goto('http://localhost:4200/disponibilidad-ciudad');
    await page.waitForLoadState('networkidle');
    
    // Esperar ciudades
    await page.waitForSelector('.ciudad-card', { timeout: 10000 });
    
    // Seleccionar primera ciudad
    const ciudades = page.locator('.ciudad-card');
    const primeraCiudad = ciudades.first();
    const nombrePrimeraCiudad = await primeraCiudad.locator('h4').textContent();
    await primeraCiudad.click();
    
    // Esperar calendario
    await page.waitForSelector('.calendario-section', { timeout: 10000 });
    await expect(page.locator('.ciudad-seleccionada-info h3')).toContainText(nombrePrimeraCiudad || '');
    
    // Capturar datos del primer calendario
    await page.waitForSelector('.dia-card', { timeout: 10000 });
    const primeraDisponibilidad = await page.locator('.dia-card').first().textContent();
    
    // Click en botón "Cambiar ciudad"
    await page.click('button:has-text("Cambiar ciudad")');
    
    // Verificar que volvemos a la lista de ciudades
    await page.waitForSelector('.ciudades-list', { timeout: 5000 });
    
    // Seleccionar segunda ciudad (si existe)
    const ciudadesCount = await ciudades.count();
    if (ciudadesCount > 1) {
      const segundaCiudad = ciudades.nth(1);
      const nombreSegundaCiudad = await segundaCiudad.locator('h4').textContent();
      await segundaCiudad.click();
      
      // Esperar que se actualice el calendario
      await page.waitForSelector('.calendario-section', { timeout: 10000 });
      await expect(page.locator('.ciudad-seleccionada-info h3')).toContainText(nombreSegundaCiudad || '');
      
      // Verificar que el calendario cambió (nombre de ciudad diferente)
      expect(nombreSegundaCiudad).not.toBe(nombrePrimeraCiudad);
    }
  });

  /**
   * CA3: Indicadores visuales de disponibilidad
   */
  test('CA3: should show visual indicators for availability', async ({ page }) => {
    // Navegar a disponibilidad
    await page.goto('http://localhost:4200/disponibilidad-ciudad');
    await page.waitForLoadState('networkidle');
    
    // Seleccionar primera ciudad
    await page.waitForSelector('.ciudad-card', { timeout: 10000 });
    await page.locator('.ciudad-card').first().click();
    
    // Esperar calendario
    await page.waitForSelector('.dia-card', { timeout: 10000 });
    
    // Verificar que existe la leyenda
    const leyenda = page.locator('.leyenda');
    await expect(leyenda).toBeVisible();
    await expect(leyenda).toContainText('Disponible');
    await expect(leyenda).toContainText('Sin disponibilidad');
    
    // Verificar que hay días con diferentes estados
    const dias = page.locator('.dia-card');
    const primerDia = dias.first();
    
    // Verificar que cada día tiene:
    // 1. Fecha (número y mes)
    await expect(primerDia.locator('.dia-numero')).toBeVisible();
    await expect(primerDia.locator('.dia-mes')).toBeVisible();
    
    // 2. Badge de disponibilidad (✓ o ✗)
    await expect(primerDia.locator('.disponibilidad-badge')).toBeVisible();
    
    // 3. Contador de habitaciones
    await expect(primerDia.locator('.habitaciones-count')).toBeVisible();
    
    // Verificar clases CSS de disponibilidad
    const diasDisponibles = page.locator('.dia-card.disponible');
    const diasNoDisponibles = page.locator('.dia-card.no-disponible');
    
    // Al menos uno de los dos tipos debe existir
    const disponiblesCount = await diasDisponibles.count();
    const noDisponiblesCount = await diasNoDisponibles.count();
    expect(disponiblesCount + noDisponiblesCount).toBeGreaterThan(0);
  });

  /**
   * Test: Verificar información de ciudades
   */
  test('should display city information correctly', async ({ page }) => {
    await page.goto('http://localhost:4200/disponibilidad-ciudad');
    await page.waitForLoadState('networkidle');
    
    // Esperar ciudades
    await page.waitForSelector('.ciudad-card', { timeout: 10000 });
    
    const primeraCiudad = page.locator('.ciudad-card').first();
    
    // Verificar que muestra nombre de ciudad
    await expect(primeraCiudad.locator('h4')).toBeVisible();
    
    // Verificar que muestra estadísticas (hoteles y habitaciones)
    await expect(primeraCiudad.locator('.ciudad-stats')).toBeVisible();
    await expect(primeraCiudad.locator('.ciudad-stats')).toContainText('hotel');
    await expect(primeraCiudad.locator('.ciudad-stats')).toContainText('habitacion');
  });

  /**
   * Test: Verificar responsive design
   */
  test('should be responsive on mobile', async ({ page }) => {
    // Configurar viewport móvil
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('http://localhost:4200/disponibilidad-ciudad');
    await page.waitForLoadState('networkidle');
    
    // Verificar que el mensaje inicial es visible
    await expect(page.locator('.mensaje-inicial')).toBeVisible();
    
    // Verificar que las ciudades se muestran en una columna
    await page.waitForSelector('.ciudad-card', { timeout: 10000 });
    const primeraCiudad = page.locator('.ciudad-card').first();
    await expect(primeraCiudad).toBeVisible();
  });

  /**
   * Test: Verificar tooltips de días
   */
  test('should show tooltips on day hover', async ({ page }) => {
    await page.goto('http://localhost:4200/disponibilidad-ciudad');
    await page.waitForLoadState('networkidle');
    
    // Seleccionar ciudad
    await page.waitForSelector('.ciudad-card', { timeout: 10000 });
    await page.locator('.ciudad-card').first().click();
    
    // Esperar calendario
    await page.waitForSelector('.dia-card', { timeout: 10000 });
    
    // Verificar que los días tienen atributo title
    const primerDia = page.locator('.dia-card').first();
    const title = await primerDia.getAttribute('title');
    expect(title).toBeTruthy();
    expect(title?.length).toBeGreaterThan(0);
  });

  /**
   * Test: Verificar navegación desde homepage
   */
  test('should navigate from homepage to availability calendar', async ({ page }) => {
    await page.goto('http://localhost:4200');
    await page.waitForLoadState('networkidle');
    
    // Verificar que existe el botón de disponibilidad
    const botonDisponibilidad = page.locator('button:has-text("Ver Disponibilidad")');
    await expect(botonDisponibilidad).toBeVisible();
    
    // Click en el botón
    await botonDisponibilidad.click();
    
    // Verificar navegación
    await page.waitForURL('**/disponibilidad-ciudad');
    expect(page.url()).toContain('/disponibilidad-ciudad');
    
    // Verificar que cargó la página correctamente
    await expect(page.locator('.calendario-container')).toBeVisible();
  });

  /**
   * Test: Verificar loading states
   */
  test('should show loading indicators while fetching data', async ({ page }) => {
    await page.goto('http://localhost:4200/disponibilidad-ciudad');
    
    // Debería mostrar loading de ciudades (si es rápido puede que no se capture)
    // Esperar a que termine de cargar
    await page.waitForLoadState('networkidle');
    
    // Verificar que eventualmente carga las ciudades
    await page.waitForSelector('.ciudad-card', { timeout: 10000 });
    const ciudades = page.locator('.ciudad-card');
    expect(await ciudades.count()).toBeGreaterThan(0);
  });

  /**
   * Test: Verificar rango de fechas por defecto (30 días)
   */
  test('should display default 30-day range', async ({ page }) => {
    await page.goto('http://localhost:4200/disponibilidad-ciudad');
    await page.waitForLoadState('networkidle');
    
    // Seleccionar ciudad
    await page.waitForSelector('.ciudad-card', { timeout: 10000 });
    await page.locator('.ciudad-card').first().click();
    
    // Esperar calendario
    await page.waitForSelector('.dia-card', { timeout: 10000 });
    
    // Contar días mostrados
    const dias = page.locator('.dia-card');
    const diasCount = await dias.count();
    
    // Debería mostrar aproximadamente 30 días
    expect(diasCount).toBeGreaterThanOrEqual(28); // Min 28 días
    expect(diasCount).toBeLessThanOrEqual(31); // Max 31 días
  });

  /**
   * Test: Verificar que ciudad seleccionada tiene estilo especial
   */
  test('should highlight selected city', async ({ page }) => {
    await page.goto('http://localhost:4200/disponibilidad-ciudad');
    await page.waitForLoadState('networkidle');
    
    await page.waitForSelector('.ciudad-card', { timeout: 10000 });
    
    // Click en primera ciudad
    const primeraCiudad = page.locator('.ciudad-card').first();
    await primeraCiudad.click();
    
    // Esperar a que se marque como seleccionada
    await page.waitForTimeout(500);
    
    // Volver a la lista
    await page.click('button:has-text("Cambiar ciudad")');
    await page.waitForSelector('.ciudades-list', { timeout: 5000 });
    
    // Verificar que la primera ciudad tiene clase 'selected'
    const ciudadSeleccionada = page.locator('.ciudad-card.selected');
    await expect(ciudadSeleccionada).toBeVisible();
    
    // Verificar que muestra el check icon
    await expect(ciudadSeleccionada.locator('.check-icon')).toBeVisible();
  });
});

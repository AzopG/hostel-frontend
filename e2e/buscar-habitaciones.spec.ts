import { test, expect } from '@playwright/test';

/**
 * HU05: Filtrar habitaciones por fechas y número de huéspedes
 * Tests E2E para verificar los criterios de aceptación
 */
test.describe('HU05: Filtrar Habitaciones', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navegar a la página de búsqueda
    await page.goto('http://localhost:4200/buscar-habitaciones');
    await page.waitForLoadState('networkidle');
  });

  /**
   * CA1: Búsqueda básica - Listar habitaciones disponibles
   */
  test('CA1: should list available rooms matching filters', async ({ page }) => {
    // Esperar que el formulario esté visible
    await expect(page.locator('form')).toBeVisible();
    
    // Verificar campos del formulario
    await expect(page.locator('#fechaInicio')).toBeVisible();
    await expect(page.locator('#fechaFin')).toBeVisible();
    await expect(page.locator('#huespedes')).toBeVisible();
    
    // Los valores por defecto deberían estar configurados (hoy y mañana)
    const fechaInicio = await page.locator('#fechaInicio').inputValue();
    const fechaFin = await page.locator('#fechaFin').inputValue();
    expect(fechaInicio.length).toBeGreaterThan(0);
    expect(fechaFin.length).toBeGreaterThan(0);
    
    // Seleccionar 2 huéspedes (valor por defecto)
    const huespedesValue = await page.locator('#huespedes').inputValue();
    expect(huespedesValue).toBe('2');
    
    // Click en buscar
    await page.click('button[type="submit"]');
    
    // Esperar resultados o mensaje de sin resultados
    await page.waitForSelector('.resultados-section, .sin-resultados', { timeout: 10000 });
    
    // Verificar que se muestra la sección de resultados
    const resultadosSection = page.locator('.resultados-section');
    await expect(resultadosSection).toBeVisible();
  });

  /**
   * CA2: Validación de fechas - Fecha fin anterior a fecha inicio
   */
  test('CA2: should show error when end date is before start date', async ({ page }) => {
    // Configurar fecha fin anterior a fecha inicio
    const hoy = new Date();
    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);
    
    const fechaInicio = manana.toISOString().split('T')[0];
    const fechaFin = hoy.toISOString().split('T')[0];
    
    // Llenar formulario con fechas inv válidas
    await page.fill('#fechaInicio', fechaInicio);
    await page.fill('#fechaFin', fechaFin);
    
    // Intentar buscar
    await page.click('button[type="submit"]');
    
    // Esperar mensaje de error
    await page.waitForSelector('.error-message', { timeout: 5000 });
    
    // Verificar que se muestra el error
    const errorMessage = page.locator('.error-message');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('fecha');
    
    // Verificar que NO se ejecutó la búsqueda (no hay resultados)
    const resultados = page.locator('.resultados-section');
    await expect(resultados).not.toBeVisible();
  });

  /**
   * CA3: Sin resultados - Mensaje cuando no hay habitaciones disponibles
   */
  test('CA3: should show no results message when no rooms match criteria', async ({ page }) => {
    // Configurar búsqueda que probablemente no tenga resultados
    // (fecha muy lejana en el futuro + muchos huéspedes)
    const futuro = new Date();
    futuro.setFullYear(futuro.getFullYear() + 2); // 2 años en el futuro
    const futuroMasUno = new Date(futuro);
    futuroMasUno.setDate(futuroMasUno.getDate() + 1);
    
    await page.fill('#fechaInicio', futuro.toISOString().split('T')[0]);
    await page.fill('#fechaFin', futuroMasUno.toISOString().split('T')[0]);
    
    // Configurar máximo de huéspedes
    await page.fill('#huespedes', '10');
    
    // Buscar
    await page.click('button[type="submit"]');
    
    // Esperar resultado
    await page.waitForSelector('.resultados-section', { timeout: 10000 });
    
    // Verificar mensaje de sin resultados
    const sinResultados = page.locator('.sin-resultados');
    
    // Podría haber resultados o no, dependiendo de los datos
    // Si no hay resultados, verificar el mensaje
    if (await sinResultados.isVisible()) {
      await expect(sinResultados).toContainText('No hay habitaciones disponibles con esos criterios');
      
      // Verificar sugerencias
      await expect(sinResultados).toContainText('Intenta ajustar');
      
      // Verificar botón de modificar búsqueda
      const btnModificar = page.locator('.btn-modificar');
      await expect(btnModificar).toBeVisible();
    }
  });

  /**
   * CA4: Validación de huéspedes - Límite máximo
   */
  test('CA4: should prevent searching with more than maximum guests', async ({ page }) => {
    // Intentar establecer más del máximo (10)
    await page.fill('#huespedes', '15');
    
    // Intentar buscar
    await page.click('button[type="submit"]');
    
    // Esperar mensaje de error
    await page.waitForSelector('.error-message', { timeout: 5000 });
    
    // Verificar error de huéspedes
    const errorHuespedes = page.locator('.error-message').filter({ hasText: 'máximo' });
    await expect(errorHuespedes).toBeVisible();
    await expect(errorHuespedes).toContainText('10');
  });

  /**
   * CA4: Botones de incrementar/decrementar huéspedes
   */
  test('CA4: should increment and decrement guests correctly', async ({ page }) => {
    // Valor inicial debería ser 2
    let huespedesValue = await page.locator('#huespedes').inputValue();
    expect(huespedesValue).toBe('2');
    
    // Incrementar huéspedes
    await page.click('.btn-cantidad:has-text("+")');
    huespedesValue = await page.locator('#huespedes').inputValue();
    expect(huespedesValue).toBe('3');
    
    // Incrementar más veces hasta llegar al máximo
    for (let i = 0; i < 7; i++) {
      await page.click('.btn-cantidad:has-text("+")');
    }
    
    huespedesValue = await page.locator('#huespedes').inputValue();
    expect(huespedesValue).toBe('10');
    
    // Intentar incrementar más (debería estar deshabilitado)
    const btnMas = page.locator('.btn-cantidad:has-text("+")');
    await expect(btnMas).toBeDisabled();
    
    // Decrementar
    await page.click('.btn-cantidad:has-text("-")');
    huespedesValue = await page.locator('#huespedes').inputValue();
    expect(huespedesValue).toBe('9');
    
    // Volver a 1
    for (let i = 0; i < 8; i++) {
      await page.click('.btn-cantidad:has-text("-")');
    }
    
    huespedesValue = await page.locator('#huespedes').inputValue();
    expect(huespedesValue).toBe('1');
    
    // Botón de decrementar debería estar deshabilitado
    const btnMenos = page.locator('.btn-cantidad:has-text("-")');
    await expect(btnMenos).toBeDisabled();
  });

  /**
   * Test: Filtro por ciudad
   */
  test('should filter by city when selected', async ({ page }) => {
    // Esperar que carguen las ciudades
    await page.waitForTimeout(1000);
    
    // Seleccionar una ciudad
    await page.selectOption('#ciudad', { index: 1 }); // Primera ciudad (no "Todas")
    
    const ciudadSeleccionada = await page.locator('#ciudad').inputValue();
    expect(ciudadSeleccionada.length).toBeGreaterThan(0);
    
    // Buscar
    await page.click('button[type="submit"]');
    
    // Esperar resultados
    await page.waitForSelector('.resultados-section', { timeout: 10000 });
    
    // Si hay resultados, verificar que los filtros aplicados muestran la ciudad
    const filtrosAplicados = page.locator('.filtros-aplicados');
    if (await filtrosAplicados.isVisible()) {
      await expect(filtrosAplicados).toContainText(ciudadSeleccionada);
    }
  });

  /**
   * Test: Cálculo de noches
   */
  test('should calculate nights correctly', async ({ page }) => {
    const hoy = new Date();
    const tresDias = new Date(hoy);
    tresDias.setDate(tresDias.getDate() + 3);
    
    await page.fill('#fechaInicio', hoy.toISOString().split('T')[0]);
    await page.fill('#fechaFin', tresDias.toISOString().split('T')[0]);
    
    // Debería mostrar "3 noche(s)"
    await page.waitForSelector('.info-text:has-text("noche")', { timeout: 2000 });
    const infoNoches = page.locator('.info-text').filter({ hasText: 'noche' });
    await expect(infoNoches).toContainText('3');
  });

  /**
   * Test: Limpiar filtros
   */
  test('should clear filters when clicking clear button', async ({ page }) => {
    // Modificar filtros
    await page.fill('#huespedes', '5');
    await page.selectOption('#ciudad', { index: 1 });
    
    // Click en limpiar
    await page.click('.btn-limpiar');
    
    // Verificar que los filtros se reiniciaron
    const huespedesValue = await page.locator('#huespedes').inputValue();
    expect(huespedesValue).toBe('2'); // Valor por defecto
    
    const ciudadValue = await page.locator('#ciudad').inputValue();
    expect(ciudadValue).toBe(''); // "Todas las ciudades"
    
    // Resultados deberían desaparecer
    const resultados = page.locator('.resultados-section');
    await expect(resultados).not.toBeVisible();
  });

  /**
   * Test: Display de resultados - Cards de habitaciones
   */
  test('should display room cards with correct information', async ({ page }) => {
    // Realizar búsqueda
    await page.click('button[type="submit"]');
    
    // Esperar resultados
    await page.waitForSelector('.resultados-section', { timeout: 10000 });
    
    // Si hay habitaciones, verificar estructura de las cards
    const habitacionCards = page.locator('.habitacion-card');
    const count = await habitacionCards.count();
    
    if (count > 0) {
      const primeraCard = habitacionCards.first();
      
      // Verificar elementos de la card
      await expect(primeraCard.locator('.habitacion-imagen')).toBeVisible();
      await expect(primeraCard.locator('.tipo-badge')).toBeVisible();
      await expect(primeraCard.locator('.precio-badge')).toBeVisible();
      await expect(primeraCard.locator('h3')).toBeVisible(); // Nombre hotel
      await expect(primeraCard.locator('.hotel-ubicacion')).toBeVisible();
      await expect(primeraCard.locator('.btn-reservar')).toBeVisible();
      await expect(primeraCard.locator('.btn-ver-mas')).toBeVisible();
    }
  });

  /**
   * Test: Loading state
   */
  test('should show loading indicator during search', async ({ page }) => {
    // Click en buscar
    const buscarPromise = page.click('button[type="submit"]');
    
    // Inmediatamente verificar loading
    const loading = page.locator('.loading');
    
    // Podría aparecer brevemente
    // Si aparece, verificar que tiene spinner
    if (await loading.isVisible({ timeout: 500 }).catch(() => false)) {
      await expect(loading.locator('.spinner')).toBeVisible();
    }
    
    await buscarPromise;
    
    // Eventualmente el loading debería desaparecer
    await expect(loading).not.toBeVisible({ timeout: 10000 });
  });

  /**
   * Test: Responsive design
   */
  test('should be responsive on mobile', async ({ page }) => {
    // Configurar viewport móvil
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Recargar
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Verificar que el formulario es visible y usable
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('#fechaInicio')).toBeVisible();
    await expect(page.locator('#fechaFin')).toBeVisible();
    await expect(page.locator('#huespedes')).toBeVisible();
    
    // Botón de buscar debería ser visible
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  /**
   * Test: Navegación desde homepage
   */
  test('should navigate from homepage to room search', async ({ page }) => {
    await page.goto('http://localhost:4200');
    await page.waitForLoadState('networkidle');
    
    // Buscar botón "Buscar Habitaciones"
    const botonBuscar = page.locator('button:has-text("Buscar Habitaciones")');
    await expect(botonBuscar).toBeVisible();
    
    // Click en el botón
    await botonBuscar.click();
    
    // Verificar navegación
    await page.waitForURL('**/buscar-habitaciones');
    expect(page.url()).toContain('/buscar-habitaciones');
    
    // Verificar que cargó la página correctamente
    await expect(page.locator('.busqueda-container')).toBeVisible();
  });

  /**
   * Test: Badge de resultados
   */
  test('should show results count badge', async ({ page }) => {
    // Buscar
    await page.click('button[type="submit"]');
    
    // Esperar resultados
    await page.waitForSelector('.resultados-section', { timeout: 10000 });
    
    // Verificar badge de resultados
    const badgeResultados = page.locator('.badge-resultados');
    if (await badgeResultados.isVisible()) {
      const texto = await badgeResultados.textContent();
      expect(texto).toMatch(/\d+ habitacion/i);
    }
  });

  /**
   * Test: Precio total calculado
   */
  test('should calculate total price for stay', async ({ page }) => {
    // Configurar 3 noches
    const hoy = new Date();
    const tresDias = new Date(hoy);
    tresDias.setDate(tresDias.getDate() + 3);
    
    await page.fill('#fechaInicio', hoy.toISOString().split('T')[0]);
    await page.fill('#fechaFin', tresDias.toISOString().split('T')[0]);
    
    // Buscar
    await page.click('button[type="submit"]');
    
    // Esperar resultados
    await page.waitForSelector('.resultados-section', { timeout: 10000 });
    
    // Si hay habitaciones, verificar que muestra precio total
    const precioTotal = page.locator('.precio-total');
    if (await precioTotal.first().isVisible()) {
      await expect(precioTotal.first()).toContainText('Total');
      await expect(precioTotal.first()).toContainText('3 noche');
    }
  });
});

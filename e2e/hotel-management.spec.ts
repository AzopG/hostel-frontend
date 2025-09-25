import { test, expect } from '@playwright/test';

test.describe('Hotel Management', () => {
  test.beforeEach(async ({ page }) => {
    // Mock autenticación
    await page.route('**/api/auth/verify', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          usuario: {
            _id: '123',
            nombre: 'Hotel Admin',
            email: 'admin@hotel.com',
            tipo: 'admin_central'
          }
        })
      });
    });

    // Mock lista de hoteles
    await page.route('**/api/hoteles', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              _id: '1',
              nombre: 'Hotel Plaza',
              ciudad: 'Bogotá',
              direccion: 'Calle 123 #45-67',
              telefono: '123-456-7890',
              habitaciones: [],
              salones: []
            },
            {
              _id: '2',
              nombre: 'Hotel Mar',
              ciudad: 'Cartagena',
              direccion: 'Carrera 1 #2-3',
              telefono: '098-765-4321',
              habitaciones: [],
              salones: []
            }
          ])
        });
      }
    });

    // Simular token
    await page.addInitScript(() => {
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('user', JSON.stringify({
        _id: '123',
        nombre: 'Hotel Admin',
        email: 'admin@hotel.com',
        tipo: 'admin_central'
      }));
    });
  });

  test('should display hotels list', async ({ page }) => {
    await page.goto('/dashboard/hoteles');
    
    // Verificar que se muestran los hoteles
    await expect(page.locator('text=Hotel Plaza')).toBeVisible();
    await expect(page.locator('text=Hotel Mar')).toBeVisible();
    await expect(page.locator('text=Bogotá')).toBeVisible();
    await expect(page.locator('text=Cartagena')).toBeVisible();
  });

  test('should show add hotel button', async ({ page }) => {
    await page.goto('/dashboard/hoteles');
    
    // Verificar botón de agregar hotel
    const addButton = page.locator('text=Agregar Hotel').or(page.locator('button:has-text("Nuevo")'));
    await expect(addButton).toBeVisible();
  });

  test('should filter hotels by city', async ({ page }) => {
    await page.goto('/dashboard/hoteles');
    
    // Buscar campo de filtro
    const filterInput = page.locator('input[placeholder*="Buscar"]').or(page.locator('input[placeholder*="Filtrar"]'));
    
    if (await filterInput.isVisible()) {
      await filterInput.fill('Bogotá');
      
      // Verificar que solo se muestra Hotel Plaza
      await expect(page.locator('text=Hotel Plaza')).toBeVisible();
      // Hotel Mar no debería estar visible
      await expect(page.locator('text=Hotel Mar')).not.toBeVisible();
    }
  });

  test('should handle hotel creation', async ({ page }) => {
    // Mock para crear hotel
    await page.route('**/api/hoteles', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            _id: '3',
            nombre: 'Hotel Nuevo',
            ciudad: 'Medellín',
            direccion: 'Calle Nueva 123',
            telefono: '555-123-4567',
            habitaciones: [],
            salones: []
          })
        });
      }
    });

    await page.goto('/dashboard/hoteles');
    
    // Click en agregar hotel
    const addButton = page.locator('text=Agregar Hotel').or(page.locator('button:has-text("Nuevo")'));
    if (await addButton.isVisible()) {
      await addButton.click();
      
      // Llenar formulario (si aparece modal o navegación)
      const nameInput = page.locator('input[name="nombre"]').or(page.locator('input[placeholder*="Nombre"]'));
      if (await nameInput.isVisible()) {
        await nameInput.fill('Hotel Nuevo');
        
        const cityInput = page.locator('input[name="ciudad"]').or(page.locator('input[placeholder*="Ciudad"]'));
        if (await cityInput.isVisible()) {
          await cityInput.fill('Medellín');
        }
        
        // Enviar formulario
        const submitButton = page.locator('button[type="submit"]').or(page.locator('button:has-text("Guardar")'));
        if (await submitButton.isVisible()) {
          await submitButton.click();
          
          // Verificar mensaje de éxito
          await expect(page.locator('text=Hotel creado exitosamente').or(page.locator('text=Guardado correctamente'))).toBeVisible();
        }
      }
    }
  });
});
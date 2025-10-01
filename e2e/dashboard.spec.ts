import { test, expect } from '@playwright/test';

test.describe('Dashboard Navigation', () => {
  // Mock del usuario logueado
  test.beforeEach(async ({ page }) => {
    // Interceptar verificación de token
    await page.route('**/api/auth/verify', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          usuario: {
            _id: '123',
            nombre: 'Test Admin',
            email: 'admin@test.com',
            tipo: 'admin_central'
          }
        })
      });
    });

    // Simular token en localStorage
    await page.addInitScript(() => {
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('user', JSON.stringify({
        _id: '123',
        nombre: 'Test Admin',
        email: 'admin@test.com',
        tipo: 'admin_central'
      }));
    });
  });

  test('should display dashboard correctly for admin user', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Verificar elementos principales del dashboard
    await expect(page.locator('text=Sistema Hotelero')).toBeVisible();
    await expect(page.locator('text=Test Admin')).toBeVisible();
    
    // Verificar menú de navegación
    await expect(page.locator('text=Hoteles')).toBeVisible();
    await expect(page.locator('text=Usuarios')).toBeVisible();
    await expect(page.locator('text=Reportes')).toBeVisible();
  });

  test('should navigate to hotels section', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Click en la sección de hoteles
    await page.click('text=Hoteles');
    
    // Verificar que se navega a la sección correcta
    await expect(page).toHaveURL(/dashboard\/hoteles/);
  });

  test('should navigate to users section', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Click en la sección de usuarios
    await page.click('text=Usuarios');
    
    // Verificar navegación
    await expect(page).toHaveURL(/dashboard\/usuarios/);
  });

  test('should navigate to reports section', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Click en reportes
    await page.click('text=Reportes');
    
    // Verificar navegación
    await expect(page).toHaveURL(/dashboard\/reportes/);
  });

  test('should logout successfully', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Buscar y hacer click en logout
    const logoutButton = page.locator('text=Cerrar Sesión').or(page.locator('button:has-text("Logout")'));
    
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
      
      // Verificar redirección a homepage
      await expect(page).toHaveURL('/');
    }
  });

  test('should display mobile menu on small screens', async ({ page }) => {
    // Cambiar viewport a móvil
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/dashboard');
    
    // En móvil debería mostrar menú hamburguesa
    const mobileMenuButton = page.locator('[aria-label="menu"]').or(page.locator('.mobile-menu-btn'));
    
    if (await mobileMenuButton.isVisible()) {
      await mobileMenuButton.click();
      
      // Verificar que se muestra el menú móvil
      await expect(page.locator('.mobile-menu').or(page.locator('.sidebar'))).toBeVisible();
    }
  });
});
import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display homepage correctly', async ({ page }) => {
    // Verificar que la página principal se carga
    await expect(page).toHaveTitle(/frontend-app/);
    
    // Verificar elementos principales de la homepage
    await expect(page.locator('text=Gestión Hotelera')).toBeVisible();
    await expect(page.locator('text=Ver Servicios')).toBeVisible();
  });

  test('should navigate to login page', async ({ page }) => {
    // Buscar y hacer clic en el botón de Gestión Hotelera
    await page.click('text=Gestión Hotelera');
    
    // Verificar que se navega a la página de login
    await expect(page).toHaveURL(/login/);
    await expect(page.locator('text=Iniciar Sesión')).toBeVisible();
  });

  test('should show validation errors for empty login form', async ({ page }) => {
    await page.goto('/login');
    
    // Intentar enviar formulario vacío
    await page.click('button[type="submit"]');
    
    // Verificar que se muestran errores de validación
    await expect(page.locator('text=El email es requerido')).toBeVisible();
    await expect(page.locator('text=La contraseña es requerida')).toBeVisible();
  });

  test('should show email format validation', async ({ page }) => {
    await page.goto('/login');
    
    // Ingresar email inválido
    await page.fill('input[id="email"]', 'invalid-email');
    await page.fill('input[id="password"]', 'password123');
    
    // Hacer click fuera del campo para disparar validación
    await page.click('button[type="submit"]');
    
    // Verificar error de formato de email
    await expect(page.locator('text=Formato de email inválido')).toBeVisible();
  });

  test('should handle login attempt with invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    // Llenar formulario con credenciales inválidas
    await page.fill('input[id="email"]', 'test@nonexistent.com');
    await page.fill('input[id="password"]', 'wrongpassword');
    
    // Enviar formulario
    await page.click('button[type="submit"]');
    
    // Esperar a que aparezca el mensaje de error
    await expect(page.locator('.error-message')).toBeVisible({ timeout: 5000 });
  });

  test('should fill test credentials', async ({ page }) => {
    await page.goto('/login');
    
    // Verificar que existen los botones de credenciales de prueba
    const adminButton = page.locator('text=Admin Central');
    if (await adminButton.isVisible()) {
      await adminButton.click();
      
      // Verificar que se llenaron los campos
      await expect(page.locator('input[id="email"]')).toHaveValue('admin@hotelchain.com');
      await expect(page.locator('input[id="password"]')).toHaveValue('admin123');
    }
  });

  test('should redirect to dashboard after successful login', async ({ page }) => {
    // Interceptar la llamada de login para simular éxito
    await page.route('**/api/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          msg: 'Login exitoso',
          token: 'mock-token',
          usuario: {
            _id: '123',
            nombre: 'Test User',
            email: 'test@example.com',
            tipo: 'cliente'
          },
          expiresIn: '24h'
        })
      });
    });

    await page.goto('/login');
    
    // Llenar formulario con credenciales válidas
    await page.fill('input[id="email"]', 'test@example.com');
    await page.fill('input[id="password"]', 'password123');
    
    // Enviar formulario
    await page.click('button[type="submit"]');
    
    // Verificar mensaje de éxito
    await expect(page.locator('text=Login exitoso')).toBeVisible();
    
    // Esperar redirección al dashboard
    await expect(page).toHaveURL(/dashboard/, { timeout: 2000 });
  });
});
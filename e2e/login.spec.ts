import { test, expect } from '@playwright/test';

/**
 * HU02 - Historia de Usuario: Inicio de Sesión
 * Como usuario registrado
 * Quiero iniciar sesión
 * Para acceder a mis reservas
 */

test.describe('HU02 - Inicio de Sesión', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navegar a la página de login
    await page.goto('http://localhost:4200/login');
  });

  /**
   * Criterio de Aceptación 1: Autenticación válida
   * Contexto: Usuario ingresa correo y contraseña correctos
   * Evento: Al presionar "Iniciar sesión" accede al panel correspondiente a su rol
   */
  test.describe('CA1: Autenticación válida', () => {
    
    test('CA1.1: Debe iniciar sesión con credenciales válidas y mostrar mensaje de bienvenida', async ({ page }) => {
      // Primero registrar un usuario para tener credenciales válidas
      const timestamp = Date.now();
      const email = `test${timestamp}@example.com`;
      const password = 'password123';
      const nombre = 'Usuario Test CA1';

      // Ir a registro
      await page.goto('http://localhost:4200/register');
      
      await page.fill('#nombre', nombre);
      await page.fill('#email', email);
      await page.fill('#password', password);
      await page.fill('#confirmPassword', password);
      await page.selectOption('#tipo', 'cliente');
      await page.click('button[type="submit"]');

      // Esperar a que complete el registro
      await page.waitForTimeout(3000);

      // Logout
      await page.goto('http://localhost:4200/login');

      // Ahora hacer login con las credenciales
      await page.fill('#email', email);
      await page.fill('#password', password);
      await page.click('button[type="submit"]');

      // Verificar mensaje de bienvenida
      await expect(page.locator('.success-message')).toContainText('Bienvenido', { timeout: 5000 });
      await expect(page.locator('.success-message')).toContainText(nombre);
    });

    test('CA1.2: Usuario tipo "cliente" debe redirigir a /dashboard/mis-reservas', async ({ page }) => {
      const timestamp = Date.now();
      const email = `cliente${timestamp}@example.com`;
      
      // Registrar usuario cliente
      await page.goto('http://localhost:4200/register');
      await page.fill('#nombre', 'Cliente Test');
      await page.fill('#email', email);
      await page.fill('#password', 'pass123');
      await page.fill('#confirmPassword', 'pass123');
      await page.selectOption('#tipo', 'cliente');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);

      // Login
      await page.goto('http://localhost:4200/login');
      await page.fill('#email', email);
      await page.fill('#password', 'pass123');
      await page.click('button[type="submit"]');

      // Verificar redirección
      await expect(page).toHaveURL(/.*\/dashboard\/mis-reservas/, { timeout: 10000 });
    });

    test('CA1.3: Usuario tipo "empresa" debe redirigir a /dashboard/reservas', async ({ page }) => {
      const timestamp = Date.now();
      const email = `empresa${timestamp}@example.com`;
      
      // Registrar usuario empresa
      await page.goto('http://localhost:4200/register');
      await page.fill('#nombre', 'Empresa Test');
      await page.fill('#email', email);
      await page.fill('#password', 'pass123');
      await page.fill('#confirmPassword', 'pass123');
      await page.selectOption('#tipo', 'empresa');
      await page.fill('#empresa', 'Mi Empresa');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);

      // Login
      await page.goto('http://localhost:4200/login');
      await page.fill('#email', email);
      await page.fill('#password', 'pass123');
      await page.click('button[type="submit"]');

      // Verificar redirección
      await expect(page).toHaveURL(/.*\/dashboard\/reservas/, { timeout: 10000 });
    });
  });

  /**
   * Criterio de Aceptación 2: Credenciales inválidas
   * Contexto: Usuario ingresa datos incorrectos
   * Evento: Al presionar "Iniciar sesión" se muestra mensaje "Credenciales inválidas"
   */
  test.describe('CA2: Credenciales inválidas', () => {
    
    test('CA2.1: Debe mostrar "Credenciales inválidas" con email inexistente', async ({ page }) => {
      await page.fill('#email', 'noexiste@example.com');
      await page.fill('#password', 'cualquierpassword');
      await page.click('button[type="submit"]');

      // Verificar mensaje de error
      await expect(page.locator('.error-message')).toContainText('Credenciales inválidas', { timeout: 5000 });
    });

    test('CA2.2: Debe mostrar "Credenciales inválidas" con contraseña incorrecta', async ({ page }) => {
      // Primero registrar un usuario
      const timestamp = Date.now();
      const email = `user${timestamp}@example.com`;
      
      await page.goto('http://localhost:4200/register');
      await page.fill('#nombre', 'User Test');
      await page.fill('#email', email);
      await page.fill('#password', 'correctpassword');
      await page.fill('#confirmPassword', 'correctpassword');
      await page.selectOption('#tipo', 'cliente');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);

      // Intentar login con contraseña incorrecta
      await page.goto('http://localhost:4200/login');
      await page.fill('#email', email);
      await page.fill('#password', 'wrongpassword');
      await page.click('button[type="submit"]');

      // Verificar mensaje de error
      await expect(page.locator('.error-message')).toContainText('Credenciales inválidas', { timeout: 5000 });
    });

    test('CA2.3: No debe navegar cuando las credenciales son inválidas', async ({ page }) => {
      await page.fill('#email', 'invalido@example.com');
      await page.fill('#password', 'wrongpassword');
      await page.click('button[type="submit"]');

      // Esperar un poco
      await page.waitForTimeout(2000);

      // Verificar que sigue en la página de login
      await expect(page).toHaveURL(/.*\/login/);
    });
  });

  /**
   * Criterio de Aceptación 3: Campos vacíos
   * Contexto: Algún campo está vacío
   * Evento: Al presionar "Iniciar sesión" se resaltan campos faltantes con mensaje
   */
  test.describe('CA3: Campos vacíos', () => {
    
    test('CA3.1: Debe mostrar error cuando el email está vacío', async ({ page }) => {
      await page.fill('#password', 'password123');
      await page.click('button[type="submit"]');

      // Verificar error general
      await expect(page.locator('.error-message')).toContainText('completa todos los campos');
    });

    test('CA3.2: Debe mostrar error cuando la contraseña está vacía', async ({ page }) => {
      await page.fill('#email', 'test@example.com');
      await page.click('button[type="submit"]');

      // Verificar error general
      await expect(page.locator('.error-message')).toContainText('completa todos los campos');
    });

    test('CA3.3: Debe mostrar error cuando ambos campos están vacíos', async ({ page }) => {
      await page.click('button[type="submit"]');

      // Verificar error general
      await expect(page.locator('.error-message')).toContainText('completa todos los campos');
    });

    test('CA3.4: Debe resaltar con borde rojo los campos vacíos', async ({ page }) => {
      await page.click('button[type="submit"]');

      // Verificar que los campos tienen clase error
      const emailInput = page.locator('#email');
      const passwordInput = page.locator('#password');

      await expect(emailInput).toHaveClass(/error/);
      await expect(passwordInput).toHaveClass(/error/);
    });

    test('CA3.5: Debe mostrar mensaje específico para email requerido', async ({ page }) => {
      // Hacer click en email y luego salir sin llenar
      await page.click('#email');
      await page.click('#password');

      // Verificar mensaje específico
      const emailError = page.locator('.form-group:has(#email) .error-message');
      await expect(emailError).toContainText('El email es requerido');
    });

    test('CA3.6: Debe mostrar mensaje específico para contraseña requerida', async ({ page }) => {
      // Hacer click en password y luego salir sin llenar
      await page.click('#password');
      await page.click('#email');

      // Verificar mensaje específico
      const passwordError = page.locator('.form-group:has(#password) .error-message');
      await expect(passwordError).toContainText('La contraseña es requerida');
    });

    test('CA3.7: Debe validar formato de email', async ({ page }) => {
      await page.fill('#email', 'email-sin-arroba');
      await page.fill('#password', 'password123');
      await page.click('#password'); // Para activar validación

      // Verificar que el campo tiene error de formato
      const emailInput = page.locator('#email');
      await expect(emailInput).toHaveClass(/error/);
    });
  });

  /**
   * Criterio de Aceptación 4: Sesión persistente
   * Contexto: Usuario marca "Recordarme"
   * Evento: Al iniciar sesión su sesión se mantiene en visitas futuras hasta cerrar sesión
   */
  test.describe('CA4: Sesión persistente (Recordarme)', () => {
    
    test('CA4.1: Debe mostrar checkbox "Recordarme"', async ({ page }) => {
      const checkbox = page.locator('#rememberMe');
      await expect(checkbox).toBeVisible();
      await expect(checkbox).toHaveAttribute('type', 'checkbox');
    });

    test('CA4.2: Sesión debe persistir con "Recordarme" marcado', async ({ page, context }) => {
      // Registrar usuario
      const timestamp = Date.now();
      const email = `persistent${timestamp}@example.com`;
      
      await page.goto('http://localhost:4200/register');
      await page.fill('#nombre', 'Persistent User');
      await page.fill('#email', email);
      await page.fill('#password', 'pass123');
      await page.fill('#confirmPassword', 'pass123');
      await page.selectOption('#tipo', 'cliente');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);

      // Login con "Recordarme"
      await page.goto('http://localhost:4200/login');
      await page.fill('#email', email);
      await page.fill('#password', 'pass123');
      await page.check('#rememberMe');
      await page.click('button[type="submit"]');

      // Esperar redirección
      await page.waitForURL(/.*\/dashboard/, { timeout: 10000 });

      // Cerrar y reabrir página (simular nueva visita)
      await page.close();
      const newPage = await context.newPage();
      await newPage.goto('http://localhost:4200');

      // La sesión debería persistir - debería estar autenticado
      await newPage.waitForTimeout(2000);
      // Si está autenticado, el navbar debería mostrar el nombre del usuario
      const userMenu = newPage.locator('.user-info');
      await expect(userMenu).toBeVisible({ timeout: 5000 });
    });

    test('CA4.3: Sesión NO debe persistir sin "Recordarme"', async ({ page, context }) => {
      // Registrar usuario
      const timestamp = Date.now();
      const email = `nonpersistent${timestamp}@example.com`;
      
      await page.goto('http://localhost:4200/register');
      await page.fill('#nombre', 'Non Persistent User');
      await page.fill('#email', email);
      await page.fill('#password', 'pass123');
      await page.fill('#confirmPassword', 'pass123');
      await page.selectOption('#tipo', 'cliente');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);

      // Login SIN "Recordarme"
      await page.goto('http://localhost:4200/login');
      await page.fill('#email', email);
      await page.fill('#password', 'pass123');
      // NO marcar rememberMe
      await page.click('button[type="submit"]');

      // Esperar redirección
      await page.waitForURL(/.*\/dashboard/, { timeout: 10000 });

      // Cerrar y reabrir página (simular nueva visita)
      await page.close();
      const newPage = await context.newPage();
      await newPage.goto('http://localhost:4200');

      // La sesión NO debería persistir con sessionStorage
      await newPage.waitForTimeout(2000);
      // Debería mostrar botón de login en lugar de user menu
      const loginButton = newPage.locator('button:has-text("Iniciar Sesión")');
      await expect(loginButton).toBeVisible({ timeout: 5000 });
    });

    test('CA4.4: Checkbox debe estar desmarcado por defecto', async ({ page }) => {
      const checkbox = page.locator('#rememberMe');
      await expect(checkbox).not.toBeChecked();
    });
  });

  /**
   * Tests adicionales de UX
   */
  test('Debe navegar a registro desde el enlace', async ({ page }) => {
    const registerLink = page.locator('a:has-text("Regístrate aquí")');
    await registerLink.click();

    await expect(page).toHaveURL(/.*\/register/);
  });

  test('Debe mostrar indicador de carga durante el login', async ({ page }) => {
    await page.fill('#email', 'test@example.com');
    await page.fill('#password', 'password123');
    await page.click('button[type="submit"]');

    // Verificar que el botón muestra texto de carga
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toContainText('Iniciando sesión...', { timeout: 1000 });
  });

  test('Debe deshabilitar botón durante la carga', async ({ page }) => {
    await page.fill('#email', 'test@example.com');
    await page.fill('#password', 'password123');
    await page.click('button[type="submit"]');

    // Verificar que el botón está deshabilitado
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeDisabled({ timeout: 1000 });
  });

  test('Debe redirigir a dashboard si ya está autenticado', async ({ page }) => {
    // Primero registrar y hacer login
    const timestamp = Date.now();
    const email = `authed${timestamp}@example.com`;
    
    await page.goto('http://localhost:4200/register');
    await page.fill('#nombre', 'Authed User');
    await page.fill('#email', email);
    await page.fill('#password', 'pass123');
    await page.fill('#confirmPassword', 'pass123');
    await page.selectOption('#tipo', 'cliente');
    await page.click('button[type="submit"]');
    
    // Esperar redirección a dashboard
    await page.waitForURL(/.*\/dashboard/, { timeout: 10000 });

    // Intentar ir a login estando autenticado
    await page.goto('http://localhost:4200/login');

    // Debería redirigir de vuelta al dashboard
    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 5000 });
  });
});

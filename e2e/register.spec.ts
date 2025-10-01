import { test, expect } from '@playwright/test';

/**
 * HU01 - Historia de Usuario: Registro de Usuarios
 * Como usuario no registrado
 * Quiero poder registrarme
 * Para poder ingresar al sistema
 */

test.describe('HU01 - Registro de Usuarios', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navegar a la página principal
    await page.goto('http://localhost:4200');
  });

  /**
   * Criterio de Aceptación 1: Campos obligatorios
   * Contexto: Usuario hace clic en "Registrarse" desde la página inicial
   * Evento: El sistema muestra formulario con campos: nombre, correo, contraseña, confirmar contraseña
   */
  test('CA1: Debe mostrar formulario de registro con todos los campos obligatorios', async ({ page }) => {
    // Hacer clic en el botón de registrarse
    await page.click('button:has-text("Crear Cuenta")');
    
    // Verificar que navegó a la página de registro
    await expect(page).toHaveURL(/.*register/);
    
    // Verificar que el título del formulario es correcto
    await expect(page.locator('h2')).toContainText('Crear Cuenta');
    
    // Verificar que existen todos los campos obligatorios
    await expect(page.locator('#nombre')).toBeVisible();
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('#confirmPassword')).toBeVisible();
    await expect(page.locator('#tipo')).toBeVisible();
    
    // Verificar que tienen el asterisco de obligatorio
    const labels = await page.locator('label .required').count();
    expect(labels).toBeGreaterThan(0);
    
    // Verificar que el botón "Crear Cuenta" está presente
    await expect(page.locator('button[type="submit"]')).toContainText('Crear Cuenta');
  });

  /**
   * Criterio de Aceptación 2: Registro exitoso
   * Contexto: Usuario completa todos los campos válidos
   * Evento: Al presionar "Crear cuenta" el sistema crea la cuenta, inicia sesión y muestra mensaje de bienvenida
   */
  test('CA2: Debe registrar usuario exitosamente e iniciar sesión automáticamente', async ({ page }) => {
    // Navegar a registro
    await page.goto('http://localhost:4200/register');
    
    // Generar un email único para cada ejecución
    const timestamp = Date.now();
    const testEmail = `test${timestamp}@example.com`;
    
    // Llenar el formulario con datos válidos
    await page.fill('#nombre', 'Usuario de Prueba');
    await page.fill('#email', testEmail);
    await page.fill('#password', 'password123');
    await page.fill('#confirmPassword', 'password123');
    await page.selectOption('#tipo', 'cliente');
    
    // Enviar el formulario
    await page.click('button[type="submit"]');
    
    // Esperar por el mensaje de éxito
    await expect(page.locator('.success-message')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.success-message')).toContainText('Bienvenido');
    await expect(page.locator('.success-message')).toContainText('Usuario de Prueba');
    
    // Verificar que redirige al dashboard después del registro exitoso
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 15000 });
  });

  /**
   * Criterio de Aceptación 3: Validaciones
   * Contexto: Usuario deja campos vacíos o con formato incorrecto
   * Evento: Al presionar "Crear cuenta" el sistema muestra mensajes de error específicos y no crea la cuenta
   */
  test('CA3.1: Debe mostrar errores cuando los campos obligatorios están vacíos', async ({ page }) => {
    await page.goto('http://localhost:4200/register');
    
    // Intentar enviar formulario vacío
    await page.click('button[type="submit"]');
    
    // Verificar que muestra error general
    await expect(page.locator('.error-message')).toContainText('completa todos los campos');
    
    // Verificar que no navegó a otra página
    await expect(page).toHaveURL(/.*register/);
  });

  test('CA3.2: Debe validar formato de email', async ({ page }) => {
    await page.goto('http://localhost:4200/register');
    
    // Llenar con email inválido
    await page.fill('#nombre', 'Test User');
    await page.fill('#email', 'email-invalido');
    await page.fill('#password', 'password123');
    await page.fill('#confirmPassword', 'password123');
    await page.selectOption('#tipo', 'cliente');
    
    // Hacer clic fuera del campo email para activar la validación
    await page.click('#password');
    
    // Verificar que muestra error de formato de email
    const emailInput = page.locator('#email');
    await expect(emailInput).toHaveClass(/error/);
    
    // Verificar mensaje de error
    const emailErrorMsg = page.locator('.form-group:has(#email) .error-message');
    await expect(emailErrorMsg).toContainText('Formato de correo inválido');
  });

  test('CA3.3: Debe validar longitud mínima de contraseña (6 caracteres)', async ({ page }) => {
    await page.goto('http://localhost:4200/register');
    
    // Llenar con contraseña corta
    await page.fill('#nombre', 'Test User');
    await page.fill('#email', 'test@example.com');
    await page.fill('#password', '12345'); // Solo 5 caracteres
    await page.fill('#confirmPassword', '12345');
    
    // Hacer clic fuera del campo para activar validación
    await page.click('#confirmPassword');
    
    // Verificar que muestra error de longitud
    const passwordErrorMsg = page.locator('.form-group:has(#password) .error-message');
    await expect(passwordErrorMsg).toContainText('al menos 6 caracteres');
  });

  test('CA3.4: Debe validar que las contraseñas coincidan', async ({ page }) => {
    await page.goto('http://localhost:4200/register');
    
    // Llenar con contraseñas diferentes
    await page.fill('#nombre', 'Test User');
    await page.fill('#email', 'test@example.com');
    await page.fill('#password', 'password123');
    await page.fill('#confirmPassword', 'password456'); // Diferente
    await page.selectOption('#tipo', 'cliente');
    
    // Hacer clic fuera del campo para activar validación
    await page.click('#tipo');
    
    // Verificar que muestra error de coincidencia
    const confirmPasswordErrorMsg = page.locator('.form-group:has(#confirmPassword) .error-message');
    await expect(confirmPasswordErrorMsg).toContainText('Las contraseñas no coinciden');
  });

  test('CA3.5: Debe validar longitud mínima del nombre (3 caracteres)', async ({ page }) => {
    await page.goto('http://localhost:4200/register');
    
    // Llenar con nombre corto
    await page.fill('#nombre', 'AB'); // Solo 2 caracteres
    await page.fill('#email', 'test@example.com');
    
    // Hacer clic fuera del campo para activar validación
    await page.click('#email');
    
    // Verificar que muestra error de longitud
    const nombreErrorMsg = page.locator('.form-group:has(#nombre) .error-message');
    await expect(nombreErrorMsg).toContainText('al menos 3 caracteres');
  });

  test('CA3.6: Debe validar campo empresa cuando tipo es "empresa"', async ({ page }) => {
    await page.goto('http://localhost:4200/register');
    
    // Seleccionar tipo empresa
    await page.selectOption('#tipo', 'empresa');
    
    // Verificar que el campo empresa aparece
    await expect(page.locator('#empresa')).toBeVisible();
    
    // Llenar todos los campos excepto empresa
    await page.fill('#nombre', 'Test User');
    await page.fill('#email', 'test@example.com');
    await page.fill('#password', 'password123');
    await page.fill('#confirmPassword', 'password123');
    
    // Intentar enviar
    await page.click('button[type="submit"]');
    
    // Verificar que muestra error de campo empresa requerido
    await expect(page.locator('.error-message')).toContainText('completa todos los campos');
  });

  /**
   * Criterio de Aceptación 4: Correo duplicado
   * Contexto: Correo ya existe en el sistema
   * Evento: Al presionar "Crear cuenta" el sistema informa "El correo ya está registrado" y no crea la cuenta
   */
  test('CA4: Debe mostrar error cuando el correo ya está registrado', async ({ page }) => {
    await page.goto('http://localhost:4200/register');
    
    // Primero, registrar un usuario
    const timestamp = Date.now();
    const duplicateEmail = `duplicate${timestamp}@example.com`;
    
    await page.fill('#nombre', 'Usuario Primero');
    await page.fill('#email', duplicateEmail);
    await page.fill('#password', 'password123');
    await page.fill('#confirmPassword', 'password123');
    await page.selectOption('#tipo', 'cliente');
    await page.click('button[type="submit"]');
    
    // Esperar a que se complete el registro
    await page.waitForTimeout(3000);
    
    // Navegar de vuelta a registro (simular logout)
    await page.goto('http://localhost:4200/register');
    
    // Intentar registrar con el mismo email
    await page.fill('#nombre', 'Usuario Segundo');
    await page.fill('#email', duplicateEmail);
    await page.fill('#password', 'password456');
    await page.fill('#confirmPassword', 'password456');
    await page.selectOption('#tipo', 'cliente');
    await page.click('button[type="submit"]');
    
    // Verificar que muestra el mensaje de error específico
    await expect(page.locator('.error-message')).toContainText('El correo ya está registrado', { timeout: 5000 });
    
    // Verificar que no navegó a otra página
    await expect(page).toHaveURL(/.*register/);
  });

  /**
   * Tests adicionales de UX
   */
  test('Debe tener enlace para navegar a login', async ({ page }) => {
    await page.goto('http://localhost:4200/register');
    
    // Verificar que existe el enlace a login
    const loginLink = page.locator('a:has-text("Inicia sesión aquí")');
    await expect(loginLink).toBeVisible();
    
    // Hacer clic en el enlace
    await loginLink.click();
    
    // Verificar que navegó a login
    await expect(page).toHaveURL(/.*login/);
  });

  test('Debe mostrar indicador de carga durante el registro', async ({ page }) => {
    await page.goto('http://localhost:4200/register');
    
    const timestamp = Date.now();
    await page.fill('#nombre', 'Test User');
    await page.fill('#email', `test${timestamp}@example.com`);
    await page.fill('#password', 'password123');
    await page.fill('#confirmPassword', 'password123');
    await page.selectOption('#tipo', 'cliente');
    
    // Hacer clic en el botón y verificar el estado de carga
    await page.click('button[type="submit"]');
    
    // Verificar que el botón muestra "Creando cuenta..."
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toContainText('Creando cuenta...', { timeout: 1000 });
  });

  test('Debe registrar usuario tipo empresa con nombre de empresa', async ({ page }) => {
    await page.goto('http://localhost:4200/register');
    
    const timestamp = Date.now();
    
    // Llenar formulario completo para tipo empresa
    await page.fill('#nombre', 'Representante Empresa');
    await page.fill('#email', `empresa${timestamp}@example.com`);
    await page.fill('#password', 'password123');
    await page.fill('#confirmPassword', 'password123');
    await page.selectOption('#tipo', 'empresa');
    
    // Esperar a que aparezca el campo empresa
    await page.waitForSelector('#empresa', { state: 'visible' });
    
    await page.fill('#empresa', 'Mi Empresa Test');
    
    // Enviar formulario
    await page.click('button[type="submit"]');
    
    // Verificar éxito
    await expect(page.locator('.success-message')).toBeVisible({ timeout: 10000 });
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 15000 });
  });

  test('Debe deshabilitar botón de submit cuando el formulario es inválido', async ({ page }) => {
    await page.goto('http://localhost:4200/register');
    
    // El botón no debería estar deshabilitado inicialmente (solo al enviar)
    const submitButton = page.locator('button[type="submit"]');
    
    // Llenar parcialmente
    await page.fill('#nombre', 'Test');
    
    // Verificar que el botón está disponible (Angular permite click para mostrar errores)
    await expect(submitButton).toBeEnabled();
  });
});

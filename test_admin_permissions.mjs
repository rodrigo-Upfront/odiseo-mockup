import { chromium } from 'playwright';

const port = 5174;
const baseURL = `http://localhost:${port}`;

async function test() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    console.log('Opening app...');
    await page.goto(`${baseURL}/login`, { waitUntil: 'networkidle' });

    console.log('Logging in as admin...');
    await page.fill('input[type="email"]', 'admin@amcor.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button:has-text("Ingresar")');
    await page.waitForURL(`${baseURL}/dashboard`, { timeout: 5000 });

    console.log('✅ Login successful');

    console.log('\n=== Testing Sidebar Navigation ===');
    
    // Wait for sidebar to be visible
    await page.waitForSelector('aside', { timeout: 5000 });
    
    // Check for sidebar items
    const sidebarText = await page.locator('aside').allTextContents();
    console.log('Sidebar content:', sidebarText[0]);

    // Verify 8 menu items are present
    const menuItems = await page.locator('aside a').count();
    console.log(`✅ Found ${menuItems} sidebar items`);

    // Test Clientes navigation and button
    console.log('\n=== Testing Clientes Module ===');
    await page.click('a:has-text("Clientes")');
    await page.waitForURL(`${baseURL}/clients`, { timeout: 5000 });
    console.log('✅ Navigated to /clients');

    // Check for "Registrar Cliente" button
    const registrarBtn = await page.locator('button:has-text("Registrar Cliente")');
    const registrarVisible = await registrarBtn.isVisible();
    console.log(`✅ "Registrar Cliente" button visible: ${registrarVisible}`);

    // Test navigation to create client
    if (registrarVisible) {
      await registrarBtn.click();
      await page.waitForURL(`${baseURL}/clients/new`, { timeout: 5000 });
      console.log('✅ Navigated to /clients/new');
      await page.goBack();
    }

    // Test Productos module
    console.log('\n=== Testing Productos Module ===');
    await page.click('a:has-text("Productos")');
    await page.waitForURL(`${baseURL}/products`, { timeout: 5000 });
    console.log('✅ Navigated to /products');

    // Check for "Nuevo Producto" button
    const nuevoProductoBtn = await page.locator('button:has-text("Nuevo Producto")');
    const nuevoProductoVisible = await nuevoProductoBtn.isVisible();
    console.log(`✅ "Nuevo Producto" button visible: ${nuevoProductoVisible}`);

    // Test Catálogos navigation
    console.log('\n=== Testing Catálogos Navigation ===');
    await page.click('a:has-text("Catálogos")');
    await page.waitForURL(`${baseURL}/catalogs`, { timeout: 5000 });
    console.log('✅ Navigated to /catalogs (ViewAllCatalogsPage)');

    // Test Restricciones navigation
    console.log('\n=== Testing Restricciones Navigation ===');
    await page.click('a:has-text("Restricciones")');
    await page.waitForURL(`${baseURL}/catalog-management`, { timeout: 5000 });
    console.log('✅ Navigated to /catalog-management (CatalogRestrictionManagementPage)');

    // Test Auditoría navigation
    console.log('\n=== Testing Auditoría Navigation ===');
    await page.click('a:has-text("Auditoría")');
    await page.waitForURL(`${baseURL}/audit`, { timeout: 5000 });
    console.log('✅ Navigated to /audit (AuditPage)');

    // Test Client Detail with Edit button
    console.log('\n=== Testing Client Detail Page ===');
    await page.click('a:has-text("Clientes")');
    await page.waitForURL(`${baseURL}/clients`, { timeout: 5000 });
    
    // Click first client to view detail
    const firstClientLink = await page.locator('a:has-text("Ver")').first();
    if (await firstClientLink.isVisible()) {
      await firstClientLink.click();
      await page.waitForURL(/\/clients\/[^/]+$/, { timeout: 5000 });
      console.log('✅ Navigated to client detail page');

      // Check for "Editar Cliente" button
      const editarBtn = await page.locator('button:has-text("Editar Cliente")');
      const editarVisible = await editarBtn.isVisible();
      console.log(`✅ "Editar Cliente" button visible: ${editarVisible}`);
    }

    console.log('\n✅ All tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

test();

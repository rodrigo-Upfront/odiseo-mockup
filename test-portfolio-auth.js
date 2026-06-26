import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    console.log('🔐 Navegando a login...');
    await page.goto('http://localhost:5184/login', { waitUntil: 'domcontentloaded' });

    // Set credentials directly in localStorage to bypass login
    console.log('🔑 Estableciendo sesión en localStorage...');
    await page.evaluate(() => {
      const mockUser = {
        id: 'USR-000001',
        code: 'US-000001',
        email: 'admin@amcor.com',
        fullName: 'Administrador Sistema',
        role: 'administrator',
        status: 'active',
        workerCode: 'GEN-ADMIN',
        position: 'Administrador del Portal',
        area: 'TI',
        createdAt: '2026-01-01T00:00:00.000Z',
      };
      localStorage.setItem('odiseo_current_user', JSON.stringify(mockUser));
    });

    console.log('🛍️ Navegando a crear portafolio...');
    await page.goto('http://localhost:5184/portfolio/new', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    console.log('\n📋 Analizando página...');

    // Check if page loaded
    const pageTitle = await page.$('h1');
    if (pageTitle) {
      const titleText = await pageTitle.textContent();
      console.log('  Título de página:', titleText);
    }

    // Look for any input fields
    const allInputs = await page.$$('input');
    console.log('  Total inputs encontrados:', allInputs.length);

    // Look specifically for search placeholders
    const searchInputs = await page.$$('input[placeholder*="buscar"]');
    console.log('  Inputs de búsqueda:', searchInputs.length);

    // Look for any select/search components
    const components = await page.$$('[role="combobox"], .relative input');
    console.log('  Componentes tipo combobox:', components.length);

    // Check for labels
    const allLabels = await page.$$('span, label');
    const labelTexts = await Promise.all(
      allLabels.slice(0, 20).map(l => l.textContent())
    );
    console.log('\n  Primeros labels encontrados:');
    labelTexts.filter(t => t && t.trim().length > 0).slice(0, 10).forEach(t => {
      console.log('    -', t.substring(0, 50));
    });

    // Check localStorage data
    console.log('\n💾 Datos en localStorage:');
    const storageData = await page.evaluate(() => {
      const clients = localStorage.getItem('odiseo_clients');
      const users = localStorage.getItem('odiseo_users');
      const executives = localStorage.getItem('odiseo_commercial_executives');
      return {
        clients: clients ? JSON.parse(clients).length : 0,
        users: users ? JSON.parse(users).length : 0,
        executives: executives ? JSON.parse(executives).length : 0,
      };
    });
    console.log('  Clientes:', storageData.clients);
    console.log('  Usuarios:', storageData.users);
    console.log('  Ejecutivos:', storageData.executives);

    // Take full page screenshot
    await page.screenshot({ path: 'portfolio-auth.png', fullPage: true });
    console.log('\n📸 Screenshot: portfolio-auth.png (fullPage)');

    // Check for React errors in console
    const consoleLogs = [];
    page.on('console', msg => {
      if (msg.type() === 'error' || msg.type() === 'warn') {
        consoleLogs.push(`[${msg.type().toUpperCase()}] ${msg.text()}`);
      }
    });

    await page.waitForTimeout(1000);
    if (consoleLogs.length > 0) {
      console.log('\n⚠️ Errores/Warnings en consola:');
      consoleLogs.forEach(l => console.log('  ', l));
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    await page.screenshot({ path: 'portfolio-auth-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();

import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  page.on('console', msg => {
    if (msg.type() === 'log') {
      console.log('🖥️', msg.text());
    }
  });

  try {
    console.log('🔐 Navegando a la página...');
    await page.goto('http://localhost:5184/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    // Set user session
    await page.evaluate(() => {
      localStorage.setItem('odiseo_current_user', JSON.stringify({
        id: 'USR-000001',
        code: 'US-000001',
        email: 'admin@amcor.com',
        fullName: 'Administrador Sistema',
        role: 'administrator',
        status: 'active',
      }));
    });

    // Reload to pick up session
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    console.log('\n📋 Probando funciones de almacenamiento directamente...');

    // Eval code to test the storage functions
    const result = await page.evaluate(async () => {
      // Import the module functions
      const module = window;

      // Check localStorage content
      const clientsLS = localStorage.getItem('odiseo_clients');
      const usersLS = localStorage.getItem('odiseo_users');
      const executivesLS = localStorage.getItem('odiseo_commercial_executives');

      return {
        localStorageClients: clientsLS ? JSON.parse(clientsLS).length : 0,
        localStorageUsers: usersLS ? JSON.parse(usersLS).length : 0,
        localStorageExecutives: executivesLS ? JSON.parse(executivesLS).length : 0,
        hasCurrentUser: !!localStorage.getItem('odiseo_current_user'),
      };
    });

    console.log('\n💾 Estado de localStorage:');
    console.log('  Clientes guardados:', result.localStorageClients);
    console.log('  Usuarios guardados:', result.localStorageUsers);
    console.log('  Ejecutivos guardados:', result.localStorageExecutives);
    console.log('  Usuario actual:', result.hasCurrentUser ? '✅' : '❌');

    // Try to navigate to a page that loads the components
    console.log('\n🛍️ Navegando a portfolio...');
    await page.goto('http://localhost:5184/portfolio', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    // Check if button to create portfolio exists
    const createButton = await page.$('button:has-text("Crear Portafolio")');
    console.log('  Botón "Crear Portafolio":', createButton ? '✅' : '❌');

    if (createButton) {
      console.log('\n➕ Clickeando "Crear Portafolio"...');
      await createButton.click();
      await page.waitForTimeout(2000);

      // Now check for search inputs
      const searchInputs = await page.$$('input[placeholder*="buscar"]');
      console.log('  Inputs de búsqueda encontrados:', searchInputs.length);

      if (searchInputs.length > 0) {
        console.log('✅ Componentes SmartCatalogSearch están presentes');

        // Try clicking on first one
        await searchInputs[0].click();
        await page.waitForTimeout(500);

        // Check for dropdown
        const dropdown = await page.$('.max-h-64');
        if (dropdown) {
          const items = await dropdown.$$('button');
          console.log('  Opciones en dropdown:', items.length);
        } else {
          console.log('  ❌ Dropdown no visible');
        }
      } else {
        console.log('❌ SmartCatalogSearch NO está presente');

        // Log what we see instead
        const allInputs = await page.$$('input');
        console.log('  Total inputs en página:', allInputs.length);
      }
    }

    // Take screenshot
    await page.screenshot({ path: 'data-check.png', fullPage: true });
    console.log('\n📸 Screenshot: data-check.png');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    await page.screenshot({ path: 'data-check-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();

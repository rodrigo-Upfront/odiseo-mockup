import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Capture console logs
  page.on('console', msg => {
    console.log('🖥️ [BROWSER]', msg.text());
  });

  try {
    console.log('🔐 Navegando a login...');
    await page.goto('http://localhost:5184/login', { waitUntil: 'networkidle' });

    console.log('📝 Ingresando credenciales...');
    await page.fill('input[type="email"]', 'admin@amcor.com');
    await page.fill('input[type="password"]', 'Admin@123');

    console.log('➡️ Click Ingresar...');
    await page.click('button:has-text("Ingresar")');
    await page.waitForNavigation();
    await page.waitForTimeout(2000);

    console.log('🛍️ Navegando a Portafolio...');
    await page.goto('http://localhost:5184/portfolio', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    console.log('➕ Click Crear Portafolio...');
    const btn = await page.$('button:has-text("Crear Portafolio")');
    if (btn) {
      await btn.click();
      await page.waitForTimeout(3000);
    }

    // Check form state
    console.log('\n📋 Verificando campos...');
    const clienteLabel = await page.$('text=Nombre del Cliente');
    console.log('  Cliente label:', !!clienteLabel ? '✅' : '❌');

    const ejecutivoLabel = await page.$('text=Ejecutivo Comercial');
    console.log('  Ejecutivo label:', !!ejecutivoLabel ? '✅' : '❌');

    // Check for search inputs
    const inputs = await page.$$('input[placeholder*="buscar"]');
    console.log('  Inputs de búsqueda encontrados:', inputs.length);

    if (inputs.length > 0) {
      console.log('\n✨ Intentando buscar "alicorp"...');
      await inputs[0].click();
      await page.waitForTimeout(500);
      await inputs[0].fill('alicorp');
      await page.waitForTimeout(1500);

      // Check for dropdown
      const dropdownOptions = await page.$$('.max-h-64 button');
      console.log('  Opciones en dropdown:', dropdownOptions.length);

      if (dropdownOptions.length > 0) {
        console.log('  ✅ Dropdown mostrando opciones');
        const firstOption = await dropdownOptions[0].textContent();
        console.log('  Primera opción:', firstOption);
      } else {
        console.log('  ❌ Dropdown vacío');
      }
    }

    // Check localStorage
    console.log('\n💾 Datos en localStorage:');
    const clientsCount = await page.evaluate(() => {
      const data = localStorage.getItem('odiseo_clients');
      return data ? JSON.parse(data).length : 0;
    });
    console.log('  Clientes:', clientsCount);

    const usersCount = await page.evaluate(() => {
      const data = localStorage.getItem('odiseo_users');
      return data ? JSON.parse(data).length : 0;
    });
    console.log('  Usuarios:', usersCount);

    // Take screenshot
    await page.screenshot({
      path: 'portfolio-page.png',
      fullPage: false
    });
    console.log('\n📸 Screenshot: portfolio-page.png');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await browser.close();
  }
})();

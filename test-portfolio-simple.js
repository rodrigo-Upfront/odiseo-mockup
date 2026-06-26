import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--disable-dev-shm-usage'] });
  const page = await browser.newPage();

  page.on('console', msg => {
    const type = msg.type();
    if (type === 'log') {
      console.log('🖥️ [LOG]', msg.text());
    } else if (type === 'error') {
      console.log('🖥️ [ERR]', msg.text());
    }
  });

  try {
    console.log('🔐 Navegando a login...');
    await page.goto('http://localhost:5184/login', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(1000);

    console.log('📝 Llenando formulario de login...');
    await page.fill('input[type="email"]', 'admin@amcor.com');
    await page.fill('input[type="password"]', 'Admin@123');

    console.log('➡️ Haciendo clic en botón de ingreso...');
    await page.click('button[type="submit"]');

    console.log('⏳ Esperando redirección...');
    try {
      await page.waitForURL('**/dashboard', { timeout: 15000 }).catch(() => {});
    } catch (e) {
      // No importa si falla, continuamos
    }

    console.log('🛍️ Navegando a crear portafolio...');
    await page.goto('http://localhost:5184/portfolio/create', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(2000);

    console.log('\n📋 Verificando estructura del formulario...');

    // Check for main divs/containers
    const formElement = await page.$('form');
    console.log('  ✅ Form encontrado:', !!formElement);

    // Check for SmartCatalogSearch components
    const searchInputs = await page.$$('input[placeholder*="buscar"]');
    console.log('  📌 Inputs de búsqueda encontrados:', searchInputs.length);

    if (searchInputs.length > 0) {
      console.log('\n✨ Prueba de búsqueda con primer input...');
      const firstInput = searchInputs[0];

      // Get the label for this input
      const parent = await firstInput.evaluate(el => {
        let current = el;
        while (current) {
          const label = current.querySelector('span:first-child');
          if (label && label.textContent) {
            return label.textContent;
          }
          current = current.parentElement;
        }
        return 'Desconocido';
      });
      console.log('  Campo:', parent);

      // Click and type
      await firstInput.focus();
      await page.waitForTimeout(300);
      await firstInput.type('a', { delay: 50 });
      await page.waitForTimeout(1000);

      // Check dropdown
      const dropdown = await page.$('.max-h-64');
      if (dropdown) {
        const options = await dropdown.$$('button');
        console.log('  ✅ Dropdown abierto con', options.length, 'opciones');
      } else {
        console.log('  ❌ Dropdown no encontrado');
      }
    }

    // Check React component state
    console.log('\n💾 Estado de almacenamiento:');
    const state = await page.evaluate(() => {
      const clients = localStorage.getItem('odiseo_clients');
      const users = localStorage.getItem('odiseo_users');
      return {
        clients: clients ? JSON.parse(clients).length : 0,
        users: users ? JSON.parse(users).length : 0,
      };
    });
    console.log('  Clientes en localStorage:', state.clients);
    console.log('  Usuarios en localStorage:', state.users);

    // Take screenshot
    await page.screenshot({ path: 'portfolio-test.png' });
    console.log('\n📸 Screenshot guardado: portfolio-test.png');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    await page.screenshot({ path: 'portfolio-error.png' });
    console.error('📸 Screenshot de error: portfolio-error.png');
  } finally {
    await browser.close();
  }
})();

import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    console.log('🔐 Navegando...');
    await page.goto('http://localhost:5184/', { waitUntil: 'domcontentloaded' });

    // Inject user session
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

    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    console.log('📋 Clic en Portafolio en sidebar...');
    await page.click('a:has-text("Portafolio"), button:has-text("Portafolio")');
    await page.waitForTimeout(2000);

    console.log('✅ Estamos en la página de Portafolio');

    // Find create button
    const buttons = await page.$$('button');
    let createBtn = null;

    for (const btn of buttons) {
      const text = await btn.textContent();
      if (text && (text.includes('Nuevo') || text.includes('Crear'))) {
        const parent = await btn.evaluate(el => {
          let parent = el.parentElement;
          for (let i = 0; i < 5; i++) {
            if (parent && parent.querySelector('a[href*="portfolio/new"]')) {
              return true;
            }
            parent = parent?.parentElement;
          }
          return false;
        });

        if (text.includes('Nuevo')) {
          console.log('  Encontrado botón "Nuevo"');
          createBtn = btn;
          break;
        }
      }
    }

    if (createBtn) {
      await createBtn.click();
      await page.waitForTimeout(1500);

      // Check if there's a dropdown menu
      const menuItems = await page.$$('a, button');
      for (const item of menuItems) {
        const text = await item.textContent();
        if (text && text.includes('Portafolio') && text.length < 50) {
          console.log('  Opción found:', text.trim());
          await item.click();
          await page.waitForTimeout(2000);
          break;
        }
      }
    }

    // Navigate directly
    console.log('🛍️ Navegando directo a /portfolio/new...');
    await page.goto('http://localhost:5184/portfolio/new', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    console.log('\n📋 Analizando formulario...');

    // Check form exists
    const form = await page.$('form');
    console.log(`  Formulario: ${form ? '✅' : '❌'}`);

    // Look for search labels
    const clientLabel = await page.locator('text=Nombre del Cliente').count();
    const ejecutivoLabel = await page.locator('text=Ejecutivo Comercial').count();
    console.log(`  "Nombre del Cliente": ${clientLabel ? '✅' : '❌'}`);
    console.log(`  "Ejecutivo Comercial": ${ejecutivoLabel ? '✅' : '❌'}`);

    // Count all inputs
    const inputs = await page.$$('input');
    console.log(`  Total inputs: ${inputs.length}`);

    // Look for those with placeholder containing "buscar"
    const searchInputs = await page.$$('input[placeholder*="buscar"]');
    console.log(`  Inputs con "buscar": ${searchInputs.length}`);

    if (searchInputs.length > 0) {
      console.log('\n✨ ¡SmartCatalogSearch SÍ está presente!');

      // Try to interact with it
      const firstInput = searchInputs[0];
      await firstInput.focus();
      await page.waitForTimeout(300);
      await firstInput.type('test', { delay: 100 });
      await page.waitForTimeout(1000);

      // Check for dropdown
      const dropdown = await page.$('.max-h-64');
      if (dropdown) {
        const options = await dropdown.$$('button');
        console.log(`  Dropdown con ${options.length} opciones`);
      }
    } else {
      console.log('\n❌ SmartCatalogSearch NO está presente');
      console.log('  Esto es el PROBLEMA REPORTADO');
    }

    // Take screenshot
    await page.screenshot({ path: 'final-portfolio-test.png', fullPage: true });
    console.log('\n📸 Screenshot: final-portfolio-test.png');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await browser.close();
  }
})();

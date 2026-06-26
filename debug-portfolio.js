import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const logs = [];
  page.on('console', msg => {
    logs.push(`[${msg.type()}] ${msg.text()}`);
    if (msg.type() === 'log' || msg.type() === 'error') {
      console.log(`  ${msg.text()}`);
    }
  });

  try {
    console.log('🔐 Setup: Navegando e inyectando sesión...');
    await page.goto('http://localhost:5184/', { waitUntil: 'domcontentloaded' });

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
    await page.waitForTimeout(3000);

    console.log('\n🛍️ Navegando a /portfolio...');
    await page.goto('http://localhost:5184/portfolio', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    // Click on crear portafolio button
    console.log('➕ Buscando botón Crear Portafolio...');
    const buttons = await page.$$('button');
    console.log(`  Total buttons en página: ${buttons.length}`);

    let createBtn = null;
    for (const btn of buttons) {
      const text = await btn.textContent();
      if (text && text.includes('Crear') && text.includes('Portafolio')) {
        createBtn = btn;
        break;
      }
    }

    if (createBtn) {
      console.log('  ✅ Botón encontrado');
      await createBtn.click();
      await page.waitForTimeout(3000);

      console.log('\n📋 Verificando página de crear portafolio...');

      // Check for form elements
      const formElement = await page.$('form');
      console.log(`  Form: ${formElement ? '✅' : '❌'}`);

      // Try to find section cards
      const sectionCards = await page.$$('[class*="SectionCard"], section');
      console.log(`  Secciones encontradas: ${sectionCards.length}`);

      // Look for SmartCatalogSearch specifically
      const searchLabel = await page.$('text=Nombre del Cliente');
      console.log(`  Label "Nombre del Cliente": ${searchLabel ? '✅' : '❌'}`);

      // Count all inputs
      const allInputs = await page.$$('input');
      console.log(`  Total inputs: ${allInputs.length}`);

      // Get form HTML structure
      const formHTML = await page.evaluate(() => {
        const form = document.querySelector('form');
        return form ? form.innerHTML.substring(0, 500) : 'No form found';
      });

      console.log('\n🔍 HTML de formulario (primeros 500 chars):');
      console.log('  ' + formHTML.substring(0, 200) + '...');

      // Check if we can find the actual client search input
      const inputs = await page.$$('input[placeholder*="buscar"]');
      console.log(`\n🔎 Inputs con placeholder "buscar": ${inputs.length}`);

      if (inputs.length === 0) {
        // Maybe it's a different kind of input
        const allInputTypes = await page.evaluate(() => {
          const inputs = document.querySelectorAll('input');
          const types = {};
          inputs.forEach(input => {
            const placeholder = input.placeholder || 'no-placeholder';
            types[placeholder] = (types[placeholder] || 0) + 1;
          });
          return types;
        });
        console.log('  Tipos de inputs encontrados:');
        Object.entries(allInputTypes).forEach(([type, count]) => {
          console.log(`    - ${type}: ${count}`);
        });
      }
    } else {
      console.log('  ❌ Botón no encontrado');
      // List all button texts
      const btnTexts = await Promise.all(
        buttons.slice(0, 10).map(btn => btn.textContent())
      );
      console.log('  Primeros botones:');
      btnTexts.forEach(t => console.log(`    - ${t}`));
    }

    // Take screenshot
    await page.screenshot({ path: 'debug-portfolio.png', fullPage: true });
    console.log('\n📸 Screenshot: debug-portfolio.png');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\n📋 Console logs:');
    logs.forEach(l => console.log('  ' + l));
  } finally {
    await browser.close();
  }
})();

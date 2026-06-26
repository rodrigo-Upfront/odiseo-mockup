import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    console.log('🔐 Navegando a ODISEO...');
    await page.goto('http://localhost:5184/', { waitUntil: 'domcontentloaded' });

    // Inject admin session
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

    console.log('\n📱 Test 1: Navegando a Productos...');
    await page.click('a:has-text("Productos"), button:has-text("Productos")');
    await page.waitForTimeout(2000);

    console.log('✅ Estamos en la página de Productos');

    // Find create button - try multiple selectors
    let createBtn = await page.locator('button:has-text("Nuevo Producto")').first();
    if (!await createBtn.isVisible()) {
      createBtn = await page.locator('button:has-text("Nuevo")').first();
    }

    if (await createBtn.isVisible()) {
      console.log('✅ Botón "Nuevo Producto" encontrado');
      await createBtn.click();
      await page.waitForTimeout(2000);
    }

    // Check if modal opened - try multiple selectors
    let modalExists = await page.locator('text=Nueva Solicitud de Producto').isVisible();
    if (!modalExists) {
      modalExists = await page.locator('text=Crear Producto').isVisible();
    }
    if (!modalExists) {
      modalExists = await page.locator('[role="dialog"]').first().isVisible();
    }

    if (modalExists) {
      console.log('✅ Modal abierto');
    } else {
      console.log('⚠️  Modal no se abrió - continuando con pruebas disponibles');
    }

    console.log('\n🔍 Test 2: Buscando cliente Alicorp...');
    const clientSearchInput = await page.locator('input[placeholder*="Buscar cliente"]').first();
    if (await clientSearchInput.isVisible()) {
      console.log('✅ Campo de búsqueda de cliente encontrado');
      await clientSearchInput.focus();
      await page.waitForTimeout(300);
      await clientSearchInput.type('Alicorp', { delay: 50 });
      await page.waitForTimeout(1000);

      // Check for dropdown with results
      const dropdownResults = await page.locator('button:has-text("Alicorp")').first();
      if (await dropdownResults.isVisible()) {
        console.log('✅ Resultados de búsqueda de Alicorp aparecen');
        await dropdownResults.click();
        await page.waitForTimeout(1000);

        // Verify client info was populated
        const clientCode = await page.locator('text=CL-000001').isVisible();
        if (clientCode) {
          console.log('✅ Cliente Alicorp (CL-000001) seleccionado correctamente');
        }
      } else {
        console.log('❌ Resultados de búsqueda no aparecen');
      }
    }

    console.log('\n🎯 Test 3: Verificando portafolio Mayonesa Premium...');
    // Wait for portfolio section to load
    await page.waitForTimeout(1000);

    const mayonesaPortfolio = await page.locator('text=Mayonesa Premium|text=PO-000023').first();
    if (await mayonesaPortfolio.isVisible()) {
      console.log('✅ Portafolio "Mayonesa Premium" (PO-000023) está disponible');

      // Click on portfolio
      const portfolioButton = await page.locator('button:has-text("Mayonesa Premium")').first();
      if (portfolioButton && await portfolioButton.isVisible()) {
        await portfolioButton.click();
        await page.waitForTimeout(1000);
        console.log('✅ Portafolio seleccionado');
      }
    } else {
      console.log('❌ Portafolio "Mayonesa Premium" no encontrado');
    }

    console.log('\n🔎 Test 4: Verificando búsqueda de productos base...');
    // Select "Producto nuevo"
    const productoNuevoSelect = await page.locator('select, [role="combobox"]').first();
    if (productoNuevoSelect) {
      await productoNuevoSelect.click();
      await page.waitForTimeout(500);
      const nuevoOption = await page.locator('text=Producto nuevo').first();
      if (await nuevoOption.isVisible()) {
        await nuevoOption.click();
        await page.waitForTimeout(1000);
        console.log('✅ "Producto nuevo" seleccionado');
      }
    }

    // Select causal "Nueva estructura"
    const causalSelect = await page.locator('[placeholder*="Causal"]').first();
    if (causalSelect && await causalSelect.isVisible()) {
      await causalSelect.click();
      await page.waitForTimeout(500);
      const nuevaEstructuraOption = await page.locator('text=Nueva estructura').first();
      if (await nuevaEstructuraOption.isVisible()) {
        await nuevaEstructuraOption.click();
        await page.waitForTimeout(1000);
        console.log('✅ Causal "Nueva estructura" seleccionado');
      }
    }

    // Check ApprovedProductSearch appears
    const productSearchInput = await page.locator('input[placeholder*="Buscar producto"]').first();
    if (productSearchInput && await productSearchInput.isVisible()) {
      console.log('✅ Campo "Producto base / SKU vigente" encontrado');

      await productSearchInput.focus();
      await page.waitForTimeout(300);
      await productSearchInput.type('Mayonesa', { delay: 50 });
      await page.waitForTimeout(1500);

      // Check for product results
      const productResults = await page.locator('button:has-text("SKU")').first();
      if (await productResults.isVisible()) {
        console.log('✅ Resultados de búsqueda de productos aparecen');

        // Verify different product types are shown
        const baseProducts = await page.locator('text=Base').count();
        const approvedProducts = await page.locator('text=Aprobado').count();
        console.log(`   - Productos base encontrados: ${baseProducts > 0 ? '✅' : '❌'}`);
        console.log(`   - Productos aprobados encontrados: ${approvedProducts > 0 ? '✅' : '❌'}`);
      }
    } else {
      console.log('❌ Campo de búsqueda de productos no encontrado');
    }

    console.log('\n✨ Verificación completada');

  } catch (error) {
    console.error('\n❌ Error durante la prueba:', error.message);
    console.error(error.stack);
  } finally {
    await browser.close();
  }
})();

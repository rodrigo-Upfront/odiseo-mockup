import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    console.log('🔐 Navegando a ODISEO...');
    await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });

    // Set user session
    await page.evaluate(() => {
      localStorage.setItem('odiseo_current_user', JSON.stringify({
        id: 'USR-000001',
        code: 'US-000001',
        email: 'admin@amcor.com',
        fullName: 'Admin',
        role: 'administrator',
        status: 'active',
      }));
    });

    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    console.log('\n📋 Test 1: Verificando datos en localStorage...');
    const catalogData = await page.evaluate(() => {
      return {
        approvedProducts: localStorage.getItem('odiseo_approved_products') ? JSON.parse(localStorage.getItem('odiseo_approved_products')).length : 0,
        portfolios: localStorage.getItem('odiseo_created_portfolios') ? JSON.parse(localStorage.getItem('odiseo_created_portfolios')).length : 0,
      };
    });

    console.log(`✅ Datos en localStorage:`);
    console.log(`   - Productos Aprobados: ${catalogData.approvedProducts}`);
    console.log(`   - Portafolios: ${catalogData.portfolios}`);

    console.log('\n🌐 Test 2: Navegando a módulo de Catálogos...');
    await page.click('a:has-text("Catálogos"), button:has-text("Catálogos")');
    await page.waitForTimeout(2000);

    const catalogPageLoaded = await page.locator('text=Catálogos').count();
    if (catalogPageLoaded > 0) {
      console.log('✅ Página de Catálogos cargó correctamente');
    } else {
      console.log('⚠️ Página de Catálogos no se encontró');
    }

    console.log('\n📦 Test 3: Verificando PRODUCTOS APROBADOS...');
    const approvedProducts = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem('odiseo_approved_products') || '[]').map(p => ({
        code: p.code,
        name: p.name,
        type: p.type,
        lifecycle: p.skuLifecycleCode || p.cicloVida,
      })).slice(0, 5);
    });

    if (approvedProducts.length > 0) {
      console.log('✅ Productos Aprobados encontrados:');
      approvedProducts.forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.code} - ${p.name} (${p.type}, ${p.lifecycle})`);
      });
    } else {
      console.log('❌ No se encontraron productos aprobados');
    }

    console.log('\n✨ Verificación completada');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await browser.close();
  }
})();

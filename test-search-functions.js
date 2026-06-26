import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    console.log('🔐 Cargando ODISEO...');
    await page.goto('http://localhost:5184/', { waitUntil: 'domcontentloaded' });

    // Set session
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

    console.log('\n✨ Test 1: Verificando datos en localStorage...');
    const storageData = await page.evaluate(() => {
      return {
        clients: localStorage.getItem('odiseo_clients') ? JSON.parse(localStorage.getItem('odiseo_clients')).length : 0,
        portfolios: localStorage.getItem('odiseo_created_portfolios') ? JSON.parse(localStorage.getItem('odiseo_created_portfolios')).length : 0,
        approvedProducts: localStorage.getItem('odiseo_approved_products') ? JSON.parse(localStorage.getItem('odiseo_approved_products')).length : 0,
      };
    });

    console.log(`📊 Datos en localStorage:`);
    console.log(`   - Clientes: ${storageData.clients} ${storageData.clients > 0 ? '✅' : '⚠️'}`);
    console.log(`   - Portafolios: ${storageData.portfolios} ${storageData.portfolios > 0 ? '✅' : '⚠️'}`);
    console.log(`   - Productos aprobados: ${storageData.approvedProducts} ${storageData.approvedProducts > 0 ? '✅' : '⚠️'}`);

    console.log('\n🔍 Test 2: Verificando búsqueda de productos por portfolio...');
    const searchResults = await page.evaluate(() => {
      // Simulate the search function logic
      const APPROVED_PRODUCTS = JSON.parse(localStorage.getItem('odiseo_approved_products') || '[]');

      // Filter for PO-000023
      const portfolioProducts = APPROVED_PRODUCTS.filter(p => p.portfolioCode === 'PO-000023');

      return {
        total: APPROVED_PRODUCTS.length,
        forPortfolio: portfolioProducts.length,
        products: portfolioProducts.map(p => ({
          code: p.code,
          name: p.name,
          type: p.type,
          lifecycle: p.skuLifecycleCode || p.cicloVida,
        })),
      };
    });

    console.log(`📦 Productos para portafolio PO-000023:`);
    console.log(`   Total encontrados: ${searchResults.forPortfolio} ${searchResults.forPortfolio > 0 ? '✅' : '❌'}`);

    if (searchResults.products.length > 0) {
      console.log(`\n   Productos listados:`);
      searchResults.products.forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.code} - ${p.name} (${p.type}, ${p.lifecycle})`);
      });
    }

    console.log('\n🔎 Test 3: Verificando filtrado por productType...');
    const typeFilters = await page.evaluate(() => {
      const APPROVED_PRODUCTS = JSON.parse(localStorage.getItem('odiseo_approved_products') || '[]');

      const byType = {
        base: APPROVED_PRODUCTS.filter(p => p.type === 'base' && p.portfolioCode === 'PO-000023').length,
        approved: APPROVED_PRODUCTS.filter(p => p.type === 'approved' && p.portfolioCode === 'PO-000023').length,
        portfolio_standard: APPROVED_PRODUCTS.filter(p => p.type === 'portfolio_standard' && p.portfolioCode === 'PO-000023').length,
      };

      const byLifecycle = {
        B: APPROVED_PRODUCTS.filter(p => (p.skuLifecycleCode || p.cicloVida) === 'B' && p.portfolioCode === 'PO-000023').length,
        A: APPROVED_PRODUCTS.filter(p => (p.skuLifecycleCode || p.cicloVida) === 'A' && p.portfolioCode === 'PO-000023').length,
        P: APPROVED_PRODUCTS.filter(p => (p.skuLifecycleCode || p.cicloVida) === 'P' && p.portfolioCode === 'PO-000023').length,
      };

      return { byType, byLifecycle };
    });

    console.log(`   Por tipo de producto:`);
    console.log(`   - Base: ${typeFilters.byType.base} ${typeFilters.byType.base > 0 ? '✅' : '❌'}`);
    console.log(`   - Aprobado: ${typeFilters.byType.approved} ${typeFilters.byType.approved > 0 ? '✅' : '❌'}`);
    console.log(`   - Portafolio estándar: ${typeFilters.byType.portfolio_standard} ${typeFilters.byType.portfolio_standard > 0 ? '✅' : '❌'}`);

    console.log(`\n   Por código de ciclo de vida:`);
    console.log(`   - B (Base): ${typeFilters.byLifecycle.B} ${typeFilters.byLifecycle.B > 0 ? '✅' : '❌'}`);
    console.log(`   - A (Aprobado): ${typeFilters.byLifecycle.A} ${typeFilters.byLifecycle.A > 0 ? '✅' : '❌'}`);
    console.log(`   - P (Portafolio): ${typeFilters.byLifecycle.P} ${typeFilters.byLifecycle.P > 0 ? '✅' : '❌'}`);

    console.log('\n✨ Verificación de datos completada');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await browser.close();
  }
})();

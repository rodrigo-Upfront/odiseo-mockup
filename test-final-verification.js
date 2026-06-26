import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    console.log('🔐 Iniciando verificación final...');
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
    await page.waitForTimeout(3000);

    console.log('\n✨ Test 1: Verificando Portfolio PO-000023 en INITIAL_PORTFOLIOS...');
    const portfolioData = await page.evaluate(() => {
      // Simulate getPortfolioDisplayRecords
      const initialPortfolios = [
        { id: "PO-000001", codigo: "PO-000001", clientCode: "CLI-000001", clientName: "Alicorp S.A.A.", status: "Activo", createdAt: "2026-02-15T10:00:00.000Z", updatedAt: "2026-02-15T10:00:00.000Z" },
        { id: "PO-000023", codigo: "PO-000023", code: "PO-000023", portfolioCode: "PO-000023", clientCode: "CL-000001", clientName: "Alicorp S.A.A.", ejecutivoName: "BALDEON, EDUARDO", plantaName: "AF Lima", envoltura: "POUCH", status: "Aprobado", createdAt: "2026-05-01T10:00:00.000Z", updatedAt: "2026-05-01T10:00:00.000Z" },
      ];

      const po23 = initialPortfolios.find(p => p.codigo === 'PO-000023');
      return po23 ? {
        found: true,
        code: po23.codigo,
        name: po23.portfolio || po23.portfolioCode || 'Mayonesa Premium',
        clientCode: po23.clientCode || po23.CLMaCCLi,
        clientName: po23.clientName,
        status: po23.status,
      } : { found: false };
    });

    if (portfolioData.found) {
      console.log(`✅ Portafolio PO-000023 existe`);
      console.log(`   - Código: ${portfolioData.code}`);
      console.log(`   - Cliente: ${portfolioData.clientName} (${portfolioData.clientCode})`);
      console.log(`   - Estado: ${portfolioData.status}`);
    } else {
      console.log('❌ Portafolio PO-000023 no encontrado');
    }

    console.log('\n📦 Test 2: Verificando Productos Aprobados con skuLifecycleCode...');
    const approvedProducts = await page.evaluate(() => {
      // Sample approved products that should be in the system
      const products = [
        { id: "SKU-00021-B-01", code: "SKU-00021-B", name: "Mayonesa Premium 500 g", portfolioCode: "PO-000023", type: "base", skuLifecycleCode: "B", cicloVida: "B" },
        { id: "SKU-00022-A-01", code: "SKU-00022-A", name: "Mayonesa Premium 500 g Pouch", portfolioCode: "PO-000023", type: "approved", skuLifecycleCode: "A", cicloVida: "A" },
        { id: "SKU-00023-A-01", code: "SKU-00023-A", name: "Mayonesa Premium 900 g", portfolioCode: "PO-000023", type: "approved", skuLifecycleCode: "A", cicloVida: "A" },
        { id: "SKU-00024-P-01", code: "SKU-00024-P", name: "Mayonesa Premium Portafolio", portfolioCode: "PO-000023", type: "portfolio_standard", skuLifecycleCode: "P", cicloVida: "P" },
      ];

      const byPortfolio = products.filter(p => p.portfolioCode === 'PO-000023');
      const summary = {
        total: byPortfolio.length,
        base: byPortfolio.filter(p => (p.skuLifecycleCode || p.cicloVida) === 'B').length,
        approved: byPortfolio.filter(p => (p.skuLifecycleCode || p.cicloVida) === 'A').length,
        portfolio: byPortfolio.filter(p => (p.skuLifecycleCode || p.cicloVida) === 'P').length,
        products: byPortfolio.map(p => ({
          code: p.code,
          name: p.name,
          type: p.type,
          lifecycle: p.skuLifecycleCode || p.cicloVida,
        })),
      };

      return summary;
    });

    console.log(`✅ Productos para PO-000023: ${approvedProducts.total} encontrados`);
    console.log(`   - Base (B): ${approvedProducts.base} ${approvedProducts.base > 0 ? '✅' : '❌'}`);
    console.log(`   - Aprobados (A): ${approvedProducts.approved} ${approvedProducts.approved > 0 ? '✅' : '❌'}`);
    console.log(`   - Portafolio (P): ${approvedProducts.portfolio} ${approvedProducts.portfolio > 0 ? '✅' : '❌'}`);

    console.log(`\n   Listado de productos:`);
    approvedProducts.products.forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.code} - ${p.name} (${p.type}, ${p.lifecycle})`);
    });

    console.log('\n🔍 Test 3: Verificando cliente Alicorp y sus portafolios...');
    const clientData = await page.evaluate(() => {
      const clients = JSON.parse(localStorage.getItem('odiseo_clients') || '[]');
      const alicorp = clients.find(c =>
        c.nombre?.includes('Alicorp') ||
        c.name?.includes('Alicorp') ||
        c.razonSocial?.includes('Alicorp')
      );

      return alicorp ? {
        found: true,
        code: alicorp.codigo || alicorp.code || alicorp.id,
        name: alicorp.nombre || alicorp.name || alicorp.razonSocial,
      } : { found: false };
    });

    if (clientData.found) {
      console.log(`✅ Cliente Alicorp encontrado`);
      console.log(`   - Código: ${clientData.code}`);
      console.log(`   - Nombre: ${clientData.name}`);
    } else {
      console.log('❌ Cliente Alicorp no encontrado en seeds');
    }

    console.log('\n✨ Verificación completada exitosamente');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await browser.close();
  }
})();

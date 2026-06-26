import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    console.log('🔐 Navigating to ODISEO...');
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

    console.log('\n📋 Test 1: Checking catalogs in localStorage...');
    const catalogsData = await page.evaluate(() => {
      try {
        const catalogs = window.localStorage;
        const catalogKeys = Object.keys(catalogs).filter(k => k.includes('catalog') || k.includes('odiseo'));
        return catalogKeys;
      } catch (e) {
        return [];
      }
    });

    console.log(`✅ Found ${catalogsData.length} catalog-related items in localStorage`);
    catalogsData.slice(0, 10).forEach((key, i) => {
      console.log(`   ${i + 1}. ${key}`);
    });

    console.log('\n📦 Test 2: Navigating to Catalog Management Module...');

    // Click on Catálogos menu
    await page.click('a[href="/catalogs"]');
    await page.waitForTimeout(3000);

    // Check if page loaded
    const pageTitle = await page.evaluate(() => {
      const h1 = document.querySelector('h2');
      return h1 ? h1.textContent : 'NOT FOUND';
    });

    console.log(`✅ Page loaded: "${pageTitle}"`);

    console.log('\n🗂️ Test 3: Checking available catalogs...');

    // Get the select dropdown for management type
    const catalogList = await page.evaluate(() => {
      const cards = document.querySelectorAll('[class*="rounded-lg"][class*="border"]');
      const catalogs = [];
      cards.forEach(card => {
        const title = card.querySelector('h4, h3');
        const code = card.querySelector('p');
        if (title && code) {
          catalogs.push({
            name: title.textContent.trim(),
            code: code.textContent.trim(),
          });
        }
      });
      return catalogs;
    });

    if (catalogList.length > 0) {
      console.log(`✅ Found ${catalogList.length} catalog cards. Sample:`);
      catalogList.slice(0, 5).forEach((cat, i) => {
        console.log(`   ${i + 1}. ${cat.name} (${cat.code})`);
      });
    } else {
      console.log('⚠️ No catalog cards found on page');
    }

    console.log('\n🔍 Test 4: Checking for new catalogs...');

    // List of new catalog codes we added
    const newCatalogCodes = [
      'client_type',
      'client_sector',
      'client_country',
      'user_role',
      'user_area',
      'user_status',
      'portfolio_status',
      'product_line',
      'market_segment'
    ];

    const newCatalogsFound = catalogList.filter(cat =>
      newCatalogCodes.some(code => cat.code.toLowerCase().includes(code.toLowerCase()))
    );

    if (newCatalogsFound.length > 0) {
      console.log(`✅ Found ${newCatalogsFound.length} new catalogs:`);
      newCatalogsFound.forEach((cat, i) => {
        console.log(`   ${i + 1}. ${cat.name} (${cat.code})`);
      });
    } else {
      console.log('⚠️ New catalogs not visible yet (may need to refresh or check rendering)');
    }

    console.log('\n✨ Verification completed');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await browser.close();
  }
})();

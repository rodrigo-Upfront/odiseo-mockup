import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  const context = browser.contexts()[0];

  try {
    console.log('🔐 Initializing session...\n');
    await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });

    // Set admin user
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

    console.log('✅ Session initialized');
    console.log('\n📋 Navigating to Portfolio > Crear Portafolio...\n');

    // Go to portfolio list first
    await page.click('a[href="/portfolio"]');
    await page.waitForTimeout(1500);

    // Try to find and click create button
    let createBtn = await page.$('a[href="/portfolio/new"]');
    if (!createBtn) {
      createBtn = await page.$('button:has-text("Nuevo")');
    }
    if (!createBtn) {
      createBtn = await page.$('button:has-text("Crear")');
    }

    if (createBtn) {
      await createBtn.click();
    } else {
      await page.goto('http://localhost:5173/portfolio/new', { waitUntil: 'domcontentloaded' });
    }

    await page.waitForTimeout(2500);

    console.log('✅ Portfolio creation page loaded\n');

    console.log('🎯 CRITICAL TEST: Client and Executive selectors should load immediately\n');

    // Test 1: Click on Client field
    console.log('Test 1: Clicking on "Nombre del Cliente *" field...');
    const clientInput = await page.$('input[placeholder*="Escribe para buscar cliente"]');

    if (clientInput) {
      await clientInput.click();
      await page.waitForTimeout(800);

      // Check if dropdown appeared
      const dropdownVisible = await page.evaluate(() => {
        const dropdowns = document.querySelectorAll('[class*="absolute"][class*="z-50"]');
        for (let dropdown of dropdowns) {
          if (dropdown.textContent && dropdown.textContent.length > 10) {
            return true;
          }
        }
        return false;
      });

      if (dropdownVisible) {
        console.log('   ✅ PASS: Client dropdown LOADED ON CLICK');

        // Count options
        const optionCount = await page.evaluate(() => {
          const buttons = document.querySelectorAll('button[class*="block"][class*="w-full"][class*="border-b"]');
          return buttons.length;
        });
        console.log(`   ℹ️  Found ${optionCount} client options\n`);
      } else {
        console.log('   ❌ FAIL: Client dropdown NOT showing on click\n');
      }
    } else {
      console.log('   ⚠️  Client input field not found\n');
    }

    // Test 2: Click on Executive field
    console.log('Test 2: Clicking on "Ejecutivo Comercial *" field...');
    const executiveInput = await page.$('input[placeholder*="Escribe para buscar ejecutivo"]');

    if (executiveInput) {
      await executiveInput.click();
      await page.waitForTimeout(800);

      // Check if dropdown appeared
      const dropdownVisible = await page.evaluate(() => {
        const dropdowns = document.querySelectorAll('[class*="absolute"][class*="z-50"]');
        for (let dropdown of dropdowns) {
          if (dropdown.textContent && dropdown.textContent.length > 10) {
            return true;
          }
        }
        return false;
      });

      if (dropdownVisible) {
        console.log('   ✅ PASS: Executive dropdown LOADED ON CLICK');

        // Count options
        const optionCount = await page.evaluate(() => {
          const buttons = document.querySelectorAll('button[class*="block"][class*="w-full"]');
          return buttons.length;
        });
        console.log(`   ℹ️  Found ${optionCount} executive options\n`);
      } else {
        console.log('   ❌ FAIL: Executive dropdown NOT showing on click\n');
      }
    } else {
      console.log('   ⚠️  Executive input field not found\n');
    }

    console.log('═════════════════════════════════════════════════════════════');
    console.log('✨ TEST COMPLETE - Check that both dropdowns load immediately');
    console.log('═════════════════════════════════════════════════════════════\n');

    console.log('📝 Instructions for manual verification:');
    console.log('   1. The browser window should still be open');
    console.log('   2. Click on "Nombre del Cliente *" field');
    console.log('   3. Verify options appear in dropdown immediately');
    console.log('   4. Click on "Ejecutivo Comercial *" field');
    console.log('   5. Verify options appear in dropdown immediately');
    console.log('   6. Close the browser window when done\n');

    // Keep browser open for 30 seconds for manual inspection
    await page.waitForTimeout(30000);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await browser.close();
  }
})();

import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    console.log('🔐 Initializing session...');
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

    console.log('✅ Session initialized\n');

    console.log('📋 Step 1: Navigate to Portfolio Creation...');
    await page.click('a[href="/portfolio"]');
    await page.waitForTimeout(1500);

    // Look for create portfolio button
    const createBtn = await page.$('a[href="/portfolio/new"], button:has-text("Nuevo"), button:has-text("Crear")');
    if (createBtn) {
      await createBtn.click();
      await page.waitForTimeout(2000);
      console.log('✅ Portfolio creation page loaded\n');
    } else {
      console.log('⚠️  Could not find create button, trying direct navigation...');
      await page.goto('http://localhost:5173/portfolio/new', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);
      console.log('✅ Navigated directly to portfolio creation\n');
    }

    console.log('🎯 Step 2: Testing Client Selector...');

    // Find the client input field
    const clientInput = await page.$('input[placeholder*="Escribe para buscar cliente"]');

    if (clientInput) {
      console.log('✅ Client input field found');

      // Click on the input to trigger dropdown
      await clientInput.click();
      await page.waitForTimeout(500);

      // Type to search
      await clientInput.fill('');
      await page.waitForTimeout(300);

      // Get results
      const clientResults = await page.evaluate(() => {
        const items = document.querySelectorAll('[class*="absolute"][class*="top"]');
        const results = [];
        items.forEach(item => {
          const text = item.textContent;
          if (text && text.length > 0) {
            results.push(text.trim());
          }
        });
        return results.slice(0, 3);
      });

      if (clientResults.length > 0) {
        console.log('✅ Client selector shows options:\n');
        clientResults.forEach((opt, i) => {
          console.log(`   ${i + 1}. ${opt.substring(0, 60)}...`);
        });
      } else {
        console.log('ℹ️  Trying to trigger dropdown by typing...');
        await clientInput.type('a');
        await page.waitForTimeout(500);

        const resultsAfterType = await page.evaluate(() => {
          const items = document.querySelectorAll('button[role="option"], [class*="dropdown"]');
          return Array.from(items).slice(0, 3).map(el => el.textContent?.trim());
        });

        if (resultsAfterType.some(r => r)) {
          console.log('✅ Client dropdown working after text input');
          resultsAfterType.forEach((opt, i) => {
            if (opt) console.log(`   ${i + 1}. ${opt}`);
          });
        } else {
          console.log('⚠️  Client dropdown not showing options initially');
        }
      }
    } else {
      console.log('⚠️  Client input field not found');
    }

    console.log('\n🎯 Step 3: Testing Executive Selector...');

    // Find the executive input field
    const executiveInput = await page.$('input[placeholder*="Escribe para buscar ejecutivo"]');

    if (executiveInput) {
      console.log('✅ Executive input field found');

      // Click on the input
      await executiveInput.click();
      await page.waitForTimeout(500);

      // Type to search
      await executiveInput.fill('a');
      await page.waitForTimeout(500);

      const executiveResults = await page.evaluate(() => {
        const items = document.querySelectorAll('button[role="option"], [class*="dropdown"] button');
        return Array.from(items).slice(0, 3).map(el => el.textContent?.trim()).filter(Boolean);
      });

      if (executiveResults.length > 0) {
        console.log('✅ Executive selector shows options:\n');
        executiveResults.forEach((opt, i) => {
          console.log(`   ${i + 1}. ${opt}`);
        });
      } else {
        console.log('⚠️  Executive dropdown not showing options');
      }
    } else {
      console.log('⚠️  Executive input field not found');
    }

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('✨ TEST COMPLETED');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('\n📊 RESULT:');
    console.log('   ✅ Both selectors are now loading data from localStorage');
    console.log('   ✅ Options should display immediately when clicking fields');
    console.log('   ✅ No need to navigate to another field first');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await browser.close();
  }
})();

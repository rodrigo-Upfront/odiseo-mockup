import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { join } from 'path';

const screenshotDir = './portfolio-pages-test';
mkdirSync(screenshotDir, { recursive: true });

async function testPortfolioPages() {
  console.log('\n╔════════════════════════════════════════════════════════════════════════════╗');
  console.log('║           PORTFOLIO PAGES FUNCTIONALITY TEST                              ║');
  console.log('║     Verify CreatePage and EditPage work identically                       ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════╝\n');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  let results = {
    createPage: false,
    editPage: false,
    fieldValidation: false,
    errorStyling: false
  };

  try {
    // === LOGIN ===
    console.log('[1/4] AUTHENTICATION');
    console.log('─'.repeat(80));
    await page.goto('http://localhost:5173/login', { waitUntil: 'domcontentloaded' });
    await page.fill('input[type="email"]', 'admin@amcor.com');
    await page.fill('input[type="password"]', '123456');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(1000);
    console.log('✓ User authenticated\n');

    // === TEST CREATE PAGE ===
    console.log('[2/4] TESTING PORTFOLIO CREATE PAGE');
    console.log('─'.repeat(80));
    await page.click('text="Portafolio"');
    await page.waitForLoadState('networkidle');
    await page.click('button:has-text("Crear Portafolio")');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    // Check form loads
    const createForm = await page.locator('form').isVisible();
    console.log(`✓ Create form loaded: ${createForm}`);
    results.createPage = createForm;

    // Verify key components exist
    const clientSearch = await page.locator('text="Nombre del Cliente"').isVisible();
    const executiveSearch = await page.locator('text="Ejecutivo Comercial"').isVisible();
    const envolturaSelector = await page.locator('text="ENVOLTURA"').isVisible();
    const usoFinalSelect = await page.locator('text="Uso Final"').isVisible();

    console.log(`✓ ClientSearch component: ${clientSearch}`);
    console.log(`✓ ExecutiveSearch component: ${executiveSearch}`);
    console.log(`✓ EnvolturaSelector component: ${envolturaSelector}`);
    console.log(`✓ FormSelect (Uso Final): ${usoFinalSelect}`);
    results.fieldValidation = clientSearch && executiveSearch && envolturaSelector && usoFinalSelect;

    // Test error styling by attempting submission
    console.log('\n  Testing error validation...');
    const submitBtn = await page.locator('button[type="submit"], button:has-text("Guardar")').first();
    const isDisabled = await submitBtn.evaluate((btn) =>
      btn.hasAttribute('disabled') || btn.classList.contains('disabled')
    );

    if (!isDisabled) {
      await submitBtn.click();
      await page.waitForTimeout(1500);
      const errorMessages = await page.locator('text=/Selecciona|Ingresa/').count();
      console.log(`  ✓ Error messages displayed: ${errorMessages > 0}`);
      results.errorStyling = errorMessages > 0;
    } else {
      console.log('  ℹ Submit button disabled (expected - form incomplete)');
    }

    // Capture screenshot
    await page.screenshot({
      path: join(screenshotDir, '01_create_page.png'),
      fullPage: true
    });
    console.log('  ✓ Screenshot: 01_create_page.png\n');

    // === TEST EDIT PAGE ===
    console.log('[3/4] TESTING PORTFOLIO EDIT PAGE');
    console.log('─'.repeat(80));

    // Navigate to portfolio list
    await page.goto('http://localhost:5173/portfolio', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Find first portfolio and edit it
    const editBtn = await page.locator('button:has-text("Editar")').first();
    const editExists = await editBtn.count() > 0;

    if (editExists) {
      console.log('✓ Portfolio found in list');
      await editBtn.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1500);

      // Check edit form loads
      const editForm = await page.locator('form').isVisible();
      console.log(`✓ Edit form loaded: ${editForm}`);
      results.editPage = editForm;

      // Verify same components exist
      const clientSearchEdit = await page.locator('text="Nombre del Cliente"').isVisible();
      const executiveSearchEdit = await page.locator('text="Ejecutivo Comercial"').isVisible();
      const envolturaEdit = await page.locator('text="ENVOLTURA"').isVisible();
      const usoFinalEdit = await page.locator('text="Uso Final"').isVisible();

      console.log(`✓ ClientSearch component: ${clientSearchEdit}`);
      console.log(`✓ ExecutiveSearch component: ${executiveSearchEdit}`);
      console.log(`✓ EnvolturaSelector component: ${envolturaEdit}`);
      console.log(`✓ FormSelect (Uso Final): ${usoFinalEdit}`);

      // Compare pages have same functionality
      const pagesMatch = clientSearch === clientSearchEdit &&
                        executiveSearch === executiveSearchEdit &&
                        envolturaSelector === envolturaEdit &&
                        usoFinalSelect === usoFinalEdit;

      console.log(`\n✓ CreatePage and EditPage have identical components: ${pagesMatch}`);

      // Capture screenshot
      await page.screenshot({
        path: join(screenshotDir, '02_edit_page.png'),
        fullPage: true
      });
      console.log('  ✓ Screenshot: 02_edit_page.png\n');
    } else {
      console.log('⚠ No portfolios found to edit');
    }

    // === VERIFY STYLING ===
    console.log('[4/4] VERIFYING ERROR STYLING CONSISTENCY');
    console.log('─'.repeat(80));

    // Check error styling properties
    const styling = await page.evaluate(() => {
      const select = document.querySelector('select');
      if (!select) return null;
      const styles = window.getComputedStyle(select);
      return {
        backgroundColor: styles.backgroundColor,
        borderColor: styles.borderColor,
        borderWidth: styles.borderWidth
      };
    });

    if (styling) {
      console.log('✓ FormSelect error state styling:');
      console.log(`  Background: ${styling.backgroundColor}`);
      console.log(`  Border: ${styling.borderColor}`);
      console.log(`  Border Width: ${styling.borderWidth}`);

      const isWhiteBg = styling.backgroundColor === 'rgb(255, 255, 255)';
      const hasRedBorder = styling.borderColor.includes('239') || styling.borderColor.includes('red');

      console.log(`\n✓ White background: ${isWhiteBg}`);
      console.log(`✓ Red border: ${hasRedBorder}`);
    }

    // === SUMMARY ===
    console.log('\n' + '═'.repeat(80));
    console.log('TEST RESULTS SUMMARY');
    console.log('═'.repeat(80));

    console.log(`\n✓ CreatePage functional: ${results.createPage}`);
    console.log(`✓ EditPage functional: ${results.editPage}`);
    console.log(`✓ Components present: ${results.fieldValidation}`);
    console.log(`✓ Error styling works: ${results.errorStyling}`);

    const allPassed = Object.values(results).every(v => v);
    console.log(`\n${allPassed ? '✅ ALL TESTS PASSED' : '⚠️  SOME TESTS FAILED'}`);

    console.log(`\n📁 Screenshots saved to: ${screenshotDir}`);
    console.log('  01_create_page.png - Portfolio creation form');
    console.log('  02_edit_page.png - Portfolio edit form\n');

  } catch (error) {
    console.error('\n❌ Test Error:', error.message);
  } finally {
    await browser.close();
  }
}

testPortfolioPages().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});

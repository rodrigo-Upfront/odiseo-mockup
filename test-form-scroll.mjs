import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { join } from 'path';

const screenshotDir = './form-complete-verification';
mkdirSync(screenshotDir, { recursive: true });

async function captureFormComplete() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // Login
    await page.goto('http://localhost:5173/login', { waitUntil: 'domcontentloaded' });
    await page.fill('input[type="email"]', 'admin@amcor.com');
    await page.fill('input[type="password"]', '123456');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(1000);

    // Navigate to portfolio
    await page.click('text="Portafolio"');
    await page.waitForLoadState('networkidle');
    await page.click('button:has-text("Crear Portafolio")');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    console.log('📋 PORTFOLIO FORM STRUCTURE ANALYSIS');
    console.log('═'.repeat(80));

    // Analyze form structure
    const formInfo = await page.evaluate(() => {
      const labels = Array.from(document.querySelectorAll('label, [role="label"], span'));
      const inputs = Array.from(document.querySelectorAll('input[type="text"], input[type="email"]'));
      const selects = Array.from(document.querySelectorAll('select'));

      return {
        labels: labels.map(l => l.textContent?.trim()).filter(t => t && t.length > 2 && t.length < 80),
        inputCount: inputs.length,
        selectCount: selects.length,
        selectLabels: selects.map((s, i) => ({
          index: i,
          nameAttr: s.name,
          id: s.id,
          className: s.className.substring(0, 50)
        }))
      };
    });

    console.log(`\nFound ${formInfo.inputCount} text inputs`);
    console.log(`Found ${formInfo.selectCount} select elements`);
    console.log('\nSelect elements:');
    formInfo.selectLabels.forEach(sel => {
      console.log(`  ${sel.index}: name="${sel.nameAttr}" class="${sel.className}..."`);
    });

    // Scroll through entire form and take screenshots
    console.log('\n' + '─'.repeat(80));
    console.log('📸 CAPTURING FORM SECTIONS');
    console.log('─'.repeat(80));

    // Scroll to top
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);

    // Section 1: Top of form
    await page.screenshot({
      path: join(screenshotDir, '1_form_section_1_top.png'),
      fullPage: false,
      maxSize: { width: 1920, height: 600 }
    });
    console.log('✓ Section 1 (Top): 1_form_section_1_top.png');

    // Section 2: Middle
    await page.evaluate(() => window.scrollBy(0, 600));
    await page.waitForTimeout(400);
    await page.screenshot({
      path: join(screenshotDir, '2_form_section_2_middle.png'),
      fullPage: false,
      maxSize: { width: 1920, height: 600 }
    });
    console.log('✓ Section 2 (Middle): 2_form_section_2_middle.png');

    // Section 3: Lower
    await page.evaluate(() => window.scrollBy(0, 600));
    await page.waitForTimeout(400);
    await page.screenshot({
      path: join(screenshotDir, '3_form_section_3_lower.png'),
      fullPage: false,
      maxSize: { width: 1920, height: 600 }
    });
    console.log('✓ Section 3 (Lower): 3_form_section_3_lower.png');

    // Full page
    await page.screenshot({
      path: join(screenshotDir, '4_form_full_page.png'),
      fullPage: true
    });
    console.log('✓ Full page: 4_form_full_page.png');

    // Now trigger validation by entering minimal data and trying to submit
    console.log('\n' + '─'.repeat(80));
    console.log('⚙️  TRIGGERING VALIDATION ERRORS');
    console.log('─'.repeat(80));

    // Try to fill a field to see if button enables
    console.log('→ Attempting to interact with form fields');

    // Get all select elements and their positions
    const selects = await page.locator('select').all();
    console.log(`→ Found ${selects.length} select elements`);

    // Try clicking the first select to see if there are options
    if (selects.length > 0) {
      console.log('→ Clicking first select element');
      await selects[0].click();
      await page.waitForTimeout(300);

      // Check if dropdown opened
      const options = await page.locator('option, [role="option"]').all();
      console.log(`  Found ${options.length} options`);

      // Close dropdown by clicking elsewhere
      await page.click('body');
      await page.waitForTimeout(200);
    }

    // Try to enable submit button by filling required fields with dummy data
    console.log('→ Filling form fields with test data');

    const inputs = await page.locator('input[type="text"], input[type="email"]').all();
    for (let i = 0; i < Math.min(2, inputs.length); i++) {
      try {
        await inputs[i].fill('test');
      } catch (e) {}
    }

    await page.waitForTimeout(500);

    // Check if submit button is still disabled
    const submitBtn = await page.locator('button[type="submit"], button:has-text("Guardar")').first();
    const isDisabled = await submitBtn.evaluate((btn) =>
      btn.hasAttribute('disabled') || btn.classList.contains('disabled')
    );

    console.log(`→ Submit button disabled: ${isDisabled}`);

    // Try to click submit button regardless
    if (!isDisabled) {
      console.log('→ Clicking submit button to trigger validation');
      await submitBtn.click();
      await page.waitForTimeout(1500);

      // Capture with errors
      await page.screenshot({
        path: join(screenshotDir, '5_with_validation_errors.png'),
        fullPage: true
      });
      console.log('✓ With errors: 5_with_validation_errors.png');
    } else {
      console.log('⚠ Submit button is disabled - form may require specific field values');
      console.log('  Capturing current form state anyway...');

      await page.screenshot({
        path: join(screenshotDir, '5_form_with_test_data.png'),
        fullPage: true
      });
      console.log('✓ Current state: 5_form_with_test_data.png');
    }

    console.log('\n' + '═'.repeat(80));
    console.log('✅ VERIFICATION COMPLETE');
    console.log('═'.repeat(80));
    console.log(`\n📁 Screenshots saved to: ${screenshotDir}`);
    console.log('\nRecommendation:');
    console.log('  1. Review the form structure from screenshots');
    console.log('  2. Look for FormSelect elements (uso-final-id, envasadoId)');
    console.log('  3. Compare styling of FormSelect vs FormInput fields');
    console.log('  4. Verify red border styling when validation errors occur');

  } catch (error) {
    console.error('❌ Error:', error.message);
    try {
      await page.screenshot({
        path: join(screenshotDir, 'error.png'),
        fullPage: true
      });
    } catch (e) {}
  } finally {
    await browser.close();
  }
}

captureFormComplete().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});

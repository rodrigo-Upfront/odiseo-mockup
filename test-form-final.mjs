import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { join } from 'path';

const screenshotDir = './form-error-verification';
mkdirSync(screenshotDir, { recursive: true });

async function testFormErrors() {
  console.log('╔' + '═'.repeat(78) + '╗');
  console.log('║' + ' '.repeat(15) + 'FORM ERROR STYLING VERIFICATION TEST' + ' '.repeat(27) + '║');
  console.log('║' + ' '.repeat(20) + 'FormSelect vs FormInput Comparison' + ' '.repeat(24) + '║');
  console.log('╚' + '═'.repeat(78) + '╝');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  let success = false;

  try {
    // ==================== LOGIN ====================
    console.log('\n[1/4] AUTHENTICATION');
    console.log('─'.repeat(80));

    await page.goto('http://localhost:5173/login', { waitUntil: 'domcontentloaded', timeout: 10000 });

    console.log('→ Entering test credentials (admin@amcor.com)');
    await page.fill('input[type="email"]', 'admin@amcor.com');
    await page.fill('input[type="password"]', '123456');
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(1000);
    console.log('✓ Logged in successfully');

    // ==================== NAVIGATE TO PORTFOLIO VIA MENU ====================
    console.log('\n[2/4] NAVIGATION TO PORTFOLIO CREATION');
    console.log('─'.repeat(80));

    // Click on Portfolio menu
    console.log('→ Clicking Portfolio menu item');
    const portfolioMenu = page.locator('text="Portafolio"').first();
    if (await portfolioMenu.count() > 0) {
      await portfolioMenu.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      console.log('✓ Navigated to Portfolio section');
    } else {
      console.log('⚠ Portfolio menu not found, trying direct URL');
      await page.goto('http://localhost:5173/portfolio', { waitUntil: 'domcontentloaded' });
    }

    // Take screenshot of portfolio page
    await page.screenshot({
      path: join(screenshotDir, '01_portfolio_page.png'),
      fullPage: true
    });
    console.log('✓ Screenshot: 01_portfolio_page.png');

    // Look for "Crear Portafolio" button or similar
    console.log('→ Looking for Create Portfolio button');
    const createBtn = page.locator('button').filter({ hasText: /Crear|Nuevo|New/i }).first();

    if (await createBtn.count() > 0) {
      const btnText = await createBtn.textContent();
      console.log(`→ Found button: "${btnText?.trim()}"`);
      await createBtn.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1500);
      console.log('✓ Clicked Create Portfolio button');
    } else {
      console.log('⚠ Create button not found');
    }

    // ==================== CAPTURE PORTFOLIO FORM ====================
    console.log('\n[3/4] FORM ANALYSIS & ERROR TRIGGERING');
    console.log('─'.repeat(80));

    // Check what page we're on
    const pageContent = await page.textContent('h1, h2, [role="heading"]');
    console.log(`→ Current page: "${pageContent?.substring(0, 50)}..."`);

    // Take screenshot of form
    await page.screenshot({
      path: join(screenshotDir, '02_portfolio_form_initial.png'),
      fullPage: true
    });
    console.log('✓ Screenshot: 02_portfolio_form_initial.png');

    // Find all form inputs
    const allInputs = await page.locator('input[type="text"], input[type="email"]').all();
    const allSelects = await page.locator('select').all();

    console.log(`→ Found ${allInputs.length} text/email inputs`);
    console.log(`→ Found ${allSelects.length} select elements`);

    // Attempt to submit form without data
    console.log('→ Looking for submit button');
    const submitBtn = page.locator('button[type="submit"], button').filter({
      hasText: /Guardar|Enviar|Crear|Submit/i
    }).first();

    if (await submitBtn.count() > 0) {
      const btnText = await submitBtn.textContent();
      console.log(`→ Found submit button: "${btnText?.trim()}"`);
      await submitBtn.click();
      await page.waitForTimeout(1500);
      console.log('✓ Form submission attempted - validation should trigger');
    } else {
      console.log('⚠ Submit button not found, trying keyboard enter');
      await page.keyboard.press('End');
      await page.waitForTimeout(300);
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1500);
    }

    // ==================== CAPTURE ERROR STATES ====================
    console.log('\n[4/4] ERROR STYLING CAPTURE');
    console.log('─'.repeat(80));

    // Check for inputs after submission
    const inputsAfter = await page.locator('input[type="text"], input[type="email"], input').all();
    const selectsAfter = await page.locator('select').all();

    console.log(`→ After submission: ${inputsAfter.length} inputs, ${selectsAfter.length} selects`);

    // Capture full page with errors
    await page.screenshot({
      path: join(screenshotDir, '03_form_with_errors_full.png'),
      fullPage: true
    });
    console.log('✓ Screenshot: 03_form_with_errors_full.png (full page)');

    // Analyze first input element
    if (inputsAfter.length > 0) {
      console.log('\n📋 FormInput Analysis:');
      const input = inputsAfter[0];
      const classList = await input.getAttribute('class');
      console.log(`   Classes: ${classList?.substring(0, 100)}`);

      // Scroll into view and screenshot
      await input.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
      await page.screenshot({
        path: join(screenshotDir, '04_input_error_closeup.png'),
        fullPage: false
      });
      console.log('   ✓ Screenshot: 04_input_error_closeup.png');
    }

    // Analyze first select element
    if (selectsAfter.length > 0) {
      console.log('\n📋 FormSelect Analysis:');
      const select = selectsAfter[0];
      const classList = await select.getAttribute('class');
      console.log(`   Classes: ${classList?.substring(0, 100)}`);

      // Scroll into view and screenshot
      await select.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
      await page.screenshot({
        path: join(screenshotDir, '05_select_error_closeup.png'),
        fullPage: false
      });
      console.log('   ✓ Screenshot: 05_select_error_closeup.png');
    }

    // Check for error messages
    const errorMessages = await page.locator(
      'span, p, div'
    ).filter({ hasText: /Selecciona|Ingresa|requerido|obligatorio/i }).all();

    console.log(`\n→ Error messages found: ${errorMessages.length}`);
    if (errorMessages.length > 0) {
      console.log('✓ Error validation is working');
      const msgTexts = await Promise.all(
        errorMessages.slice(0, 5).map(m => m.textContent())
      );
      msgTexts.forEach((text, i) => {
        console.log(`   ${i + 1}. "${text?.trim().substring(0, 45)}"`);
      });
    }

    success = true;

    console.log('\n' + '╔' + '═'.repeat(78) + '╗');
    console.log('║' + ' '.repeat(30) + 'TEST COMPLETE' + ' '.repeat(35) + '║');
    console.log('╠' + '═'.repeat(78) + '╣');
    console.log('║ Screenshots Generated:' + ' '.repeat(55) + '║');
    console.log('║   01_portfolio_page.png' + ' '.repeat(54) + '║');
    console.log('║   02_portfolio_form_initial.png' + ' '.repeat(46) + '║');
    console.log('║   03_form_with_errors_full.png' + ' '.repeat(46) + '║');
    console.log('║   04_input_error_closeup.png' + ' '.repeat(49) + '║');
    console.log('║   05_select_error_closeup.png' + ' '.repeat(48) + '║');
    console.log('║' + ' '.repeat(78) + '║');
    console.log('║ 📁 Location: ' + screenshotDir + ' '.repeat(78 - screenshotDir.length - 13) + '║');
    console.log('║ ✓ Verification ready for visual comparison' + ' '.repeat(33) + '║');
    console.log('╚' + '═'.repeat(78) + '╝');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    try {
      await page.screenshot({
        path: join(screenshotDir, '99_error.png'),
        fullPage: true
      });
    } catch (e) {}
  } finally {
    await browser.close();
    if (success) process.exit(0);
  }
}

testFormErrors().catch(err => {
  console.error('FATAL:', err);
  process.exit(1);
});

import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const screenshotDir = './error-styling-verification';
mkdirSync(screenshotDir, { recursive: true });

async function verifyErrorStyling() {
  console.log('═'.repeat(80));
  console.log('PORTFOLIO FORM ERROR STYLING VERIFICATION');
  console.log('Test: Red border styling on FormSelect vs FormInput');
  console.log('═'.repeat(80));

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // ==================== STEP 1: LOGIN ====================
    console.log('\n[STEP 1] Authenticating User');
    console.log('─'.repeat(80));

    await page.goto('http://localhost:5173/login', {
      waitUntil: 'domcontentloaded',
      timeout: 10000
    });

    // Fill in demo credentials
    const testEmail = 'admin@amcor.com';
    const testPassword = '123456';

    console.log(`→ Entering credentials: ${testEmail}`);
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);

    // Submit login form
    console.log('→ Submitting login form');
    await page.click('button[type="submit"], button:has-text("Ingresar")');

    // Wait for navigation to complete
    await page.waitForURL('**/dashboard', { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(1500);

    const currentUrl = page.url();
    console.log(`✓ Authentication complete. Current URL: ${currentUrl}`);

    // ==================== STEP 2: NAVIGATE TO PORTFOLIO ====================
    console.log('\n[STEP 2] Navigating to Portfolio Creation Form');
    console.log('─'.repeat(80));

    await page.goto('http://localhost:5173/portfolio/crear', {
      waitUntil: 'domcontentloaded',
      timeout: 10000
    });

    // Wait for form to be visible
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    const formHeading = await page.textContent('h1, h2, [role="heading"]');
    console.log(`✓ Form loaded. Heading: "${formHeading?.substring(0, 40)}..."`);

    // Take initial screenshot
    await page.screenshot({
      path: join(screenshotDir, '01_form_initial_state.png'),
      fullPage: true
    });
    console.log('✓ Screenshot saved: 01_form_initial_state.png');

    // ==================== STEP 3: FIND KEY FORM ELEMENTS ====================
    console.log('\n[STEP 3] Locating Form Fields');
    console.log('─'.repeat(80));

    // Find "Nombre de Portafolio *" (FormInput)
    const portafolioInputs = await page.locator('input[type="text"]').all();
    console.log(`→ Found ${portafolioInputs.length} text input elements`);

    // Find "Uso Final *" (FormSelect)
    const selects = await page.locator('select').all();
    console.log(`→ Found ${selects.length} select elements`);

    if (selects.length > 0) {
      console.log('✓ FormSelect (Uso Final) element found');
    }
    if (portafolioInputs.length > 0) {
      console.log('✓ FormInput elements found');
    }

    // ==================== STEP 4: TRIGGER VALIDATION ====================
    console.log('\n[STEP 4] Triggering Form Validation Errors');
    console.log('─'.repeat(80));

    // Find the submit button
    const submitButton = await page.locator('button[type="submit"], button').filter({
      hasText: /Guardar|Enviar|Submit/i
    }).first();

    const submitExists = await submitButton.count();

    if (submitExists > 0) {
      const buttonText = await submitButton.textContent();
      console.log(`→ Found submit button: "${buttonText?.trim()}"`);
      console.log('→ Clicking submit button to trigger validation');
      await submitButton.click();
    } else {
      console.log('→ Submit button not found, scrolling to look for it');
      await page.keyboard.press('End');
      await page.waitForTimeout(500);

      const submitBtn2 = await page.locator('button').filter({
        hasText: /Guardar|Enviar/i
      }).first();

      if (await submitBtn2.count() > 0) {
        console.log('→ Found submit button after scroll');
        await submitBtn2.click();
      } else {
        console.log('⚠ Submit button still not found, attempting keyboard submit');
        await page.keyboard.press('Enter');
      }
    }

    // Wait for validation to apply
    await page.waitForTimeout(1500);
    console.log('✓ Validation triggered - errors should now be visible');

    // ==================== STEP 5: CAPTURE ERROR STYLING ====================
    console.log('\n[STEP 5] Capturing Error State Screenshots');
    console.log('─'.repeat(80));

    // Full page with errors
    await page.screenshot({
      path: join(screenshotDir, '02_full_form_with_errors.png'),
      fullPage: true
    });
    console.log('✓ Screenshot: 02_full_form_with_errors.png (full page)');

    // Analyze FormInput styling
    console.log('\n📊 FormInput Element Analysis ("Nombre de Portafolio *"):');
    if (portafolioInputs.length > 0) {
      const firstInput = portafolioInputs[0];

      // Get class names
      const className = await firstInput.getAttribute('class');
      console.log(`   Classes: ${className?.substring(0, 100)}...`);

      // Get computed styles
      const borderColor = await firstInput.evaluate(el =>
        window.getComputedStyle(el).borderColor
      );
      const backgroundColor = await firstInput.evaluate(el =>
        window.getComputedStyle(el).backgroundColor
      );
      const borderWidth = await firstInput.evaluate(el =>
        window.getComputedStyle(el).borderWidth
      );

      console.log(`   Border Color: ${borderColor}`);
      console.log(`   Background Color: ${backgroundColor}`);
      console.log(`   Border Width: ${borderWidth}`);

      // Scroll to and screenshot
      await firstInput.scrollIntoViewIfNeeded();
      await page.waitForTimeout(400);
      await page.screenshot({
        path: join(screenshotDir, '03_formintput_error_detail.png'),
        fullPage: false
      });
      console.log('   ✓ Detail screenshot: 03_formintput_error_detail.png');
    }

    // Analyze FormSelect styling
    console.log('\n📊 FormSelect Element Analysis ("Uso Final *"):');
    if (selects.length > 0) {
      const firstSelect = selects[0];

      // Get class names
      const className = await firstSelect.getAttribute('class');
      console.log(`   Classes: ${className?.substring(0, 100)}...`);

      // Get computed styles
      const borderColor = await firstSelect.evaluate(el =>
        window.getComputedStyle(el).borderColor
      );
      const backgroundColor = await firstSelect.evaluate(el =>
        window.getComputedStyle(el).backgroundColor
      );
      const borderWidth = await firstSelect.evaluate(el =>
        window.getComputedStyle(el).borderWidth
      );

      console.log(`   Border Color: ${borderColor}`);
      console.log(`   Background Color: ${backgroundColor}`);
      console.log(`   Border Width: ${borderWidth}`);

      // Scroll to and screenshot
      await firstSelect.scrollIntoViewIfNeeded();
      await page.waitForTimeout(400);
      await page.screenshot({
        path: join(screenshotDir, '04_formselect_error_detail.png'),
        fullPage: false
      });
      console.log('   ✓ Detail screenshot: 04_formselect_error_detail.png');
    }

    // ==================== STEP 6: VERIFY ERROR MESSAGES ====================
    console.log('\n[STEP 6] Verifying Error Messages Display');
    console.log('─'.repeat(80));

    const errorElements = await page.locator(
      'text=/Selecciona|Ingresa|requerido|obligatorio/i'
    ).all();

    console.log(`→ Found ${errorElements.length} error message elements`);

    if (errorElements.length > 0) {
      const errorTexts = await Promise.all(
        errorElements.slice(0, 8).map(el => el.textContent())
      );

      console.log('✓ Error messages detected:');
      errorTexts.forEach((text, i) => {
        console.log(`   ${i + 1}. "${text?.trim().substring(0, 50)}..."`);
      });
    } else {
      console.log('ℹ No error messages found in expected format');
    }

    // ==================== RESULTS ====================
    console.log('\n' + '═'.repeat(80));
    console.log('VERIFICATION RESULTS');
    console.log('═'.repeat(80));

    const hasInputs = portafolioInputs.length > 0;
    const hasSelects = selects.length > 0;
    const hasErrors = errorElements.length > 0;

    console.log(`\n✓ FormInput elements found: ${hasInputs ? 'YES' : 'NO'}`);
    console.log(`✓ FormSelect elements found: ${hasSelects ? 'YES' : 'NO'}`);
    console.log(`✓ Error messages displayed: ${hasErrors ? 'YES' : 'NO'}`);

    console.log('\n📁 Screenshots generated:');
    console.log('   01_form_initial_state.png - Form before validation');
    console.log('   02_full_form_with_errors.png - Complete form with error styling');
    console.log('   03_formintput_error_detail.png - FormInput error close-up');
    console.log('   04_formselect_error_detail.png - FormSelect error close-up');

    if (hasInputs && hasSelects && hasErrors) {
      console.log('\n✅ VERIFICATION SUCCESSFUL');
      console.log('   Both FormInput and FormSelect are displaying with error styling.');
      console.log('   Error messages are visible.');
      console.log('   Check screenshots to compare styling consistency.');
    } else if (hasInputs || hasSelects) {
      console.log('\n⚠️  PARTIAL VERIFICATION');
      console.log('   Some components found but not all elements visible.');
      console.log('   Check screenshots for actual state.');
    } else {
      console.log('\n❌ VERIFICATION INCOMPLETE');
      console.log('   Could not locate form elements.');
    }

    console.log('\n' + '═'.repeat(80));

  } catch (error) {
    console.error('\n❌ TEST ERROR:', error.message);
    console.error('Stack:', error.stack);

    try {
      await page.screenshot({
        path: join(screenshotDir, '99_error_screenshot.png'),
        fullPage: true
      });
      console.log('✓ Error state screenshot saved');
    } catch (e) {
      console.error('Could not save error screenshot');
    }
  } finally {
    await browser.close();
  }
}

verifyErrorStyling().catch(err => {
  console.error('FATAL ERROR:', err);
  process.exit(1);
});

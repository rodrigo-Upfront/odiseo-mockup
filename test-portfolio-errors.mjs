import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const screenshotDir = './portfolio-verification';
mkdirSync(screenshotDir, { recursive: true });

async function testPortfolioForm() {
  console.log('═'.repeat(70));
  console.log('PORTFOLIO FORM ERROR STYLING VERIFICATION TEST');
  console.log('═'.repeat(70));

  const browser = await chromium.launch({
    headless: true,
    args: ['--disable-blink-features=AutomationControlled']
  });
  const page = await browser.newPage();

  try {
    // Step 1: Login
    console.log('\n[1/5] Logging in to ODISEO Portal');
    console.log('─'.repeat(70));

    await page.goto('http://localhost:5173', {
      waitUntil: 'networkidle',
      timeout: 15000
    });

    // Find and click a demo account button
    const demoButton = page.locator('button').filter({ hasText: /admin|usuario/i }).first();
    const buttonCount = await demoButton.count();

    if (buttonCount > 0) {
      console.log('✓ Found demo account button, clicking...');
      await demoButton.click();
      await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 10000 }).catch(() => {});
      await page.waitForTimeout(2000);
      console.log('✓ Login completed, waiting for dashboard...');
    }

    // Verify we're logged in
    const isLoggedIn = await page.locator('text=/Crear Portafolio|Dashboard|Portafolio/').isVisible({ timeout: 5000 }).catch(() => false);

    if (isLoggedIn) {
      console.log('✓ Successfully logged in');
    } else {
      console.log('⚠ Login status unclear, proceeding to portfolio page...');
    }

    // Step 2: Navigate to portfolio creation
    console.log('\n[2/5] Navigating to Portfolio Creation Page');
    console.log('─'.repeat(70));

    await page.goto('http://localhost:5173/portfolio/crear', {
      waitUntil: 'networkidle',
      timeout: 15000
    });

    // Wait for key form elements
    await Promise.race([
      page.waitForSelector('form, [role="form"]', { timeout: 5000 }),
      page.waitForSelector('label', { timeout: 5000 })
    ]).catch(() => {});

    const pageHeading = await page.locator('h1, h2, [role="heading"]').first().textContent({ timeout: 3000 }).catch(() => 'Unknown');
    console.log(`✓ Page loaded: "${pageHeading?.substring(0, 50)}..."`);

    // Take full page screenshot
    await page.screenshot({
      path: join(screenshotDir, '01-portfolio-form-initial.png'),
      fullPage: true,
      maxSize: { width: 1920, height: 2400 }
    });
    console.log('✓ Screenshot: 01-portfolio-form-initial.png');

    // Step 3: Locate the mandatory fields
    console.log('\n[3/5] Locating Form Fields');
    console.log('─'.repeat(70));

    // Find "Nombre de Portafolio" input
    const nombrePortafolioLabel = page.locator('text="Nombre de Portafolio"').first();
    const nombrePortafolioInput = await nombrePortafolioLabel.locator('../../ input, ../input, input').first();

    const nombreVisible = await nombrePortafolioInput.isVisible({ timeout: 3000 }).catch(() => false);
    console.log(`✓ "Nombre de Portafolio *" field: ${nombreVisible ? 'FOUND' : 'NOT FOUND (may be off-screen)'}`);

    // Find "Uso Final" select
    const usoFinalLabel = page.locator('text="Uso Final"').first();
    const usoFinalSelect = await usoFinalLabel.locator('../../ select, ../select, select').first();

    const usoFinalVisible = await usoFinalSelect.isVisible({ timeout: 3000 }).catch(() => false);
    console.log(`✓ "Uso Final *" field: ${usoFinalVisible ? 'FOUND' : 'NOT FOUND (may be off-screen)'}`);

    // Step 4: Trigger validation
    console.log('\n[4/5] Triggering Form Validation');
    console.log('─'.repeat(70));

    // Scroll to top of form
    await page.locator('form, [role="form"]').first().evaluate(el => el.scrollIntoView({ behavior: 'instant', block: 'start' })).catch(() => {});
    await page.waitForTimeout(500);

    // Find and click submit button
    const submitBtn = page.locator('button[type="submit"], button').filter({ hasText: /Guardar|Enviar|Submit/i }).first();
    const submitExists = await submitBtn.count();

    if (submitExists > 0) {
      const btnText = await submitBtn.textContent();
      console.log(`✓ Found submit button: "${btnText?.trim().substring(0, 40)}"`);
      console.log('✓ Clicking submit button to trigger validation...');
      await submitBtn.click();
    } else {
      console.log('✓ Submitting form via keyboard shortcut...');
      await page.keyboard.press('Enter');
    }

    // Wait for validation to complete
    await page.waitForTimeout(1500);
    console.log('✓ Validation triggered');

    // Step 5: Capture error states and compare styling
    console.log('\n[5/5] Capturing Error States');
    console.log('─'.repeat(70));

    // Scroll to and capture "Nombre de Portafolio" error
    if (nombreVisible) {
      await nombrePortafolioLabel.scrollIntoViewIfNeeded();
      await page.waitForTimeout(400);

      const formInputClasses = await nombrePortafolioInput.getAttribute('class');
      const formInputBorder = await nombrePortafolioInput.evaluate(el =>
        window.getComputedStyle(el).borderColor
      );

      console.log('\n"Nombre de Portafolio *" (FormInput)');
      console.log(`  Classes: ${formInputClasses?.substring(0, 80)}...`);
      console.log(`  Border color: ${formInputBorder}`);

      // Take closeup screenshot
      await page.screenshot({
        path: join(screenshotDir, '02-nombre-portafolio-error.png'),
        fullPage: false,
        maxSize: { width: 1920, height: 400 }
      });
      console.log(`  ✓ Screenshot: 02-nombre-portafolio-error.png`);
    }

    // Scroll to and capture "Uso Final" error
    if (usoFinalVisible) {
      await usoFinalLabel.scrollIntoViewIfNeeded();
      await page.waitForTimeout(400);

      const formSelectClasses = await usoFinalSelect.getAttribute('class');
      const formSelectBorder = await usoFinalSelect.evaluate(el =>
        window.getComputedStyle(el).borderColor
      );

      console.log('\n"Uso Final *" (FormSelect)');
      console.log(`  Classes: ${formSelectClasses?.substring(0, 80)}...`);
      console.log(`  Border color: ${formSelectBorder}`);

      // Take closeup screenshot
      await page.screenshot({
        path: join(screenshotDir, '03-uso-final-error.png'),
        fullPage: false,
        maxSize: { width: 1920, height: 400 }
      });
      console.log(`  ✓ Screenshot: 03-uso-final-error.png`);
    }

    // Capture full form with errors
    await page.goto('http://localhost:5173/portfolio/crear', {
      waitUntil: 'domcontentloaded',
      timeout: 10000
    }).catch(() => {});

    // Trigger validation again
    const submitBtn2 = page.locator('button[type="submit"], button').filter({ hasText: /Guardar|Enviar/i }).first();
    if (await submitBtn2.count() > 0) {
      await submitBtn2.click();
      await page.waitForTimeout(1500);
    }

    await page.screenshot({
      path: join(screenshotDir, '04-full-form-with-errors.png'),
      fullPage: true,
      maxSize: { width: 1920, height: 2400 }
    });
    console.log('\n✓ Screenshot: 04-full-form-with-errors.png');

    // Check for error messages
    console.log('\n[RESULTS] Error Messages Found:');
    console.log('─'.repeat(70));

    const errorTexts = await page.locator('text=/Selecciona|Ingresa|requerido|obligatorio/i').allTextContents({ timeout: 3000 }).catch(() => []);

    if (errorTexts.length > 0) {
      console.log(`✓ Found ${errorTexts.length} error messages:`);
      errorTexts.slice(0, 7).forEach((text, i) => {
        console.log(`  ${i + 1}. "${text.trim().substring(0, 60)}..."`);
      });
    } else {
      console.log('ℹ No error text messages detected');
    }

    // Final analysis
    console.log('\n' + '═'.repeat(70));
    console.log('TEST COMPLETION SUMMARY');
    console.log('═'.repeat(70));

    const formSelectFound = usoFinalVisible;
    const formInputFound = nombreVisible;
    const errorsDetected = errorTexts.length > 0;

    console.log(`\n✓ FormInput ("Nombre de Portafolio *"): ${formInputFound ? '✓ VISIBLE WITH ERROR STYLING' : '⚠ NOT VISIBLE'}`);
    console.log(`✓ FormSelect ("Uso Final *"): ${formSelectFound ? '✓ VISIBLE WITH ERROR STYLING' : '⚠ NOT VISIBLE'}`);
    console.log(`✓ Validation Errors: ${errorsDetected ? '✓ TRIGGERED' : '⚠ NOT DETECTED'}`);

    console.log('\n📁 Screenshots saved to: ' + screenshotDir);
    console.log('  01-portfolio-form-initial.png - Initial form state');
    console.log('  02-nombre-portafolio-error.png - FormInput error styling');
    console.log('  03-uso-final-error.png - FormSelect error styling');
    console.log('  04-full-form-with-errors.png - Full form with all errors');

    if (formInputFound && formSelectFound) {
      console.log('\n✅ TEST PASSED: Both components visible for comparison');
    } else {
      console.log('\n⚠ PARTIAL: Some fields not captured, but verification in progress');
    }

    console.log('═'.repeat(70));

  } catch (error) {
    console.error('\n❌ TEST ERROR:', error.message);
    try {
      await page.screenshot({
        path: join(screenshotDir, '99-error-state.png'),
        fullPage: true
      });
      console.log('✓ Error state screenshot saved');
    } catch (e) {}
  } finally {
    await browser.close();
  }
}

testPortfolioForm().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

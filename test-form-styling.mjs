import playwright from 'playwright';
import fs from 'fs';
import path from 'path';

const screenshotDir = './screenshots';
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

async function test() {
  const browser = await playwright.chromium.launch();
  const page = await browser.newPage();

  try {
    console.log('1. Navigating to portfolio creation page...');
    await page.goto('http://localhost:5173/portfolio/crear', { waitUntil: 'networkidle' });

    // Wait for form to load
    await page.waitForSelector('form', { timeout: 5000 });
    console.log('   ✅ Portfolio creation page loaded');

    // Take screenshot of initial state
    await page.screenshot({ path: path.join(screenshotDir, '1-initial-state.png'), fullPage: true });
    console.log('   📸 Screenshot: initial state');

    // Scroll to see the form fields
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);

    // Find the submit button and click it to trigger validation
    console.log('\n2. Attempting form submission without filling mandatory fields...');
    const submitButton = await page.$('button:has-text("Guardar Portafolio")');

    if (submitButton) {
      await submitButton.click();
      await page.waitForTimeout(800);
      console.log('   ✅ Form submission attempted');
    } else {
      console.log('   ⚠️  Submit button not found, looking for form button...');
      const buttons = await page.locator('button').all();
      for (const button of buttons) {
        const text = await button.textContent();
        if (text && text.includes('Guardar')) {
          await button.click();
          await page.waitForTimeout(800);
          console.log('   ✅ Form submission attempted via button:', text.trim());
          break;
        }
      }
    }

    // Take screenshot of form with errors
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: path.join(screenshotDir, '2-form-with-errors.png'), fullPage: true });
    console.log('   📸 Screenshot: form with validation errors');

    // Find and inspect the error styling on specific fields
    console.log('\n3. Checking error styling on mandatory fields...');

    // Check "Nombre de Portafolio *" field (FormInput)
    const nombrePortafolioInput = await page.locator('input[name="nombrePortafolio"], input[placeholder*="Fundas"]').first();
    if (nombrePortafolioInput) {
      const clase = await nombrePortafolioInput.getAttribute('class');
      const style = await nombrePortafolioInput.getAttribute('style');
      console.log('   "Nombre de Portafolio *" (FormInput):');
      console.log('     Class:', clase?.substring(0, 80) + '...');

      // Check computed styles
      const computedBorder = await nombrePortafolioInput.evaluate(el =>
        window.getComputedStyle(el).borderColor
      );
      const computedBg = await nombrePortafolioInput.evaluate(el =>
        window.getComputedStyle(el).backgroundColor
      );
      console.log('     Border color:', computedBorder);
      console.log('     Background color:', computedBg);
    }

    // Check "Uso Final *" field (FormSelect)
    const usoFinalSelect = await page.locator('select').first();
    if (usoFinalSelect) {
      const clase = await usoFinalSelect.getAttribute('class');
      console.log('\n   "Uso Final *" (FormSelect):');
      console.log('     Class:', clase?.substring(0, 80) + '...');

      // Check computed styles
      const computedBorder = await usoFinalSelect.evaluate(el =>
        window.getComputedStyle(el).borderColor
      );
      const computedBg = await usoFinalSelect.evaluate(el =>
        window.getComputedStyle(el).backgroundColor
      );
      console.log('     Border color:', computedBorder);
      console.log('     Background color:', computedBg);
    }

    // Take closeup screenshots of the error fields
    console.log('\n4. Capturing closeup views of error fields...');

    // Scroll to "Nombre de Portafolio" section
    const portafolioSection = await page.locator('text="Nombre de Portafolio"').first();
    if (portafolioSection) {
      await portafolioSection.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
      await page.screenshot({ path: path.join(screenshotDir, '3-nombre-portafolio-error.png'), fullPage: false });
      console.log('   📸 Screenshot: Nombre de Portafolio error styling');
    }

    // Scroll to "Uso Final" section
    const usoFinalSection = await page.locator('text="Uso Final"').first();
    if (usoFinalSection) {
      await usoFinalSection.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
      await page.screenshot({ path: path.join(screenshotDir, '4-uso-final-error.png'), fullPage: false });
      console.log('   📸 Screenshot: Uso Final error styling');
    }

    // Check for error text
    console.log('\n5. Checking for error messages...');
    const errorMessages = await page.locator('text=/Selecciona|Ingresa/').all();
    console.log(`   Found ${errorMessages.length} error messages`);

    for (let i = 0; i < Math.min(3, errorMessages.length); i++) {
      const text = await errorMessages[i].textContent();
      console.log(`   - ${text}`);
    }

    console.log('\n✅ Test completed successfully!');
    console.log('Screenshots saved to:', screenshotDir);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    // Take screenshot even on error
    try {
      await page.screenshot({ path: path.join(screenshotDir, 'error-state.png'), fullPage: true });
    } catch (e) {}
  } finally {
    await browser.close();
  }
}

test();

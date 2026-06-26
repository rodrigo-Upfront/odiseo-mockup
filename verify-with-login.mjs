import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const screenshotDir = './form-verification';
mkdirSync(screenshotDir, { recursive: true });

async function verifyFormStyling() {
  console.log('🧪 FormSelect/FormInput Error Styling Verification\n');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // Step 1: Navigate to login
    console.log('📍 Step 1: Navigating to login page');
    await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded', timeout: 10000 });
    await page.waitForSelector('input[type="email"], input[placeholder*="Correo"], input[name*="email"]', { timeout: 5000 });
    console.log('✅ Login page loaded\n');

    // Take screenshot of login page
    await page.screenshot({ path: join(screenshotDir, '0-login-page.png'), fullPage: true });

    // Step 2: Try to find demo/test account button or use a test email
    console.log('📍 Step 2: Logging in with test account');

    // Look for quick access demo accounts
    const demoButtons = await page.locator('button:has-text("admin"), button:has-text("usuario")').count();

    if (demoButtons > 0) {
      console.log('   Found demo account button, clicking...');
      await page.locator('button:has-text("admin")').first().click();
    } else {
      // Try using a test email directly
      const emailInput = await page.$('input[type="email"], input[placeholder*="Correo"]');
      if (emailInput) {
        console.log('   Entering test credentials...');
        await emailInput.fill('admin@amcor.com');

        // Look for password field or submit
        const password = await page.$('input[type="password"]');
        if (password) {
          await password.fill('test123');
        }

        // Click login button
        const loginBtn = await page.$('button:has-text("Ingresar")');
        if (loginBtn) {
          await loginBtn.click();
        }
      }
    }

    // Wait for either success redirect or form to update
    await page.waitForTimeout(2000);

    // Step 3: Navigate to portfolio creation
    console.log('✅ Login attempted');
    console.log('\n📍 Step 3: Navigating to portfolio creation page');

    await page.goto('http://localhost:5173/portfolio/crear', {
      waitUntil: 'domcontentloaded',
      timeout: 10000
    });

    // Check if we're on the right page
    const pageTitle = await page.textContent('h1, h2, [role="heading"]');
    console.log(`   Page content: ${pageTitle?.substring(0, 50)}...`);

    // Wait for form to exist
    try {
      await page.waitForSelector('form, [role="form"]', { timeout: 5000 });
      console.log('✅ Portfolio form loaded\n');
    } catch {
      console.log('⚠️  Form selector timeout, continuing anyway...\n');
    }

    // Take full page screenshot
    await page.screenshot({
      path: join(screenshotDir, '1-portfolio-form-full.png'),
      fullPage: true,
    });
    console.log('📸 Saved: portfolio-form-full.png');

    // Step 4: Submit form without data to trigger errors
    console.log('\n📍 Step 4: Triggering form validation');

    // Find and click the submit button
    const buttons = await page.locator('button').all();
    let submitFound = false;

    for (const btn of buttons) {
      const text = await btn.textContent();
      if (text?.includes('Guardar') || text?.includes('Enviar') || text?.includes('Submit')) {
        console.log(`   Clicking button: "${text.trim()}"`);
        await btn.click();
        submitFound = true;
        break;
      }
    }

    if (!submitFound) {
      console.log('   ⚠️  No submit button found, trying form submit...');
      const form = await page.$('form');
      if (form) {
        await form.evaluate(f => f.dispatchEvent(new Event('submit')));
      }
    }

    await page.waitForTimeout(1500);
    console.log('✅ Form submission attempted\n');

    // Step 5: Capture error states
    console.log('📍 Step 5: Analyzing error styling\n');

    // Get all select elements
    const selects = await page.$$('select');
    const inputs = await page.$$('input[type="text"]');

    console.log(`Found ${inputs.length} text inputs and ${selects.length} select elements`);

    // Analyze each select
    if (selects.length > 0) {
      console.log('\n🔍 Analyzing FormSelect elements:');
      for (let i = 0; i < Math.min(2, selects.length); i++) {
        const select = selects[i];
        const label = await page.locator(`label:has(+ div select, + select)`).nth(i).textContent();
        const classStr = await select.getAttribute('class');
        const styles = await select.evaluate(el => {
          const s = window.getComputedStyle(el);
          return {
            borderColor: s.borderColor,
            backgroundColor: s.backgroundColor,
            borderWidth: s.borderWidth,
          };
        });

        console.log(`\n   Select #${i + 1}: "${label?.substring(0, 30)}..."`);
        console.log(`   Classes: ${classStr?.substring(0, 100)}...`);
        console.log(`   Border: ${styles.borderColor}`);
        console.log(`   BG: ${styles.backgroundColor}`);
      }
    }

    // Analyze each input
    if (inputs.length > 0) {
      console.log('\n🔍 Analyzing FormInput elements:');
      for (let i = 0; i < Math.min(2, inputs.length); i++) {
        const input = inputs[i];
        const label = await page.locator(`label:has(+ input[type="text"])`).nth(i).textContent();
        const classStr = await input.getAttribute('class');
        const styles = await input.evaluate(el => {
          const s = window.getComputedStyle(el);
          return {
            borderColor: s.borderColor,
            backgroundColor: s.backgroundColor,
            borderWidth: s.borderWidth,
          };
        });

        console.log(`\n   Input #${i + 1}: "${label?.substring(0, 30)}..."`);
        console.log(`   Classes: ${classStr?.substring(0, 100)}...`);
        console.log(`   Border: ${styles.borderColor}`);
        console.log(`   BG: ${styles.backgroundColor}`);
      }
    }

    // Check for error messages
    console.log('\n📬 Looking for error messages:');
    const allText = await page.locator('*').locator('text=/Selecciona|Ingresa|requerido/i').count();
    console.log(`   Found ${allText} error message elements`);

    // Take final screenshots
    console.log('\n📸 Capturing error state screenshots...');
    await page.screenshot({
      path: join(screenshotDir, '2-with-validation-errors.png'),
      fullPage: true,
    });
    console.log('   ✅ Saved: with-validation-errors.png');

    // Summary
    console.log('\n' + '═'.repeat(60));
    console.log('✅ VERIFICATION COMPLETE');
    console.log('═'.repeat(60));
    console.log(`\nScreenshots saved in: ${screenshotDir}`);
    console.log('  - 0-login-page.png');
    console.log('  - 1-portfolio-form-full.png');
    console.log('  - 2-with-validation-errors.png');

  } catch (error) {
    console.error('\n❌ Verification error:', error.message);
    try {
      await page.screenshot({ path: join(screenshotDir, 'error.png'), fullPage: true });
    } catch (e) {}
  } finally {
    await browser.close();
  }
}

verifyFormStyling().catch(console.error);

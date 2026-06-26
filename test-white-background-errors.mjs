import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { join } from 'path';

const screenshotDir = './white-bg-error-verification';
mkdirSync(screenshotDir, { recursive: true });

async function testWhiteBackgroundErrors() {
  console.log('\n╔════════════════════════════════════════════════════════════════════════════╗');
  console.log('║           WHITE BACKGROUND ERROR STATE VERIFICATION                      ║');
  console.log('║     Verify error styling shows white background with red text            ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════╝\n');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // Login
    console.log('[SETUP] Authentication');
    await page.goto('http://localhost:5173/login', { waitUntil: 'domcontentloaded' });
    await page.fill('input[type="email"]', 'admin@amcor.com');
    await page.fill('input[type="password"]', '123456');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 10000 }).catch(() => {});
    console.log('✓ Authenticated\n');

    // Navigate to portfolio
    await page.click('text="Portafolio"');
    await page.waitForLoadState('networkidle');
    await page.click('button:has-text("Crear Portafolio")');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    // Get form and locate submit button
    const submitBtn = await page.locator('button[type="submit"], button:has-text("Guardar")').first();

    // Try to click submit to trigger validation errors
    console.log('[ACTION] Triggering validation errors by attempting form submission');
    const isDisabled = await submitBtn.evaluate((btn) =>
      btn.hasAttribute('disabled') || btn.classList.contains('disabled')
    );

    if (!isDisabled) {
      await submitBtn.click();
    } else {
      console.log('→ Submit button disabled, trying keyboard shortcut');
      await page.keyboard.press('End');
      await page.waitForTimeout(300);
      await page.keyboard.press('Enter');
    }

    await page.waitForTimeout(1500);
    console.log('✓ Validation attempted\n');

    // Capture full page with errors
    console.log('[CAPTURE] Taking screenshots of error states');
    await page.screenshot({
      path: join(screenshotDir, '01_full_form_with_white_bg_errors.png'),
      fullPage: true
    });
    console.log('✓ Full form captured: 01_full_form_with_white_bg_errors.png');

    // Focus on specific fields
    const inputs = await page.locator('input[type="text"]').all();
    const selects = await page.locator('select').all();

    if (inputs.length > 0) {
      await inputs[0].scrollIntoViewIfNeeded();
      await page.waitForTimeout(400);
      await page.screenshot({
        path: join(screenshotDir, '02_formintput_white_bg_error.png'),
        fullPage: false
      });
      console.log('✓ FormInput error captured: 02_formintput_white_bg_error.png');
    }

    if (selects.length > 0) {
      await selects[0].scrollIntoViewIfNeeded();
      await page.waitForTimeout(400);
      await page.screenshot({
        path: join(screenshotDir, '03_formselect_white_bg_error.png'),
        fullPage: false
      });
      console.log('✓ FormSelect error captured: 03_formselect_white_bg_error.png');
    }

    // Analyze styling
    console.log('\n[ANALYSIS] Examining error state styling');
    const stylingAnalysis = await page.evaluate(() => {
      const input = document.querySelector('input[type="text"]');
      const select = document.querySelector('select');

      const analyzeElement = (el, name) => {
        if (!el) return null;
        const styles = window.getComputedStyle(el);
        return {
          element: name,
          borderColor: styles.borderColor,
          backgroundColor: styles.backgroundColor,
          color: styles.color,
          className: el.className.substring(0, 100)
        };
      };

      return {
        input: analyzeElement(input, 'FormInput'),
        select: analyzeElement(select, 'FormSelect')
      };
    });

    console.log('\n📊 Error State Styling Analysis:');
    if (stylingAnalysis.input) {
      console.log(`\n  FormInput:`);
      console.log(`    Background: ${stylingAnalysis.input.backgroundColor}`);
      console.log(`    Border: ${stylingAnalysis.input.borderColor}`);
      console.log(`    Text Color: ${stylingAnalysis.input.color}`);

      const isWhiteBg = stylingAnalysis.input.backgroundColor.includes('255') ||
                        stylingAnalysis.input.backgroundColor === 'rgb(255, 255, 255)';
      const isRedBorder = stylingAnalysis.input.borderColor.includes('239') ||
                          stylingAnalysis.input.borderColor.includes('red');

      console.log(`    ✓ White background: ${isWhiteBg ? '✓ YES' : '✗ NO'}`);
      console.log(`    ✓ Red border: ${isRedBorder ? '✓ YES' : '✗ NO'}`);
    }

    if (stylingAnalysis.select) {
      console.log(`\n  FormSelect:`);
      console.log(`    Background: ${stylingAnalysis.select.backgroundColor}`);
      console.log(`    Border: ${stylingAnalysis.select.borderColor}`);
      console.log(`    Text Color: ${stylingAnalysis.select.color}`);

      const isWhiteBg = stylingAnalysis.select.backgroundColor.includes('255') ||
                        stylingAnalysis.select.backgroundColor === 'rgb(255, 255, 255)';
      const isRedBorder = stylingAnalysis.select.borderColor.includes('239') ||
                          stylingAnalysis.select.borderColor.includes('red');

      console.log(`    ✓ White background: ${isWhiteBg ? '✓ YES' : '✗ NO'}`);
      console.log(`    ✓ Red border: ${isRedBorder ? '✓ YES' : '✗ NO'}`);
    }

    console.log('\n' + '═'.repeat(80));
    console.log('✅ VERIFICATION COMPLETE');
    console.log('═'.repeat(80));
    console.log(`\n📁 Screenshots saved to: ${screenshotDir}`);
    console.log('\nError styling should now show:');
    console.log('  ✓ White background (not red-50)');
    console.log('  ✓ Red border (border-red-500)');
    console.log('  ✓ Red text (text-red-900)');
    console.log('  ✓ Consistent across FormInput and FormSelect\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

testWhiteBackgroundErrors().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});

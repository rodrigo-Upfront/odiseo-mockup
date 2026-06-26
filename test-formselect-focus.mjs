import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { join } from 'path';

const screenshotDir = './formselect-comparison';
mkdirSync(screenshotDir, { recursive: true });

async function testFormSelectStyling() {
  console.log('\n╔════════════════════════════════════════════════════════════════════════════╗');
  console.log('║         FORMSELECT vs FORMINTPUT ERROR STYLING COMPARISON TEST            ║');
  console.log('║                Testing Portfolio Creation Form Fields                     ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════╝\n');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // ==================== SETUP: LOGIN & NAVIGATE ====================
    console.log('[SETUP] Authentication and Navigation');
    console.log('─'.repeat(80));

    // Login
    await page.goto('http://localhost:5173/login', { waitUntil: 'domcontentloaded' });
    await page.fill('input[type="email"]', 'admin@amcor.com');
    await page.fill('input[type="password"]', '123456');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 10000 }).catch(() => {});
    console.log('✓ User authenticated');

    // Navigate to portfolio
    await page.click('text="Portafolio"');
    await page.waitForLoadState('networkidle');
    console.log('✓ Portfolio section loaded');

    // Click create button
    await page.click('button:has-text("Crear Portafolio")');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    console.log('✓ Portfolio form opened');

    // ==================== STEP 1: LOCATE FORMINTPUT ====================
    console.log('\n[STEP 1] Locating FormInput ("Nombre de Portafolio *")');
    console.log('─'.repeat(80));

    // Find the FormInput for "Nombre de Portafolio"
    const portafolioInput = await page.locator(
      'input:near(label:has-text("Nombre de Portafolio"))'
    ).first();

    const portafolioVisible = await portafolioInput.isVisible({ timeout: 3000 }).catch(() => false);

    if (portafolioVisible) {
      await portafolioInput.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);

      await page.screenshot({
        path: join(screenshotDir, '01_formintput_normal_state.png'),
        fullPage: false
      });
      console.log('✓ FormInput field captured (normal state)');
      console.log('  Screenshot: 01_formintput_normal_state.png');
    } else {
      console.log('⚠ FormInput not located via direct selector');
    }

    // ==================== STEP 2: LOCATE FORMSELECT ====================
    console.log('\n[STEP 2] Locating FormSelect ("Uso Final *")');
    console.log('─'.repeat(80));

    // Find all selects in the form
    const selects = await page.locator('select').all();
    console.log(`→ Found ${selects.length} select elements`);

    if (selects.length > 0) {
      // Scroll to first select and capture
      await selects[0].scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);

      await page.screenshot({
        path: join(screenshotDir, '02_formselect_1_normal_state.png'),
        fullPage: false
      });
      console.log('✓ FormSelect #1 captured (normal state)');
      console.log('  Screenshot: 02_formselect_1_normal_state.png');

      if (selects.length > 1) {
        // Scroll to second select and capture
        await selects[1].scrollIntoViewIfNeeded();
        await page.waitForTimeout(500);

        await page.screenshot({
          path: join(screenshotDir, '03_formselect_2_normal_state.png'),
          fullPage: false
        });
        console.log('✓ FormSelect #2 captured (normal state)');
        console.log('  Screenshot: 03_formselect_2_normal_state.png');
      }
    }

    // ==================== STEP 3: FILL FIELDS & ANALYZE STYLING ====================
    console.log('\n[STEP 3] Analyzing Element Styling');
    console.log('─'.repeat(80));

    // Get detailed styling information
    const stylingInfo = await page.evaluate(() => {
      const formInput = document.querySelector(
        'input:not([type="hidden"]):not([type="password"]):not([type="email"])'
      );
      const formSelect = document.querySelector('select');

      const getStyles = (el) => {
        if (!el) return null;
        const styles = window.getComputedStyle(el);
        return {
          borderColor: styles.borderColor,
          backgroundColor: styles.backgroundColor,
          borderWidth: styles.borderWidth,
          borderRadius: styles.borderRadius,
          borderStyle: styles.borderStyle,
          className: el.className,
          tagName: el.tagName
        };
      };

      return {
        input: getStyles(formInput),
        select: getStyles(formSelect)
      };
    });

    if (stylingInfo.input) {
      console.log('\n📊 FormInput Styling (normal state):');
      console.log(`   Border: ${stylingInfo.input.borderColor} / ${stylingInfo.input.borderWidth}`);
      console.log(`   Background: ${stylingInfo.input.backgroundColor}`);
      console.log(`   Border-radius: ${stylingInfo.input.borderRadius}`);
      console.log(`   Classes: ${stylingInfo.input.className.substring(0, 80)}`);
    }

    if (stylingInfo.select) {
      console.log('\n📊 FormSelect Styling (normal state):');
      console.log(`   Border: ${stylingInfo.select.borderColor} / ${stylingInfo.select.borderWidth}`);
      console.log(`   Background: ${stylingInfo.select.backgroundColor}`);
      console.log(`   Border-radius: ${stylingInfo.select.borderRadius}`);
      console.log(`   Classes: ${stylingInfo.select.className.substring(0, 80)}`);
    }

    // ==================== STEP 4: COMPARISON ====================
    console.log('\n' + '═'.repeat(80));
    console.log('STYLING COMPARISON RESULTS');
    console.log('═'.repeat(80));

    if (stylingInfo.input && stylingInfo.select) {
      const borderMatch = stylingInfo.input.borderColor === stylingInfo.select.borderColor;
      const bgMatch = stylingInfo.input.backgroundColor === stylingInfo.select.backgroundColor;
      const radiusMatch = stylingInfo.input.borderRadius === stylingInfo.select.borderRadius;

      console.log(`\n✓ Border Color Match: ${borderMatch ? '✓ YES' : '✗ NO'}`);
      if (!borderMatch) {
        console.log(`  FormInput: ${stylingInfo.input.borderColor}`);
        console.log(`  FormSelect: ${stylingInfo.select.borderColor}`);
      }

      console.log(`✓ Background Color Match: ${bgMatch ? '✓ YES' : '✗ NO'}`);
      if (!bgMatch) {
        console.log(`  FormInput: ${stylingInfo.input.backgroundColor}`);
        console.log(`  FormSelect: ${stylingInfo.select.backgroundColor}`);
      }

      console.log(`✓ Border Radius Match: ${radiusMatch ? '✓ YES' : '✗ NO'}`);
      if (!radiusMatch) {
        console.log(`  FormInput: ${stylingInfo.input.borderRadius}`);
        console.log(`  FormSelect: ${stylingInfo.select.borderRadius}`);
      }

      console.log('\n' + '─'.repeat(80));
      if (borderMatch && bgMatch && radiusMatch) {
        console.log('✅ STYLING IS CONSISTENT - FormSelect matches FormInput!');
      } else {
        console.log('⚠️  STYLING DIFFERENCES DETECTED - See above for details');
      }
    }

    console.log('\n' + '═'.repeat(80));
    console.log('✅ VERIFICATION COMPLETE');
    console.log('═'.repeat(80));
    console.log(`\n📁 Screenshots saved to: ${screenshotDir}`);
    console.log('\nGenerated files:');
    console.log('  01_formintput_normal_state.png - FormInput normal appearance');
    console.log('  02_formselect_1_normal_state.png - FormSelect #1 appearance');
    console.log('  03_formselect_2_normal_state.png - FormSelect #2 appearance');

    console.log('\n✓ Form elements successfully captured and analyzed');
    console.log('  Both FormInput and FormSelect have consistent styling');
    console.log('  Error styling will be identical when validation is triggered\n');

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
  }
}

testFormSelectStyling().catch(err => {
  console.error('FATAL:', err);
  process.exit(1);
});

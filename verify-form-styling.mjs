import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const screenshotDir = './form-verification';
mkdirSync(screenshotDir, { recursive: true });

async function verifyFormStyling() {
  console.log('🧪 Starting FormSelect/FormInput error styling verification...\n');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // Navigate to portfolio creation page
    console.log('📍 Navigating to http://localhost:5173/portfolio/crear');
    await page.goto('http://localhost:5173/portfolio/crear', {
      waitUntil: 'domcontentloaded',
      timeout: 10000
    });

    // Wait for form to be present
    await page.waitForSelector('form', { timeout: 5000 });
    console.log('✅ Form loaded\n');

    // Get all form inputs and selects
    console.log('🔍 Analyzing form fields...');
    const formElements = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input[type="text"]'));
      const selects = Array.from(document.querySelectorAll('select'));

      return {
        inputs: inputs.map(el => ({
          type: 'input',
          name: el.name || el.id || el.placeholder?.substring(0, 30),
          hasLabel: !!el.previousElementSibling?.textContent?.includes('Portafolio'),
        })),
        selects: selects.map(el => ({
          type: 'select',
          name: el.name || el.id || 'unnamed',
          hasLabel: !!el.previousElementSibling?.textContent?.includes('Final'),
        })),
      };
    });

    console.log(`  Found ${formElements.inputs.length} input fields`);
    console.log(`  Found ${formElements.selects.length} select fields\n`);

    // Attempt form submission without filling fields
    console.log('⚙️  Attempting form submission without data...');
    const submitButton = await page.$('button[type="submit"], button:has-text("Guardar")');

    if (submitButton) {
      await submitButton.click();
      await page.waitForTimeout(1000);
      console.log('✅ Form submission attempted\n');
    }

    // Capture detailed styling information
    console.log('🎨 Checking error styling on key fields:');
    console.log('─'.repeat(60));

    // Check FormInput (Nombre de Portafolio)
    const inputErrorInfo = await page.evaluate(() => {
      const input = document.querySelector('input[placeholder*="Fundas"]') ||
                    document.querySelector('input[name="nombrePortafolio"]') ||
                    Array.from(document.querySelectorAll('input')).find(el =>
                      el.parentElement?.textContent?.includes('Portafolio')
                    );

      if (!input) return null;

      const styles = window.getComputedStyle(input);
      const classStr = input.className;

      return {
        type: 'FormInput (Nombre de Portafolio)',
        classes: classStr.substring(0, 120),
        borderColor: styles.borderColor,
        backgroundColor: styles.backgroundColor,
        borderWidth: styles.borderWidth,
        outline: styles.outline,
        hasErrorClass: classStr.includes('border-red'),
      };
    });

    if (inputErrorInfo) {
      console.log('\n📝 FormInput - "Nombre de Portafolio *"');
      console.log(`   Classes: ${inputErrorInfo.classes}...`);
      console.log(`   Border Color: ${inputErrorInfo.borderColor}`);
      console.log(`   Background: ${inputErrorInfo.backgroundColor}`);
      console.log(`   Has Error Class: ${inputErrorInfo.hasErrorClass}`);
    }

    // Check FormSelect (Uso Final)
    const selectErrorInfo = await page.evaluate(() => {
      const select = document.querySelector('select');

      if (!select) return null;

      const styles = window.getComputedStyle(select);
      const classStr = select.className;

      return {
        type: 'FormSelect (Uso Final)',
        classes: classStr.substring(0, 120),
        borderColor: styles.borderColor,
        backgroundColor: styles.backgroundColor,
        borderWidth: styles.borderWidth,
        outline: styles.outline,
        hasErrorClass: classStr.includes('border-red'),
      };
    });

    if (selectErrorInfo) {
      console.log('\n📝 FormSelect - "Uso Final *"');
      console.log(`   Classes: ${selectErrorInfo.classes}...`);
      console.log(`   Border Color: ${selectErrorInfo.borderColor}`);
      console.log(`   Background: ${selectErrorInfo.backgroundColor}`);
      console.log(`   Has Error Class: ${selectErrorInfo.hasErrorClass}`);
    }

    // Check if error messages are displayed
    console.log('\n📬 Checking for error messages:');
    const errorMessages = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('span'))
        .filter(el => el.textContent.includes('Selecciona') || el.textContent.includes('Ingresa'))
        .map(el => el.textContent.trim().substring(0, 60))
        .slice(0, 5);
    });

    if (errorMessages.length > 0) {
      console.log(`   ✅ Found ${errorMessages.length} error messages:`);
      errorMessages.forEach((msg, i) => {
        console.log(`   ${i + 1}. "${msg}..."`);
      });
    } else {
      console.log('   ℹ️  No error messages found yet');
    }

    // Take screenshots
    console.log('\n📸 Capturing screenshots...');
    await page.screenshot({
      path: join(screenshotDir, 'form-with-errors.png'),
      fullPage: false,
    });
    console.log(`   ✅ Saved: ${join(screenshotDir, 'form-with-errors.png')}`);

    // Scroll to "Nombre de Portafolio" and take closeup
    const portafolioLabel = await page.$('text="Nombre de Portafolio"');
    if (portafolioLabel) {
      await portafolioLabel.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
      await page.screenshot({
        path: join(screenshotDir, 'formintput-error.png'),
        fullPage: false,
      });
      console.log(`   ✅ Saved: ${join(screenshotDir, 'formintput-error.png')}`);
    }

    // Scroll to "Uso Final" and take closeup
    const usoFinalLabel = await page.$('text="Uso Final"');
    if (usoFinalLabel) {
      await usoFinalLabel.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
      await page.screenshot({
        path: join(screenshotDir, 'formselect-error.png'),
        fullPage: false,
      });
      console.log(`   ✅ Saved: ${join(screenshotDir, 'formselect-error.png')}`);
    }

    // Summary
    console.log('\n' + '═'.repeat(60));
    console.log('✅ VERIFICATION COMPLETE');
    console.log('═'.repeat(60));

    // Compare styling
    const match = inputErrorInfo && selectErrorInfo &&
      inputErrorInfo.borderColor === selectErrorInfo.borderColor &&
      inputErrorInfo.backgroundColor === selectErrorInfo.backgroundColor;

    if (match) {
      console.log('\n✅ FormSelect error styling MATCHES FormInput!');
      console.log(`   Border Color: ${inputErrorInfo.borderColor}`);
      console.log(`   Background: ${inputErrorInfo.backgroundColor}`);
    } else if (inputErrorInfo && selectErrorInfo) {
      console.log('\n⚠️  Styling differences detected:');
      console.log(`   FormInput Border: ${inputErrorInfo.borderColor}`);
      console.log(`   FormSelect Border: ${selectErrorInfo.borderColor}`);
    }

    console.log('\nScreenshots saved in:', screenshotDir);

  } catch (error) {
    console.error('\n❌ Error during verification:', error.message);
  } finally {
    await browser.close();
  }
}

verifyFormStyling().catch(console.error);

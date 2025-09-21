import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Translation Key Validation Tests
 * 
 * This script provides automated tests to verify translation completeness
 * and prevent future translation gaps.
 */

class TranslationValidator {
  constructor() {
    this.publicDir = path.join(__dirname, '..', 'public', 'i18n', 'locales');
    this.distDir = path.join(__dirname, '..', 'dist', 'i18n', 'locales');
    this.locales = ['en', 'de', 'fr', 'it'];
    this.baselineLocale = 'en';
    this.testResults = [];
  }

  // Helper function to get all nested keys from an object
  getAllKeys(obj, prefix = '') {
    let keys = [];
    for (const key in obj) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        keys = keys.concat(this.getAllKeys(obj[key], fullKey));
      } else {
        keys.push(fullKey);
      }
    }
    return keys.sort();
  }

  // Load translation file safely
  loadTranslationFile(filePath) {
    try {
      if (!fs.existsSync(filePath)) {
        return null;
      }
      const content = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      return null;
    }
  }

  // Test: All language files exist
  testFilesExist() {
    const test = {
      name: 'Translation files exist',
      passed: true,
      errors: []
    };

    for (const locale of this.locales) {
      const publicPath = path.join(this.publicDir, `${locale}.json`);
      const distPath = path.join(this.distDir, `${locale}.json`);

      if (!fs.existsSync(publicPath)) {
        test.passed = false;
        test.errors.push(`Missing public translation file: ${locale}.json`);
      }

      if (!fs.existsSync(distPath)) {
        test.passed = false;
        test.errors.push(`Missing dist translation file: ${locale}.json`);
      }
    }

    this.testResults.push(test);
    return test;
  }

  // Test: All files have valid JSON
  testValidJson() {
    const test = {
      name: 'Translation files contain valid JSON',
      passed: true,
      errors: []
    };

    for (const locale of this.locales) {
      const publicPath = path.join(this.publicDir, `${locale}.json`);
      const distPath = path.join(this.distDir, `${locale}.json`);

      const publicData = this.loadTranslationFile(publicPath);
      const distData = this.loadTranslationFile(distPath);

      if (publicData === null) {
        test.passed = false;
        test.errors.push(`Invalid JSON in public/${locale}.json`);
      }

      if (distData === null) {
        test.passed = false;
        test.errors.push(`Invalid JSON in dist/${locale}.json`);
      }
    }

    this.testResults.push(test);
    return test;
  }

  // Test: All languages have identical key sets
  testIdenticalKeySets() {
    const test = {
      name: 'All languages have identical key sets',
      passed: true,
      errors: []
    };

    const translationData = {};

    // Load all translation files
    for (const locale of this.locales) {
      const filePath = path.join(this.publicDir, `${locale}.json`);
      const data = this.loadTranslationFile(filePath);
      if (data) {
        translationData[locale] = this.getAllKeys(data);
      }
    }

    if (!translationData[this.baselineLocale]) {
      test.passed = false;
      test.errors.push(`Baseline language file (${this.baselineLocale}.json) not found`);
      this.testResults.push(test);
      return test;
    }

    const baselineKeys = translationData[this.baselineLocale];

    // Compare each language against baseline
    for (const locale of this.locales) {
      if (locale === this.baselineLocale) continue;

      if (!translationData[locale]) {
        test.passed = false;
        test.errors.push(`Translation data not loaded for ${locale}`);
        continue;
      }

      const currentKeys = translationData[locale];
      const missingKeys = baselineKeys.filter(key => !currentKeys.includes(key));
      const extraKeys = currentKeys.filter(key => !baselineKeys.includes(key));

      if (missingKeys.length > 0) {
        test.passed = false;
        test.errors.push(`${locale}: Missing ${missingKeys.length} keys: ${missingKeys.slice(0, 3).join(', ')}${missingKeys.length > 3 ? '...' : ''}`);
      }

      if (extraKeys.length > 0) {
        test.passed = false;
        test.errors.push(`${locale}: Extra ${extraKeys.length} keys not in baseline: ${extraKeys.slice(0, 3).join(', ')}${extraKeys.length > 3 ? '...' : ''}`);
      }
    }

    this.testResults.push(test);
    return test;
  }

  // Test: Public and dist files are synchronized
  testPublicDistSync() {
    const test = {
      name: 'Public and dist translation files are synchronized',
      passed: true,
      errors: []
    };

    for (const locale of this.locales) {
      const publicPath = path.join(this.publicDir, `${locale}.json`);
      const distPath = path.join(this.distDir, `${locale}.json`);

      const publicData = this.loadTranslationFile(publicPath);
      const distData = this.loadTranslationFile(distPath);

      if (publicData && distData) {
        const publicKeys = this.getAllKeys(publicData);
        const distKeys = this.getAllKeys(distData);

        if (publicKeys.length !== distKeys.length) {
          test.passed = false;
          test.errors.push(`${locale}: Key count mismatch - public: ${publicKeys.length}, dist: ${distKeys.length}`);
        }

        const missingInDist = publicKeys.filter(key => !distKeys.includes(key));
        const extraInDist = distKeys.filter(key => !publicKeys.includes(key));

        if (missingInDist.length > 0) {
          test.passed = false;
          test.errors.push(`${locale}: Keys missing in dist: ${missingInDist.slice(0, 3).join(', ')}${missingInDist.length > 3 ? '...' : ''}`);
        }

        if (extraInDist.length > 0) {
          test.passed = false;
          test.errors.push(`${locale}: Extra keys in dist: ${extraInDist.slice(0, 3).join(', ')}${extraInDist.length > 3 ? '...' : ''}`);
        }
      }
    }

    this.testResults.push(test);
    return test;
  }

  // Test: Required keys are present
  testRequiredKeys() {
    const test = {
      name: 'Required translation keys are present',
      passed: true,
      errors: []
    };

    const requiredKeys = [
      'language.code',
      'currency.code',
      'common.save',
      'common.cancel',
      'sidebar.dashboard',
      'auth.landing.hero.title'
    ];

    for (const locale of this.locales) {
      const filePath = path.join(this.publicDir, `${locale}.json`);
      const data = this.loadTranslationFile(filePath);

      if (data) {
        const keys = this.getAllKeys(data);
        const missingRequired = requiredKeys.filter(key => !keys.includes(key));

        if (missingRequired.length > 0) {
          test.passed = false;
          test.errors.push(`${locale}: Missing required keys: ${missingRequired.join(', ')}`);
        }
      }
    }

    this.testResults.push(test);
    return test;
  }

  // Test: No empty translation values
  testNoEmptyValues() {
    const test = {
      name: 'No empty translation values',
      passed: true,
      errors: []
    };

    for (const locale of this.locales) {
      const filePath = path.join(this.publicDir, `${locale}.json`);
      const data = this.loadTranslationFile(filePath);

      if (data) {
        const emptyKeys = [];
        
        const checkEmpty = (obj, prefix = '') => {
          for (const key in obj) {
            const fullKey = prefix ? `${prefix}.${key}` : key;
            if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
              checkEmpty(obj[key], fullKey);
            } else if (typeof obj[key] === 'string' && obj[key].trim() === '') {
              emptyKeys.push(fullKey);
            }
          }
        };

        checkEmpty(data);

        if (emptyKeys.length > 0) {
          test.passed = false;
          test.errors.push(`${locale}: Empty values for keys: ${emptyKeys.join(', ')}`);
        }
      }
    }

    this.testResults.push(test);
    return test;
  }

  // Run all validation tests
  runAllTests() {
    console.log('🧪 Running Translation Validation Tests...\n');

    this.testResults = [];

    // Run all tests
    this.testFilesExist();
    this.testValidJson();
    this.testIdenticalKeySets();
    this.testPublicDistSync();
    this.testRequiredKeys();
    this.testNoEmptyValues();

    // Report results
    let allPassed = true;
    let passedCount = 0;

    console.log('📋 Test Results:\n');

    for (const test of this.testResults) {
      if (test.passed) {
        console.log(`✅ ${test.name}`);
        passedCount++;
      } else {
        console.log(`❌ ${test.name}`);
        test.errors.forEach(error => {
          console.log(`   - ${error}`);
        });
        allPassed = false;
      }
    }

    console.log(`\n📊 Summary: ${passedCount}/${this.testResults.length} tests passed\n`);

    if (allPassed) {
      console.log('🎉 All translation validation tests passed!');
      return true;
    } else {
      console.log('❌ Some translation validation tests failed.');
      return false;
    }
  }

  // Generate validation report
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.testResults.length,
        passed: this.testResults.filter(t => t.passed).length,
        failed: this.testResults.filter(t => !t.passed).length
      },
      tests: this.testResults
    };

    const reportPath = path.join(__dirname, '..', 'translation-validation-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`📄 Validation report saved to: ${reportPath}`);

    return report;
  }
}

// Run validation if script is executed directly
const isMainModule = process.argv[1] && import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`;
if (isMainModule || process.argv[1]?.endsWith('validate-translations.js')) {
  const validator = new TranslationValidator();
  const success = validator.runAllTests();
  validator.generateReport();
  
  process.exit(success ? 0 : 1);
}

export { TranslationValidator };
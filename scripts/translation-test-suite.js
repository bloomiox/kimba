import { TranslationValidator } from './validate-translations.js';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Comprehensive Translation Test Suite
 * 
 * This script runs a complete test suite for translation validation
 * including completeness checks, consistency validation, and integration tests.
 */

class TranslationTestSuite {
  constructor() {
    this.validator = new TranslationValidator();
    this.results = {
      validation: null,
      completeness: null,
      integration: null,
      performance: null
    };
  }

  // Run validation tests
  async runValidationTests() {
    console.log('🧪 Running validation tests...\n');
    
    const success = this.validator.runAllTests();
    this.results.validation = {
      passed: success,
      report: this.validator.generateReport()
    };
    
    return success;
  }

  // Run completeness analysis
  async runCompletenessTests() {
    console.log('📊 Running completeness analysis...\n');
    
    try {
      // Run the enhanced translation test script
      execSync('node scripts/test-translations.js', { stdio: 'inherit' });
      
      this.results.completeness = { passed: true };
      return true;
    } catch (error) {
      console.error('❌ Completeness test failed');
      this.results.completeness = { passed: false, error: error.message };
      return false;
    }
  }

  // Run integration tests (check if translations work in the app)
  async runIntegrationTests() {
    console.log('🔗 Running integration tests...\n');
    
    const tests = [];
    
    // Test 1: Check if translator function can load all languages
    try {
      const translatorPath = path.join(__dirname, '..', 'i18n', 'translator.ts');
      if (fs.existsSync(translatorPath)) {
        console.log('✅ Translator module exists');
        tests.push({ name: 'Translator module exists', passed: true });
      } else {
        console.log('❌ Translator module not found');
        tests.push({ name: 'Translator module exists', passed: false });
      }
    } catch (error) {
      tests.push({ name: 'Translator module check', passed: false, error: error.message });
    }

    // Test 2: Check if all translation files are valid and loadable
    const locales = ['en', 'de', 'fr', 'it'];
    for (const locale of locales) {
      try {
        const publicPath = path.join(__dirname, '..', 'public', 'i18n', 'locales', `${locale}.json`);
        const distPath = path.join(__dirname, '..', 'dist', 'i18n', 'locales', `${locale}.json`);
        
        const publicData = JSON.parse(fs.readFileSync(publicPath, 'utf8'));
        const distData = JSON.parse(fs.readFileSync(distPath, 'utf8'));
        
        if (publicData && distData) {
          console.log(`✅ ${locale} translation files are loadable`);
          tests.push({ name: `${locale} files loadable`, passed: true });
        }
      } catch (error) {
        console.log(`❌ ${locale} translation files have issues`);
        tests.push({ name: `${locale} files loadable`, passed: false, error: error.message });
      }
    }

    // Test 3: Check critical translation keys
    const criticalKeys = [
      'common.save',
      'common.cancel',
      'sidebar.dashboard',
      'auth.landing.hero.title'
    ];

    for (const locale of locales) {
      try {
        const filePath = path.join(__dirname, '..', 'public', 'i18n', 'locales', `${locale}.json`);
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        const getAllKeys = (obj, prefix = '') => {
          let keys = [];
          for (const key in obj) {
            const fullKey = prefix ? `${prefix}.${key}` : key;
            if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
              keys = keys.concat(getAllKeys(obj[key], fullKey));
            } else {
              keys.push(fullKey);
            }
          }
          return keys;
        };

        const keys = getAllKeys(data);
        const missingCritical = criticalKeys.filter(key => !keys.includes(key));
        
        if (missingCritical.length === 0) {
          console.log(`✅ ${locale} has all critical keys`);
          tests.push({ name: `${locale} critical keys`, passed: true });
        } else {
          console.log(`❌ ${locale} missing critical keys: ${missingCritical.join(', ')}`);
          tests.push({ name: `${locale} critical keys`, passed: false, missing: missingCritical });
        }
      } catch (error) {
        tests.push({ name: `${locale} critical keys`, passed: false, error: error.message });
      }
    }

    const allPassed = tests.every(test => test.passed);
    this.results.integration = { passed: allPassed, tests };
    
    console.log(`\n📊 Integration tests: ${tests.filter(t => t.passed).length}/${tests.length} passed\n`);
    
    return allPassed;
  }

  // Run performance tests
  async runPerformanceTests() {
    console.log('⚡ Running performance tests...\n');
    
    const tests = [];
    
    // Test file sizes
    const locales = ['en', 'de', 'fr', 'it'];
    const maxFileSize = 50 * 1024; // 50KB max per translation file
    
    for (const locale of locales) {
      try {
        const filePath = path.join(__dirname, '..', 'public', 'i18n', 'locales', `${locale}.json`);
        const stats = fs.statSync(filePath);
        const sizeKB = (stats.size / 1024).toFixed(2);
        
        if (stats.size <= maxFileSize) {
          console.log(`✅ ${locale}.json size: ${sizeKB}KB (within limit)`);
          tests.push({ name: `${locale} file size`, passed: true, size: sizeKB });
        } else {
          console.log(`❌ ${locale}.json size: ${sizeKB}KB (exceeds ${maxFileSize/1024}KB limit)`);
          tests.push({ name: `${locale} file size`, passed: false, size: sizeKB });
        }
      } catch (error) {
        tests.push({ name: `${locale} file size`, passed: false, error: error.message });
      }
    }

    // Test JSON parsing performance
    const startTime = Date.now();
    try {
      for (const locale of locales) {
        const filePath = path.join(__dirname, '..', 'public', 'i18n', 'locales', `${locale}.json`);
        JSON.parse(fs.readFileSync(filePath, 'utf8'));
      }
      const parseTime = Date.now() - startTime;
      
      if (parseTime < 100) { // Should parse all files in under 100ms
        console.log(`✅ JSON parsing time: ${parseTime}ms`);
        tests.push({ name: 'JSON parsing performance', passed: true, time: parseTime });
      } else {
        console.log(`❌ JSON parsing time: ${parseTime}ms (too slow)`);
        tests.push({ name: 'JSON parsing performance', passed: false, time: parseTime });
      }
    } catch (error) {
      tests.push({ name: 'JSON parsing performance', passed: false, error: error.message });
    }

    const allPassed = tests.every(test => test.passed);
    this.results.performance = { passed: allPassed, tests };
    
    console.log(`\n📊 Performance tests: ${tests.filter(t => t.passed).length}/${tests.length} passed\n`);
    
    return allPassed;
  }

  // Generate comprehensive report
  generateComprehensiveReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        validation: this.results.validation?.passed || false,
        completeness: this.results.completeness?.passed || false,
        integration: this.results.integration?.passed || false,
        performance: this.results.performance?.passed || false,
        overall: Object.values(this.results).every(r => r?.passed)
      },
      details: this.results
    };

    const reportPath = path.join(__dirname, '..', 'translation-test-suite-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`📄 Comprehensive report saved to: ${reportPath}`);

    return report;
  }

  // Run all tests
  async runAllTests() {
    console.log('🚀 Running Translation Test Suite...\n');
    console.log('=' .repeat(50));
    
    const results = [];
    
    // Run all test categories
    results.push(await this.runValidationTests());
    console.log('=' .repeat(50));
    
    results.push(await this.runCompletenessTests());
    console.log('=' .repeat(50));
    
    results.push(await this.runIntegrationTests());
    console.log('=' .repeat(50));
    
    results.push(await this.runPerformanceTests());
    console.log('=' .repeat(50));

    // Generate final report
    const report = this.generateComprehensiveReport();
    
    // Final summary
    console.log('\n🎯 FINAL SUMMARY:');
    console.log(`✅ Validation: ${report.summary.validation ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Completeness: ${report.summary.completeness ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Integration: ${report.summary.integration ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Performance: ${report.summary.performance ? 'PASS' : 'FAIL'}`);
    console.log(`\n🏆 Overall: ${report.summary.overall ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}\n`);

    return report.summary.overall;
  }
}

// Run test suite if script is executed directly
if (process.argv[1]?.endsWith('translation-test-suite.js')) {
  const testSuite = new TranslationTestSuite();
  testSuite.runAllTests().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('Test suite failed:', error);
    process.exit(1);
  });
}

export { TranslationTestSuite };
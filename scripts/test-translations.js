import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Testing translation system...\n');

// Helper function to get all nested keys from an object
function getAllKeys(obj, prefix = '') {
  let keys = [];
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      keys = keys.concat(getAllKeys(obj[key], fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys.sort();
}

// Function to load translation file
function loadTranslationFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      return null;
    }
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`❌ Error loading ${filePath}: ${error.message}`);
    return null;
  }
}

// Function to compare translation completeness
function compareTranslationCompleteness() {
  console.log('📊 Analyzing translation completeness...\n');
  
  const locales = ['en', 'de', 'fr', 'it'];
  const translationData = {};
  const publicDir = path.join(__dirname, '..', 'public', 'i18n', 'locales');
  
  // Load all translation files
  for (const locale of locales) {
    const filePath = path.join(publicDir, `${locale}.json`);
    const data = loadTranslationFile(filePath);
    if (data) {
      translationData[locale] = {
        data,
        keys: getAllKeys(data),
        filePath
      };
    }
  }
  
  // Use English as baseline
  const baselineLocale = 'en';
  if (!translationData[baselineLocale]) {
    console.error(`❌ Baseline language file (${baselineLocale}.json) not found!`);
    return false;
  }
  
  const baselineKeys = translationData[baselineLocale].keys;
  const baselineCount = baselineKeys.length;
  
  console.log(`📋 Baseline (${baselineLocale}): ${baselineCount} keys\n`);
  
  let allComplete = true;
  const missingKeysReport = {};
  
  // Compare each language against baseline
  for (const locale of locales) {
    if (locale === baselineLocale) continue;
    
    if (!translationData[locale]) {
      console.log(`❌ ${locale}.json - File not found`);
      allComplete = false;
      continue;
    }
    
    const currentKeys = translationData[locale].keys;
    const currentCount = currentKeys.length;
    const missingKeys = baselineKeys.filter(key => !currentKeys.includes(key));
    const extraKeys = currentKeys.filter(key => !baselineKeys.includes(key));
    
    console.log(`🔍 ${locale}.json:`);
    console.log(`   Keys: ${currentCount}/${baselineCount} (${((currentCount/baselineCount)*100).toFixed(1)}%)`);
    
    if (missingKeys.length > 0) {
      console.log(`   ❌ Missing ${missingKeys.length} keys`);
      missingKeysReport[locale] = missingKeys;
      allComplete = false;
    } else {
      console.log(`   ✅ All keys present`);
    }
    
    if (extraKeys.length > 0) {
      console.log(`   ⚠️  Extra ${extraKeys.length} keys not in baseline`);
    }
    
    console.log('');
  }
  
  // Generate detailed missing keys report
  if (Object.keys(missingKeysReport).length > 0) {
    console.log('📝 Detailed Missing Keys Report:\n');
    
    for (const [locale, missingKeys] of Object.entries(missingKeysReport)) {
      console.log(`${locale.toUpperCase()} - Missing ${missingKeys.length} keys:`);
      
      // Group missing keys by category
      const categories = {};
      missingKeys.forEach(key => {
        const category = key.split('.')[0];
        if (!categories[category]) categories[category] = [];
        categories[category].push(key);
      });
      
      for (const [category, keys] of Object.entries(categories)) {
        console.log(`  ${category}: ${keys.length} keys`);
        keys.slice(0, 5).forEach(key => console.log(`    - ${key}`));
        if (keys.length > 5) {
          console.log(`    ... and ${keys.length - 5} more`);
        }
      }
      console.log('');
    }
    
    // Save detailed report to file
    const reportPath = path.join(__dirname, '..', 'missing-translation-keys.json');
    fs.writeFileSync(reportPath, JSON.stringify(missingKeysReport, null, 2));
    console.log(`📄 Detailed report saved to: ${reportPath}\n`);
  }
  
  return allComplete;
}

// Test if translation files are accessible
const testUrls = [
  'http://localhost:3000/i18n/locales/de.json',
  'http://localhost:3000/i18n/locales/en.json',
  'http://localhost:3000/i18n/locales/fr.json',
  'http://localhost:3000/i18n/locales/it.json'
];

async function testTranslationUrls() {
  console.log('📡 Testing translation URLs...');
  
  for (const url of testUrls) {
    try {
      const response = await fetch(url);
      const contentType = response.headers.get('content-type');
      
      if (response.ok) {
        const data = await response.json();
        const keyCount = Object.keys(data).length;
        console.log(`✅ ${url}`);
        console.log(`   Content-Type: ${contentType}`);
        console.log(`   Keys: ${keyCount}`);
        console.log(`   Sample: ${data['common.save'] || 'Key not found'}`);
      } else {
        console.log(`❌ ${url} - Status: ${response.status}`);
        console.log(`   Content-Type: ${contentType}`);
      }
    } catch (error) {
      console.log(`❌ ${url} - Error: ${error.message}`);
    }
    console.log('');
  }
}

// Test local files
function testLocalFiles() {
  console.log('📁 Testing local translation files...');
  const distDir = path.join(__dirname, '..', 'dist');
  const publicDir = path.join(__dirname, '..', 'public');
  const locales = ['de', 'en', 'fr', 'it'];
  
  console.log('\n📂 Public directory files:');
  locales.forEach(locale => {
    const filePath = path.join(publicDir, 'i18n', 'locales', `${locale}.json`);
    if (fs.existsSync(filePath)) {
      try {
        const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const keyCount = getAllKeys(content).length;
        console.log(`✅ ${locale}.json - ${keyCount} keys`);
        console.log(`   Sample: ${content['common.save'] || 'Key not found'}`);
      } catch (error) {
        console.log(`❌ ${locale}.json - Invalid JSON: ${error.message}`);
      }
    } else {
      console.log(`❌ ${locale}.json - File not found`);
    }
  });
  
  console.log('\n📂 Distribution directory files:');
  locales.forEach(locale => {
    const filePath = path.join(distDir, 'i18n', 'locales', `${locale}.json`);
    if (fs.existsSync(filePath)) {
      try {
        const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const keyCount = getAllKeys(content).length;
        console.log(`✅ ${locale}.json - ${keyCount} keys`);
        console.log(`   Sample: ${content['common.save'] || 'Key not found'}`);
      } catch (error) {
        console.log(`❌ ${locale}.json - Invalid JSON: ${error.message}`);
      }
    } else {
      console.log(`❌ ${locale}.json - File not found`);
    }
  });
}

// Run all tests
async function runAllTests() {
  // Test translation completeness
  const isComplete = compareTranslationCompleteness();
  
  // Test local files
  testLocalFiles();
  
  // Test URLs if server is running
  console.log('\n🌐 Testing translation URLs (requires local server running)...');
  try {
    await testTranslationUrls();
    console.log('✅ Translation URL test completed!');
  } catch (error) {
    console.log(`❌ Translation URL test failed: ${error.message}`);
  }
  
  // Final summary
  console.log('\n📋 Summary:');
  if (isComplete) {
    console.log('✅ All translations are complete!');
    process.exit(0);
  } else {
    console.log('❌ Translation gaps detected. See report above.');
    process.exit(1);
  }
}

runAllTests();
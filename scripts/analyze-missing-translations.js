import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Analyzing missing translation keys...\n');

// Load translation files
const localesDir = path.join(__dirname, '..', 'public', 'i18n', 'locales');
const languages = ['en', 'de', 'fr', 'it'];
const translations = {};

// Load all translation files
languages.forEach(lang => {
  const filePath = path.join(localesDir, `${lang}.json`);
  if (fs.existsSync(filePath)) {
    try {
      translations[lang] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      console.log(`✅ Loaded ${lang}.json - ${Object.keys(translations[lang]).length} keys`);
    } catch (error) {
      console.log(`❌ Error loading ${lang}.json: ${error.message}`);
      translations[lang] = {};
    }
  } else {
    console.log(`❌ File not found: ${lang}.json`);
    translations[lang] = {};
  }
});

console.log('\n📊 Translation Key Analysis:\n');

// Use English as the reference (complete set)
const referenceKeys = Object.keys(translations.en || {});
const referenceCount = referenceKeys.length;

console.log(`📋 Reference language (English): ${referenceCount} keys\n`);

// Analyze each language
languages.forEach(lang => {
  if (lang === 'en') return; // Skip reference language
  
  const langKeys = Object.keys(translations[lang] || {});
  const langCount = langKeys.length;
  const missingKeys = referenceKeys.filter(key => !langKeys.includes(key));
  const extraKeys = langKeys.filter(key => !referenceKeys.includes(key));
  
  console.log(`🌐 ${lang.toUpperCase()} Analysis:`);
  console.log(`   Total keys: ${langCount}/${referenceCount}`);
  console.log(`   Missing keys: ${missingKeys.length}`);
  console.log(`   Extra keys: ${extraKeys.length}`);
  
  if (extraKeys.length > 0) {
    console.log(`   ⚠️  Extra keys found: ${extraKeys.join(', ')}`);
  }
  
  console.log('');
});

// Detailed missing key analysis
function categorizeKeys(keys) {
  const categories = {
    'System Configuration': [],
    'Common UI Elements': [],
    'Sidebar Navigation': [],
    'Dashboard': [],
    'Settings': [],
    'Landing Page - Navigation': [],
    'Landing Page - Actions': [],
    'Landing Page - Hero': [],
    'Landing Page - Features': [],
    'Landing Page - Testimonials': [],
    'Landing Page - Pricing': [],
    'Landing Page - CTA': [],
    'Landing Page - Contact': [],
    'Landing Page - Footer': [],
    'Other': []
  };
  
  keys.forEach(key => {
    if (key.startsWith('language.') || key.startsWith('currency.')) {
      categories['System Configuration'].push(key);
    } else if (key.startsWith('common.')) {
      categories['Common UI Elements'].push(key);
    } else if (key.startsWith('sidebar.')) {
      categories['Sidebar Navigation'].push(key);
    } else if (key.startsWith('dashboard.')) {
      categories['Dashboard'].push(key);
    } else if (key.startsWith('settings.')) {
      categories['Settings'].push(key);
    } else if (key.startsWith('auth.landing.nav.')) {
      categories['Landing Page - Navigation'].push(key);
    } else if (key === 'auth.landing.signIn' || key === 'auth.landing.getStarted' || 
               key === 'auth.landing.freeTrial' || key === 'auth.landing.noCreditCard') {
      categories['Landing Page - Actions'].push(key);
    } else if (key.startsWith('auth.landing.hero.') || key === 'auth.landing.subtitle') {
      categories['Landing Page - Hero'].push(key);
    } else if (key.startsWith('auth.landing.features.')) {
      categories['Landing Page - Features'].push(key);
    } else if (key.startsWith('auth.landing.testimonials.')) {
      categories['Landing Page - Testimonials'].push(key);
    } else if (key.startsWith('auth.landing.pricing.')) {
      categories['Landing Page - Pricing'].push(key);
    } else if (key.startsWith('auth.landing.cta.')) {
      categories['Landing Page - CTA'].push(key);
    } else if (key.startsWith('auth.landing.contact.')) {
      categories['Landing Page - Contact'].push(key);
    } else if (key === 'auth.landing.copyright' || key === 'auth.landing.madeIn') {
      categories['Landing Page - Footer'].push(key);
    } else {
      categories['Other'].push(key);
    }
  });
  
  return categories;
}

// Analyze missing keys for French and Italian
['fr', 'it'].forEach(lang => {
  const langKeys = Object.keys(translations[lang] || {});
  const missingKeys = referenceKeys.filter(key => !langKeys.includes(key));
  
  if (missingKeys.length > 0) {
    console.log(`\n🔍 Detailed Missing Keys Analysis for ${lang.toUpperCase()}:`);
    console.log(`📊 Total missing: ${missingKeys.length} keys\n`);
    
    const categorizedMissing = categorizeKeys(missingKeys);
    
    Object.entries(categorizedMissing).forEach(([category, keys]) => {
      if (keys.length > 0) {
        console.log(`📂 ${category} (${keys.length} keys):`);
        keys.forEach(key => {
          const englishValue = translations.en[key];
          console.log(`   • ${key}`);
          console.log(`     EN: "${englishValue}"`);
        });
        console.log('');
      }
    });
  }
});

// Generate summary report
console.log('\n📋 SUMMARY REPORT:');
console.log('==================');

const frenchKeys = Object.keys(translations.fr || {});
const italianKeys = Object.keys(translations.it || {});
const frenchMissing = referenceKeys.filter(key => !frenchKeys.includes(key));
const italianMissing = referenceKeys.filter(key => !italianKeys.includes(key));

console.log(`\n🇬🇧 English (Reference): ${referenceCount} keys`);
console.log(`🇩🇪 German: ${Object.keys(translations.de || {}).length} keys`);
console.log(`🇫🇷 French: ${frenchKeys.length} keys (${frenchMissing.length} missing)`);
console.log(`🇮🇹 Italian: ${italianKeys.length} keys (${italianMissing.length} missing)`);

console.log(`\n🎯 Translation Completeness:`);
console.log(`   German: ${((Object.keys(translations.de || {}).length / referenceCount) * 100).toFixed(1)}%`);
console.log(`   French: ${((frenchKeys.length / referenceCount) * 100).toFixed(1)}%`);
console.log(`   Italian: ${((italianKeys.length / referenceCount) * 100).toFixed(1)}%`);

// Export missing keys for use in other scripts
const missingKeysData = {
  french: frenchMissing,
  italian: italianMissing,
  categories: {
    french: categorizeKeys(frenchMissing),
    italian: categorizeKeys(italianMissing)
  }
};

const outputPath = path.join(__dirname, '..', 'missing-translation-keys.json');
fs.writeFileSync(outputPath, JSON.stringify(missingKeysData, null, 2));
console.log(`\n💾 Missing keys data exported to: missing-translation-keys.json`);

console.log('\n✅ Analysis complete!');
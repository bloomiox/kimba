import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Verifying build output...\n');

const distDir = path.join(__dirname, '..', 'dist');
const requiredFiles = [
  'index.html',
  'index.css',
  '_redirects',
  '_headers',
  'i18n/locales/de.json',
  'i18n/locales/en.json',
  'i18n/locales/fr.json',
  'i18n/locales/it.json'
];

let allGood = true;

// Check if dist directory exists
if (!fs.existsSync(distDir)) {
  console.log('❌ dist/ directory not found');
  allGood = false;
} else {
  console.log('✅ dist/ directory exists');
}

// Check required files
requiredFiles.forEach(file => {
  const filePath = path.join(distDir, file);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    console.log(`✅ ${file} (${stats.size} bytes)`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    allGood = false;
  }
});

// Check assets directory
const assetsDir = path.join(distDir, 'assets');
if (fs.existsSync(assetsDir)) {
  const assetFiles = fs.readdirSync(assetsDir);
  console.log(`✅ assets/ directory (${assetFiles.length} files)`);
  assetFiles.forEach(file => {
    console.log(`   - ${file}`);
  });
} else {
  console.log('⚠️  assets/ directory not found (may be okay for minimal build)');
}

// Verify translation files have content
console.log('\n📝 Checking translation files...');
const languages = ['de', 'en', 'fr', 'it'];
languages.forEach(lang => {
  const filePath = path.join(distDir, 'i18n', 'locales', `${lang}.json`);
  if (fs.existsSync(filePath)) {
    try {
      const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const keyCount = Object.keys(content).length;
      console.log(`✅ ${lang}.json - ${keyCount} translation keys`);
    } catch (error) {
      console.log(`❌ ${lang}.json - Invalid JSON`);
      allGood = false;
    }
  }
});

// Check configuration files
console.log('\n⚙️  Checking configuration files...');
const redirectsPath = path.join(distDir, '_redirects');
if (fs.existsSync(redirectsPath)) {
  const content = fs.readFileSync(redirectsPath, 'utf8');
  if (content.includes('/assets/*') && content.includes('/i18n/*') && content.includes('/index.html')) {
    console.log('✅ _redirects - Contains required rules');
  } else {
    console.log('⚠️  _redirects - May be missing required rules');
  }
}

const headersPath = path.join(distDir, '_headers');
if (fs.existsSync(headersPath)) {
  const content = fs.readFileSync(headersPath, 'utf8');
  if (content.includes('application/json') && content.includes('text/css')) {
    console.log('✅ _headers - Contains required MIME types');
  } else {
    console.log('⚠️  _headers - May be missing required MIME types');
  }
}

console.log('\n' + '='.repeat(50));
if (allGood) {
  console.log('🎉 BUILD VERIFICATION PASSED!');
  console.log('✅ Ready for Cloudflare Pages deployment');
} else {
  console.log('❌ BUILD VERIFICATION FAILED!');
  console.log('⚠️  Please fix the issues above before deploying');
}
console.log('='.repeat(50));
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Testing URL accessibility...\n');

const distDir = path.join(__dirname, '..', 'dist');

// Test URLs that should be accessible
const testUrls = [
  '/index.html',
  '/index.css',
  '/assets/index-BNlN1JX4.css',
  '/assets/index-BzIFnxEf.js',
  '/assets/index-DclWOD0H.js',
  '/i18n/locales/de.json',
  '/i18n/locales/en.json',
  '/i18n/locales/fr.json',
  '/i18n/locales/it.json'
];

console.log('📁 Checking file existence in dist folder:');
testUrls.forEach(url => {
  const filePath = path.join(distDir, url.substring(1)); // Remove leading slash
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    console.log(`✅ ${url} (${stats.size} bytes)`);
  } else {
    console.log(`❌ ${url} - FILE NOT FOUND`);
  }
});

console.log('\n📋 _redirects file content:');
const redirectsPath = path.join(distDir, '_redirects');
if (fs.existsSync(redirectsPath)) {
  const content = fs.readFileSync(redirectsPath, 'utf8');
  console.log(content);
} else {
  console.log('❌ _redirects file not found');
}

console.log('\n📋 _headers file content:');
const headersPath = path.join(distDir, '_headers');
if (fs.existsSync(headersPath)) {
  const content = fs.readFileSync(headersPath, 'utf8');
  console.log(content);
} else {
  console.log('❌ _headers file not found');
}

console.log('\n🚀 Ready for deployment test!');
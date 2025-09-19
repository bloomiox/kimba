const fs = require('fs');
const path = require('path');

// Create directories if they don't exist
const distI18nDir = path.join(__dirname, '..', 'dist', 'i18n', 'locales');
if (!fs.existsSync(distI18nDir)) {
  fs.mkdirSync(distI18nDir, { recursive: true });
}

// Copy i18n files
const publicI18nDir = path.join(__dirname, '..', 'public', 'i18n', 'locales');
const files = fs.readdirSync(publicI18nDir);
files.forEach(file => {
  if (file.endsWith('.json')) {
    fs.copyFileSync(
      path.join(publicI18nDir, file),
      path.join(distI18nDir, file)
    );
    console.log(`Copied ${file}`);
  }
});

// Copy _redirects and _headers
const publicDir = path.join(__dirname, '..', 'public');
const distDir = path.join(__dirname, '..', 'dist');

['_redirects', '_headers'].forEach(file => {
  const srcPath = path.join(publicDir, file);
  const destPath = path.join(distDir, file);
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`Copied ${file}`);
  }
});

console.log('Asset copying completed!');
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create directories if they don't exist
const distDir = path.join(__dirname, '..', 'dist');
const distI18nDir = path.join(distDir, 'i18n', 'locales');

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

if (!fs.existsSync(distI18nDir)) {
  fs.mkdirSync(distI18nDir, { recursive: true });
}

// Copy i18n files
const publicI18nDir = path.join(__dirname, '..', 'public', 'i18n', 'locales');
if (fs.existsSync(publicI18nDir)) {
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
}

// Copy _redirects, _headers, and index.css
const publicDir = path.join(__dirname, '..', 'public');

['_redirects', '_headers', 'index.css'].forEach(file => {
  const srcPath = path.join(publicDir, file);
  const destPath = path.join(distDir, file);
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`Copied ${file}`);
  }
});

// Copy functions directory
const functionsDir = path.join(__dirname, '..', 'functions');
const distFunctionsDir = path.join(distDir, 'functions');

if (fs.existsSync(functionsDir)) {
  if (!fs.existsSync(distFunctionsDir)) {
    fs.mkdirSync(distFunctionsDir, { recursive: true });
  }
  
  const functionFiles = fs.readdirSync(functionsDir);
  functionFiles.forEach(file => {
    const srcPath = path.join(functionsDir, file);
    const destPath = path.join(distFunctionsDir, file);
    fs.copyFileSync(srcPath, destPath);
    console.log(`Copied functions/${file}`);
  });
}

console.log('Asset copying completed!');
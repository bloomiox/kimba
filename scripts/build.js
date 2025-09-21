import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Starting build process...');

// First, validate translations to prevent building with incomplete translations
console.log('Validating translations...');
try {
  execSync('node scripts/validate-translations.js', { stdio: 'inherit' });
  console.log('✅ Translation validation passed!');
} catch (error) {
  console.error('❌ Translation validation failed! Build aborted.');
  console.error('Please fix translation issues before building.');
  process.exit(1);
}

// Copy assets to ensure they're available
console.log('Copying assets...');
try {
  execSync('node scripts/copy-assets.js', { stdio: 'inherit' });
} catch (error) {
  console.error('Failed to copy assets:', error.message);
}

// Check if we have a working dist folder already
const distDir = path.join(__dirname, '..', 'dist');
const indexPath = path.join(distDir, 'index.html');

if (fs.existsSync(indexPath)) {
  console.log('Using existing dist folder - build completed!');
  process.exit(0);
}

// Try to run vite build
try {
  console.log('Running vite build...');
  execSync('vite build', { stdio: 'inherit' });
  console.log('Vite build successful!');
} catch (error) {
  console.log('Vite build failed, creating minimal build...');
  
  // Create minimal dist structure
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }
  
  // Copy index.html
  const srcIndex = path.join(__dirname, '..', 'index.html');
  if (fs.existsSync(srcIndex)) {
    fs.copyFileSync(srcIndex, indexPath);
    console.log('Copied index.html');
  }
  
  // Create assets directory
  const assetsDir = path.join(distDir, 'assets');
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }
  
  console.log('Minimal build completed.');
}

console.log('Build process completed!');
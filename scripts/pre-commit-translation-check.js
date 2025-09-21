#!/usr/bin/env node

/**
 * Pre-commit hook for translation validation
 * 
 * This script can be used as a Git pre-commit hook to ensure
 * translation completeness before commits are made.
 * 
 * To install as a Git hook:
 * 1. Copy this file to .git/hooks/pre-commit
 * 2. Make it executable: chmod +x .git/hooks/pre-commit
 * 
 * Or run manually: node scripts/pre-commit-translation-check.js
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Pre-commit translation validation...\n');

try {
  // Check if any translation files are being committed
  let hasTranslationChanges = false;
  
  try {
    const stagedFiles = execSync('git diff --cached --name-only', { encoding: 'utf8' });
    const translationFilePattern = /i18n\/locales\/.*\.json$/;
    
    if (stagedFiles.split('\n').some(file => translationFilePattern.test(file))) {
      hasTranslationChanges = true;
      console.log('📝 Translation files detected in commit');
    }
  } catch (error) {
    // If git command fails, we're probably not in a git repo
    // Still run validation as a safety check
    console.log('⚠️  Could not check staged files, running validation anyway');
    hasTranslationChanges = true;
  }

  if (hasTranslationChanges) {
    console.log('🧪 Running translation validation...\n');
    
    // Run translation validation
    execSync('node scripts/validate-translations.js', { stdio: 'inherit' });
    
    console.log('\n✅ Translation validation passed!');
    console.log('✅ Commit can proceed.\n');
  } else {
    console.log('ℹ️  No translation files in commit, skipping validation.\n');
  }

  process.exit(0);

} catch (error) {
  console.error('\n❌ Translation validation failed!');
  console.error('❌ Commit blocked to prevent translation issues.\n');
  console.error('Please fix the translation issues and try again.');
  console.error('You can run "npm run validate-translations" to see detailed errors.\n');
  
  process.exit(1);
}
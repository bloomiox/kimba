# Translation Testing and Validation

This directory contains comprehensive tools for testing and validating translation completeness and consistency.

## Available Scripts

### Core Validation Scripts

#### `validate-translations.js`
Automated validation tests to ensure translation completeness and prevent future translation gaps.

```bash
npm run validate-translations
# or
node scripts/validate-translations.js
```

**Features:**
- ✅ Verifies all translation files exist
- ✅ Validates JSON syntax
- ✅ Ensures identical key sets across all languages
- ✅ Checks public/dist file synchronization
- ✅ Validates required keys are present
- ✅ Detects empty translation values
- 📄 Generates detailed validation report

#### `test-translations.js` (Enhanced)
Enhanced translation completeness checker with detailed missing key analysis.

```bash
npm run test-translations
# or
node scripts/test-translations.js
```

**Features:**
- 📊 Compares key counts across all languages
- 🔍 Identifies missing keys by category
- 📝 Generates detailed missing keys report
- 🌐 Tests translation URL accessibility
- 📂 Validates both public and dist directories

#### `translation-test-suite.js`
Comprehensive test suite covering validation, completeness, integration, and performance.

```bash
npm run test-translation-suite
# or
node scripts/translation-test-suite.js
```

**Test Categories:**
1. **Validation Tests** - Core validation checks
2. **Completeness Tests** - Key completeness analysis
3. **Integration Tests** - Translation system integration
4. **Performance Tests** - File size and parsing performance

### Continuous Integration Scripts

#### `pre-commit-translation-check.js`
Pre-commit hook to validate translations before commits.

```bash
npm run pre-commit-check
# or
node scripts/pre-commit-translation-check.js
```

**Installation as Git Hook:**
```bash
# Copy to Git hooks directory
cp scripts/pre-commit-translation-check.js .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

## Integration with Build Process

Translation validation is automatically integrated into the build process:

```bash
npm run build
```

The build will fail if translation validation fails, preventing deployment of incomplete translations.

## Usage Examples

### Daily Development Workflow

```bash
# Before starting work - check current state
npm run validate-translations

# After making translation changes
npm run test-translations

# Before committing
npm run pre-commit-check

# Full test suite (recommended before releases)
npm run test-translation-suite
```

### CI/CD Integration

Add to your CI/CD pipeline:

```yaml
# Example GitHub Actions step
- name: Validate Translations
  run: npm run validate-translations

- name: Run Translation Test Suite
  run: npm run test-translation-suite
```

### Troubleshooting Translation Issues

1. **Missing Keys Detected:**
   ```bash
   npm run test-translations
   # Check the generated missing-translation-keys.json report
   ```

2. **Validation Failures:**
   ```bash
   npm run validate-translations
   # Check the generated translation-validation-report.json
   ```

3. **Comprehensive Analysis:**
   ```bash
   npm run test-translation-suite
   # Check the generated translation-test-suite-report.json
   ```

## Generated Reports

### `translation-validation-report.json`
Detailed validation test results with pass/fail status for each test.

### `missing-translation-keys.json`
Comprehensive list of missing translation keys organized by language and category.

### `translation-test-suite-report.json`
Complete test suite results including validation, completeness, integration, and performance metrics.

## Translation File Structure

Expected structure for translation files:

```
public/i18n/locales/
├── en.json (baseline - 98 keys)
├── de.json (98 keys)
├── fr.json (98 keys)
└── it.json (98 keys)

dist/i18n/locales/
├── en.json (synchronized with public)
├── de.json (synchronized with public)
├── fr.json (synchronized with public)
└── it.json (synchronized with public)
```

## Key Categories

Translation keys are organized into these categories:

- `language.*` - Language and locale settings
- `currency.*` - Currency settings
- `common.*` - Common UI elements (buttons, actions)
- `sidebar.*` - Navigation elements
- `dashboard.*` - Dashboard content
- `auth.landing.*` - Landing page content (64 keys)
- `settings.*` - Settings page content
- `clients.*` - Client management content

## Best Practices

1. **Always validate before committing:**
   ```bash
   npm run validate-translations
   ```

2. **Use the pre-commit hook:**
   ```bash
   cp scripts/pre-commit-translation-check.js .git/hooks/pre-commit
   ```

3. **Run full test suite before releases:**
   ```bash
   npm run test-translation-suite
   ```

4. **Check reports for detailed analysis:**
   - Review generated JSON reports for specific issues
   - Use category-based missing key reports to prioritize fixes

5. **Maintain synchronization:**
   - Ensure public and dist directories stay synchronized
   - Use the build process to automatically validate translations

## Requirements Addressed

This testing system addresses the following requirements:

- **3.3**: All translation files have the same keys
- **4.1**: Translation tests report the same number of keys for all languages
- **4.2**: No English fallback text appears when testing the application
- **4.3**: All UI elements update to the selected language when switching
- **4.4**: All text is properly translated when accessing any page or feature

## Exit Codes

All scripts use standard exit codes:
- `0` - Success (all tests passed)
- `1` - Failure (one or more tests failed)

This allows for easy integration with CI/CD pipelines and automated workflows.
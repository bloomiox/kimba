# Design Document

## Overview

This design addresses the incomplete translation coverage for French and Italian languages in the salon management application. The solution involves identifying missing translation keys, creating complete translations for all missing content, and ensuring consistency across all language files.

## Architecture

### Translation System Structure

The application uses a JSON-based translation system with the following structure:

```
public/i18n/locales/
├── en.json (98 keys - complete)
├── de.json (98 keys - complete) 
├── fr.json (34 keys - incomplete)
└── it.json (34 keys - incomplete)
```

The translation system is managed by:
- `i18n/translator.ts` - Core translation functions
- `contexts/SettingsContext.tsx` - Language switching and state management
- `components/common/LanguageSwitcher.tsx` - UI for language selection

### Missing Translation Categories

Based on analysis of the English translation file, the missing translations fall into these categories:

1. **Landing Page Content** (64 keys missing)
   - Navigation elements
   - Hero section content
   - Features descriptions
   - Testimonials
   - Pricing information
   - Contact information

2. **Settings and Language** (1 key missing)
   - Language selection labels

## Components and Interfaces

### Translation File Structure

Each language file follows this hierarchical structure:

```json
{
  "language.code": "language-COUNTRY",
  "currency.code": "CURRENCY",
  "common.*": "Common UI elements",
  "sidebar.*": "Navigation elements", 
  "dashboard.*": "Dashboard content",
  "auth.landing.*": "Landing page content",
  "settings.*": "Settings page content",
  "clients.*": "Client management content"
}
```

### Key Translation Categories

1. **Common Elements** ✅ (Complete in all languages)
   - Buttons, actions, time references
   - Error messages

2. **Sidebar Navigation** ✅ (Complete in all languages)
   - Menu items, logout

3. **Dashboard** ✅ (Complete in all languages)
   - Welcome messages, subtitles

4. **Landing Page** ❌ (Missing in French/Italian)
   - All auth.landing.* keys (64 keys)

5. **Settings** ❌ (Missing in French/Italian)
   - settings.language.title

## Data Models

### Translation Key Structure

```typescript
interface TranslationKeys {
  // System configuration
  'language.code': string;
  'currency.code': string;
  
  // Common UI elements
  'common.*': string;
  
  // Navigation
  'sidebar.*': string;
  
  // Dashboard
  'dashboard.*': string;
  
  // Authentication and landing
  'auth.landing.*': string;
  
  // Settings
  'settings.*': string;
  
  // Client management
  'clients.*': string;
}
```

### Missing Keys Analysis

The following 65 keys are missing from French and Italian translations:

1. `settings.language.title`
2. All `auth.landing.*` keys (64 keys):
   - Navigation: nav.features, nav.pricing, nav.contact
   - Actions: signIn, getStarted, freeTrial, noCreditCard
   - Hero: hero.title, hero.subtitle, subtitle
   - Features: features.* (8 keys)
   - Testimonials: testimonials.* (10 keys)
   - Pricing: pricing.* (21 keys)
   - CTA: cta.* (2 keys)
   - Contact: contact.* (2 keys)
   - Footer: copyright, madeIn

## Error Handling

### Translation Fallback Strategy

The current system implements fallback behavior:

1. **Primary**: Requested language translation
2. **Fallback**: German (de) translation
3. **Final Fallback**: Translation key itself

### Missing Translation Detection

The application should handle missing translations gracefully:

```typescript
const t = (key: string, replacements?: Record<string, string | number>): string => {
  let translation = translations[key] || key; // Falls back to key if missing
  // Apply replacements...
  return translation;
};
```

## Testing Strategy

### Translation Completeness Testing

1. **Key Count Verification**
   - All language files must have identical key counts
   - Current test: `scripts/test-translations.js`

2. **Key Existence Verification**
   - Every key in English must exist in all other languages
   - No missing keys allowed

3. **Runtime Translation Testing**
   - Switch between languages and verify no English fallbacks appear
   - Test all major application flows in each language

4. **Automated Testing**
   - Extend `test-translations.js` to check key completeness
   - Add validation for missing keys

### Quality Assurance Process

1. **Translation Accuracy Review**
   - Native speakers should review translations
   - Context-appropriate translations for salon industry

2. **UI Testing**
   - Test text overflow in different languages
   - Verify proper text rendering and formatting

3. **User Experience Testing**
   - Complete user flows in each language
   - Ensure cultural appropriateness of content

## Implementation Approach

### Phase 1: Key Identification and Mapping
1. Extract all missing keys from English translation file
2. Create mapping of English keys to translate
3. Organize keys by functional area

### Phase 2: Translation Creation
1. Translate missing keys for French
2. Translate missing keys for Italian
3. Ensure consistency with existing translations

### Phase 3: File Updates and Testing
1. Update French translation file with all missing keys
2. Update Italian translation file with all missing keys
3. Run translation tests to verify completeness
4. Test application functionality in all languages

### Phase 4: Quality Assurance
1. Manual testing of all translated content
2. Verification of proper text rendering
3. User experience testing across languages
export type Language = 'de' | 'en' | 'fr' | 'it';
type Translations = Record<string, string>;

let translations: Translations = {};

const loadTranslations = async (lang: Language): Promise<void> => {
  try {
    console.log(`Loading translations for language: ${lang}`);
    const response = await fetch(`/i18n/locales/${lang}.json`);
    if (!response.ok) {
        throw new Error(`Failed to load ${lang}.json - Status: ${response.status}`);
    }
    translations = await response.json();
    console.log(`Successfully loaded ${Object.keys(translations).length} translation keys for ${lang}`);
    console.log('Sample translation keys:', Object.keys(translations).slice(0, 5));
    if (translations['capabilities.hero.title']) {
      console.log('capabilities.hero.title found:', translations['capabilities.hero.title']);
    } else {
      console.log('capabilities.hero.title NOT found in translations');
    }
  } catch (error) {
    console.warn(`Could not load translations for ${lang}, falling back to 'de'.`, error);
    try {
        const fallbackResponse = await fetch(`/i18n/locales/de.json`);
        translations = await fallbackResponse.json();
        console.log(`Fallback loaded ${Object.keys(translations).length} translation keys for de`);
    } catch (fallbackError) {
        console.error('Failed to load fallback German translations.', fallbackError);
        translations = {};
    }
  }
};

const t = (key: string, replacements?: Record<string, string | number>): string => {
  let translation = translations[key];
  if (!translation) {
    console.warn(`Translation key not found: ${key}`);
    translation = key;
  }
  if (replacements) {
    Object.entries(replacements).forEach(([placeholder, value]) => {
      translation = translation.replace(`{{${placeholder}}}`, String(value));
    });
  }
  return translation;
};

export { loadTranslations, t };
export type Language = 'de' | 'en' | 'fr' | 'it';
type Translations = Record<string, string>;

let translations: Translations = {};

const loadTranslations = async (lang: Language): Promise<void> => {
  try {
    const response = await fetch(`/i18n/locales/${lang}.json`);
    if (!response.ok) {
        throw new Error(`Failed to load ${lang}.json`);
    }
    translations = await response.json();
  } catch (error) {
    console.warn(`Could not load translations for ${lang}, falling back to 'de'.`, error);
    try {
        const fallbackResponse = await fetch(`/i18n/locales/de.json`);
        translations = await fallbackResponse.json();
    } catch (fallbackError) {
        console.error('Failed to load fallback German translations.', fallbackError);
        translations = {};
    }
  }
};

const t = (key: string, replacements?: Record<string, string | number>): string => {
  let translation = translations[key] || key;
  if (replacements) {
    Object.entries(replacements).forEach(([placeholder, value]) => {
      translation = translation.replace(`{{${placeholder}}}`, String(value));
    });
  }
  return translation;
};

export { loadTranslations, t };
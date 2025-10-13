export type AccentChoice =
  | 'purple'
  | 'blue'
  | 'green'
  | 'pink'
  | 'orange'
  | 'red'
  | 'teal'
  | 'indigo'
  | 'yellow'
  | 'amber'
  | 'lime'
  | 'cyan'
  | 'sky'
  | 'violet'
  | 'fuchsia'
  | 'rose'
  | 'custom';

export type TranslateFn = (key: string, replacements?: Record<string, string | number>) => string;

export interface OnboardingData {
  salonName: string;
  salonLogo: string | null;
  theme: 'light' | 'dark';
  accentColor: AccentChoice;
  customAccentColor?: string;
  typography: 'sans' | 'serif';
  language: 'de' | 'en' | 'fr' | 'it';
  currency: 'CHF' | 'EUR' | 'USD';
  layout: 'standard' | 'compact';
  selectedServices: string[];
  customServices: Array<{ name: string; duration: number; price: number }>;
  teamMembers: Array<{ name: string; type: 'expert' | 'station'; email?: string; phone?: string }>;
}

export interface AccentOption {
  name: AccentChoice;
  label: string;
  className: string;
}

export interface LanguageOption {
  id: OnboardingData['language'];
  label: string;
  flag: string;
}

export interface CurrencyOption {
  id: OnboardingData['currency'];
  label: string;
  symbol: string;
}

export interface SalonInfoStepProps {
  data: OnboardingData;
  t: TranslateFn;
  accentColors: AccentOption[];
  languages: LanguageOption[];
  currencies: CurrencyOption[];
  updateData: (updates: Partial<OnboardingData>) => void;
  onThemeChange: (theme: OnboardingData['theme']) => void;
  onTypographyChange: (typography: OnboardingData['typography']) => void;
  onAccentColorChange: (accent: AccentChoice) => void;
  onCustomAccentColorChange: (color: string) => void;
  onLanguageChange: (language: OnboardingData['language']) => void;
  onCurrencyChange: (currency: OnboardingData['currency']) => void;
  showCustomColorPicker: boolean;
  setShowCustomColorPicker: (value: boolean) => void;
}

export interface ServicesStepProps {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
  commonServices: Array<{ name: string; duration: number; price: number }>;
}

export interface TeamStepProps {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
}

export interface ReviewStepProps {
  data: OnboardingData;
  t: TranslateFn;
  languages: LanguageOption[];
  accentColors: AccentOption[];
  onComplete: () => void;
  onSkip: () => void;
  isCompleting: boolean;
  isSkipping: boolean;
}

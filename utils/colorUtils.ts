/**
 * Utility functions for working with colors in the application
 */

/**
 * Maps a base color class to the dynamic accent color class
 * @param baseClass The original class name (e.g., 'bg-blue-500')
 * @returns The corresponding accent class (e.g., 'bg-accent')
 */
export const mapToAccentColor = (baseClass: string): string => {
  if (!baseClass) return '';
  
  // Extract the type of utility (bg, text, border, etc.) from the base class
  const matches = baseClass.match(/(^|\s)(((hover|focus|dark|group-hover|dark:group-hover):)*(bg|text|border|ring))-[a-z]+-\d+/g);
  
  if (!matches || matches.length === 0) {
    return baseClass; // Return original if no color utility classes found
  }
  
  let result = baseClass;
  
  // Replace each matched utility with its accent equivalent
  matches.forEach(match => {
    // Extract the prefix (hover:, focus:, etc.) and the utility type (bg, text, etc.)
    const parts = match.match(/(^|\s)((((hover|focus|dark|group-hover|dark:group-hover):)*)(bg|text|border|ring))-[a-z]+-\d+/);
    if (parts && parts.length >= 7) {
      const prefix = parts[2]; // The full prefix including hover:, focus:, etc.
      const utility = parts[6]; // The base utility (bg, text, border, ring)
      result = result.replace(match, `${prefix.trim()}-accent`);
    }
  });
  
  return result;
};
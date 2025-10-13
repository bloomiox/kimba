// Utility functions to handle dates without timezone issues

/**
 * Format a Date object to YYYY-MM-DD string without timezone conversion
 * This prevents the common issue where dates shift by one day due to timezone conversion
 */
export const formatDateForStorage = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Format a Date object for HTML date input without timezone conversion
 * Same as formatDateForStorage but more explicit naming for input fields
 */
export const formatDateForInput = (date: Date): string => {
  return formatDateForStorage(date);
};

/**
 * Get today's date as YYYY-MM-DD string without timezone issues
 */
export const getTodayString = (): string => {
  return formatDateForStorage(new Date());
};

/**
 * Get tomorrow's date as YYYY-MM-DD string without timezone issues
 */
export const getTomorrowString = (): string => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return formatDateForStorage(tomorrow);
};

/**
 * Check if a date string (YYYY-MM-DD) is today
 */
export const isToday = (dateString: string): boolean => {
  return dateString === getTodayString();
};

/**
 * Check if a date string (YYYY-MM-DD) is tomorrow
 */
export const isTomorrow = (dateString: string): boolean => {
  return dateString === getTomorrowString();
};

/**
 * Create a Date object from a date string (YYYY-MM-DD) without timezone issues
 */
export const createDateFromString = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

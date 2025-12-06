/**
 * BiDi (Bidirectional) text utilities for Arabic content
 * 
 * These helpers detect Arabic characters and apply appropriate RTL classes
 * at the text level, while keeping the overall app layout LTR.
 */

/**
 * Check if a string contains Arabic characters
 * @param s - String to check
 * @returns true if string contains Arabic characters (U+0600 to U+06FF)
 */
export const hasArabic = (s?: string | null): boolean => {
    if (!s) return false;
    return /[\u0600-\u06FF]/.test(s);
};

/**
 * Get the appropriate BiDi class for a text string
 * Returns "rtl-text" if Arabic is detected, otherwise "ltr-text"
 * @param s - String to check
 * @returns CSS class name for bidirectional text
 */
export const bidiTextClass = (s?: string | null): string => {
    return hasArabic(s) ? "rtl-text" : "ltr-text";
};

/**
 * Get BiDi class with plaintext isolation
 * Useful for mixed content that may contain both Arabic and English
 * @param s - String to check
 * @returns CSS class name with plaintext isolation
 */
export const bidiPlainClass = (s?: string | null): string => {
    return hasArabic(s) ? "rtl-text bidi-plain" : "ltr-text";
};


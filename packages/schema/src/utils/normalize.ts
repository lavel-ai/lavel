// packages/schema/src/utils/normalize.ts
type StringInput = string | null | undefined;

export const normalizeText = {
  /**
   * Trims whitespace from a string, returning an empty string if null or undefined.
   */
  trim: (input: StringInput): string => input?.trim() ?? '',

  /**
   * Converts a string to title case (e.g., "john doe" -> "John Doe").
   */
  titleCase: (input: StringInput): string => {
    const trimmed = normalizeText.trim(input);
    if (!trimmed) return '';
    
    return trimmed
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase())
      // Handle special cases like "O'Connor" or "Jean-Pierre"
      .replace(/\b(Mc|Mac)(\w)/g, (match, prefix, letter) => prefix + letter.toUpperCase())
      .replace(/(-\w)/g, match => match.toUpperCase())
      .replace(/('|')\w/g, match => match.toUpperCase());
  },

  /**
   * Converts a string to uppercase
   */
  uppercase: (input: StringInput): string => normalizeText.trim(input)?.toUpperCase() ?? '',

  /**
   * Converts a string to lowercase
   */
  lowercase: (input: StringInput): string => normalizeText.trim(input)?.toLowerCase() ?? '',

  /**
   * Converts empty strings to null, trims non-empty strings
   */
  nullIfEmpty: (input: StringInput): string | null => {
    const trimmed = normalizeText.trim(input);
    return trimmed === '' ? null : trimmed;
  },
};
type StringInput = string | null | undefined;

export const utils = {
  /**
   * Trims whitespace from a string, returning an empty string if null or undefined.
   */
  trim: (input: StringInput): string => input?.trim() ?? '',

  /**
   * Converts a string to title case (e.g., "john doe" -> "John Doe").
   */
  titleCase: (input: StringInput): string =>
    utils.trim(input)?.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()) ?? '',

  /**
   * Converts a string to uppercase (e.g., "abc123" -> "ABC123").
   */
  uppercase: (input: StringInput): string => utils.trim(input)?.toUpperCase() ?? '',

  /**
   * Converts a string to lowercase (e.g., "ABC123" -> "abc123").
   */
  lowercase: (input: StringInput): string => utils.trim(input)?.toLowerCase() ?? '',

  /**
   * Normalizes a phone number to digits with an optional leading "+" (e.g., "(123) 456-7890" -> "+1234567890").
   */
  phone: (input: StringInput): string => {
    const val = utils.trim(input)?.replace(/[^\d+]/g, '') ?? '';
    return /^\+?\d{10,15}$/.test(val) ? val : '';
  },

  /**
   * Converts empty strings to null, trims non-empty strings (e.g., " " -> null, "123" -> "123").
   */
  nullIfEmpty: (input: StringInput): string | null => {
    const trimmed = utils.trim(input);
    return trimmed === '' ? null : trimmed;
  },
};
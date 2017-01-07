/** Coerces a data-bound value (typically a string) to a Date. */
export function coerceDateProperty(value: any, fallbackValue = new Date()): Date {
  let timestamp = Date.parse(value);
  return isNaN(timestamp) ? fallbackValue : new Date(timestamp);
}

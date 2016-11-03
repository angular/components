/** Coerces a data-bound value (typically a string) to a number. */
export function coerceNumberProperty(value: any, fallbackValue = 0) {
  return isNaN(parseFloat(value as any)) ? fallbackValue : Number(value);
}

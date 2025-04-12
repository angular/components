import * as normalize from 'path-normalize';

/**
 * Normalizes the given path by:
 *    - Collapsing unnecessary segments (e.g. `a/./b`)
 *    - Normalizing from backslashes to Posix forward slashes.
 *    - Removing a leading `./` if present.
 */
export function normalizePath(input: string): string {
  input = normalize(input.replace(/\\/g, '/'));
  if (input.startsWith('./')) {
    input = input.substring(2);
  }
  return input;
}

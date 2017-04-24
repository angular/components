/** Gets whether the current platform is a web browser (versus node). */
export function isBrowser() {
  return typeof document === 'object';
}

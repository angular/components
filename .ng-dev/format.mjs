/**
 * Configuration for the `ng-dev format` command.
 *
 * @type { import("@angular/ng-dev").FormatConfig }
 */
export const format = {
  buildifier: true,
  prettier: {
    matchers: ['**/*.{js,ts,mts,mjs,json}'],
  },
};

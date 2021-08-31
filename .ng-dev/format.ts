import {FormatConfig} from '@angular/dev-infra-private/ng-dev/format/config';

/**
 * Configuration for the ng-dev format command. We currently only use the buildifier
 * formatter that is responsible for formatting Bazel build and `.bzl` files.
 */
export const format: FormatConfig = {
  buildifier: true,
  'clang-format': {
    matchers: [
      '**/*.{js,ts}',
      // These schematic ng-generate files are template files that cannot be formatted.
      '!src/material/schematics/ng-generate/*/files/**/*',
      '!src/cdk/schematics/ng-generate/*/files/**/*',

      // Schematic ng-update test cases should not be formatted as that could break the
      // expected output tests. Generated code does is not formatted according to prettier.
      '!src/cdk/schematics/ng-update/test-cases/**/*_input.ts',
      '!src/cdk/schematics/ng-update/test-cases/**/*_expected_output.ts',
      '!src/material/schematics/ng-update/test-cases/**/*_input.ts',
      '!src/material/schematics/ng-update/test-cases/**/*_expected_output.ts',
    ],
  },
};

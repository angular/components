import {compileString} from 'sass';
import {runfiles} from '@bazel/runfiles';
import * as path from 'path';
import {createLocalAngularPackageImporter} from '../../../../../tools/sass/local-sass-importer.js';

const testDir = path.join(runfiles.resolvePackageRelative('../_all-theme.scss'), '../tests');
const packagesDir = path.join(runfiles.resolveWorkspaceRelative('src/cdk/_index.scss'), '../..');
const localPackageSassImporter = createLocalAngularPackageImporter(packagesDir);

function transpile(content: string): string {
  return compileString(`@use '../../../index' as mat;\n${content}`, {
    loadPaths: [testDir],
    importers: [localPackageSassImporter],
  }).css.toString();
}

// Imports the registry module directly (bypasses the public-API `show` filter)
// so tests can call registry-keys() without it being part of the public API.
function transpileRegistry(content: string): string {
  return compileString(`@use '../../../core/tokens/token-registry';\n${content}`, {
    loadPaths: [testDir],
    importers: [localPackageSassImporter],
  }).css.toString();
}

describe('mat.token-var()', () => {
  describe('valid inputs', () => {
    it('should generate CSS variable without fallback', () => {
      expect(transpile(`div { color: mat.token-var(snack-bar, container-color); }`)).toContain(
        'color: var(--mat-snack-bar-container-color)',
      );
    });

    it('should generate CSS variable with a fallback value', () => {
      expect(
        transpile(`div { color: mat.token-var(snack-bar, container-color, white); }`),
      ).toContain('color: var(--mat-snack-bar-container-color, white)');
    });

    it('should support 0 as a fallback value', () => {
      // $fallback != null (not truthy) so 0 must be preserved as a valid fallback.
      expect(transpile(`div { opacity: mat.token-var(snack-bar, container-shape, 0); }`)).toContain(
        'var(--mat-snack-bar-container-shape, 0)',
      );
    });

    it('should support false as a fallback value', () => {
      // $fallback != null (not truthy) so false must be preserved as a valid fallback.
      // Note: must use a real CSS property (not a custom property) - Sass does not
      // evaluate function calls inside custom property values (e.g. --x: ...).
      expect(
        transpile(`div { color: mat.token-var(snack-bar, container-shape, false); }`),
      ).toContain('var(--mat-snack-bar-container-shape, false)');
    });

    it('should work for a different component (button)', () => {
      // After get-overrides strips the `button-` prefix, `button-filled-container-color`
      // becomes `filled-container-color` as the token name.
      expect(
        transpile(`div { background: mat.token-var(button, filled-container-color); }`),
      ).toContain('background: var(--mat-button-filled-container-color)');
    });
  });

  describe('invalid inputs', () => {
    it('should throw for an unknown component name', () => {
      expect(() =>
        transpile(`div { color: mat.token-var(snackbar, container-color); }`),
      ).toThrowError(/Unknown component `snackbar`/);
    });

    it('should throw for an unknown token on a valid component', () => {
      expect(() => transpile(`div { color: mat.token-var(snack-bar, typo-color); }`)).toThrowError(
        /Unknown token `typo-color` for component `snack-bar`/,
      );
    });
  });

  // Smoke test: verify every expected component has a registry entry.
  // Uses one Sass compilation (via registry-keys()) instead of 41 separate ones
  // to keep the test suite within the default Bazel timeout.
  describe('registry completeness', () => {
    const components = [
      'app',
      'autocomplete',
      'badge',
      'bottom-sheet',
      'button',
      'button-toggle',
      'card',
      'checkbox',
      'chip',
      'datepicker',
      'dialog',
      'divider',
      'expansion',
      'fab',
      'form-field',
      'grid-list',
      'icon',
      'icon-button',
      'list',
      'menu',
      'optgroup',
      'option',
      'paginator',
      'progress-bar',
      'progress-spinner',
      'pseudo-checkbox',
      'radio',
      'ripple',
      'select',
      'sidenav',
      'slide-toggle',
      'slider',
      'snack-bar',
      'sort',
      'stepper',
      'table',
      'tabs',
      'timepicker',
      'toolbar',
      'tooltip',
      'tree',
    ];

    // One compilation shared by both tests below: generates a `--registered-{name}: 1`
    // marker property for every component in the registry.
    let registeredCss: string;
    beforeAll(() => {
      registeredCss = transpileRegistry(
        ':root { @each $c in token-registry.registry-keys() { --registered-#{$c}: 1; } }',
      );
    });

    it('should not include input (it delegates all theming to form-field)', () => {
      expect(registeredCss).not.toContain('--registered-input: 1');
    });

    it('should have registry entries for all expected components', () => {
      // A missing component produces no `--registered-<name>: 1` property,
      // failing the expect below with a clear context message.
      const css = registeredCss;
      for (const component of components) {
        expect(css)
          .withContext(`"${component}" is missing from the token registry`)
          .toContain(`--registered-${component}: 1`);
      }
    });
  });
});

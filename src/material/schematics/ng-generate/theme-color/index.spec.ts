import {SchematicTestRunner, UnitTestTree} from '@angular-devkit/schematics/testing';
import {createTestApp} from '@angular/cdk/schematics/testing';

import {runfiles} from '@bazel/runfiles';
import {compileString} from 'sass';
import * as path from 'path';
import {createLocalAngularPackageImporter} from '../../../../../tools/sass/local-sass-importer';
import {ColorPalettes, generateSCSSTheme, getColorPalettes} from './index';
import {Schema} from './schema';

// Note: For Windows compatibility, we need to resolve the directory paths through runfiles
// which are guaranteed to reside in the source tree.
const testDir = runfiles.resolvePackageRelative('../theme-color');
const packagesDir = path.join(runfiles.resolveWorkspaceRelative('src/cdk/_index.scss'), '../..');
const localPackageSassImporter = createLocalAngularPackageImporter(packagesDir);

describe('material-theme-color-schematic', () => {
  let runner: SchematicTestRunner;
  let testM3ColorPalettes: ColorPalettes;

  async function runM3ThemeSchematic(
    runner: SchematicTestRunner,
    options: Schema,
  ): Promise<UnitTestTree> {
    const app = await createTestApp(runner, {standalone: true});
    return runner.runSchematic('theme-color', options, app);
  }

  /** Transpiles given Sass content into CSS. */
  function transpileTheme(content: string): string {
    return compileString(
      `
        ${content}

        html {
          @include mat.theme((
            color: (
              primary: $primary-palette,
              tertiary: $tertiary-palette,
              theme-type: light,
            ),
          ));

          @if mixin-exists(high-contrast-overrides) {
            & {
              @include high-contrast-overrides(light);
            }
          }

          &.dark-theme {
            @include mat.theme((
              color: (
                primary: $primary-palette,
                tertiary: $tertiary-palette,
                theme-type: dark,
              ),
            ));

            @if mixin-exists(high-contrast-overrides) {
              & {
                @include high-contrast-overrides(dark);
              }
            }
          }
        }
        `,
      {
        loadPaths: [testDir],
        importers: [localPackageSassImporter],
      },
    ).css.toString();
  }

  beforeEach(() => {
    testM3ColorPalettes = getColorPalettes('#984061');
    runner = new SchematicTestRunner(
      '@angular/material',
      runfiles.resolveWorkspaceRelative('src/material/schematics/collection.json'),
    );
  });

  it('should throw error if given an incorrect color', async () => {
    try {
      await runM3ThemeSchematic(runner, {
        primaryColor: '#fffff',
      });
    } catch (e) {
      expect((e as Error).message).toBe(
        'Cannot parse the specified color #fffff. Please verify it is a hex color (ex. #ffffff or ffffff).',
      );
    }
  });

  describe('with scss output', async () => {
    it('should generate theme file', async () => {
      const tree = await runM3ThemeSchematic(runner, {
        primaryColor: '#984061',
      });
      expect(tree.exists('_theme-colors.scss')).toBe(true);
    });

    it('should generate theme file at specified path', async () => {
      const tree = await runM3ThemeSchematic(runner, {
        primaryColor: '#984061',
        directory: 'projects/',
      });
      expect(tree.exists('projects/_theme-colors.scss')).toBe(true);
    });

    it('should generate theme file with correct indentation and formatting', async () => {
      const tree = await runM3ThemeSchematic(runner, {
        primaryColor: '#984061',
      });

      expect(tree.readText('_theme-colors.scss')).toEqual(getTestScssTheme());
    });

    it('should generate themes when provided a primary color', async () => {
      const tree = await runM3ThemeSchematic(runner, {
        primaryColor: '#984061',
      });

      const generatedSCSS = tree.readText('_theme-colors.scss');
      const testSCSS = generateSCSSTheme(
        testM3ColorPalettes,
        'Color palettes are generated from primary: #984061',
      );

      expect(generatedSCSS).toBe(testSCSS);
    });

    it('should generate themes when provided primary and secondary colors', async () => {
      const tree = await runM3ThemeSchematic(runner, {
        primaryColor: '#984061',
        secondaryColor: '#984061',
      });

      const generatedSCSS = tree.readText('_theme-colors.scss');

      // Change test theme palette so that secondary is the same source color as
      // primary to match schematic inputs
      let testPalettes = testM3ColorPalettes;
      testPalettes.secondary = testPalettes.primary;

      const testSCSS = generateSCSSTheme(
        testPalettes,
        'Color palettes are generated from primary: #984061, secondary: #984061',
      );

      expect(generatedSCSS).toBe(testSCSS);
      expect(transpileTheme(generatedSCSS)).toBe(transpileTheme(testSCSS));
    });

    it('should generate themes when provided primary, secondary, and tertiary colors', async () => {
      const tree = await runM3ThemeSchematic(runner, {
        primaryColor: '#984061',
        secondaryColor: '#984061',
        tertiaryColor: '#984061',
      });

      const generatedSCSS = tree.readText('_theme-colors.scss');

      // Change test theme palette so that secondary and tertiary are the same
      // source color as primary to match schematic inputs
      let testPalettes = testM3ColorPalettes;
      testPalettes.secondary = testPalettes.primary;
      testPalettes.tertiary = testPalettes.primary;

      const testSCSS = generateSCSSTheme(
        testPalettes,
        'Color palettes are generated from primary: #984061, secondary: #984061, tertiary: #984061',
      );

      expect(generatedSCSS).toBe(testSCSS);
      expect(transpileTheme(generatedSCSS)).toBe(transpileTheme(testSCSS));
    });

    it('should generate themes when provided a primary, secondary, tertiary, and neutral colors', async () => {
      const tree = await runM3ThemeSchematic(runner, {
        primaryColor: '#984061',
        secondaryColor: '#984061',
        tertiaryColor: '#984061',
        neutralColor: '#984061',
      });

      const generatedSCSS = tree.readText('_theme-colors.scss');

      // Change test theme palette so that secondary, tertiary, and neutral are
      // the same source color as primary to match schematic inputs
      let testPalettes = testM3ColorPalettes;
      testPalettes.secondary = testPalettes.primary;
      testPalettes.tertiary = testPalettes.primary;
      testPalettes.neutral = testPalettes.primary;

      const testSCSS = generateSCSSTheme(
        testPalettes,
        'Color palettes are generated from primary: #984061, secondary: #984061, tertiary: #984061, neutral: #984061',
      );

      expect(generatedSCSS).toBe(testSCSS);
      expect(transpileTheme(generatedSCSS)).toBe(transpileTheme(testSCSS));
    });

    describe('and with high contrast overrides', () => {
      it('should be able to generate high contrast overrides mixin', async () => {
        const tree = await runM3ThemeSchematic(runner, {
          primaryColor: '#984061',
          includeHighContrast: true,
        });

        const generatedSCSS = tree.readText('_theme-colors.scss');

        expect(generatedSCSS).toContain(`@mixin high-contrast-overrides`);
      });

      it('should be able to generate high contrast themes overrides when provided a primary color', async () => {
        const tree = await runM3ThemeSchematic(runner, {
          primaryColor: '#984061',
          includeHighContrast: true,
        });

        const generatedCSS = transpileTheme(tree.readText('_theme-colors.scss'));

        // Check a system variable from each color palette for their high contrast light theme value
        expect(generatedCSS).toContain(`--mat-sys-primary: #580b2f`);
        expect(generatedCSS).toContain(`--mat-sys-secondary: #45212d`);
        expect(generatedCSS).toContain(`--mat-sys-tertiary: #4d1f00`);
        expect(generatedCSS).toContain(`--mat-sys-error: #600004`);
        expect(generatedCSS).toContain(`--mat-sys-surface: #fff8f8`);
        expect(generatedCSS).toContain(`--mat-sys-surface-variant: #f6dce2`);

        // Check a system variable from each color palette for their high contrast dark theme value
        expect(generatedCSS).toContain(`--mat-sys-primary: #ffebef`);
        expect(generatedCSS).toContain(`--mat-sys-secondary: #ffebef`);
        expect(generatedCSS).toContain(`--mat-sys-tertiary: #ffece4`);
        expect(generatedCSS).toContain(`--mat-sys-error: #ffece9`);
        expect(generatedCSS).toContain(`--mat-sys-surface: #191113`);
        expect(generatedCSS).toContain(`--mat-sys-surface-variant: #534247`);
      });

      it('should be able to generate high contrast themes overrides when provided a primary and secondary color', async () => {
        const tree = await runM3ThemeSchematic(runner, {
          primaryColor: '#984061',
          secondaryColor: '#984061',
          includeHighContrast: true,
        });

        const generatedCSS = transpileTheme(tree.readText('_theme-colors.scss'));

        // Check a system variable from each color palette for their high contrast light theme value
        expect(generatedCSS).toContain(`--mat-sys-primary: #580b2f`);
        expect(generatedCSS).toContain(`--mat-sys-secondary: #580b2f`);

        // Check a system variable from each color palette for their high contrast dark theme value
        expect(generatedCSS).toContain(`--mat-sys-primary: #ffebef`);
        expect(generatedCSS).toContain(`--mat-sys-secondary: #ffebef`);
      });

      it('should be able to generate high contrast themes overrides when provided primary, secondary, and tertiary color', async () => {
        const tree = await runM3ThemeSchematic(runner, {
          primaryColor: '#984061',
          secondaryColor: '#984061',
          tertiaryColor: '#984061',
          includeHighContrast: true,
        });

        const generatedCSS = transpileTheme(tree.readText('_theme-colors.scss'));

        // Check a system variable from each color palette for their high contrast light theme value
        expect(generatedCSS).toContain(`--mat-sys-primary: #580b2f`);
        expect(generatedCSS).toContain(`--mat-sys-secondary: #580b2f`);
        expect(generatedCSS).toContain(`--mat-sys-tertiary: #580b2f`);

        // Check a system variable from each color palette for their high contrast dark theme value
        expect(generatedCSS).toContain(`--mat-sys-primary: #ffebef`);
        expect(generatedCSS).toContain(`--mat-sys-secondary: #ffebef`);
        expect(generatedCSS).toContain(`--mat-sys-tertiary: #ffebef`);
      });

      it('should be able to generate high contrast themes overrides when provided primary, secondary, tertiary, and neutral color', async () => {
        const tree = await runM3ThemeSchematic(runner, {
          primaryColor: '#984061',
          secondaryColor: '#984061',
          tertiaryColor: '#984061',
          neutralColor: '#dfdfdf', // Different color since #984061 does not change the tonal palette
          includeHighContrast: true,
        });

        const generatedCSS = transpileTheme(tree.readText('_theme-colors.scss'));

        // Check a system variable from each color palette for their high contrast light theme value
        expect(generatedCSS).toContain(`--mat-sys-primary: #580b2f`);
        expect(generatedCSS).toContain(`--mat-sys-secondary: #580b2f`);
        expect(generatedCSS).toContain(`--mat-sys-tertiary: #580b2f`);
        expect(generatedCSS).toContain(`--mat-sys-surface-bright: #f9f9f9`);

        // Check a system variable from each color palette for their high contrast dark theme value
        expect(generatedCSS).toContain(`--mat-sys-primary: #ffebef`);
        expect(generatedCSS).toContain(`--mat-sys-secondary: #ffebef`);
        expect(generatedCSS).toContain(`--mat-sys-tertiary: #ffebef`);
        expect(generatedCSS).toContain(`--mat-sys-surface-bright: #4f5051`);
      });
    });
  });

  describe('with CSS output', async () => {
    it('should generate m3 theme CSS file', async () => {
      const tree = await runM3ThemeSchematic(runner, {
        primaryColor: '#984061',
        isScss: false,
      });
      expect(tree.exists('theme.css')).toBe(true);
    });

    it('should generate m3 theme CSS file at specified path', async () => {
      const tree = await runM3ThemeSchematic(runner, {
        primaryColor: '#984061',
        directory: 'projects/',
        isScss: false,
      });
      expect(tree.exists('projects/theme.css')).toBe(true);
    });

    it('should generate m3 theme CSS file with correct indentation and formatting', async () => {
      const tree = await runM3ThemeSchematic(runner, {
        primaryColor: '#984061',
        isScss: false,
        includeHighContrast: true,
      });

      expect(tree.readText('theme.css')).toEqual(getTestCssTheme());
    });

    it('should generate CSS system variables when provided a primary color', async () => {
      const tree = await runM3ThemeSchematic(runner, {
        primaryColor: '#984061',
        isScss: false,
      });

      const generatedCSS = tree.readText('theme.css');

      // Check a system variable from each color palette for their light dark value
      expect(generatedCSS).toContain(`--mat-sys-primary: light-dark(#984061, #ffb0c8)`);
      expect(generatedCSS).toContain(`--mat-sys-secondary: light-dark(#7e525f, #efb8c7)`);
      expect(generatedCSS).toContain(`--mat-sys-tertiary: light-dark(#974810, #ffb68e)`);
      expect(generatedCSS).toContain(`--mat-sys-error: light-dark(#ba1a1a, #ffb4ab)`);
      expect(generatedCSS).toContain(`--mat-sys-surface: light-dark(#fff8f8, #191113)`);
      expect(generatedCSS).toContain(`--mat-sys-surface-variant: light-dark(#f6dce2, #534247)`);
    });

    it('should generate CSS system variables when provided a primary and secondary colors', async () => {
      const tree = await runM3ThemeSchematic(runner, {
        primaryColor: '#984061',
        secondaryColor: '#984061',
        isScss: false,
      });

      const generatedCSS = tree.readText('theme.css');

      // Check a system variable from each color palette for their light dark value
      expect(generatedCSS).toContain(`--mat-sys-primary: light-dark(#984061, #ffb0c8)`);
      expect(generatedCSS).toContain(`--mat-sys-secondary: light-dark(#984061, #ffb0c8)`);
      expect(generatedCSS).toContain(`--mat-sys-tertiary: light-dark(#974810, #ffb68e)`);
      expect(generatedCSS).toContain(`--mat-sys-error: light-dark(#ba1a1a, #ffb4ab)`);
      expect(generatedCSS).toContain(`--mat-sys-surface: light-dark(#fff8f8, #191113)`);
      expect(generatedCSS).toContain(`--mat-sys-surface-variant: light-dark(#f6dce2, #534247)`);
    });

    it('should generate CSS system variables when provided a primary, secondary, and tertiary colors', async () => {
      const tree = await runM3ThemeSchematic(runner, {
        primaryColor: '#984061',
        secondaryColor: '#984061',
        tertiaryColor: '#984061',
        isScss: false,
      });

      const generatedCSS = tree.readText('theme.css');

      // Check a system variable from each color palette for their light dark value
      expect(generatedCSS).toContain(`--mat-sys-primary: light-dark(#984061, #ffb0c8)`);
      expect(generatedCSS).toContain(`--mat-sys-secondary: light-dark(#984061, #ffb0c8)`);
      expect(generatedCSS).toContain(`--mat-sys-tertiary: light-dark(#984061, #ffb0c8)`);
      expect(generatedCSS).toContain(`--mat-sys-error: light-dark(#ba1a1a, #ffb4ab)`);
      expect(generatedCSS).toContain(`--mat-sys-surface: light-dark(#fff8f8, #191113)`);
      expect(generatedCSS).toContain(`--mat-sys-surface-variant: light-dark(#f6dce2, #534247)`);
    });

    it('should generate CSS system variables when provided a primary, secondary, tertiary, and neutral colors', async () => {
      const tree = await runM3ThemeSchematic(runner, {
        primaryColor: '#984061',
        secondaryColor: '#984061',
        tertiaryColor: '#984061',
        neutralColor: '#984061',
        isScss: false,
      });

      const generatedCSS = tree.readText('theme.css');

      // Check a system variable from each color palette for their light dark value
      expect(generatedCSS).toContain(`--mat-sys-primary: light-dark(#984061, #ffb0c8)`);
      expect(generatedCSS).toContain(`--mat-sys-secondary: light-dark(#984061, #ffb0c8)`);
      expect(generatedCSS).toContain(`--mat-sys-tertiary: light-dark(#984061, #ffb0c8)`);
      expect(generatedCSS).toContain(`--mat-sys-error: light-dark(#ba1a1a, #ffb4ab)`);
      expect(generatedCSS).toContain(`--mat-sys-surface: light-dark(#fff8f8, #2f0015);`);
      expect(generatedCSS).toContain(`--mat-sys-surface-variant: light-dark(#f6dce2, #534247)`);
    });

    describe('and with high contrast overrides', () => {
      it('should generate high contrast system variables', async () => {
        const tree = await runM3ThemeSchematic(runner, {
          primaryColor: '#984061',
          isScss: false,
          includeHighContrast: true,
        });

        const generatedCSS = tree.readText('theme.css');
        expect(generatedCSS).toContain(`@media (prefers-contrast: more) {`);
      });

      it('should generate high contrast system variables when provided a primary color', async () => {
        const tree = await runM3ThemeSchematic(runner, {
          primaryColor: '#984061',
          isScss: false,
          includeHighContrast: true,
        });

        const generatedCSS = tree.readText('theme.css');

        // Check a system variable from each color palette for their high contrast light dark value
        expect(generatedCSS).toContain(`--mat-sys-primary: light-dark(#580b2f, #ffebef)`);
        expect(generatedCSS).toContain(`--mat-sys-secondary: light-dark(#45212d, #ffebef)`);
        expect(generatedCSS).toContain(`--mat-sys-tertiary: light-dark(#4d1f00, #ffece4)`);
        expect(generatedCSS).toContain(`--mat-sys-error: light-dark(#600004, #ffece9)`);
        expect(generatedCSS).toContain(`--mat-sys-surface: light-dark(#fff8f8, #191113)`);
        expect(generatedCSS).toContain(`--mat-sys-surface-variant: light-dark(#f6dce2, #534247)`);
      });

      it('should generate high contrast system variables when provided a primary and secondary color', async () => {
        const tree = await runM3ThemeSchematic(runner, {
          primaryColor: '#984061',
          secondaryColor: '#984061',
          isScss: false,
          includeHighContrast: true,
        });

        const generatedCSS = tree.readText('theme.css');

        // Check a system variable from each color palette for their high contrast light dark value
        expect(generatedCSS).toContain(`--mat-sys-primary: light-dark(#580b2f, #ffebef)`);
        expect(generatedCSS).toContain(`--mat-sys-secondary: light-dark(#580b2f, #ffebef)`);
      });

      it('should generate high contrast system variables when provided primary, secondary, and tertiary color', async () => {
        const tree = await runM3ThemeSchematic(runner, {
          primaryColor: '#984061',
          secondaryColor: '#984061',
          tertiaryColor: '#984061',
          isScss: false,
          includeHighContrast: true,
        });

        const generatedCSS = tree.readText('theme.css');

        // Check a system variable from each color palette for their high contrast light dark value
        expect(generatedCSS).toContain(`--mat-sys-primary: light-dark(#580b2f, #ffebef)`);
        expect(generatedCSS).toContain(`--mat-sys-secondary: light-dark(#580b2f, #ffebef)`);
        expect(generatedCSS).toContain(`--mat-sys-tertiary: light-dark(#580b2f, #ffebef)`);
      });

      it('should generate high contrast system variables when provided primary, secondary, tertiary, and neutral color', async () => {
        const tree = await runM3ThemeSchematic(runner, {
          primaryColor: '#984061',
          secondaryColor: '#984061',
          tertiaryColor: '#984061',
          neutralColor: '#dfdfdf', // Different color since #984061 does not change the tonal palette
          isScss: false,
          includeHighContrast: true,
        });

        const generatedCSS = tree.readText('theme.css');

        // Check a system variable from each color palette for their high contrast light dark value
        expect(generatedCSS).toContain(`--mat-sys-primary: light-dark(#580b2f, #ffebef)`);
        expect(generatedCSS).toContain(`--mat-sys-secondary: light-dark(#580b2f, #ffebef)`);
        expect(generatedCSS).toContain(`--mat-sys-tertiary: light-dark(#580b2f, #ffebef)`);
        expect(generatedCSS).toContain(`--mat-sys-surface-bright: light-dark(#f9f9f9, #4f5051)`);
      });
    });
  });
});

function getTestScssTheme(): string {
  return `// This file was generated by running 'ng generate @angular/material:theme-color'.
// Proceed with caution if making changes to this file.

@use 'sass:map';
@use '@angular/material' as mat;

// Note: Color palettes are generated from primary: #984061
$_palettes: (
  primary: (
    0: #000000,
    10: #3e001d,
    20: #5e1133,
    25: #6c1d3e,
    30: #7b2949,
    35: #893455,
    40: #984061,
    50: #b6587a,
    60: #d57194,
    70: #f48bae,
    80: #ffb0c8,
    90: #ffd9e2,
    95: #ffecf0,
    98: #fff8f8,
    99: #fffbff,
    100: #ffffff,
  ),
  secondary: (
    0: #000000,
    10: #31101d,
    20: #4a2531,
    25: #56303c,
    30: #633b48,
    35: #704653,
    40: #7e525f,
    50: #996a78,
    60: #b58392,
    70: #d29dac,
    80: #efb8c7,
    90: #ffd9e2,
    95: #ffecf0,
    98: #fff8f8,
    99: #fffbff,
    100: #ffffff,
  ),
  tertiary: (
    0: #000000,
    10: #331200,
    20: #532200,
    25: #642a00,
    30: #763300,
    35: #883d03,
    40: #974810,
    50: #b66028,
    60: #d6783e,
    70: #f69256,
    80: #ffb68e,
    90: #ffdbc9,
    95: #ffede5,
    98: #fff8f6,
    99: #fffbff,
    100: #ffffff,
  ),
  neutral: (
    0: #000000,
    10: #22191c,
    20: #372e30,
    25: #43393b,
    30: #4f4446,
    35: #5b5052,
    40: #675b5e,
    50: #807477,
    60: #9b8d90,
    70: #b6a8aa,
    80: #d2c3c5,
    90: #efdfe1,
    95: #fdedef,
    98: #fff8f8,
    99: #fffbff,
    100: #ffffff,
    4: #140c0e,
    6: #191113,
    12: #261d20,
    17: #31282a,
    22: #3c3235,
    24: #413739,
    87: #e6d6d9,
    92: #f5e4e7,
    94: #faeaed,
    96: #fff0f2,
  ),
  neutral-variant: (
    0: #000000,
    10: #25181c,
    20: #3c2c31,
    25: #47373b,
    30: #534247,
    35: #604e52,
    40: #6c5a5e,
    50: #867277,
    60: #a18b90,
    70: #bca5ab,
    80: #d9c0c6,
    90: #f6dce2,
    95: #ffecf0,
    98: #fff8f8,
    99: #fffbff,
    100: #ffffff,
  ),
  error: (
    0: #000000,
    10: #410002,
    20: #690005,
    25: #7e0007,
    30: #93000a,
    35: #a80710,
    40: #ba1a1a,
    50: #de3730,
    60: #ff5449,
    70: #ff897d,
    80: #ffb4ab,
    90: #ffdad6,
    95: #ffedea,
    98: #fff8f7,
    99: #fffbff,
    100: #ffffff,
  ),
);

$_rest: (
  secondary: map.get($_palettes, secondary),
  neutral: map.get($_palettes, neutral),
  neutral-variant: map.get($_palettes,  neutral-variant),
  error: map.get($_palettes, error),
);

$primary-palette: map.merge(map.get($_palettes, primary), $_rest);
$tertiary-palette: map.merge(map.get($_palettes, tertiary), $_rest);`;
}

function getTestCssTheme(): string {
  return `/* Note: Color palettes are generated from primary: #984061 */
html {
  /* COLOR SYSTEM VARIABLES */
  color-scheme: light;

  /* Primary palette variables */
  --mat-sys-primary: light-dark(#984061, #ffb0c8);
  --mat-sys-on-primary: light-dark(#ffffff, #5e1133);
  --mat-sys-primary-container: light-dark(#ffd9e2, #7b2949);
  --mat-sys-on-primary-container: light-dark(#3e001d, #ffd9e2);
  --mat-sys-inverse-primary: light-dark(#ffb0c8, #984061);
  --mat-sys-primary-fixed: light-dark(#ffd9e2, #ffd9e2);
  --mat-sys-primary-fixed-dim: light-dark(#ffb0c8, #ffb0c8);
  --mat-sys-on-primary-fixed: light-dark(#3e001d, #3e001d);
  --mat-sys-on-primary-fixed-variant: light-dark(#7b2949, #7b2949);

  /* Secondary palette variables */
  --mat-sys-secondary: light-dark(#7e525f, #efb8c7);
  --mat-sys-on-secondary: light-dark(#ffffff, #4a2531);
  --mat-sys-secondary-container: light-dark(#ffd9e2, #633b48);
  --mat-sys-on-secondary-container: light-dark(#31101d, #ffd9e2);
  --mat-sys-secondary-fixed: light-dark(#ffd9e2, #ffd9e2);
  --mat-sys-secondary-fixed-dim: light-dark(#efb8c7, #efb8c7);
  --mat-sys-on-secondary-fixed: light-dark(#31101d, #31101d);
  --mat-sys-on-secondary-fixed-variant: light-dark(#633b48, #633b48);

  /* Tertiary palette variables */
  --mat-sys-tertiary: light-dark(#974810, #ffb68e);
  --mat-sys-on-tertiary: light-dark(#ffffff, #532200);
  --mat-sys-tertiary-container: light-dark(#ffdbc9, #763300);
  --mat-sys-on-tertiary-container: light-dark(#331200, #ffdbc9);
  --mat-sys-tertiary-fixed: light-dark(#ffdbc9, #ffdbc9);
  --mat-sys-tertiary-fixed-dim: light-dark(#ffb68e, #ffb68e);
  --mat-sys-on-tertiary-fixed: light-dark(#331200, #331200);
  --mat-sys-on-tertiary-fixed-variant: light-dark(#763300, #763300);

  /* Neutral palette variables */
  --mat-sys-background: light-dark(#fff8f8, #191113);
  --mat-sys-on-background: light-dark(#22191c, #efdfe1);
  --mat-sys-surface: light-dark(#fff8f8, #191113);
  --mat-sys-surface-dim: light-dark(#e6d6d9, #191113);
  --mat-sys-surface-bright: light-dark(#fff8f8, #413739);
  --mat-sys-surface-container-lowest: light-dark(#ffffff, #140c0e);
  --mat-sys-surface-container: light-dark(#faeaed, #261d20);
  --mat-sys-surface-container-high: light-dark(#f5e4e7, #31282a);
  --mat-sys-surface-container-highest: light-dark(#efdfe1, #3c3235);
  --mat-sys-on-surface: light-dark(#22191c, #efdfe1);
  --mat-sys-shadow: light-dark(#000000, #000000);
  --mat-sys-scrim: light-dark(#000000, #000000);
  --mat-sys-surface-tint: light-dark(#984061, #ffb0c8);
  --mat-sys-inverse-surface: light-dark(#372e30, #efdfe1);
  --mat-sys-inverse-on-surface: light-dark(#fdedef, #372e30);
  --mat-sys-outline: light-dark(#867277, #a18b90);
  --mat-sys-outline-variant: light-dark(#d9c0c6, #534247);
  --mat-sys-neutral10: light-dark(#22191c, #22191c); /* Variable used for the form field native select option text color */

  /* Error palette variables */
  --mat-sys-error: light-dark(#ba1a1a, #ffb4ab);
  --mat-sys-on-error: light-dark(#ffffff, #690005);
  --mat-sys-error-container: light-dark(#ffdad6, #93000a);
  --mat-sys-on-error-container: light-dark(#410002, #ffdad6);

  /* Neutral variant palette variables */
  --mat-sys-surface-variant: light-dark(#f6dce2, #534247);
  --mat-sys-on-surface-variant: light-dark(#534247, #d9c0c6);
  --mat-sys-neutral-variant20: light-dark(#3c2c31, #3c2c31); /* Variable used for the sidenav scrim (container background shadow when opened) */

  /* TYPOGRAPHY SYSTEM VARIABLES */

  /* Typography variables. Only used in the different typescale system variables. */
  --mat-sys-brand-font-family: Roboto; /* The font-family to use for brand text. */
  --mat-sys-plain-font-family: Roboto; /* The font-family to use for plain text. */
  --mat-sys-bold-font-weight: 700; /* The font-weight to use for bold text. */
  --mat-sys-medium-font-weight: 500; /* The font-weight to use for medium text. */
  --mat-sys-regular-font-weight: 400; /* The font-weight to use for regular text. */

  /* Typescale variables. */
  /* Warning: Risk of reduced fidelity from using the composite typography tokens (ex. --mat-sys-body-large) since
     tracking cannot be represented in the "font" property shorthand. Consider using the discrete properties instead. */
  --mat-sys-body-large: var(--mat-sys-body-large-weight) var(--mat-sys-body-large-size) / var(--mat-sys-body-large-line-height) var(--mat-sys-body-large-font);
  --mat-sys-body-large-font: var(--mat-sys-plain-font-family);
  --mat-sys-body-large-line-height: 1.5rem;
  --mat-sys-body-large-size: 1rem;
  --mat-sys-body-large-tracking: 0.031rem;
  --mat-sys-body-large-weight: var(--mat-sys-regular-font-weight);

  /* Body medium typescale */
  --mat-sys-body-medium: var(--mat-sys-body-medium-weight) var(--mat-sys-body-medium-size) / var(--mat-sys-body-medium-line-height) var(--mat-sys-body-medium-font);
  --mat-sys-body-medium-font: var(--mat-sys-plain-font-family);
  --mat-sys-body-medium-line-height: 1.25rem;
  --mat-sys-body-medium-size: 0.875rem;
  --mat-sys-body-medium-tracking: 0.016rem;
  --mat-sys-body-medium-weight: var(--mat-sys-regular-font-weight);

  /* Body small typescale */
  --mat-sys-body-small: var(--mat-sys-body-small-weight) var(--mat-sys-body-small-size) / var(--mat-sys-body-small-line-height) var(--mat-sys-body-small-font);
  --mat-sys-body-small-font: var(--mat-sys-plain-font-family);
  --mat-sys-body-small-line-height: 1rem;
  --mat-sys-body-small-size: 0.75rem;
  --mat-sys-body-small-tracking: 0.025rem;
  --mat-sys-body-small-weight: var(--mat-sys-regular-font-weight);

  /* Display large typescale */
  --mat-sys-display-large: var(--mat-sys-display-large-weight) var(--mat-sys-display-large-size) / var(--mat-sys-display-large-line-height) var(--mat-sys-display-large-font);
  --mat-sys-display-large-font: var(--mat-sys-brand-font-family);
  --mat-sys-display-large-line-height: 4rem;
  --mat-sys-display-large-size: 3.562rem;
  --mat-sys-display-large-tracking: -0.016rem;
  --mat-sys-display-large-weight: var(--mat-sys-regular-font-weight);

  /* Display medium typescale */
  --mat-sys-display-medium: var(--mat-sys-display-medium-weight) var(--mat-sys-display-medium-size) / var(--mat-sys-display-medium-line-height) var(--mat-sys-display-medium-font);
  --mat-sys-display-medium-font: var(--mat-sys-brand-font-family);
  --mat-sys-display-medium-line-height: 3.25rem;
  --mat-sys-display-medium-size: 2.812rem;
  --mat-sys-display-medium-tracking: 0;
  --mat-sys-display-medium-weight: var(--mat-sys-regular-font-weight);

  /* Display small typescale */
  --mat-sys-display-small: var(--mat-sys-display-small-weight) var(--mat-sys-display-small-size) / var(--mat-sys-display-small-line-height) var(--mat-sys-display-small-font);
  --mat-sys-display-small-font: var(--mat-sys-brand-font-family);
  --mat-sys-display-small-line-height: 2.75rem;
  --mat-sys-display-small-size: 2.25rem;
  --mat-sys-display-small-tracking: 0;
  --mat-sys-display-small-weight: var(--mat-sys-regular-font-weight);

  /* Headline large typescale */
  --mat-sys-headline-large: var(--mat-sys-headline-large-weight) var(--mat-sys-headline-large-size) / var(--mat-sys-headline-large-line-height) var(--mat-sys-headline-large-font);
  --mat-sys-headline-large-font: var(--mat-sys-brand-font-family);
  --mat-sys-headline-large-line-height: 2.5rem;
  --mat-sys-headline-large-size: 2rem;
  --mat-sys-headline-large-tracking: 0;
  --mat-sys-headline-large-weight: var(--mat-sys-regular-font-weight);

  /* Headline medium typescale */
  --mat-sys-headline-medium: var(--mat-sys-headline-medium-weight) var(--mat-sys-headline-medium-size) / var(--mat-sys-headline-medium-line-height) var(--mat-sys-headline-medium-font);
  --mat-sys-headline-medium-font: var(--mat-sys-brand-font-family);
  --mat-sys-headline-medium-line-height: 2.25rem;
  --mat-sys-headline-medium-size: 1.75rem;
  --mat-sys-headline-medium-tracking: 0;
  --mat-sys-headline-medium-weight: var(--mat-sys-regular-font-weight);

  /* Headline small typescale */
  --mat-sys-headline-small: var(--mat-sys-headline-small-weight) var(--mat-sys-headline-small-size) / var(--mat-sys-headline-small-line-height) var(--mat-sys-headline-small-font);
  --mat-sys-headline-small-font: var(--mat-sys-brand-font-family);
  --mat-sys-headline-small-line-height: 2rem;
  --mat-sys-headline-small-size: 1.5rem;
  --mat-sys-headline-small-tracking: 0;
  --mat-sys-headline-small-weight: var(--mat-sys-regular-font-weight);

  /* Label large typescale */
  --mat-sys-label-large: var(--mat-sys-label-large-weight) var(--mat-sys-label-large-size) / var(--mat-sys-label-large-line-height) var(--mat-sys-label-large-font);
  --mat-sys-label-large-font: var(--mat-sys-plain-font-family);
  --mat-sys-label-large-line-height: 1.25rem;
  --mat-sys-label-large-size: 0.875rem;
  --mat-sys-label-large-tracking: 0.006rem;
  --mat-sys-label-large-weight: var(--mat-sys-medium-font-weight);
  --mat-sys-label-large-weight-prominent: var(--mat-sys-bold-font-weight);

  /* Label medium typescale */
  --mat-sys-label-medium: var(--mat-sys-label-medium-weight) var(--mat-sys-label-medium-size) / var(--mat-sys-label-medium-line-height) var(--mat-sys-label-medium-font);
  --mat-sys-label-medium-font: var(--mat-sys-plain-font-family);
  --mat-sys-label-medium-line-height: 1rem;
  --mat-sys-label-medium-size: 0.75rem;
  --mat-sys-label-medium-tracking: 0.031rem;
  --mat-sys-label-medium-weight: var(--mat-sys-medium-font-weight);
  --mat-sys-label-medium-weight-prominent: var(--mat-sys-bold-font-weight);

  /* Label small typescale */
  --mat-sys-label-small: var(--mat-sys-label-small-weight) var(--mat-sys-label-small-size) / var(--mat-sys-label-small-line-height) var(--mat-sys-label-small-font);
  --mat-sys-label-small-font: var(--mat-sys-plain-font-family);
  --mat-sys-label-small-line-height: 1rem;
  --mat-sys-label-small-size: 0.688rem;
  --mat-sys-label-small-tracking: 0.031rem;
  --mat-sys-label-small-weight: var(--mat-sys-medium-font-weight);

  /* Title large typescale */
  --mat-sys-title-large: var(--mat-sys-title-large-weight) var(--mat-sys-title-large-size) / var(--mat-sys-title-large-line-height) var(--mat-sys-title-large-font);
  --mat-sys-title-large-font: var(--mat-sys-brand-font-family);
  --mat-sys-title-large-line-height: 1.75rem;
  --mat-sys-title-large-size: 1.375rem;
  --mat-sys-title-large-tracking: 0;
  --mat-sys-title-large-weight: var(--mat-sys-regular-font-weight);

  /* Title medium typescale */
  --mat-sys-title-medium: var(--mat-sys-title-medium-weight) var(--mat-sys-title-medium-size) / var(--mat-sys-title-medium-line-height) var(--mat-sys-title-medium-font);
  --mat-sys-title-medium-font: var(--mat-sys-plain-font-family);
  --mat-sys-title-medium-line-height: 1.5rem;
  --mat-sys-title-medium-size: 1rem;
  --mat-sys-title-medium-tracking: 0.009rem;
  --mat-sys-title-medium-weight: var(--mat-sys-medium-font-weight);

  /* Title small typescale */
  --mat-sys-title-small: var(--mat-sys-title-small-weight) var(--mat-sys-title-small-size) / var(--mat-sys-title-small-line-height) var(--mat-sys-title-small-font);
  --mat-sys-title-small-font: var(--mat-sys-plain-font-family);
  --mat-sys-title-small-line-height: 1.25rem;
  --mat-sys-title-small-size: 0.875rem;
  --mat-sys-title-small-tracking: 0.006rem;
  --mat-sys-title-small-weight: var(--mat-sys-medium-font-weight);

  /* ELEVATION SYSTEM VARIABLES */

  /* Box shadow colors. Only used in the elevation level system variables. */
  --mat-sys-umbra-color: color-mix(in srgb, var(--mat-sys-shadow), transparent 80%);
  --mat-sys-penumbra-color: color-mix(in srgb, var(--mat-sys-shadow), transparent 86%);
  --mat-sys-ambient-color: color-mix(in srgb, var(--mat-sys-shadow), transparent 88%);

  /* Elevation level system variables. These are used as the value for box-shadow CSS property. */
  --mat-sys-level0: 0px 0px 0px 0px var(--mat-sys-umbra-color), 0px 0px 0px 0px var(--mat-sys-penumbra-color), 0px 0px 0px 0px var(--mat-sys-ambient-color);
  --mat-sys-level1: 0px 2px 1px -1px var(--mat-sys-umbra-color), 0px 1px 1px 0px var(--mat-sys-penumbra-color), 0px 1px 3px 0px var(--mat-sys-ambient-color);
  --mat-sys-level2: 0px 3px 3px -2px var(--mat-sys-umbra-color), 0px 3px 4px 0px var(--mat-sys-penumbra-color), 0px 1px 8px 0px var(--mat-sys-ambient-color);
  --mat-sys-level3: 0px 3px 5px -1px var(--mat-sys-umbra-color), 0px 6px 10px 0px var(--mat-sys-penumbra-color), 0px 1px 18px 0px var(--mat-sys-ambient-color);
  --mat-sys-level4: 0px 5px 5px -3px var(--mat-sys-umbra-color), 0px 8px 10px 1px var(--mat-sys-penumbra-color), 0px 3px 14px 2px var(--mat-sys-ambient-color);
  --mat-sys-level5: 0px 7px 8px -4px var(--mat-sys-umbra-color), 0px 12px 17px 2px var(--mat-sys-penumbra-color), 0px 5px 22px 4px var(--mat-sys-ambient-color);

  /* SHAPE SYSTEM VARIABLES */
  --mat-sys-corner-extra-large: 28px;
  --mat-sys-corner-extra-large-top: 28px 28px 0 0;
  --mat-sys-corner-extra-small: 4px;
  --mat-sys-corner-extra-small-top: 4px 4px 0 0;
  --mat-sys-corner-full: 9999px;
  --mat-sys-corner-large: 16px;
  --mat-sys-corner-large-end: 0 16px 16px 0;
  --mat-sys-corner-large-start: 16px 0 0 16px;
  --mat-sys-corner-large-top: 16px 16px 0 0;
  --mat-sys-corner-medium: 12px;
  --mat-sys-corner-none: 0;
  --mat-sys-corner-small: 8px;

  /* STATE SYSTEM VARIABLES */
  --mat-sys-dragged-state-layer-opacity: 0.16;
  --mat-sys-focus-state-layer-opacity: 0.12;
  --mat-sys-hover-state-layer-opacity: 0.08;
  --mat-sys-pressed-state-layer-opacity: 0.12;

  @media (prefers-contrast: more) {
    /* Primary palette variables */
    --mat-sys-primary: light-dark(#580b2f, #ffebef);
    --mat-sys-on-primary: light-dark(#ffffff, #000000);
    --mat-sys-primary-container: light-dark(#7e2b4c, #ffabc5);
    --mat-sys-on-primary-container: light-dark(#ffffff, #20000c);
    --mat-sys-inverse-primary: light-dark(#ffb0c8, #7c2a4b);
    --mat-sys-primary-fixed: light-dark(#7e2b4c, #ffd9e2);
    --mat-sys-primary-fixed-dim: light-dark(#611335, #ffb0c8);
    --mat-sys-on-primary-fixed: light-dark(#ffffff, #000000);
    --mat-sys-on-primary-fixed-variant: light-dark(#ffffff, #2b0013);

    /* Secondary palette variables */
    --mat-sys-secondary: light-dark(#45212d, #ffebef);
    --mat-sys-on-secondary: light-dark(#ffffff, #000000);
    --mat-sys-secondary-container: light-dark(#663d4a, #ebb4c3);
    --mat-sys-on-secondary-container: light-dark(#ffffff, #1d020c);
    --mat-sys-secondary-fixed: light-dark(#663d4a, #ffd9e2);
    --mat-sys-secondary-fixed-dim: light-dark(#4c2734, #efb8c7);
    --mat-sys-on-secondary-fixed: light-dark(#ffffff, #000000);
    --mat-sys-on-secondary-fixed-variant: light-dark(#ffffff, #240612);

    /* Tertiary palette variables */
    --mat-sys-tertiary: light-dark(#4d1f00, #ffece4);
    --mat-sys-on-tertiary: light-dark(#4d1f00, #ffece4);
    --mat-sys-tertiary-container: light-dark(#7a3500, #ffb184);
    --mat-sys-on-tertiary-container: light-dark(#ffffff, #190600);
    --mat-sys-tertiary-fixed: light-dark(#7a3500, #ffdbc9);
    --mat-sys-tertiary-fixed-dim: light-dark(#572400, #ffb68e);
    --mat-sys-on-tertiary-fixed: light-dark(#ffffff, #000000);
    --mat-sys-on-tertiary-fixed-variant: light-dark(#ffffff, #220a00);

    /* Neutral palette variables */
    --mat-sys-background: light-dark(#fff8f8, #191113);
    --mat-sys-on-background: light-dark(#22191c, #efdfe1);
    --mat-sys-surface: light-dark(#fff8f8, #191113);
    --mat-sys-surface-dim: light-dark(#c4b5b8, #191113);
    --mat-sys-surface-bright: light-dark(#fff8f8, #584d50);
    --mat-sys-surface-container-lowest: light-dark(#ffffff, #000000);
    --mat-sys-surface-container: light-dark(#efdfe1, #372e30);
    --mat-sys-surface-container-high: light-dark(#e0d1d3, #43393b);
    --mat-sys-surface-container-highest: light-dark(#d2c3c5, #4f4446);
    --mat-sys-on-surface: light-dark(#000000, #ffffff);
    --mat-sys-shadow: light-dark(#000000, #000000);
    --mat-sys-scrim: light-dark(#000000, #000000);
    --mat-sys-surface-tint: light-dark(#984061, #ffb0c8);
    --mat-sys-inverse-surface: light-dark(#372e30, #efdfe1);
    --mat-sys-inverse-on-surface: light-dark(#ffffff, #000000);
    --mat-sys-outline: light-dark(#37282c, #ffebef);
    --mat-sys-outline-variant: light-dark(#564549, #d5bdc2);
    --mat-sys-neutral10: light-dark(#22191c, #22191c); /* Variable used for the form field native select option text color */

    /* Error palette variables */
    --mat-sys-error: light-dark(#600004, #ffece9);
    --mat-sys-on-error: light-dark(#ffffff, #000000);
    --mat-sys-error-container: light-dark(#98000a, #ffaea4);
    --mat-sys-on-error-container: light-dark(#ffffff, #220001);

    /* Neutral variant palette variables */
    --mat-sys-surface-variant: light-dark(#f6dce2, #534247);
    --mat-sys-on-surface-variant: light-dark(#000000, #ffffff);
    --mat-sys-neutral-variant20: light-dark(#3c2c31, #3c2c31); /* Variable used for the sidenav scrim (container background shadow when opened) */
  }
}
`;
}

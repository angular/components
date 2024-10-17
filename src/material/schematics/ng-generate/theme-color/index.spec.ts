import {SchematicTestRunner, UnitTestTree} from '@angular-devkit/schematics/testing';
import {createTestApp} from '@angular/cdk/schematics/testing';

import {runfiles} from '@bazel/runfiles';
import {compileString} from 'sass';
import * as path from 'path';
import {createLocalAngularPackageImporter} from '../../../../../tools/sass/local-sass-importer';
import {generateSCSSTheme} from './index';
import {Schema} from './schema';

// Note: For Windows compatibility, we need to resolve the directory paths through runfiles
// which are guaranteed to reside in the source tree.
const testDir = runfiles.resolvePackageRelative('../theme-color');
const packagesDir = path.join(runfiles.resolveWorkspaceRelative('src/cdk/_index.scss'), '../..');
const localPackageSassImporter = createLocalAngularPackageImporter(packagesDir);

describe('material-theme-color-schematic', () => {
  let runner: SchematicTestRunner;
  let testM3ThemePalette: Map<string, Map<number, string>>;

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

          @if mixin-exists(high-contrast-light-theme-overrides) {
            & {
              @include high-contrast-light-theme-overrides();
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

            @if mixin-exists(high-contrast-dark-theme-overrides) {
              & {
                @include high-contrast-dark-theme-overrides();
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

  async function runM3ThemeSchematic(
    runner: SchematicTestRunner,
    options: Schema,
  ): Promise<UnitTestTree> {
    const app = await createTestApp(runner, {standalone: true});
    return runner.runSchematic('theme-color', options, app);
  }

  beforeEach(() => {
    testM3ThemePalette = getPaletteMap();
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

  it('should generate m3 theme file', async () => {
    const tree = await runM3ThemeSchematic(runner, {
      primaryColor: '#984061',
    });
    expect(tree.exists('_theme-colors.scss')).toBe(true);
  });

  it('should generate m3 theme file at specified path', async () => {
    const tree = await runM3ThemeSchematic(runner, {
      primaryColor: '#984061',
      directory: 'projects/',
    });
    expect(tree.exists('projects/_theme-colors.scss')).toBe(true);
  });

  it('should generate m3 theme file with correct indentation and formatting', async () => {
    const tree = await runM3ThemeSchematic(runner, {
      primaryColor: '#984061',
    });
    expect(tree.readText('_theme-colors.scss')).toEqual(getTestTheme());
  });

  it('should generate themes when provided a primary color', async () => {
    const tree = await runM3ThemeSchematic(runner, {
      primaryColor: '#984061',
    });

    const generatedSCSS = tree.readText('_theme-colors.scss');
    const testSCSS = generateSCSSTheme(
      testM3ThemePalette,
      'Color palettes are generated from primary: #984061',
    );

    expect(generatedSCSS).toBe(testSCSS);
    expect(transpileTheme(generatedSCSS)).toBe(transpileTheme(testSCSS));
  });

  it('should generate themes when provided primary and secondary colors', async () => {
    const tree = await runM3ThemeSchematic(runner, {
      primaryColor: '#984061',
      secondaryColor: '#984061',
    });

    const generatedSCSS = tree.readText('_theme-colors.scss');

    // Change test theme palette so that secondary is the same source color as
    // primary to match schematic inputs
    let testPalette = testM3ThemePalette;
    testPalette.set('secondary', testM3ThemePalette.get('primary')!);

    const testSCSS = generateSCSSTheme(
      testPalette,
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
    let testPalette = testM3ThemePalette;
    testPalette.set('secondary', testM3ThemePalette.get('primary')!);
    testPalette.set('tertiary', testM3ThemePalette.get('primary')!);

    const testSCSS = generateSCSSTheme(
      testPalette,
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
    let testPalette = testM3ThemePalette;
    testPalette.set('secondary', testM3ThemePalette.get('primary')!);
    testPalette.set('tertiary', testM3ThemePalette.get('primary')!);

    // Neutral's tonal palette has additional tones as opposed to the other color palettes.
    let neutralPalette = new Map(testM3ThemePalette.get('primary')!);
    neutralPalette.set(4, '#26000f');
    neutralPalette.set(6, '#2f0015');
    neutralPalette.set(12, '#460022');
    neutralPalette.set(17, '#55082c');
    neutralPalette.set(22, '#631637');
    neutralPalette.set(24, '#691a3c');
    neutralPalette.set(87, '#ffcdda');
    neutralPalette.set(92, '#ffe1e8');
    neutralPalette.set(94, '#ffe8ed');
    neutralPalette.set(96, '#fff0f2');
    testPalette.set('neutral', neutralPalette);

    const testSCSS = generateSCSSTheme(
      testPalette,
      'Color palettes are generated from primary: #984061, secondary: #984061, tertiary: #984061, neutral: #984061',
    );

    expect(generatedSCSS).toBe(testSCSS);
    expect(transpileTheme(generatedSCSS)).toBe(transpileTheme(testSCSS));
  });

  it('should be able to generate high contrast theme mixins', async () => {
    const tree = await runM3ThemeSchematic(runner, {
      primaryColor: '#984061',
      includeHighContrast: true,
    });

    const generatedSCSS = tree.readText('_theme-colors.scss');

    expect(generatedSCSS).toContain(`@mixin high-contrast-light-theme-overrides`);
    expect(generatedSCSS).toContain(`@mixin high-contrast-dark-theme-overrides`);
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
    expect(generatedCSS).toContain(`--mat-sys-outline: #37282c`);

    // Check a system variable from each color palette for their high contrast dark theme value
    expect(generatedCSS).toContain(`--mat-sys-primary: #ffebef`);
    expect(generatedCSS).toContain(`--mat-sys-secondary: #ffebef`);
    expect(generatedCSS).toContain(`--mat-sys-tertiary: #ffece4`);
    expect(generatedCSS).toContain(`--mat-sys-error: #ffece9`);
    expect(generatedCSS).toContain(`--mat-sys-surface: #191113`);
    expect(generatedCSS).toContain(`--mat-sys-outline: #ffebef`);
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

function getTestTheme() {
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

function getPaletteMap() {
  // Hue maps created from https://m3.material.io/theme-builder#/custom (using
  // #984061 as source color). Not using predefined M3 palettes since some neutral
  // hues are slightly off from generated theme.
  return new Map([
    [
      'primary',
      new Map<number, string>([
        [0, '#000000'],
        [10, '#3e001d'],
        [20, '#5e1133'],
        [25, '#6c1d3e'],
        [30, '#7b2949'],
        [35, '#893455'],
        [40, '#984061'],
        [50, '#b6587a'],
        [60, '#d57194'],
        [70, '#f48bae'],
        [80, '#ffb0c8'],
        [90, '#ffd9e2'],
        [95, '#ffecf0'],
        [98, '#fff8f8'],
        [99, '#fffbff'],
        [100, '#ffffff'],
      ]),
    ],
    [
      'secondary',
      new Map<number, string>([
        [0, '#000000'],
        [10, '#31101d'],
        [20, '#4a2531'],
        [25, '#56303c'],
        [30, '#633b48'],
        [35, '#704653'],
        [40, '#7e525f'],
        [50, '#996a78'],
        [60, '#b58392'],
        [70, '#d29dac'],
        [80, '#efb8c7'],
        [90, '#ffd9e2'],
        [95, '#ffecf0'],
        [98, '#fff8f8'],
        [99, '#fffbff'],
        [100, '#ffffff'],
      ]),
    ],
    [
      'tertiary',
      new Map<number, string>([
        [0, '#000000'],
        [10, '#331200'],
        [20, '#532200'],
        [25, '#642a00'],
        [30, '#763300'],
        [35, '#883d03'],
        [40, '#974810'],
        [50, '#b66028'],
        [60, '#d6783e'],
        [70, '#f69256'],
        [80, '#ffb68e'],
        [90, '#ffdbc9'],
        [95, '#ffede5'],
        [98, '#fff8f6'],
        [99, '#fffbff'],
        [100, '#ffffff'],
      ]),
    ],
    [
      'neutral',
      new Map<number, string>([
        [0, '#000000'],
        [10, '#22191c'],
        [20, '#372e30'],
        [25, '#43393b'],
        [30, '#4f4446'],
        [35, '#5b5052'],
        [40, '#675b5e'],
        [50, '#807477'],
        [60, '#9b8d90'],
        [70, '#b6a8aa'],
        [80, '#d2c3c5'],
        [90, '#efdfe1'],
        [95, '#fdedef'],
        [98, '#fff8f8'],
        [99, '#fffbff'],
        [100, '#ffffff'],
        [4, '#140c0e'],
        [6, '#191113'],
        [12, '#261d20'],
        [17, '#31282a'],
        [22, '#3c3235'],
        [24, '#413739'],
        [87, '#e6d6d9'],
        [92, '#f5e4e7'],
        [94, '#faeaed'],
        [96, '#fff0f2'],
      ]),
    ],
    [
      'neutral-variant',
      new Map<number, string>([
        [0, '#000000'],
        [10, '#25181c'],
        [20, '#3c2c31'],
        [25, '#47373b'],
        [30, '#534247'],
        [35, '#604e52'],
        [40, '#6c5a5e'],
        [50, '#867277'],
        [60, '#a18b90'],
        [70, '#bca5ab'],
        [80, '#d9c0c6'],
        [90, '#f6dce2'],
        [95, '#ffecf0'],
        [98, '#fff8f8'],
        [99, '#fffbff'],
        [100, '#ffffff'],
      ]),
    ],
    [
      'error',
      new Map<number, string>([
        [0, '#000000'],
        [10, '#410002'],
        [20, '#690005'],
        [25, '#7e0007'],
        [30, '#93000a'],
        [35, '#a80710'],
        [40, '#ba1a1a'],
        [50, '#de3730'],
        [60, '#ff5449'],
        [70, '#ff897d'],
        [80, '#ffb4ab'],
        [90, '#ffdad6'],
        [95, '#ffedea'],
        [98, '#fff8f7'],
        [99, '#fffbff'],
        [100, '#ffffff'],
      ]),
    ],
  ]);
}

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
const testDir = runfiles.resolvePackageRelative('../m3-theme');
const packagesDir = path.join(runfiles.resolveWorkspaceRelative('src/cdk/_index.scss'), '../..');
const localPackageSassImporter = createLocalAngularPackageImporter(packagesDir);

describe('material-m3-theme-schematic', () => {
  let runner: SchematicTestRunner;
  let testM3ThemePalette: Map<string, Map<number, string>>;

  /** Transpiles given Sass content into CSS. */
  function transpileTheme(content: string): string {
    return compileString(
      `
        ${content}

        @mixin _theme($theme) {
          @include mat.all-component-colors($theme);
          @include mat.system-level-colors($theme);
          @include mat.system-level-typography($theme);
        }

        html {
          @if variable-exists(light-theme) {
            @include _theme($light-theme);
          }
          @if variable-exists(dark-theme) {
            @include _theme($dark-theme);
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
    return runner.runSchematic('m3-theme', options, app);
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
        themeTypes: 'light',
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
      themeTypes: 'light',
    });
    expect(tree.exists('m3-theme.scss')).toBe(true);
  });

  it('should generate m3 theme file at specified path', async () => {
    const tree = await runM3ThemeSchematic(runner, {
      primaryColor: '#984061',
      themeTypes: 'light',
      directory: 'projects/',
    });
    expect(tree.exists('projects/m3-theme.scss')).toBe(true);
  });

  it('should generate m3 theme file with correct indentation and formatting', async () => {
    const tree = await runM3ThemeSchematic(runner, {
      primaryColor: '#984061',
      themeTypes: 'both',
    });
    expect(tree.readText('m3-theme.scss')).toEqual(getTestTheme());
  });

  it('should generate light theme when provided a primary color', async () => {
    const tree = await runM3ThemeSchematic(runner, {
      primaryColor: '#984061',
      themeTypes: 'light',
    });

    const generatedSCSS = tree.readText('m3-theme.scss');
    const testSCSS = generateSCSSTheme(
      testM3ThemePalette,
      'light',
      'Color palettes are generated from primary: #984061',
      false,
    );

    expect(generatedSCSS).toBe(testSCSS);
  });

  it('should generate dark theme when provided a primary color', async () => {
    const tree = await runM3ThemeSchematic(runner, {
      primaryColor: '#984061',
      themeTypes: 'dark',
    });

    const generatedSCSS = tree.readText('m3-theme.scss');
    const testSCSS = generateSCSSTheme(
      testM3ThemePalette,
      'dark',
      'Color palettes are generated from primary: #984061',
      false,
    );

    expect(generatedSCSS).toBe(testSCSS);
    expect(transpileTheme(generatedSCSS)).toBe(transpileTheme(testSCSS));
  });

  it('should generate light and dark theme when provided a primary color', async () => {
    const tree = await runM3ThemeSchematic(runner, {
      primaryColor: '#984061',
      themeTypes: 'both',
    });

    const generatedSCSS = tree.readText('m3-theme.scss');
    const testSCSS = generateSCSSTheme(
      testM3ThemePalette,
      'both',
      'Color palettes are generated from primary: #984061',
      false,
    );

    expect(generatedSCSS).toBe(testSCSS);
    expect(transpileTheme(generatedSCSS)).toBe(transpileTheme(testSCSS));
  });

  it('should generate themes when provided primary and secondary colors', async () => {
    const tree = await runM3ThemeSchematic(runner, {
      primaryColor: '#984061',
      secondaryColor: '#984061',
      themeTypes: 'both',
    });

    const generatedSCSS = tree.readText('m3-theme.scss');

    // Change test theme palette so that secondary is the same source color as
    // primary to match schematic inputs
    let testPalette = testM3ThemePalette;
    testPalette.set('secondary', testM3ThemePalette.get('primary')!);

    const testSCSS = generateSCSSTheme(
      testPalette,
      'both',
      'Color palettes are generated from primary: #984061, secondary: #984061',
      false,
    );

    expect(generatedSCSS).toBe(testSCSS);
    expect(transpileTheme(generatedSCSS)).toBe(transpileTheme(testSCSS));
  });

  it('should generate themes when provided primary, secondary, and tertiary colors', async () => {
    const tree = await runM3ThemeSchematic(runner, {
      primaryColor: '#984061',
      secondaryColor: '#984061',
      tertiaryColor: '#984061',
      themeTypes: 'both',
    });

    const generatedSCSS = tree.readText('m3-theme.scss');

    // Change test theme palette so that secondary and tertiary are the same
    // source color as primary to match schematic inputs
    let testPalette = testM3ThemePalette;
    testPalette.set('secondary', testM3ThemePalette.get('primary')!);
    testPalette.set('tertiary', testM3ThemePalette.get('primary')!);

    const testSCSS = generateSCSSTheme(
      testPalette,
      'both',
      'Color palettes are generated from primary: #984061, secondary: #984061, tertiary: #984061',
      false,
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
      themeTypes: 'both',
    });

    const generatedSCSS = tree.readText('m3-theme.scss');

    // Change test theme palette so that secondary, tertiary, and neutral are
    // the same source color as primary to match schematic inputs
    let testPalette = testM3ThemePalette;
    testPalette.set('secondary', testM3ThemePalette.get('primary')!);
    testPalette.set('tertiary', testM3ThemePalette.get('primary')!);
    testPalette.set('neutral', testM3ThemePalette.get('primary')!);

    const testSCSS = generateSCSSTheme(
      testPalette,
      'both',
      'Color palettes are generated from primary: #984061, secondary: #984061, tertiary: #984061, neutral: #984061',
      false,
    );

    expect(generatedSCSS).toBe(testSCSS);
    expect(transpileTheme(generatedSCSS)).toBe(transpileTheme(testSCSS));
  });

  it('should be able to generate a theme using system variables', async () => {
    const primaryColor = '#984061';
    const tree = await runM3ThemeSchematic(runner, {
      primaryColor,
      themeTypes: 'light',
      useSystemVariables: true,
    });

    const generatedSCSS = tree.readText('m3-theme.scss');
    const generatedCSS = transpileTheme(generatedSCSS);

    expect(generatedSCSS).toContain(
      [
        `  color: (`,
        `    theme-type: light,`,
        `    primary: $_primary,`,
        `    tertiary: $_tertiary,`,
        `    use-system-variables: true,`,
        `  ),`,
        `  typography: (`,
        `    use-system-variables: true,`,
        `  ),`,
      ].join('\n'),
    );

    expect(generatedCSS).toContain(`--sys-primary: ${primaryColor}`);
    expect(generatedCSS).toContain('var(--sys-primary)');
  });

  it('should estimate missing neutral hues', async () => {
    const tree = await runM3ThemeSchematic(runner, {
      primaryColor: '#232e62',
      secondaryColor: '#cc862a',
      tertiaryColor: '#44263e',
      neutralColor: '#929093',
      themeTypes: 'light',
    });

    expect(tree.readContent('m3-theme.scss')).toContain(
      [
        `  neutral: (`,
        `    0: #000000,`,
        `    4: #0b0b0c,`,
        `    6: #111012,`,
        `    10: #1c1b1e,`,
        `    12: #201f22,`,
        `    17: #2b2a2d,`,
        `    20: #313033,`,
        `    22: #353437,`,
        `    24: #3a393c,`,
        `    25: #3c3b3e,`,
        `    30: #474649,`,
        `    35: #535255,`,
        `    40: #5f5e61,`,
        `    50: #787679,`,
        `    60: #929093,`,
        `    70: #adaaad,`,
        `    80: #c8c5c9,`,
        `    87: #dcd9dd,`,
        `    90: #e5e1e5,`,
        `    92: #ebe7eb,`,
        `    94: #f0edf0,`,
        `    95: #f3f0f3,`,
        `    96: #f6f3f6,`,
        `    98: #fcf8fb,`,
        `    99: #fffbfe,`,
        `    100: #ffffff,`,
        `  ),`,
      ].join('\n'),
    );
  });
});

function getTestTheme() {
  return `// This file was generated by running 'ng generate @angular/material:m3-theme'.
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
$_primary: map.merge(map.get($_palettes, primary), $_rest);
$_tertiary: map.merge(map.get($_palettes, tertiary), $_rest);

$light-theme: mat.define-theme((
  color: (
    theme-type: light,
    primary: $_primary,
    tertiary: $_tertiary,
  ),
));
$dark-theme: mat.define-theme((
  color: (
    theme-type: dark,
    primary: $_primary,
    tertiary: $_tertiary,
  ),
));`;
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

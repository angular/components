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
    expect(transpileTheme(generatedSCSS)).toBe(transpileTheme(testSCSS));
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
        `    4: #000527,`,
        `    6: #00073a,`,
        `    10: #000c61,`,
        `    12: #051166,`,
        `    17: #121e71,`,
        `    20: #1a2678,`,
        `    22: #1f2b7d,`,
        `    24: #243082,`,
        `    25: #273384,`,
        `    30: #333f90,`,
        `    35: #404b9c,`,
        `    40: #4c57a9,`,
        `    50: #6570c4,`,
        `    60: #7f8ae0,`,
        `    70: #9aa5fd,`,
        `    80: #bcc2ff,`,
        `    87: #d5d7ff,`,
        `    90: #dfe0ff,`,
        `    92: #e6e6ff,`,
        `    94: #edecff,`,
        `    95: #f0efff,`,
        `    96: #f4f2ff,`,
        `    98: #fbf8ff,`,
        `    99: #fffbff,`,
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
    10: #2b151c,
    20: #422931,
    25: #4e343c,
    30: #5a3f47,
    35: #674b53,
    40: #74565f,
    50: #8e6f77,
    60: #aa8891,
    70: #c6a2ab,
    80: #e2bdc6,
    90: #ffd9e2,
    95: #ffecf0,
    98: #fff8f8,
    99: #fffbff,
    100: #ffffff,
  ),
  tertiary: (
    0: #000000,
    10: #2e1500,
    20: #48290c,
    25: #543416,
    30: #623f20,
    35: #6f4a2a,
    40: #7c5635,
    50: #986e4b,
    60: #b48862,
    70: #d1a27b,
    80: #efbd94,
    90: #ffdcc2,
    95: #ffeee2,
    98: #fff8f5,
    99: #fffbff,
    100: #ffffff,
  ),
  neutral: (
    0: #000000,
    10: #201a1b,
    20: #352f30,
    25: #413a3b,
    30: #4c4546,
    35: #585052,
    40: #645c5e,
    50: #7e7576,
    60: #988e90,
    70: #b3a9aa,
    80: #cfc4c5,
    90: #ebe0e1,
    95: #faeeef,
    98: #fff8f8,
    99: #fffbff,
    100: #ffffff,
    4: #120d0e,
    6: #171213,
    12: #241e1f,
    17: #2f282a,
    22: #3a3334,
    24: #3e3739,
    87: #e3d7d9,
    92: #f1e5e7,
    94: #f7ebec,
    96: #fdf1f2,
  ),
  neutral-variant: (
    0: #000000,
    10: #24191c,
    20: #3a2d30,
    25: #45383b,
    30: #514347,
    35: #5d4f52,
    40: #6a5b5e,
    50: #837377,
    60: #9e8c90,
    70: #b9a7ab,
    80: #d5c2c6,
    90: #f2dde2,
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
        [10, '#2b151c'],
        [20, '#422931'],
        [25, '#4e343c'],
        [30, '#5a3f47'],
        [35, '#674b53'],
        [40, '#74565f'],
        [50, '#8e6f77'],
        [60, '#aa8891'],
        [70, '#c6a2ab'],
        [80, '#e2bdc6'],
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
        [10, '#2e1500'],
        [20, '#48290c'],
        [25, '#543416'],
        [30, '#623f20'],
        [35, '#6f4a2a'],
        [40, '#7c5635'],
        [50, '#986e4b'],
        [60, '#b48862'],
        [70, '#d1a27b'],
        [80, '#efbd94'],
        [90, '#ffdcc2'],
        [95, '#ffeee2'],
        [98, '#fff8f5'],
        [99, '#fffbff'],
        [100, '#ffffff'],
      ]),
    ],
    [
      'neutral',
      new Map<number, string>([
        [0, '#000000'],
        [10, '#201a1b'],
        [20, '#352f30'],
        [25, '#413a3b'],
        [30, '#4c4546'],
        [35, '#585052'],
        [40, '#645c5e'],
        [50, '#7e7576'],
        [60, '#988e90'],
        [70, '#b3a9aa'],
        [80, '#cfc4c5'],
        [90, '#ebe0e1'],
        [95, '#faeeef'],
        [98, '#fff8f8'],
        [99, '#fffbff'],
        [100, '#ffffff'],
        [4, '#120d0e'],
        [6, '#171213'],
        [12, '#241e1f'],
        [17, '#2f282a'],
        [22, '#3a3334'],
        [24, '#3e3739'],
        [87, '#e3d7d9'],
        [92, '#f1e5e7'],
        [94, '#f7ebec'],
        [96, '#fdf1f2'],
      ]),
    ],
    [
      'neutral-variant',
      new Map<number, string>([
        [0, '#000000'],
        [10, '#24191c'],
        [20, '#3a2d30'],
        [25, '#45383b'],
        [30, '#514347'],
        [35, '#5d4f52'],
        [40, '#6a5b5e'],
        [50, '#837377'],
        [60, '#9e8c90'],
        [70, '#b9a7ab'],
        [80, '#d5c2c6'],
        [90, '#f2dde2'],
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

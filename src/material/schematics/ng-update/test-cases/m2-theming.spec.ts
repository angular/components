import {createTestCaseSetup} from '@angular/cdk/schematics/testing';
import {MIGRATION_PATH} from '../../paths';

describe('M2 theming migration', () => {
  async function setup(originalSource: string): Promise<string> {
    const themePath = 'projects/cdk-testing/theme.scss';
    const {runFixers, writeFile, appTree} = await createTestCaseSetup(
      'migration-v18',
      MIGRATION_PATH,
      [],
    );

    writeFile(themePath, originalSource);
    await runFixers();
    return appTree.readContent(themePath);
  }

  it('should migrate usages of the M2 theming APIs', async () => {
    const result = await setup(
      [
        `@use '@angular/material' as mat;`,

        `$my-primary: mat.define-palette(mat.$indigo-palette, 500);`,
        `$my-accent: mat.define-palette(mat.$pink-palette, A200, A100, A400);`,
        `$my-warn: mat.define-palette(mat.$red-palette);`,

        `$my-theme: mat.define-light-theme((`,
        `  color: (`,
        `    primary: $my-primary,`,
        `    accent: $my-accent,`,
        `    warn: $my-warn,`,
        `  ),`,
        `  typography: mat.define-typography-config(),`,
        `  density: 0,`,
        `));`,
        `@include mat.all-component-themes($my-theme);`,
      ].join('\n'),
    );

    expect(result.split('\n')).toEqual([
      `@use '@angular/material' as mat;`,

      `$my-primary: mat.m2-define-palette(mat.$m2-indigo-palette, 500);`,
      `$my-accent: mat.m2-define-palette(mat.$m2-pink-palette, A200, A100, A400);`,
      `$my-warn: mat.m2-define-palette(mat.$m2-red-palette);`,

      `$my-theme: mat.m2-define-light-theme((`,
      `  color: (`,
      `    primary: $my-primary,`,
      `    accent: $my-accent,`,
      `    warn: $my-warn,`,
      `  ),`,
      `  typography: mat.m2-define-typography-config(),`,
      `  density: 0,`,
      `));`,
      `@include mat.all-component-themes($my-theme);`,
    ]);
  });

  it('should migrate usages of the M2 theming APIs with double quotes', async () => {
    const result = await setup(
      [
        `@use "@angular/material" as mat;`,

        `$my-primary: mat.define-palette(mat.$indigo-palette, 500);`,
        `$my-accent: mat.define-palette(mat.$pink-palette, A200, A100, A400);`,
        `$my-warn: mat.define-palette(mat.$red-palette);`,

        `$my-theme: mat.define-light-theme((`,
        `  color: (`,
        `    primary: $my-primary,`,
        `    accent: $my-accent,`,
        `    warn: $my-warn,`,
        `  ),`,
        `  typography: mat.define-typography-config(),`,
        `  density: 0,`,
        `));`,
        `@include mat.all-component-themes($my-theme);`,
      ].join('\n'),
    );

    expect(result.split('\n')).toEqual([
      `@use "@angular/material" as mat;`,

      `$my-primary: mat.m2-define-palette(mat.$m2-indigo-palette, 500);`,
      `$my-accent: mat.m2-define-palette(mat.$m2-pink-palette, A200, A100, A400);`,
      `$my-warn: mat.m2-define-palette(mat.$m2-red-palette);`,

      `$my-theme: mat.m2-define-light-theme((`,
      `  color: (`,
      `    primary: $my-primary,`,
      `    accent: $my-accent,`,
      `    warn: $my-warn,`,
      `  ),`,
      `  typography: mat.m2-define-typography-config(),`,
      `  density: 0,`,
      `));`,
      `@include mat.all-component-themes($my-theme);`,
    ]);
  });

  it('should migrate a file that imports Material under multiple namespaces', async () => {
    const result = await setup(
      [
        `@use '@angular/material' as mat;`,
        `@use '@angular/material' as other;`,

        `$my-primary: mat.define-palette(mat.$indigo-palette, 500);`,
        `$my-accent: other.define-palette(mat.$pink-palette, A200, A100, A400);`,
        `$my-warn: mat.define-palette(other.$red-palette);`,

        `$my-theme: mat.define-light-theme((`,
        `  color: (`,
        `    primary: $my-primary,`,
        `    accent: $my-accent,`,
        `    warn: $my-warn,`,
        `  ),`,
        `  typography: other.define-typography-config(),`,
        `  density: 0,`,
        `));`,
        `@include other.all-component-themes($my-theme);`,
      ].join('\n'),
    );

    expect(result.split('\n')).toEqual([
      `@use '@angular/material' as mat;`,
      `@use '@angular/material' as other;`,

      `$my-primary: mat.m2-define-palette(mat.$m2-indigo-palette, 500);`,
      `$my-accent: other.m2-define-palette(mat.$m2-pink-palette, A200, A100, A400);`,
      `$my-warn: mat.m2-define-palette(other.$m2-red-palette);`,

      `$my-theme: mat.m2-define-light-theme((`,
      `  color: (`,
      `    primary: $my-primary,`,
      `    accent: $my-accent,`,
      `    warn: $my-warn,`,
      `  ),`,
      `  typography: other.m2-define-typography-config(),`,
      `  density: 0,`,
      `));`,
      `@include other.all-component-themes($my-theme);`,
    ]);
  });

  it('should handle variables with overlapping names', async () => {
    const result = await setup(
      [
        `@use '@angular/material' as mat;`,

        `$my-primary: mat.define-palette(mat.$deep-orange-palette);`,
        `$my-accent: mat.define-palette(mat.$orange-palette);`,

        `$my-theme: mat.define-light-theme((`,
        `  color: (`,
        `    primary: $my-primary,`,
        `    accent: $my-accent,`,
        `  )`,
        `));`,
        `@include mat.all-component-themes($my-theme);`,
      ].join('\n'),
    );

    expect(result.split('\n')).toEqual([
      `@use '@angular/material' as mat;`,

      `$my-primary: mat.m2-define-palette(mat.$m2-deep-orange-palette);`,
      `$my-accent: mat.m2-define-palette(mat.$m2-orange-palette);`,

      `$my-theme: mat.m2-define-light-theme((`,
      `  color: (`,
      `    primary: $my-primary,`,
      `    accent: $my-accent,`,
      `  )`,
      `));`,
      `@include mat.all-component-themes($my-theme);`,
    ]);
  });

  it('should not change comments', async () => {
    const result = await setup(
      [
        `@use '@angular/material' as mat;`,

        `// Define using mat.define-palette() because of reasons.`,
        `$my-primary: mat.define-palette(mat.$deep-orange-palette);`,
      ].join('\n'),
    );

    expect(result.split('\n')).toEqual([
      `@use '@angular/material' as mat;`,

      `// Define using mat.define-palette() because of reasons.`,
      `$my-primary: mat.m2-define-palette(mat.$m2-deep-orange-palette);`,
    ]);
  });

  it('should migrate usages of the experimental M3 theming APIs', async () => {
    const result = await setup(
      [
        `@use '@angular/material' as mat;`,
        `@use '@angular/material-experimental' as matx;`,

        `$theme: matx.define-theme((`,
        `  color: (`,
        `    theme-type: dark,`,
        `    primary: matx.$m3-violet-palette,`,
        `    tertiary: matx.$m3-red-palette,`,
        `  ),`,
        `  typography: (`,
        `    brand-family: 'Roboto',`,
        `    bold-weight: 900`,
        `  ),`,
        `  density: (`,
        `    scale: -1`,
        `  )`,
        `));`,

        `html {`,
        `  @include mat.all-component-themes($my-theme);`,
        `}`,
        `@include matx.color-variants-back-compat($theme);`,
      ].join('\n'),
    );

    expect(result.split('\n')).toEqual([
      `@use '@angular/material' as mat;`,
      `@use '@angular/material-experimental' as matx;`,

      `$theme: mat.define-theme((`,
      `  color: (`,
      `    theme-type: dark,`,
      `    primary: mat.$violet-palette,`,
      `    tertiary: mat.$red-palette,`,
      `  ),`,
      `  typography: (`,
      `    brand-family: 'Roboto',`,
      `    bold-weight: 900`,
      `  ),`,
      `  density: (`,
      `    scale: -1`,
      `  )`,
      `));`,

      `html {`,
      `  @include mat.all-component-themes($my-theme);`,
      `}`,
      `@include mat.color-variants-backwards-compatibility($theme);`,
    ]);
  });

  it('should migrate usages of M3 APIs in a file that does not import Material', async () => {
    const result = await setup(
      [
        `@use '@angular/material-experimental' as matx;`,

        `$theme: matx.define-theme((`,
        `  color: (`,
        `    theme-type: dark,`,
        `    primary: matx.$m3-violet-palette,`,
        `    tertiary: matx.$m3-red-palette,`,
        `  ),`,
        `  typography: (`,
        `    brand-family: 'Roboto',`,
        `    bold-weight: 900`,
        `  ),`,
        `  density: (`,
        `    scale: -1`,
        `  )`,
        `));`,

        `@include matx.color-variants-back-compat($theme);`,
      ].join('\n'),
    );

    expect(result.split('\n')).toEqual([
      `@use '@angular/material' as mat;`,
      `@use '@angular/material-experimental' as matx;`,

      `$theme: mat.define-theme((`,
      `  color: (`,
      `    theme-type: dark,`,
      `    primary: mat.$violet-palette,`,
      `    tertiary: mat.$red-palette,`,
      `  ),`,
      `  typography: (`,
      `    brand-family: 'Roboto',`,
      `    bold-weight: 900`,
      `  ),`,
      `  density: (`,
      `    scale: -1`,
      `  )`,
      `));`,

      `@include mat.color-variants-backwards-compatibility($theme);`,
    ]);
  });

  it('should not insert a Material import if no experimental APIs are migrated', async () => {
    const result = await setup(
      [
        `@use '@angular/material-experimental' as matx;`,
        `@include matx.something-not-theming-related();`,
      ].join('\n'),
    );

    expect(result.split('\n')).toEqual([
      `@use '@angular/material-experimental' as matx;`,
      `@include matx.something-not-theming-related();`,
    ]);
  });

  it('should migrate usages of the M2 theming APIs in a file with CRLF endings', async () => {
    const result = await setup(
      [
        `@use '@angular/material' as mat;`,

        `$my-primary: mat.define-palette(mat.$indigo-palette, 500);`,
        `$my-accent: mat.define-palette(mat.$pink-palette, A200, A100, A400);`,
        `$my-warn: mat.define-palette(mat.$red-palette);`,

        `$my-theme: mat.define-light-theme((`,
        `  color: (`,
        `    primary: $my-primary,`,
        `    accent: $my-accent,`,
        `    warn: $my-warn,`,
        `  ),`,
        `  typography: mat.define-typography-config(),`,
        `  density: 0,`,
        `));`,
        `@include mat.all-component-themes($my-theme);`,
      ].join('\r\n'),
    );

    expect(result.split('\r\n')).toEqual([
      `@use '@angular/material' as mat;`,

      `$my-primary: mat.m2-define-palette(mat.$m2-indigo-palette, 500);`,
      `$my-accent: mat.m2-define-palette(mat.$m2-pink-palette, A200, A100, A400);`,
      `$my-warn: mat.m2-define-palette(mat.$m2-red-palette);`,

      `$my-theme: mat.m2-define-light-theme((`,
      `  color: (`,
      `    primary: $my-primary,`,
      `    accent: $my-accent,`,
      `    warn: $my-warn,`,
      `  ),`,
      `  typography: mat.m2-define-typography-config(),`,
      `  density: 0,`,
      `));`,
      `@include mat.all-component-themes($my-theme);`,
    ]);
  });
});

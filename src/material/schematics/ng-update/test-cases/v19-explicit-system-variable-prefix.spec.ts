import {UnitTestTree} from '@angular-devkit/schematics/testing';
import {createTestCaseSetup} from '@angular/cdk/schematics/testing';
import {MIGRATION_PATH} from '../../paths';

const THEME_FILE_PATH = '/projects/cdk-testing/src/theme.scss';

describe('v19 explicit system variable prefix migration', () => {
  let tree: UnitTestTree;
  let writeFile: (filename: string, content: string) => void;
  let runMigration: () => Promise<unknown>;

  function stripWhitespace(content: string): string {
    return content.replace(/\s/g, '');
  }

  beforeEach(async () => {
    const testSetup = await createTestCaseSetup('migration-v19', MIGRATION_PATH, []);
    tree = testSetup.appTree;
    writeFile = testSetup.writeFile;
    runMigration = testSetup.runFixers;
  });

  it('should add an explicit system variables prefix', async () => {
    writeFile(
      THEME_FILE_PATH,
      `
        @use '@angular/material' as mat;

        $theme: mat.define-theme((
          color: (
            theme-type: 'light',
            primary: mat.$azure-palette,
            tertiary: mat.$red-palette,
            use-system-variables: true
          ),
          typography: (
            use-system-variables: true
          ),
          density: (
            scale: -1
          ),
        ));

        @include mat.all-component-themes($theme);
      `,
    );

    await runMigration();

    expect(stripWhitespace(tree.readText(THEME_FILE_PATH))).toBe(
      stripWhitespace(`
        @use '@angular/material' as mat;

        $theme: mat.define-theme((
          color: (
            theme-type: 'light',
            primary: mat.$azure-palette,
            tertiary: mat.$red-palette,
            use-system-variables: true,
            system-variables-prefix: sys,
          ),
          typography: (
            use-system-variables: true,
            system-variables-prefix: sys,
          ),
          density: (
            scale: -1
          ),
        ));

        @include mat.all-component-themes($theme);
    `),
    );
  });

  it('should add an explicit system variables prefix if the value is using trailing commas', async () => {
    writeFile(
      THEME_FILE_PATH,
      `
        @use '@angular/material' as mat;

        $theme: mat.define-theme((
          color: (
            theme-type: 'light',
            primary: mat.$azure-palette,
            tertiary: mat.$red-palette,
            use-system-variables: true,
          ),
          typography: (
            use-system-variables: true,
          ),
          density: (
            scale: -1
          ),
        ));

        @include mat.all-component-themes($theme);
      `,
    );

    await runMigration();

    expect(stripWhitespace(tree.readText(THEME_FILE_PATH))).toBe(
      stripWhitespace(`
        @use '@angular/material' as mat;

        $theme: mat.define-theme((
          color: (
            theme-type: 'light',
            primary: mat.$azure-palette,
            tertiary: mat.$red-palette,
            use-system-variables: true,
            system-variables-prefix: sys,
          ),
          typography: (
            use-system-variables: true,
            system-variables-prefix: sys,
          ),
          density: (
            scale: -1
          ),
        ));

        @include mat.all-component-themes($theme);
    `),
    );
  });

  it('should not add an explicit system variables prefix if the map has one already', async () => {
    writeFile(
      THEME_FILE_PATH,
      `
        @use '@angular/material' as mat;

        $theme: mat.define-theme((
          color: (
            theme-type: 'light',
            primary: mat.$azure-palette,
            tertiary: mat.$red-palette,
            use-system-variables: true
          ),
          typography: (
            use-system-variables: true,
            system-variables-prefix: foo
          ),
          density: (
            scale: -1
          ),
        ));

        @include mat.all-component-themes($theme);
      `,
    );

    await runMigration();

    expect(stripWhitespace(tree.readText(THEME_FILE_PATH))).toBe(
      stripWhitespace(`
        @use '@angular/material' as mat;

        $theme: mat.define-theme((
          color: (
            theme-type: 'light',
            primary: mat.$azure-palette,
            tertiary: mat.$red-palette,
            use-system-variables: true,
            system-variables-prefix: sys,
          ),
          typography: (
            use-system-variables: true,
            system-variables-prefix: foo
          ),
          density: (
            scale: -1
          ),
        ));

        @include mat.all-component-themes($theme);
    `),
    );
  });

  it('should handle a single-line map', async () => {
    writeFile(
      THEME_FILE_PATH,
      `
        @use '@angular/material' as mat;

        $theme: mat.define-theme((
          color: (theme-type: 'light', primary: mat.$azure-palette, use-system-variables: true),
          typography: (use-system-variables: true),
          density: (scale: -1),
        ));

        @include mat.all-component-themes($theme);
      `,
    );

    await runMigration();

    expect(stripWhitespace(tree.readText(THEME_FILE_PATH))).toBe(
      stripWhitespace(`
        @use '@angular/material' as mat;

        $theme: mat.define-theme((
          color: (theme-type: 'light', primary: mat.$azure-palette, use-system-variables: true, system-variables-prefix: sys,),
          typography: (use-system-variables: true, system-variables-prefix: sys,),
          density: (scale: -1),
        ));

        @include mat.all-component-themes($theme);
    `),
    );
  });
});

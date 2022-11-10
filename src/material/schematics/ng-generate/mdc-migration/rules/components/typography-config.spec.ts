import {createTestApp, patchDevkitTreeToExposeTypeScript} from '@angular/cdk/schematics/testing';
import {SchematicTestRunner, UnitTestTree} from '@angular-devkit/schematics/testing';
import {createNewTestRunner, migrateComponents, THEME_FILE} from './test-setup-helper';

describe('typography migrations', () => {
  let runner: SchematicTestRunner;
  let cliAppTree: UnitTestTree;

  async function runMigrationTest(file: string, oldFileContent: string, newFileContent: string) {
    cliAppTree.create(file, oldFileContent);
    const tree = await migrateComponents([], runner, cliAppTree);
    expect(tree.readContent(file)).toBe(newFileContent);
  }

  beforeEach(async () => {
    runner = createNewTestRunner();
    cliAppTree = patchDevkitTreeToExposeTypeScript(await createTestApp(runner));
  });

  it('should migrate an empty typography config call', async () => {
    await runMigrationTest(
      THEME_FILE,
      `
      @use '@angular/material' as mat;

      $sample-project-theme: mat.define-light-theme((
        color: (
          primary: $sample-project-primary,
          accent: $sample-project-accent,
          warn: $sample-project-warn,
        ),
        typography: mat.define-legacy-typography-config(),
      ));
    `,
      `
      @use '@angular/material' as mat;

      $sample-project-theme: mat.define-light-theme((
        color: (
          primary: $sample-project-primary,
          accent: $sample-project-accent,
          warn: $sample-project-warn,
        ),
        typography: mat.define-typography-config(),
      ));
    `,
    );
  });

  it('should migrate a typography config with positional arguments', async () => {
    await runMigrationTest(
      THEME_FILE,
      `
      @use '@angular/material' as mat;

      $sample-project-theme: mat.define-light-theme((
        color: (
          primary: $sample-project-primary,
          accent: $sample-project-accent,
          warn: $sample-project-warn,
        ),
        typography: mat.define-legacy-typography-config($font-family, $display-4, $display-3),
      ));
      `,
      `
      @use '@angular/material' as mat;

      $sample-project-theme: mat.define-light-theme((
        color: (
          primary: $sample-project-primary,
          accent: $sample-project-accent,
          warn: $sample-project-warn,
        ),
        typography: mat.define-typography-config($font-family, $display-4, $display-3),
      ));
      `,
    );
  });

  it('should migrate a typography config with named arguments', async () => {
    await runMigrationTest(
      THEME_FILE,
      `
        @use '@angular/material' as mat;

        $sample-project-theme: mat.define-light-theme((
          color: (
            primary: $sample-project-primary,
            accent: $sample-project-accent,
            warn: $sample-project-warn,
          ),
          typography: mat.define-legacy-typography-config(
            $font-family: $font-family,
            $display-4: $display-4,
            $display-3: $display-3,
            $display-2: $display-2,
            $display-1: $display-1,
            $headline: $headline,
            $title: $title,
            $subheading-2: $subheading-2,
            $subheading-1: $subheading-1,
            $body-2: $body-2,
            $body-1: $body-1,
            $caption: $caption,
            $button: $button,
          ),
        ));
      `,
      `
        @use '@angular/material' as mat;

        $sample-project-theme: mat.define-light-theme((
          color: (
            primary: $sample-project-primary,
            accent: $sample-project-accent,
            warn: $sample-project-warn,
          ),
          typography: mat.define-typography-config(
            $font-family: $font-family,
            $headline-1: $display-4,
            $headline-2: $display-3,
            $headline-3: $display-2,
            $headline-4: $display-1,
            $headline-5: $headline,
            $headline-6: $title,
            $subtitle-1: $subheading-2,
            $body-1: $subheading-1,
            $subtitle-2: $body-2,
            $body-2: $body-1,
            $caption: $caption,
            $button: $button,
          ),
        ));
      `,
    );
  });

  it('should migrate multiple typography configs with named arguments within the same file', async () => {
    await runMigrationTest(
      THEME_FILE,
      `
        @use '@angular/material' as mat;

        $sample-project-theme: mat.define-light-theme((
          color: (
            primary: $sample-project-primary,
            accent: $sample-project-accent,
            warn: $sample-project-warn,
          ),
          typography: mat.define-legacy-typography-config(
            $display-4: $display-4,
            $title: $title,
          ),
        ));

        $other-sample-project-theme: mat.define-light-theme((
          color: (
            primary: $sample-project-primary,
            accent: $sample-project-accent,
            warn: $sample-project-warn,
          ),
          typography: mat.define-legacy-typography-config(
            $display-2: $display-2,
            $subheading-2: $subheading-2,
          ),
        ));
      `,
      `
        @use '@angular/material' as mat;

        $sample-project-theme: mat.define-light-theme((
          color: (
            primary: $sample-project-primary,
            accent: $sample-project-accent,
            warn: $sample-project-warn,
          ),
          typography: mat.define-typography-config(
            $headline-1: $display-4,
            $headline-6: $title,
          ),
        ));

        $other-sample-project-theme: mat.define-light-theme((
          color: (
            primary: $sample-project-primary,
            accent: $sample-project-accent,
            warn: $sample-project-warn,
          ),
          typography: mat.define-typography-config(
            $headline-3: $display-2,
            $subtitle-1: $subheading-2,
          ),
        ));
      `,
    );
  });

  it('should migrate a typography config with a mixture of positional and named arguments', async () => {
    await runMigrationTest(
      THEME_FILE,
      `
      @use '@angular/material' as mat;

      $sample-project-theme: mat.define-light-theme((
        color: (
          primary: $sample-project-primary,
          accent: $sample-project-accent,
          warn: $sample-project-warn,
        ),
        typography: mat.define-legacy-typography-config($font-family, $display-4: $custom-display-4, $display-3),
      ));
      `,
      `
      @use '@angular/material' as mat;

      $sample-project-theme: mat.define-light-theme((
        color: (
          primary: $sample-project-primary,
          accent: $sample-project-accent,
          warn: $sample-project-warn,
        ),
        typography: mat.define-typography-config($font-family, $headline-1: $custom-display-4, $display-3),
      ));
      `,
    );
  });

  it('should replace the `input` level with `body-1` if there is no `body-1` in the config', async () => {
    await runMigrationTest(
      THEME_FILE,
      `
      @use '@angular/material' as mat;

      $sample-project-theme: mat.define-light-theme((
        color: (
          primary: $sample-project-primary,
          accent: $sample-project-accent,
          warn: $sample-project-warn,
        ),
        typography: mat.define-legacy-typography-config(
          $display-4: $display-4,
          $display-3: $display-3,
          $input: $input,
        ),
      ));
      `,
      `
      @use '@angular/material' as mat;

      $sample-project-theme: mat.define-light-theme((
        color: (
          primary: $sample-project-primary,
          accent: $sample-project-accent,
          warn: $sample-project-warn,
        ),
        typography: mat.define-typography-config(
          $headline-1: $display-4,
          $headline-2: $display-3,
          $body-1: $input,
        ),
      ));
      `,
    );
  });

  it('should comment out the `input` level if a `body-1` already exists', async () => {
    await runMigrationTest(
      THEME_FILE,
      `
      @use '@angular/material' as mat;

      $sample-project-theme: mat.define-light-theme((
        color: (
          primary: $sample-project-primary,
          accent: $sample-project-accent,
          warn: $sample-project-warn,
        ),
        typography: mat.define-legacy-typography-config(
          $display-4: $display-4,
          $display-3: $display-3,
          $input: $input,
          $subheading-1: $subheading-1,
        ),
      ));
      `,
      `
      @use '@angular/material' as mat;

      $sample-project-theme: mat.define-light-theme((
        color: (
          primary: $sample-project-primary,
          accent: $sample-project-accent,
          warn: $sample-project-warn,
        ),
        typography: mat.define-typography-config(
          $headline-1: $display-4,
          $headline-2: $display-3,
          /* TODO(mdc-migration): No longer supported. Use \`body-1\` instead. $input: $input, */
          $body-1: $subheading-1,
        ),
      ));
      `,
    );
  });
});

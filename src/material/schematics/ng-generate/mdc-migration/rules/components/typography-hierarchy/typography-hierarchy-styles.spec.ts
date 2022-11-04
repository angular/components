import {createTestApp, patchDevkitTreeToExposeTypeScript} from '@angular/cdk/schematics/testing';
import {SchematicTestRunner, UnitTestTree} from '@angular-devkit/schematics/testing';
import {createNewTestRunner, migrateComponents, THEME_FILE} from '../test-setup-helper';

describe('typography hierarchy styles migrator', () => {
  let runner: SchematicTestRunner;
  let cliAppTree: UnitTestTree;

  async function runMigrationTest(oldFileContent: string, newFileContent: string) {
    cliAppTree.create(THEME_FILE, oldFileContent);
    const tree = await migrateComponents([], runner, cliAppTree);
    expect(tree.readContent(THEME_FILE)).toBe(newFileContent);
  }

  beforeEach(async () => {
    runner = createNewTestRunner();
    cliAppTree = patchDevkitTreeToExposeTypeScript(await createTestApp(runner));
  });

  it('should replace the legacy hierarchy mixin with the non-legacy version', async () => {
    await runMigrationTest(
      `
        @use '@angular/material' as mat;
        $config: ();
        @include mat.legacy-typography-hierarchy($config);
      `,
      `
        @use '@angular/material' as mat;
        $config: ();
        @include mat.typography-hierarchy($config);
      `,
    );
  });

  it('should use the correct namespace', async () => {
    await runMigrationTest(
      `
        @use '@angular/material' as arbitrary;
        $config: ();
        @include arbitrary.legacy-typography-hierarchy($config);
      `,
      `
        @use '@angular/material' as arbitrary;
        $config: ();
        @include arbitrary.typography-hierarchy($config);
      `,
    );
  });

  it('should replace multiple legacy hierarchy mixin usages', async () => {
    await runMigrationTest(
      `
        @use '@angular/material' as mat;
        $config: ();
        $other-config: ();
        @include mat.legacy-typography-hierarchy($config);
        @include mat.legacy-typography-hierarchy($other-config);
      `,
      `
        @use '@angular/material' as mat;
        $config: ();
        $other-config: ();
        @include mat.typography-hierarchy($config);
        @include mat.typography-hierarchy($other-config);
      `,
    );
  });

  it('should replace usages of the legacy typography hierarchy classes', async () => {
    await runMigrationTest(
      `
        .mat-display-4 {
          color: red;
        }

        .mat-display-3 {
          color: red;
        }

        .mat-display-2 {
          color: red;
        }

        .mat-display-1 {
          color: red;
        }

        .mat-headline {
          color: red;
        }

        .mat-title {
          color: red;
        }

        .mat-subheading-2 {
          color: red;
        }

        .mat-body-2 {
          color: red;
        }

        .mat-subheading-1 {
          color: red;
        }

        .mat-body-1 {
          color: red;
        }
      `,
      `
        .mat-headline-1 {
          color: red;
        }

        .mat-headline-2 {
          color: red;
        }

        .mat-headline-3 {
          color: red;
        }

        .mat-headline-4 {
          color: red;
        }

        .mat-headline-5 {
          color: red;
        }

        .mat-headline-6 {
          color: red;
        }

        .mat-subtitle-1 {
          color: red;
        }

        .mat-subtitle-2 {
          color: red;
        }

        .mat-body-1 {
          color: red;
        }

        .mat-body-2 {
          color: red;
        }
      `,
    );
  });
});

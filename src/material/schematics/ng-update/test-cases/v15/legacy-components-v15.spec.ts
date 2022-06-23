import {UnitTestTree} from '@angular-devkit/schematics/testing';
import {createTestCaseSetup} from '@angular/cdk/schematics/testing';
import {join} from 'path';
import {MIGRATION_PATH} from '../../../paths';

const PROJECT_ROOT_DIR = '/projects/cdk-testing';
const THEME_FILE_PATH = join(PROJECT_ROOT_DIR, 'src/theme.scss');
const TS_FILE_PATH = join(PROJECT_ROOT_DIR, 'src/app/app.component.ts');

describe('v15 legacy components migration', () => {
  let tree: UnitTestTree;

  /** Writes an single line file. */
  let writeLine: (path: string, line: string) => void;

  /** Writes an array of lines as a single file. */
  let writeLines: (path: string, lines: string[]) => void;

  /** Reads a file. */
  let readFile: (path: string) => string;

  /** Reads a file and split it into an array where each item is a new line. */
  let readLines: (path: string) => string[];

  /** Runs the v15 migration on the test application. */
  let runMigration: () => Promise<{logOutput: string}>;

  beforeEach(async () => {
    const testSetup = await createTestCaseSetup('migration-v15', MIGRATION_PATH, []);
    tree = testSetup.appTree;
    runMigration = testSetup.runFixers;
    readFile = (path: string) => tree.readContent(path);
    readLines = (path: string) => tree.readContent(path).split('\n');
    writeLine = (path: string, lines: string) => testSetup.writeFile(path, lines);
    writeLines = (path: string, lines: string[]) => testSetup.writeFile(path, lines.join('\n'));
  });

  describe('typescript migrations', () => {
    async function runTypeScriptMigrationTest(ctx: string, opts: {old: string; new: string}) {
      writeLine(TS_FILE_PATH, opts.old);
      await runMigration();
      expect(readFile(TS_FILE_PATH)).withContext(ctx).toEqual(opts.new);
    }

    it('updates import declarations', async () => {
      await runTypeScriptMigrationTest('named binding', {
        old: `import {MatButton} from '@angular/material/button';`,
        new: `import {MatLegacyButton as MatButton} from '@angular/material/legacy-button';`,
      });
      await runTypeScriptMigrationTest('named binding w/ alias', {
        old: `import {MatButton as Button} from '@angular/material/button';`,
        new: `import {MatLegacyButton as Button} from '@angular/material/legacy-button';`,
      });
      await runTypeScriptMigrationTest('multiple named bindings', {
        old: `import {MatButton, MatButtonModule} from '@angular/material/button';`,
        new: `import {MatLegacyButton as MatButton, MatLegacyButtonModule as MatButtonModule} from '@angular/material/legacy-button';`,
      });
      await runTypeScriptMigrationTest('multiple named bindings w/ alias', {
        old: `import {MatButton, MatButtonModule as ButtonModule} from '@angular/material/button';`,
        new: `import {MatLegacyButton as MatButton, MatLegacyButtonModule as ButtonModule} from '@angular/material/legacy-button';`,
      });
    });

    it('updates import expressions', async () => {
      await runTypeScriptMigrationTest('destructured & awaited', {
        old: `const {MatButton} = await import('@angular/material/button');`,
        new: `const {MatLegacyButton: MatButton} = await import('@angular/material/legacy-button');`,
      });
      await runTypeScriptMigrationTest('destructured & awaited w/ alias', {
        old: `const {MatButton: Button} = await import('@angular/material/button');`,
        new: `const {MatLegacyButton: Button} = await import('@angular/material/legacy-button');`,
      });
      await runTypeScriptMigrationTest('promise', {
        old: `const promise = import('@angular/material/button');`,
        new: `const promise = import('@angular/material/legacy-button');`,
      });
      await runTypeScriptMigrationTest('.then', {
        old: `import('@angular/material/button').then(() => {});`,
        new: `import('@angular/material/legacy-button').then(() => {});`,
      });
    });
  });

  describe('style migrations', () => {
    async function runStylesheetMigrationTest(ctx: string, opts: {old: string[]; new: string[]}) {
      writeLines(THEME_FILE_PATH, opts.old);
      await runMigration();
      expect(readLines(THEME_FILE_PATH)).withContext(ctx).toEqual(opts.new);
    }
    it('updates angular material mixins', async () => {
      await runStylesheetMigrationTest('core and component mixins', {
        old: [
          `@use '@angular/material';`,
          `@include material.core();`,
          `@include material.button-color($light-theme);`,
          `@include material.button-theme($theme);`,
          `@include material.button-typography($typography);`,
        ],
        new: [
          `@use '@angular/material';`,
          `@include material.legacy-core();`,
          `@include material.legacy-button-color($light-theme);`,
          `@include material.legacy-button-theme($theme);`,
          `@include material.legacy-button-typography($typography);`,
        ],
      });
      await runStylesheetMigrationTest('all component mixins', {
        old: [
          `@use '@angular/material';`,
          `@include material.all-component-colors($theme);`,
          `@include material.all-component-themes($theme);`,
          `@include material.all-component-typographies($theme);`,
        ],
        new: [
          `@use '@angular/material';`,
          `@include material.all-legacy-component-colors($theme);`,
          `@include material.all-legacy-component-themes($theme);`,
          `@include material.all-legacy-component-typographies($theme);`,
        ],
      });
      await runStylesheetMigrationTest('core and component mixins w/ namespace', {
        old: [
          `@use '@angular/material' as mat;`,
          `@include mat.core();`,
          `@include mat.button-color($light-theme);`,
          `@include mat.button-theme($theme);`,
          `@include mat.button-typography($typography);`,
        ],
        new: [
          `@use '@angular/material' as mat;`,
          `@include mat.legacy-core();`,
          `@include mat.legacy-button-color($light-theme);`,
          `@include mat.legacy-button-theme($theme);`,
          `@include mat.legacy-button-typography($typography);`,
        ],
      });
      await runStylesheetMigrationTest('all component mixins w/ namespace', {
        old: [
          `@use '@angular/material' as mat;`,
          `@include mat.all-component-colors($theme);`,
          `@include mat.all-component-themes($theme);`,
          `@include mat.all-component-typographies($theme);`,
        ],
        new: [
          `@use '@angular/material' as mat;`,
          `@include mat.all-legacy-component-colors($theme);`,
          `@include mat.all-legacy-component-themes($theme);`,
          `@include mat.all-legacy-component-typographies($theme);`,
        ],
      });
    });
  });
});

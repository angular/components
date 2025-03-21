import {UnitTestTree} from '@angular-devkit/schematics/testing';
import {createTestCaseSetup} from '../../../../cdk/schematics/testing';
import {join} from 'path';
import {MIGRATION_PATH} from '../../paths';

const PROJECT_ROOT_DIR = '/projects/cdk-testing';
const THEME_FILE_PATH = join(PROJECT_ROOT_DIR, 'src/theme.scss');

describe('v19 mat.core migration', () => {
  let tree: UnitTestTree;

  /** Writes multiple lines to a file. */
  let writeLines: (path: string, lines: string[]) => void;

  /** Reads multiple lines from a file. */
  let readLines: (path: string) => string[];

  /** Runs the v15 migration on the test application. */
  let runMigration: () => Promise<{logOutput: string}>;

  beforeEach(async () => {
    const testSetup = await createTestCaseSetup('migration-v19', MIGRATION_PATH, []);
    tree = testSetup.appTree;
    runMigration = testSetup.runFixers;
    readLines = (path: string) => tree.readContent(path).split('\n');
    writeLines = (path: string, lines: string[]) => testSetup.writeFile(path, lines.join('\n'));
  });

  describe('style migrations', () => {
    async function runSassMigrationTest(ctx: string, opts: {old: string[]; new: string[]}) {
      writeLines(THEME_FILE_PATH, opts.old);
      await runMigration();
      expect(readLines(THEME_FILE_PATH)).withContext(ctx).toEqual(opts.new);
    }

    it('should remove uses of the core mixin', async () => {
      await runSassMigrationTest('', {
        old: [`@use '@angular/material' as mat;`, `@include mat.core();`],
        new: [
          `@use '@angular/material' as mat;`,
          `@include mat.elevation-classes();`,
          `@include mat.app-background();`,
        ],
      });

      await runSassMigrationTest('w/ unique namespace', {
        old: [`@use '@angular/material' as material;`, `@include material.core();`],
        new: [
          `@use '@angular/material' as material;`,
          `@include material.elevation-classes();`,
          `@include material.app-background();`,
        ],
      });

      await runSassMigrationTest('w/ no namespace', {
        old: [`@use '@angular/material';`, `@include material.core();`],
        new: [
          `@use '@angular/material';`,
          `@include material.elevation-classes();`,
          `@include material.app-background();`,
        ],
      });

      await runSassMigrationTest('w/ unique whitespace', {
        old: [
          `	 	@use	 	'@angular/material'	 	as	 	material	 	    ;	 	  `,
          `	 	@include	 	material.core(	 	)	 	    ;	 	  `,
        ],
        new: [
          `	 	@use	 	'@angular/material'	 	as	 	material	 	    ;	 	  `,
          `	 	@include material.elevation-classes();`,
          `	 	@include material.app-background();	 	  `,
        ],
      });
    });

    it('should not break if there is an invalid syntax', async () => {
      await runSassMigrationTest('', {
        old: [`@use '@angular/material' as mat;`, `.foo { content: '; }`],
        new: [`@use '@angular/material' as mat;`, `.foo { content: '; }`],
      });
    });
  });
});

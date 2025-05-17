import {UnitTestTree} from '@angular-devkit/schematics/testing';
import {createTestCaseSetup} from '../../../../cdk/schematics/testing';
import {MIGRATION_PATH} from '../../paths';

const THEME_FILE_PATH = '/projects/cdk-testing/src/theme.scss';

describe('v20 rename tokens migration', () => {
  let tree: UnitTestTree;
  let writeFile: (filename: string, content: string) => void;
  let runMigration: () => Promise<unknown>;

  function stripWhitespace(content: string): string {
    return content.replace(/\s/g, '');
  }

  beforeEach(async () => {
    const testSetup = await createTestCaseSetup('migration-v20', MIGRATION_PATH, []);
    tree = testSetup.appTree;
    writeFile = testSetup.writeFile;
    runMigration = testSetup.runFixers;
  });

  it('should rename mdc tokens to mat and change component ordering', async () => {
    writeFile(
      THEME_FILE_PATH,
      `
        html {
          --mdc-icon-button-icon-size: 24px;
          --mat-filled-button-color: red;
          --mat-filled-text-field-color: red;
          --mat-full-pseudo-checkbox-color: red;
          --mat-legacy-button-toggle-color: red;
        }
      `,
    );

    await runMigration();

    expect(stripWhitespace(tree.readText(THEME_FILE_PATH))).toBe(
      stripWhitespace(`
        html {
          --mat-icon-button-icon-size: 24px;
          --mat-button-filled-color: red;
          --mat-form-field-filled-color: red;
          --mat-pseudo-checkbox-full-color: red;
          --mat-button-toggle-legacy-color: red;
        }
    `),
    );
  });
});

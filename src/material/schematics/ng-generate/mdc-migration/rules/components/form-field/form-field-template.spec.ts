import {createTestApp, patchDevkitTreeToExposeTypeScript} from '@angular/cdk/schematics/testing';
import {SchematicTestRunner, UnitTestTree} from '@angular-devkit/schematics/testing';
import {createNewTestRunner, migrateComponents, TEMPLATE_FILE} from '../test-setup-helper';

describe('form-field template migrator', () => {
  let runner: SchematicTestRunner;
  let cliAppTree: UnitTestTree;

  async function runMigrationTest(oldFileContent: string, newFileContent: string) {
    cliAppTree.overwrite(TEMPLATE_FILE, oldFileContent);
    const tree = await migrateComponents(['form-field'], runner, cliAppTree);
    expect(tree.readContent(TEMPLATE_FILE)).toBe(newFileContent);
  }

  beforeEach(async () => {
    runner = createNewTestRunner();
    cliAppTree = patchDevkitTreeToExposeTypeScript(await createTestApp(runner));
  });

  it('should not update other elements appearance', async () => {
    await runMigrationTest(
      '<mat-card appearance="raised"></mat-card>',
      '<mat-card appearance="raised"></mat-card>',
    );
  });

  it('should not update default appearance', async () => {
    await runMigrationTest(
      '<mat-form-field></mat-form-field>',
      '<mat-form-field></mat-form-field>',
    );
  });

  it('should not update outline appearance', async () => {
    await runMigrationTest(
      '<mat-form-field appearance="outline"></mat-form-field>',
      '<mat-form-field appearance="outline"></mat-form-field>',
    );
  });

  it('should not update fill appearance', async () => {
    await runMigrationTest(
      '<mat-form-field appearance="fill"></mat-form-field>',
      '<mat-form-field appearance="fill"></mat-form-field>',
    );
  });

  it('should update standard appearance', async () => {
    await runMigrationTest(
      '<mat-form-field appearance="standard"></mat-form-field>',
      '<mat-form-field></mat-form-field>',
    );
  });

  it('should update legacy appearance', async () => {
    await runMigrationTest(
      '<mat-form-field appearance="legacy"></mat-form-field>',
      '<mat-form-field></mat-form-field>',
    );
  });
});

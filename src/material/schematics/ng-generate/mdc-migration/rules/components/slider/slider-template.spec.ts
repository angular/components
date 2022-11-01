import {createTestApp, patchDevkitTreeToExposeTypeScript} from '@angular/cdk/schematics/testing';
import {SchematicTestRunner, UnitTestTree} from '@angular-devkit/schematics/testing';
import {createNewTestRunner, migrateComponents, TEMPLATE_FILE} from '../test-setup-helper';

describe('slider template migrator', () => {
  let runner: SchematicTestRunner;
  let cliAppTree: UnitTestTree;

  async function runMigrationTest(oldFileContent: string, newFileContent: string) {
    cliAppTree.overwrite(TEMPLATE_FILE, oldFileContent);
    const tree = await migrateComponents(['slider'], runner, cliAppTree);
    expect(tree.readContent(TEMPLATE_FILE)).toBe(newFileContent);
  }

  beforeEach(async () => {
    runner = createNewTestRunner();
    cliAppTree = patchDevkitTreeToExposeTypeScript(await createTestApp(runner));
  });

  it('should not update other elements', async () => {
    await runMigrationTest('<mat-button></mat-button>', '<mat-button></mat-button>');
  });
});

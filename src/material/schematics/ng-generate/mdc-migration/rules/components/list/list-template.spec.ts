import {createTestApp, patchDevkitTreeToExposeTypeScript} from '@angular/cdk/schematics/testing';
import {SchematicTestRunner, UnitTestTree} from '@angular-devkit/schematics/testing';
import {createNewTestRunner, migrateComponents, TEMPLATE_FILE} from '../test-setup-helper';

describe('list template migrator', () => {
  let runner: SchematicTestRunner;
  let cliAppTree: UnitTestTree;

  async function runMigrationTest(oldFileContent: string, newFileContent: string) {
    cliAppTree.overwrite(TEMPLATE_FILE, oldFileContent);
    const tree = await migrateComponents(['list'], runner, cliAppTree);
    expect(tree.readContent(TEMPLATE_FILE)).toBe(newFileContent);
  }

  beforeEach(async () => {
    runner = createNewTestRunner();
    cliAppTree = patchDevkitTreeToExposeTypeScript(await createTestApp(runner));
  });

  it('should update mat-list-icon and mat-line directives with the updated names', async () => {
    await runMigrationTest(
      `<mat-list-item>
        <mat-icon mat-list-icon>note</mat-icon>
        <div mat-line>title</div>
        <div mat-line>subtitle</div>
      </mat-list-item>`,
      `<mat-list-item>
        <mat-icon matListItemIcon>note</mat-icon>
        <div matListItemTitle>title</div>
        <div matListItemLine>subtitle</div>
      </mat-list-item>`,
    );
  });

  it('should update matListAvatar and matLine directives with the updated names', async () => {
    await runMigrationTest(
      `<mat-list-item>
        <img matListAvatar src="..." alt="...">
        <div matLine>title</div>
        <div matLine>subtitle</div>
      </mat-list-item>`,
      `<mat-list-item>
        <img matListItemAvatar src="..." alt="...">
        <div matListItemTitle>title</div>
        <div matListItemLine>subtitle</div>
      </mat-list-item>`,
    );
  });
});

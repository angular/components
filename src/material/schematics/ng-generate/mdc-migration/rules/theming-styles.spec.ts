import {createTestApp, patchDevkitTreeToExposeTypeScript} from '@angular/cdk/schematics/testing';
import {SchematicTestRunner, UnitTestTree} from '@angular-devkit/schematics/testing';
import {Schema} from '../schema';
import {COLLECTION_PATH} from '../../../paths';

describe('theming styles', () => {
  let runner: SchematicTestRunner;
  let cliAppTree: UnitTestTree;
  const tsconfig = '/projects/material/tsconfig.app.json';
  const themeFile = '/projects/material/src/theme.scss';

  beforeEach(async () => {
    runner = new SchematicTestRunner('schematics', COLLECTION_PATH);
    cliAppTree = patchDevkitTreeToExposeTypeScript(await createTestApp(runner));
  });

  async function migrate(options: Schema): Promise<UnitTestTree> {
    return await runner.runSchematicAsync('mdcMigration', options, cliAppTree).toPromise();
  }

  it('should update all of the themes', async () => {
    cliAppTree.create(
      themeFile,
      `
      @use '@angular/material' as mat;
      $light-theme: ();
      @include mat.button-theme($theme);
    `,
    );
    const tree = await migrate({tsconfig, components: ['all']});
    expect(tree.readContent(themeFile)).toBe(`
      @use '@angular/material' as mat;
      $light-theme: ();
      @include mat.mdc-button-theme($theme);
      @include mat.mdc-button-typography($theme);
      @include mat.mdc-fab-theme($theme);
      @include mat.mdc-fab-typography($theme);
      @include mat.mdc-icon-theme($theme);
      @include mat.mdc-icon-typography($theme);
    `);
  });
});

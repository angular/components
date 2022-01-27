import {createTestApp, patchDevkitTreeToExposeTypeScript} from '@angular/cdk/schematics/testing';
import {SchematicTestRunner, UnitTestTree} from '@angular-devkit/schematics/testing';
import {Schema} from '../../schema';
import {COLLECTION_PATH} from '../../../../paths';

describe('button styles', () => {
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

  it('should do nothing if button is not specified', async () => {
    cliAppTree.create(themeFile, `
      @use '@angular/material' as mat;
      $theme: ();
      @include mat.button-theme($theme);
    `);
    const tree = await migrate({tsconfig, components: []});
    expect(tree.readContent(themeFile)).toBe(`
      @use '@angular/material' as mat;
      $theme: ();
      @include mat.button-theme($theme);
    `);
  });

  it('should replace the old theme with the new ones', async () => {
    cliAppTree.create(themeFile, `
      @use '@angular/material' as mat;
      $theme: ();
      @include mat.button-theme($theme);
    `);
    const tree = await migrate({tsconfig, components: ['button']});
    expect(tree.readContent(themeFile)).toBe(`
      @use '@angular/material' as mat;
      $theme: ();
      @include mat.mdc-button-theme($theme);
      @include mat.mdc-button-typography($theme);
      @include mat.mdc-fab-theme($theme);
      @include mat.mdc-fab-typography($theme);
      @include mat.mdc-icon-theme($theme);
      @include mat.mdc-icon-typography($theme);
    `);
  });

  it('should use the correct namespace', async () => {
    cliAppTree.create(themeFile, `
      @use '@angular/material' as arbitrary;
      $theme: ();
      @include arbitrary.button-theme($theme);
    `);
    const tree = await migrate({tsconfig, components: ['button']});
    expect(tree.readContent(themeFile)).toBe(`
      @use '@angular/material' as arbitrary;
      $theme: ();
      @include arbitrary.mdc-button-theme($theme);
      @include arbitrary.mdc-button-typography($theme);
      @include arbitrary.mdc-fab-theme($theme);
      @include arbitrary.mdc-fab-typography($theme);
      @include arbitrary.mdc-icon-theme($theme);
      @include arbitrary.mdc-icon-typography($theme);
    `);
  });

  it('should handle updating multiple themes', async () => {
    cliAppTree.create(themeFile, `
      @use '@angular/material' as mat;
      $light-theme: ();
      $dark-theme: ();
      @include mat.button-theme($light-theme);
      @include mat.button-theme($dark-theme);
    `);
    const tree = await migrate({tsconfig, components: ['button']});
    expect(tree.readContent(themeFile)).toBe(`
      @use '@angular/material' as mat;
      $light-theme: ();
      $dark-theme: ();
      @include mat.mdc-button-theme($light-theme);
      @include mat.mdc-button-typography($light-theme);
      @include mat.mdc-fab-theme($light-theme);
      @include mat.mdc-fab-typography($light-theme);
      @include mat.mdc-icon-theme($light-theme);
      @include mat.mdc-icon-typography($light-theme);
      @include mat.mdc-button-theme($dark-theme);
      @include mat.mdc-button-typography($dark-theme);
      @include mat.mdc-fab-theme($dark-theme);
      @include mat.mdc-fab-typography($dark-theme);
      @include mat.mdc-icon-theme($dark-theme);
      @include mat.mdc-icon-typography($dark-theme);
    `);
  });

  it('should preserve whitespace', async () => {
    cliAppTree.create(themeFile, `
      @use '@angular/material' as mat;
      $theme: ();


      @include mat.button-theme($theme);


    `);
    const tree = await migrate({tsconfig, components: ['button']});
    expect(tree.readContent(themeFile)).toBe(`
      @use '@angular/material' as mat;
      $theme: ();


      @include mat.mdc-button-theme($theme);
      @include mat.mdc-button-typography($theme);
      @include mat.mdc-fab-theme($theme);
      @include mat.mdc-fab-typography($theme);
      @include mat.mdc-icon-theme($theme);
      @include mat.mdc-icon-typography($theme);


    `);
  });
});

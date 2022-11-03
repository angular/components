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

  it('should update a basic slider', async () => {
    await runMigrationTest(
      '<mat-slider></mat-slider>',
      '<mat-slider><input matSliderThumb /></mat-slider>',
    );
  });

  describe('should move a value binding to the slider thumb', () => {
    it('with non-indented bindings', async () => {
      await runMigrationTest(
        '<mat-slider [(value)]="myValue"></mat-slider>',
        '<mat-slider><input matSliderThumb [(value)]="myValue" /></mat-slider>',
      );
      await runMigrationTest(
        '<mat-slider min="50" [(value)]="myValue"></mat-slider>',
        '<mat-slider min="50"><input matSliderThumb [(value)]="myValue" /></mat-slider>',
      );
      await runMigrationTest(
        '<mat-slider [(value)]="myValue" max="200"></mat-slider>',
        '<mat-slider max="200"><input matSliderThumb [(value)]="myValue" /></mat-slider>',
      );
      await runMigrationTest(
        '<mat-slider min="50" [(value)]="myValue" max="200"></mat-slider>',
        '<mat-slider min="50" max="200"><input matSliderThumb [(value)]="myValue" /></mat-slider>',
      );
    });

    it('with indented bindings', async () => {
      await runMigrationTest(
        `<mat-slider
          [(value)]="myValue"></mat-slider>`,
        `<mat-slider><input matSliderThumb [(value)]="myValue" /></mat-slider>`,
      );
      await runMigrationTest(
        `<mat-slider
          min="50"
          [(value)]="myValue"></mat-slider>`,
        `<mat-slider
          min="50"><input matSliderThumb [(value)]="myValue" /></mat-slider>`,
      );
      await runMigrationTest(
        `<mat-slider
          [(value)]="myValue"
          max="200"></mat-slider>`,
        `<mat-slider
          max="200"><input matSliderThumb [(value)]="myValue" /></mat-slider>`,
      );
      await runMigrationTest(
        `<mat-slider
          min="50"
          [(value)]="myValue"
          max="200"></mat-slider>`,
        `<mat-slider
          min="50"
          max="200"><input matSliderThumb [(value)]="myValue" /></mat-slider>`,
      );
    });
  });

  it('should add a comment if a binding has no new mapping', async () => {
    await runMigrationTest(
      `
      <mat-slider invert></mat-slider>`,
      `
      <!-- TODO: The 'invert' property no longer exists -->
      <mat-slider><input matSliderThumb /></mat-slider>`,
    );
    await runMigrationTest(
      `
      <mat-slider vertical></mat-slider>`,
      `
      <!-- TODO: The 'vertical' property no longer exists -->
      <mat-slider><input matSliderThumb /></mat-slider>`,
    );
    await runMigrationTest(
      `
      <mat-slider vertical invert></mat-slider>`,
      `
      <!-- TODO: The 'vertical' property no longer exists -->
      <!-- TODO: The 'invert' property no longer exists -->
      <mat-slider><input matSliderThumb /></mat-slider>`,
    );
    await runMigrationTest(
      `
      <button>Click Me</button><mat-slider vertical invert></mat-slider>`,
      `
      <button>Click Me</button>
      <!-- TODO: The 'vertical' property no longer exists -->
      <!-- TODO: The 'invert' property no longer exists -->
      <mat-slider><input matSliderThumb /></mat-slider>`,
    );
  });
});

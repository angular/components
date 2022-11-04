import {createTestApp, patchDevkitTreeToExposeTypeScript} from '@angular/cdk/schematics/testing';
import {SchematicTestRunner, UnitTestTree} from '@angular-devkit/schematics/testing';
import {createNewTestRunner, migrateComponents, TEMPLATE_FILE} from '../test-setup-helper';

describe('typography hierarchy template migrator', () => {
  let runner: SchematicTestRunner;
  let cliAppTree: UnitTestTree;

  async function runMigrationTest(oldFileContent: string, newFileContent: string) {
    cliAppTree.overwrite(TEMPLATE_FILE, oldFileContent);
    const tree = await migrateComponents([], runner, cliAppTree);
    expect(tree.readContent(TEMPLATE_FILE)).toBe(newFileContent);
  }

  beforeEach(async () => {
    runner = createNewTestRunner();
    cliAppTree = patchDevkitTreeToExposeTypeScript(await createTestApp(runner));
  });

  it('should migrate legacy typography levels in static attributes', async () => {
    await runMigrationTest(
      `
        <h1 class="mat-display-4">Hello</h1>
        <h1 class="mat-display-3">Hello</h1>
        <h1 class="mat-display-2">Hello</h1>
        <h1 class="mat-display-1">Hello</h1>
        <h1 class="mat-headline">Hello</h1>
        <h1 class="mat-title">Hello</h1>
        <h1 class="mat-subheading-2">Hello</h1>
        <h1 class="mat-body-2">Hello</h1>
        <h1 class="mat-subheading-1">Hello</h1>
        <h1 class="mat-body-1">Hello</h1>
      `,
      `
        <h1 class="mat-headline-1">Hello</h1>
        <h1 class="mat-headline-2">Hello</h1>
        <h1 class="mat-headline-3">Hello</h1>
        <h1 class="mat-headline-4">Hello</h1>
        <h1 class="mat-headline-5">Hello</h1>
        <h1 class="mat-headline-6">Hello</h1>
        <h1 class="mat-subtitle-1">Hello</h1>
        <h1 class="mat-subtitle-2">Hello</h1>
        <h1 class="mat-body-1">Hello</h1>
        <h1 class="mat-body-2">Hello</h1>
      `,
    );
  });

  it('should migrate multiple static class usages of the legacy typography levels in a single file', async () => {
    await runMigrationTest(
      `
        <h1 class="header mat-display-4" other-attr="foo">Hello</h1><div foo="bar"></div>
        <h2 class="mat-display-3">Hi</h2>
      `,
      `
        <h1 class="header mat-headline-1" other-attr="foo">Hello</h1><div foo="bar"></div>
        <h2 class="mat-headline-2">Hi</h2>
      `,
    );
  });

  it('should migrate legacy typography levels in class bindings', async () => {
    await runMigrationTest(
      `
        <h1 [class.mat-display-4]="expr">Hello</h1>
        <h1 [class.mat-display-3]="expr">Hello</h1>
        <h1 [class.mat-display-2]="expr">Hello</h1>
        <h1 [class.mat-display-1]="expr">Hello</h1>
        <h1 [class.mat-headline]="expr">Hello</h1>
        <h1 [class.mat-title]="expr">Hello</h1>
        <h1 [class.mat-subheading-2]="expr">Hello</h1>
        <h1 [class.mat-body-2]="expr">Hello</h1>
        <h1 [class.mat-subheading-1]="expr">Hello</h1>
        <h1 [class.mat-body-1]="expr">Hello</h1>
      `,
      `
        <h1 [class.mat-headline-1]="expr">Hello</h1>
        <h1 [class.mat-headline-2]="expr">Hello</h1>
        <h1 [class.mat-headline-3]="expr">Hello</h1>
        <h1 [class.mat-headline-4]="expr">Hello</h1>
        <h1 [class.mat-headline-5]="expr">Hello</h1>
        <h1 [class.mat-headline-6]="expr">Hello</h1>
        <h1 [class.mat-subtitle-1]="expr">Hello</h1>
        <h1 [class.mat-subtitle-2]="expr">Hello</h1>
        <h1 [class.mat-body-1]="expr">Hello</h1>
        <h1 [class.mat-body-2]="expr">Hello</h1>
      `,
    );
  });

  it('should migrate mixed class bindings and static class attribute', async () => {
    await runMigrationTest(
      `
        <h1 [class.mat-display-4]="someExpr" class="foo mat-subheading-2 bar">Hello</h1>
        <h1 [class.mat-display-1]="someExpr">Hello</h1>
      `,
      `
        <h1 [class.mat-headline-1]="someExpr" class="foo mat-subtitle-1 bar">Hello</h1>
        <h1 [class.mat-headline-4]="someExpr">Hello</h1>
      `,
    );
  });
});

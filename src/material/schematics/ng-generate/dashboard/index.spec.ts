import {SchematicTestRunner} from '@angular-devkit/schematics/testing';
import {createTestApp, getFileContent} from '@angular/cdk/schematics/testing';
import {COLLECTION_PATH} from '../../paths';
import {Schema} from './schema';

describe('material-dashboard-schematic', () => {
  let runner: SchematicTestRunner;

  const baseOptions: Schema = {
    name: 'foo',
    project: 'material',
  };

  beforeEach(() => {
    runner = new SchematicTestRunner('schematics', COLLECTION_PATH);
  });

  it('should create dashboard files and add them to module', async () => {
    const app = await createTestApp(runner, {standalone: false});
    const tree = await runner.runSchematic('dashboard', baseOptions, app);
    const files = tree.files;

    expect(files).toContain('/projects/material/src/app/foo/foo.component.css');
    expect(files).toContain('/projects/material/src/app/foo/foo.component.html');
    expect(files).toContain('/projects/material/src/app/foo/foo.component.spec.ts');
    expect(files).toContain('/projects/material/src/app/foo/foo.component.ts');

    const moduleContent = getFileContent(tree, '/projects/material/src/app/app.module.ts');
    expect(moduleContent).toMatch(/import.*Foo.*from '.\/foo\/foo.component'/);
    expect(moduleContent).toMatch(/declarations:\s*\[[^\]]+?,\r?\n\s+FooComponent\r?\n/m);
  });

  it('should add dashboard imports to module', async () => {
    const app = await createTestApp(runner, {standalone: false});
    const tree = await runner.runSchematic('dashboard', baseOptions, app);
    const moduleContent = getFileContent(tree, '/projects/material/src/app/app.module.ts');

    expect(moduleContent).toContain('MatGridListModule');
    expect(moduleContent).toContain('MatCardModule');
    expect(moduleContent).toContain('MatMenuModule');
    expect(moduleContent).toContain('MatIconModule');
    expect(moduleContent).toContain('MatButtonModule');

    expect(moduleContent).toContain(
      `import { MatGridListModule } from '@angular/material/grid-list';`,
    );
    expect(moduleContent).toContain(`import { MatCardModule } from '@angular/material/card';`);
    expect(moduleContent).toContain(`import { MatMenuModule } from '@angular/material/menu';`);
    expect(moduleContent).toContain(`import { MatIconModule } from '@angular/material/icon';`);
    expect(moduleContent).toContain(`import { MatButtonModule } from '@angular/material/button';`);
  });

  it('should throw if no name has been specified', async () => {
    const appTree = await createTestApp(runner);

    await expectAsync(
      runner.runSchematic('dashboard', {project: 'material'}, appTree),
    ).toBeRejectedWithError(/required property 'name'/);
  });

  describe('standalone option', () => {
    it('should generate a standalone component', async () => {
      const app = await createTestApp(runner, {standalone: false});
      const tree = await runner.runSchematic('dashboard', {...baseOptions, standalone: true}, app);
      const module = getFileContent(tree, '/projects/material/src/app/app.module.ts');
      const component = getFileContent(tree, '/projects/material/src/app/foo/foo.component.ts');
      const requiredModules = [
        'MatButtonModule',
        'MatCardModule',
        'MatGridListModule',
        'MatIconModule',
        'MatMenuModule',
      ];

      requiredModules.forEach(name => {
        expect(module).withContext('Module should not import dependencies').not.toContain(name);
        expect(component).withContext('Component should import dependencies').toContain(name);
      });

      expect(module).not.toContain('FooComponent');
      expect(component).toContain('standalone: true');
      expect(component).toContain('imports: [');
    });

    it('should infer the standalone option from the project structure', async () => {
      const app = await createTestApp(runner, {standalone: true});
      const tree = await runner.runSchematic('dashboard', baseOptions, app);
      const componentContent = getFileContent(
        tree,
        '/projects/material/src/app/foo/foo.component.ts',
      );

      expect(tree.exists('/projects/material/src/app/app.module.ts')).toBe(false);
      expect(componentContent).toContain('standalone: true');
      expect(componentContent).toContain('imports: [');
    });
  });

  describe('style option', () => {
    it('should respect the option value', async () => {
      const tree = await runner.runSchematic(
        'dashboard',
        {style: 'scss', ...baseOptions},
        await createTestApp(runner),
      );
      expect(tree.files).toContain('/projects/material/src/app/foo/foo.component.scss');
    });

    it('should fall back to the @schematics/angular:component option value', async () => {
      const tree = await runner.runSchematic(
        'dashboard',
        baseOptions,
        await createTestApp(runner, {style: 'less'}),
      );
      expect(tree.files).toContain('/projects/material/src/app/foo/foo.component.less');
    });
  });

  describe('inlineStyle option', () => {
    it('should respect the option value', async () => {
      const app = await createTestApp(runner);
      const tree = await runner.runSchematic('dashboard', {inlineStyle: true, ...baseOptions}, app);
      expect(tree.files).not.toContain('/projects/material/src/app/foo/foo.component.css');
    });

    it('should fall back to the @schematics/angular:component option value', async () => {
      const tree = await runner.runSchematic(
        'dashboard',
        baseOptions,
        await createTestApp(runner, {inlineStyle: true}),
      );
      expect(tree.files).not.toContain('/projects/material/src/app/foo/foo.component.css');
    });
  });

  describe('inlineTemplate option', () => {
    it('should respect the option value', async () => {
      const app = await createTestApp(runner);
      const tree = await runner.runSchematic(
        'dashboard',
        {inlineTemplate: true, ...baseOptions},
        app,
      );
      expect(tree.files).not.toContain('/projects/material/src/app/foo/foo.component.html');
    });

    it('should fall back to the @schematics/angular:component option value', async () => {
      const app = await createTestApp(runner, {inlineTemplate: true});
      const tree = await runner.runSchematic('dashboard', baseOptions, app);

      expect(tree.files).not.toContain('/projects/material/src/app/foo/foo.component.html');
    });
  });

  describe('skipTests option', () => {
    it('should respect the option value', async () => {
      const tree = await runner.runSchematic(
        'dashboard',
        {skipTests: true, ...baseOptions},
        await createTestApp(runner),
      );
      expect(tree.files).not.toContain('/projects/material/src/app/foo/foo.component.spec.ts');
    });

    it('should fall back to the @schematics/angular:component option value', async () => {
      const tree = await runner.runSchematic(
        'dashboard',
        baseOptions,
        await createTestApp(runner, {skipTests: true}),
      );
      expect(tree.files).not.toContain('/projects/material/src/app/foo/foo.component.spec.ts');
    });
  });
});

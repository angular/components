import {SchematicTestRunner} from '@angular-devkit/schematics/testing';
import {createTestApp, getFileContent} from '@angular/cdk/schematics/testing';
import {COLLECTION_PATH} from '../../paths';
import {Schema} from './schema';

describe('material-table-schematic', () => {
  let runner: SchematicTestRunner;

  const baseOptions: Schema = {
    name: 'foo',
    project: 'material',
  };

  beforeEach(() => {
    runner = new SchematicTestRunner('schematics', COLLECTION_PATH);
  });

  it('should create table files and add them to module', async () => {
    const app = await createTestApp(runner, {standalone: false});
    const tree = await runner.runSchematic('table', baseOptions, app);
    const files = tree.files;

    expect(files).toContain('/projects/material/src/app/foo/foo.component.css');
    expect(files).toContain('/projects/material/src/app/foo/foo.component.html');
    expect(files).toContain('/projects/material/src/app/foo/foo.component.spec.ts');
    expect(files).toContain('/projects/material/src/app/foo/foo.component.ts');
    expect(files).toContain('/projects/material/src/app/foo/foo-datasource.ts');

    const moduleContent = getFileContent(tree, '/projects/material/src/app/app.module.ts');
    expect(moduleContent).toMatch(/import.*Foo.*from '.\/foo\/foo.component'/);
    expect(moduleContent).toMatch(/declarations:\s*\[[^\]]+?,\r?\n\s+FooComponent\r?\n/m);

    const datasourceContent = getFileContent(
      tree,
      '/projects/material/src/app/foo/foo-datasource.ts',
    );

    expect(datasourceContent).toContain('FooItem');
    expect(datasourceContent).toContain('FooDataSource');

    const componentContent = getFileContent(
      tree,
      '/projects/material/src/app/foo/foo.component.ts',
    );

    expect(componentContent).toContain('FooDataSource');
  });

  it('should add table imports to module', async () => {
    const app = await createTestApp(runner, {standalone: false});
    const tree = await runner.runSchematic('table', baseOptions, app);
    const moduleContent = getFileContent(tree, '/projects/material/src/app/app.module.ts');

    expect(moduleContent).toContain('MatTableModule');
    expect(moduleContent).toContain('MatPaginatorModule');
    expect(moduleContent).toContain('MatSortModule');

    expect(moduleContent).toContain(`import { MatTableModule } from '@angular/material/table';`);
    expect(moduleContent).toContain(`import { MatSortModule } from '@angular/material/sort';`);
    expect(moduleContent).toContain(
      `import { MatPaginatorModule } from '@angular/material/paginator';`,
    );
  });

  it('should throw if no name has been specified', async () => {
    const appTree = await createTestApp(runner);

    await expectAsync(
      runner.runSchematic('table', {project: 'material'}, appTree),
    ).toBeRejectedWithError(/required property 'name'/);
  });

  describe('standalone option', () => {
    it('should generate a standalone component', async () => {
      const app = await createTestApp(runner, {standalone: false});
      const tree = await runner.runSchematic('table', {...baseOptions, standalone: true}, app);
      const module = getFileContent(tree, '/projects/material/src/app/app.module.ts');
      const component = getFileContent(tree, '/projects/material/src/app/foo/foo.component.ts');
      const requiredModules = ['MatTableModule', 'MatPaginatorModule', 'MatSortModule'];

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
      const tree = await runner.runSchematic('table', baseOptions, app);
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
        'table',
        {style: 'scss', ...baseOptions},
        await createTestApp(runner),
      );
      expect(tree.files).toContain('/projects/material/src/app/foo/foo.component.scss');
    });

    it('should fall back to the @schematics/angular:component option value', async () => {
      const tree = await runner.runSchematic(
        'table',
        baseOptions,
        await createTestApp(runner, {style: 'less'}),
      );
      expect(tree.files).toContain('/projects/material/src/app/foo/foo.component.less');
    });
  });

  describe('inlineStyle option', () => {
    it('should respect the option value', async () => {
      const tree = await runner.runSchematic(
        'table',
        {inlineStyle: true, ...baseOptions},
        await createTestApp(runner),
      );
      expect(tree.files).not.toContain('/projects/material/src/app/foo/foo.component.css');
    });

    it('should fall back to the @schematics/angular:component option value', async () => {
      const tree = await runner.runSchematic(
        'table',
        baseOptions,
        await createTestApp(runner, {inlineStyle: true}),
      );
      expect(tree.files).not.toContain('/projects/material/src/app/foo/foo.component.css');
    });
  });

  describe('inlineTemplate option', () => {
    it('should respect the option value', async () => {
      const tree = await runner.runSchematic(
        'table',
        {inlineTemplate: true, ...baseOptions},
        await createTestApp(runner),
      );
      expect(tree.files).not.toContain('/projects/material/src/app/foo/foo.component.html');
    });

    it('should fall back to the @schematics/angular:component option value', async () => {
      const tree = await runner.runSchematic(
        'table',
        baseOptions,
        await createTestApp(runner, {inlineTemplate: true}),
      );
      expect(tree.files).not.toContain('/projects/material/src/app/foo/foo.component.html');
    });
  });

  describe('skipTests option', () => {
    it('should respect the option value', async () => {
      const tree = await runner.runSchematic(
        'table',
        {skipTests: true, ...baseOptions},
        await createTestApp(runner),
      );
      expect(tree.files).not.toContain('/projects/material/src/app/foo/foo.component.spec.ts');
    });

    it('should fall back to the @schematics/angular:component option value', async () => {
      const tree = await runner.runSchematic(
        'table',
        baseOptions,
        await createTestApp(runner, {skipTests: true}),
      );
      expect(tree.files).not.toContain('/projects/material/src/app/foo/foo.component.spec.ts');
    });
  });
});

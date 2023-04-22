import {SchematicTestRunner, UnitTestTree} from '@angular-devkit/schematics/testing';
import {createTestApp, getFileContent} from '@angular/cdk/schematics/testing';
import {COLLECTION_PATH} from '../../paths';

import {Schema} from './schema';

describe('material-navigation-schematic', () => {
  let runner: SchematicTestRunner;

  const baseOptions: Schema = {
    name: 'foo',
    project: 'material',
  };

  beforeEach(() => {
    runner = new SchematicTestRunner('schematics', COLLECTION_PATH);
  });

  function expectNavigationSchematicModuleImports(tree: UnitTestTree) {
    const moduleContent = getFileContent(tree, '/projects/material/src/app/app.module.ts');
    expect(moduleContent).toMatch(/MatToolbarModule,\s+/);
    expect(moduleContent).toMatch(/MatButtonModule,\s+/);
    expect(moduleContent).toMatch(/MatSidenavModule,\s+/);
    expect(moduleContent).toMatch(/MatIconModule,\s+/);
    expect(moduleContent).toMatch(/MatListModule\s+],/);
    expect(moduleContent).toContain(`import { MatButtonModule } from '@angular/material/button';`);
    expect(moduleContent).toContain(`import { MatIconModule } from '@angular/material/icon';`);
    expect(moduleContent).toContain(`import { MatListModule } from '@angular/material/list';`);
    expect(moduleContent).toContain(
      `import { MatToolbarModule } from '@angular/material/toolbar';`,
    );
    expect(moduleContent).toContain(
      `import { MatSidenavModule } from '@angular/material/sidenav';`,
    );
  }

  it('should create navigation files and add them to module', async () => {
    const app = await createTestApp(runner);
    const tree = await runner.runSchematic('navigation', baseOptions, app);
    const files = tree.files;

    expect(files).toContain('/projects/material/src/app/foo/foo.component.css');
    expect(files).toContain('/projects/material/src/app/foo/foo.component.html');
    expect(files).toContain('/projects/material/src/app/foo/foo.component.spec.ts');
    expect(files).toContain('/projects/material/src/app/foo/foo.component.ts');

    const moduleContent = getFileContent(tree, '/projects/material/src/app/app.module.ts');
    expect(moduleContent).toMatch(/import.*Foo.*from '.\/foo\/foo.component'/);
    expect(moduleContent).toMatch(/declarations:\s*\[[^\]]+?,\r?\n\s+FooComponent\r?\n/m);
  });

  it('should add navigation imports to module', async () => {
    const app = await createTestApp(runner);
    const tree = await runner.runSchematic('navigation', baseOptions, app);
    expectNavigationSchematicModuleImports(tree);
  });

  it('should support `nav` as schematic alias', async () => {
    const app = await createTestApp(runner);
    const tree = await runner.runSchematic('nav', baseOptions, app);
    expectNavigationSchematicModuleImports(tree);
  });

  it('should throw if no name has been specified', async () => {
    const appTree = await createTestApp(runner);

    await expectAsync(
      runner.runSchematic('navigation', {project: 'material'}, appTree),
    ).toBeRejectedWithError(/required property 'name'/);
  });

  describe('standalone option', () => {
    it('should generate a standalone component', async () => {
      const app = await createTestApp(runner);
      const tree = await runner.runSchematic('navigation', {...baseOptions, standalone: true}, app);
      const module = getFileContent(tree, '/projects/material/src/app/app.module.ts');
      const component = getFileContent(tree, '/projects/material/src/app/foo/foo.component.ts');
      const requiredModules = [
        'MatToolbarModule',
        'MatButtonModule',
        'MatSidenavModule',
        'MatListModule',
        'MatIconModule',
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
      const tree = await runner.runSchematic('navigation', baseOptions, app);
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
        'navigation',
        {style: 'scss', ...baseOptions},
        await createTestApp(runner),
      );
      expect(tree.files).toContain('/projects/material/src/app/foo/foo.component.scss');
    });

    it('should fall back to the @schematics/angular:component option value', async () => {
      const tree = await runner.runSchematic(
        'navigation',
        baseOptions,
        await createTestApp(runner, {style: 'less'}),
      );
      expect(tree.files).toContain('/projects/material/src/app/foo/foo.component.less');
    });
  });

  describe('inlineStyle option', () => {
    it('should respect the option value', async () => {
      const tree = await runner.runSchematic(
        'navigation',
        {inlineStyle: true, ...baseOptions},
        await createTestApp(runner),
      );
      expect(tree.files).not.toContain('/projects/material/src/app/foo/foo.component.css');
    });

    it('should fall back to the @schematics/angular:component option value', async () => {
      const tree = await runner.runSchematic(
        'navigation',
        baseOptions,
        await createTestApp(runner, {inlineStyle: true}),
      );
      expect(tree.files).not.toContain('/projects/material/src/app/foo/foo.component.css');
    });
  });

  describe('inlineTemplate option', () => {
    it('should respect the option value', async () => {
      const tree = await runner.runSchematic(
        'navigation',
        {inlineTemplate: true, ...baseOptions},
        await createTestApp(runner),
      );
      expect(tree.files).not.toContain('/projects/material/src/app/foo/foo.component.html');
    });

    it('should fall back to the @schematics/angular:component option value', async () => {
      const tree = await runner.runSchematic(
        'navigation',
        baseOptions,
        await createTestApp(runner, {inlineTemplate: true}),
      );
      expect(tree.files).not.toContain('/projects/material/src/app/foo/foo.component.html');
    });
  });

  describe('skipTests option', () => {
    it('should respect the option value', async () => {
      const tree = await runner.runSchematic(
        'navigation',
        {skipTests: true, ...baseOptions},
        await createTestApp(runner),
      );
      expect(tree.files).not.toContain('/projects/material/src/app/foo/foo.component.spec.ts');
    });

    it('should fall back to the @schematics/angular:component option value', async () => {
      const tree = await runner.runSchematic(
        'navigation',
        baseOptions,
        await createTestApp(runner, {skipTests: true}),
      );
      expect(tree.files).not.toContain('/projects/material/src/app/foo/foo.component.spec.ts');
    });
  });
  describe('router option', () => {
    it('should respect the option value if routing true', async () => {
      const tree = await runner.runSchematic(
        'navigation',
        {routing: true, ...baseOptions},
        await createTestApp(runner),
      );
      const template = tree.readContent('/projects/material/src/app/foo/foo.component.html');
      expect(template).toContain('<a mat-list-item routerLink="/">Link 1</a>');
    });
    it('should respect the option value if routing false', async () => {
      const tree = await runner.runSchematic(
        'navigation',
        {routing: false, ...baseOptions},
        await createTestApp(runner),
      );
      const template = tree.readContent('/projects/material/src/app/foo/foo.component.html');
      expect(template).toContain('<a mat-list-item href="#">Link 1</a>');
    });
  });
});

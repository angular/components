import {SchematicTestRunner} from '@angular-devkit/schematics/testing';
import {createTestApp, getFileContent} from '@angular/cdk/schematics/testing';
import {COLLECTION_PATH} from '../../paths';
import {Schema} from './schema';

describe('Material address-form schematic', () => {
  let runner: SchematicTestRunner;

  const baseOptions: Schema = {
    name: 'foo',
    project: 'material',
  };

  beforeEach(() => {
    runner = new SchematicTestRunner('schematics', COLLECTION_PATH);
  });

  it('should create address-form files and add them to module', async () => {
    const app = await createTestApp(runner);
    const tree = await runner.runSchematic('address-form', baseOptions, app);
    const files = tree.files;

    expect(files).toContain('/projects/material/src/app/foo/foo.component.css');
    expect(files).toContain('/projects/material/src/app/foo/foo.component.html');
    expect(files).toContain('/projects/material/src/app/foo/foo.component.spec.ts');
    expect(files).toContain('/projects/material/src/app/foo/foo.component.ts');

    const moduleContent = getFileContent(tree, '/projects/material/src/app/app.module.ts');
    expect(moduleContent).toMatch(/import.*Foo.*from '.\/foo\/foo.component'/);
    expect(moduleContent).toMatch(/declarations:\s*\[[^\]]+?,\r?\n\s+FooComponent\r?\n/m);
  });

  it('should add address-form imports to module', async () => {
    const app = await createTestApp(runner);
    const tree = await runner.runSchematic('address-form', baseOptions, app);
    const moduleContent = getFileContent(tree, '/projects/material/src/app/app.module.ts');

    expect(moduleContent).toContain('MatInputModule');
    expect(moduleContent).toContain('MatButtonModule');
    expect(moduleContent).toContain('MatSelectModule');
    expect(moduleContent).toContain('MatRadioModule');
    expect(moduleContent).toContain('ReactiveFormsModule');
  });

  it('should throw if no name has been specified', async () => {
    const appTree = await createTestApp(runner);

    await expectAsync(
      runner.runSchematic('address-form', {project: 'material'}, appTree),
    ).toBeRejectedWithError(/required property 'name'/);
  });

  describe('standalone option', () => {
    it('should generate a standalone component', async () => {
      const app = await createTestApp(runner);
      const tree = await runner.runSchematic(
        'address-form',
        {...baseOptions, standalone: true},
        app,
      );
      const module = getFileContent(tree, '/projects/material/src/app/app.module.ts');
      const content = getFileContent(tree, '/projects/material/src/app/foo/foo.component.ts');
      const requiredModules = [
        'MatInputModule',
        'MatButtonModule',
        'MatSelectModule',
        'MatRadioModule',
        'ReactiveFormsModule',
      ];

      requiredModules.forEach(name => {
        expect(module).withContext('Module should not import dependencies').not.toContain(name);
        expect(content).withContext('Component should import dependencies').toContain(name);
      });

      expect(module).not.toContain('FooComponent');
      expect(content).toContain('standalone: true');
      expect(content).toContain('imports: [');
    });

    it('should infer the standalone option from the project structure', async () => {
      const app = await createTestApp(runner, {standalone: true});
      const tree = await runner.runSchematic('address-form', baseOptions, app);
      const component = getFileContent(tree, '/projects/material/src/app/foo/foo.component.ts');

      expect(tree.exists('/projects/material/src/app/app.module.ts')).toBe(false);
      expect(component).toContain('standalone: true');
      expect(component).toContain('imports: [');
    });
  });

  describe('style option', () => {
    it('should respect the option value', async () => {
      const tree = await runner.runSchematic(
        'address-form',
        {style: 'scss', ...baseOptions},
        await createTestApp(runner),
      );
      expect(tree.files).toContain('/projects/material/src/app/foo/foo.component.scss');
    });

    it('should fall back to the @schematics/angular:component option value', async () => {
      const tree = await runner.runSchematic(
        'address-form',
        baseOptions,
        await createTestApp(runner, {style: 'less'}),
      );
      expect(tree.files).toContain('/projects/material/src/app/foo/foo.component.less');
    });
  });

  describe('inlineStyle option', () => {
    it('should respect the option value', async () => {
      const app = await createTestApp(runner);
      const tree = await runner.runSchematic(
        'address-form',
        {inlineStyle: true, ...baseOptions},
        app,
      );
      expect(tree.files).not.toContain('/projects/material/src/app/foo/foo.component.css');
      expect(tree.readContent('/projects/material/src/app/foo/foo.component.ts')).toContain(
        'styles: [`',
      );
    });

    it('should fall back to the @schematics/angular:component option value', async () => {
      const app = await createTestApp(runner, {inlineStyle: true});
      const tree = await runner.runSchematic('address-form', baseOptions, app);

      expect(tree.files).not.toContain('/projects/material/src/app/foo/foo.component.css');
    });
  });

  describe('inlineTemplate option', () => {
    it('should respect the option value', async () => {
      const app = await createTestApp(runner);
      const tree = await runner.runSchematic(
        'address-form',
        {inlineTemplate: true, ...baseOptions},
        app,
      );
      expect(tree.files).not.toContain('/projects/material/src/app/foo/foo.component.html');
      expect(tree.readContent('/projects/material/src/app/foo/foo.component.ts')).toContain(
        'template: `',
      );
    });

    it('should fall back to the @schematics/angular:component option value', async () => {
      const app = await createTestApp(runner, {inlineTemplate: true});
      const tree = await runner.runSchematic('address-form', baseOptions, app);

      expect(tree.files).not.toContain('/projects/material/src/app/foo/foo.component.html');
    });
  });

  describe('skipTests option', () => {
    it('should respect the option value', async () => {
      const app = await createTestApp(runner);
      const tree = await runner.runSchematic(
        'address-form',
        {skipTests: true, ...baseOptions},
        app,
      );
      expect(tree.files).not.toContain('/projects/material/src/app/foo/foo.component.spec.ts');
    });

    it('should fall back to the @schematics/angular:component option value', async () => {
      const tree = await runner.runSchematic(
        'address-form',
        baseOptions,
        await createTestApp(runner, {skipTests: true}),
      );
      expect(tree.files).not.toContain('/projects/material/src/app/foo/foo.component.spec.ts');
    });
  });
});

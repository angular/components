import {normalize, logging} from '@angular-devkit/core';
import {Tree} from '@angular-devkit/schematics';
import {SchematicTestRunner} from '@angular-devkit/schematics/testing';
import {
  getProjectFromWorkspace,
  getProjectIndexFiles,
  getProjectStyleFile,
  getProjectTargetOptions,
} from '@angular/cdk/schematics';
import {createTestApp, createTestLibrary, getFileContent} from '../../../cdk/schematics/testing';
import {ProjectDefinition, readWorkspace} from '@schematics/angular/utility';
import {COLLECTION_PATH} from '../paths';
import {addPackageToPackageJson} from './package-config';

interface PackageJson {
  dependencies: Record<string, string>;
}

describe('ng-add schematic', () => {
  const baseOptions = {project: 'material'};
  let runner: SchematicTestRunner;
  let appTree: Tree;
  let errorOutput: string[];
  let warnOutput: string[];

  beforeEach(async () => {
    runner = new SchematicTestRunner('schematics', COLLECTION_PATH);
    appTree = await createTestApp(runner, {standalone: false});

    errorOutput = [];
    warnOutput = [];
    runner.logger.subscribe((e: logging.LogEntry) => {
      if (e.level === 'error') {
        errorOutput.push(e.message);
      } else if (e.level === 'warn') {
        warnOutput.push(e.message);
      }
    });
  });

  /** Expects the given file to be in the styles of the specified workspace project. */
  function expectProjectStyleFile(project: ProjectDefinition, filePath: string) {
    expect(getProjectTargetOptions(project, 'build')['styles'])
      .withContext(`Expected "${filePath}" to be added to the project styles in the workspace.`)
      .toContain(filePath);
  }

  it('should update package.json', async () => {
    const tree = await runner.runSchematic('ng-add', baseOptions, appTree);
    const packageJson = JSON.parse(getFileContent(tree, '/package.json')) as PackageJson;
    const dependencies = packageJson.dependencies;
    const angularCoreVersion = dependencies['@angular/core'];

    expect(dependencies['@angular/material']).toBe('~0.0.0-PLACEHOLDER');
    expect(dependencies['@angular/cdk']).toBe('~0.0.0-PLACEHOLDER');
    expect(dependencies['@angular/forms'])
      .withContext('Expected the @angular/forms package to have the same version as @angular/core.')
      .toBe(angularCoreVersion);

    expect(Object.keys(dependencies))
      .withContext('Expected the modified "dependencies" to be sorted alphabetically.')
      .toEqual(Object.keys(dependencies).sort());

    expect(runner.tasks.some(task => task.name === 'node-package'))
      .withContext('Expected the package manager to be scheduled in order to update lock files.')
      .toBe(true);
    expect(runner.tasks.some(task => task.name === 'run-schematic'))
      .withContext('Expected the setup-project schematic to be scheduled.')
      .toBe(true);
  });

  it('should respect version range from CLI ng-add command', async () => {
    // Simulates the behavior of the CLI `ng add` command. The command inserts the
    // requested package version into the `package.json` before the actual schematic runs.
    addPackageToPackageJson(appTree, '@angular/material', '^9.0.0');

    const tree = await runner.runSchematic('ng-add', baseOptions, appTree);
    const packageJson = JSON.parse(getFileContent(tree, '/package.json')) as PackageJson;
    const dependencies = packageJson.dependencies;

    expect(dependencies['@angular/material']).toBe('^9.0.0');
    expect(dependencies['@angular/cdk']).toBe('^9.0.0');
  });

  it('should add default theme', async () => {
    const tree = await runner.runSchematic('ng-add-setup-project', baseOptions, appTree);
    const workspace = await readWorkspace(tree);
    const project = getProjectFromWorkspace(workspace, baseOptions.project);

    expectProjectStyleFile(project, 'projects/material/src/custom-theme.scss');
  });

  it('should support adding a custom theme', async () => {
    // TODO(devversion): do not re-create test app here.
    appTree = await createTestApp(runner, {style: 'scss'});

    const tree = await runner.runSchematic(
      'ng-add-setup-project',
      {...baseOptions, theme: 'azure-blue'},
      appTree,
    );
    const workspace = await readWorkspace(tree);
    const project = getProjectFromWorkspace(workspace, baseOptions.project);
    const expectedStylesPath = normalize(`/${project.root}/src/styles.scss`);

    const buffer = tree.read(expectedStylesPath);
    const themeContent = buffer!.toString();

    expect(themeContent).toContain(`@use '@angular/material' as mat;`);
    expect(themeContent).toContain(`@include mat.theme((`);
  });

  it('should create a custom theme file if no SCSS file could be found', async () => {
    // TODO(devversion): do not re-create test app here.
    appTree = await createTestApp(runner, {style: 'css'});

    const tree = await runner.runSchematic(
      'ng-add-setup-project',
      {...baseOptions, theme: 'azure-blue'},
      appTree,
    );
    const workspace = await readWorkspace(tree);
    const project = getProjectFromWorkspace(workspace, baseOptions.project);
    const expectedStylesPath = normalize(`/${project.root}/src/custom-theme.scss`);

    expect(tree.files)
      .withContext('Expected a custom theme file to be created')
      .toContain(expectedStylesPath);
    expectProjectStyleFile(project, 'projects/material/src/custom-theme.scss');
  });

  it('should add font links', async () => {
    const tree = await runner.runSchematic('ng-add-setup-project', baseOptions, appTree);
    const workspace = await readWorkspace(tree);
    const project = getProjectFromWorkspace(workspace, baseOptions.project);

    const indexFiles = getProjectIndexFiles(project);
    expect(indexFiles.length).toBe(1);

    indexFiles.forEach(indexPath => {
      const buffer = tree.read(indexPath)!;
      const htmlContent = buffer.toString();

      // Ensure that the indentation has been determined properly. We want to make sure that
      // the created links properly align with the existing HTML. Default CLI projects use an
      // indentation of two columns.
      expect(htmlContent).toContain(
        '  <link href="https://fonts.googleapis.com/icon?family=Material+Icons"',
      );
      expect(htmlContent).toContain(
        '  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@' +
          '300;400;500&display=swap"',
      );
    });
  });

  it('should add material app styles', async () => {
    const tree = await runner.runSchematic('ng-add-setup-project', baseOptions, appTree);
    const workspace = await readWorkspace(tree);
    const project = getProjectFromWorkspace(workspace, baseOptions.project);

    const defaultStylesPath = getProjectStyleFile(project)!;
    const htmlContent = tree.read(defaultStylesPath)!.toString();

    expect(htmlContent).toContain('html, body { height: 100%; }');
    expect(htmlContent).toContain(
      'body { margin: 0; font-family: Roboto, "Helvetica Neue", sans-serif; }',
    );
  });

  describe('custom project builders', () => {
    /** Overwrites a target builder for the workspace in the given tree */
    function overwriteTargetBuilder(tree: Tree, targetName: 'build' | 'test', newBuilder: string) {
      const config = {
        version: 1,
        projects: {
          material: {
            projectType: 'application',
            root: 'projects/material',
            sourceRoot: 'projects/material/src',
            prefix: 'app',
            architect: {
              build: {
                builder: '@angular-devkit/build-angular:application',
                options: {
                  outputPath: 'dist/material',
                  index: 'projects/material/src/index.html',
                  browser: 'projects/material/src/main.ts',
                  styles: ['projects/material/src/styles.css'],
                },
              },
              test: {
                builder: '@angular-devkit/build-angular:karma',
                options: {
                  outputPath: 'dist/material',
                  index: 'projects/material/src/index.html',
                  browser: 'projects/material/src/main.ts',
                  styles: ['projects/material/src/styles.css'],
                },
              },
            },
          },
        },
      };

      config.projects.material.architect[targetName].builder = newBuilder;
      tree.overwrite('/angular.json', JSON.stringify(config, null, 2));
    }

    it('should throw an error if the "build" target has been changed', async () => {
      overwriteTargetBuilder(appTree, 'build', 'thirdparty-builder');
      await expectAsync(
        runner.runSchematic('ng-add-setup-project', baseOptions, appTree),
      ).toBeRejected();
    });
  });

  describe('theme files', () => {
    it('should not overwrite existing custom theme files', async () => {
      appTree.create('/projects/material/custom-theme.scss', 'custom-theme');
      const tree = await runner.runSchematic(
        'ng-add-setup-project',
        {...baseOptions, theme: 'azure-blue'},
        appTree,
      );
      expect(tree.readContent('/projects/material/custom-theme.scss'))
        .withContext('Expected the old custom theme content to be unchanged.')
        .toBe('custom-theme');
    });
  });

  describe('using browser builder', () => {
    beforeEach(() => {
      const config = {
        version: 1,
        projects: {
          material: {
            projectType: 'application',
            root: 'projects/material',
            sourceRoot: 'projects/material/src',
            prefix: 'app',
            architect: {
              build: {
                builder: '@angular-devkit/build-angular:browser',
                options: {
                  outputPath: 'dist/material',
                  index: 'projects/material/src/index.html',
                  main: 'projects/material/src/main.ts',
                  styles: ['projects/material/src/styles.css'],
                },
              },
              test: {
                builder: '@angular-devkit/build-angular:karma',
                options: {
                  outputPath: 'dist/material',
                  index: 'projects/material/src/index.html',
                  browser: 'projects/material/src/main.ts',
                  styles: ['projects/material/src/styles.css'],
                },
              },
            },
          },
        },
      };

      appTree.overwrite('/angular.json', JSON.stringify(config, null, 2));
    });

    it('should add a theme', async () => {
      const tree = await runner.runSchematic('ng-add-setup-project', baseOptions, appTree);
      const workspace = await readWorkspace(tree);
      const project = getProjectFromWorkspace(workspace, baseOptions.project);

      expectProjectStyleFile(project, 'projects/material/src/custom-theme.scss');
    });
  });

  describe('using browser-esbuild builder', () => {
    beforeEach(() => {
      const config = {
        version: 1,
        projects: {
          material: {
            projectType: 'application',
            root: 'projects/material',
            sourceRoot: 'projects/material/src',
            prefix: 'app',
            architect: {
              build: {
                builder: '@angular-devkit/build-angular:browser-esbuild',
                options: {
                  outputPath: 'dist/material',
                  index: 'projects/material/src/index.html',
                  main: 'projects/material/src/main.ts',
                  styles: ['projects/material/src/styles.css'],
                },
              },
              test: {
                builder: '@angular-devkit/build-angular:karma',
                options: {
                  outputPath: 'dist/material',
                  index: 'projects/material/src/index.html',
                  browser: 'projects/material/src/main.ts',
                  styles: ['projects/material/src/styles.css'],
                },
              },
            },
          },
        },
      };

      appTree.overwrite('/angular.json', JSON.stringify(config, null, 2));
    });

    it('should add a theme', async () => {
      const tree = await runner.runSchematic('ng-add-setup-project', baseOptions, appTree);
      const workspace = await readWorkspace(tree);
      const project = getProjectFromWorkspace(workspace, baseOptions.project);

      expectProjectStyleFile(project, 'projects/material/src/custom-theme.scss');
    });
  });

  describe('using lower dependency builder', () => {
    beforeEach(() => {
      const config = {
        version: 1,
        projects: {
          material: {
            projectType: 'application',
            root: 'projects/material',
            sourceRoot: 'projects/material/src',
            prefix: 'app',
            architect: {
              build: {
                builder: '@angular/build:application',
                options: {
                  outputPath: 'dist/material',
                  index: 'projects/material/src/index.html',
                  browser: 'projects/material/src/main.ts',
                  styles: ['projects/material/src/styles.css'],
                },
              },
            },
          },
        },
      };

      appTree.overwrite('/angular.json', JSON.stringify(config, null, 2));
    });

    it('should add a theme', async () => {
      const tree = await runner.runSchematic('ng-add-setup-project', baseOptions, appTree);
      const workspace = await readWorkspace(tree);
      const project = getProjectFromWorkspace(workspace, baseOptions.project);

      expectProjectStyleFile(project, 'projects/material/src/custom-theme.scss');
    });
  });
});

describe('ng-add schematic - library project', () => {
  let runner: SchematicTestRunner;
  let libraryTree: Tree;
  let errorOutput: string[];
  let warnOutput: string[];

  beforeEach(async () => {
    runner = new SchematicTestRunner('schematics', require.resolve('../collection.json'));
    libraryTree = await createTestLibrary(runner);

    errorOutput = [];
    warnOutput = [];
    runner.logger.subscribe((e: logging.LogEntry) => {
      if (e.level === 'error') {
        errorOutput.push(e.message);
      } else if (e.level === 'warn') {
        warnOutput.push(e.message);
      }
    });
  });

  it('should warn if a library project is targeted', async () => {
    await runner.runSchematic('ng-add-setup-project', {project: 'material'}, libraryTree);

    expect(errorOutput.length).toBe(0);
    expect(warnOutput.length).toBe(1);
    expect(warnOutput[0]).toMatch(/There is no additional setup required/);
  });
});

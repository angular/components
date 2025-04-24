import {Tree} from '@angular-devkit/schematics';
import {SchematicTestRunner} from '@angular-devkit/schematics/testing';
import {COLLECTION_PATH} from '../paths';
import {createTestApp, getFileContent} from '../testing';

interface PackageJson {
  dependencies: Record<string, string>;
}

/**
 * Sorts the keys of the given object.
 * @returns A new object instance with sorted keys
 */
function sortObjectByKeys(obj: Record<string, string>) {
  return Object.keys(obj)
    .sort()
    .reduce(
      (result, key) => {
        result[key] = obj[key];
        return result;
      },
      {} as Record<string, string>,
    );
}

/** Adds a package to the package.json in the given host tree. */
export function addPackageToPackageJson(host: Tree, pkg: string, version: string): Tree {
  if (host.exists('package.json')) {
    const sourceText = host.read('package.json')!.toString('utf-8');
    const json = JSON.parse(sourceText) as PackageJson;

    if (!json.dependencies) {
      json.dependencies = {};
    }

    if (!json.dependencies[pkg]) {
      json.dependencies[pkg] = version;
      json.dependencies = sortObjectByKeys(json.dependencies);
    }

    host.overwrite('package.json', JSON.stringify(json, null, 2));
  }

  return host;
}

describe('CDK ng-add', () => {
  let runner: SchematicTestRunner;
  let appTree: Tree;

  beforeEach(async () => {
    runner = new SchematicTestRunner('schematics', COLLECTION_PATH);
    appTree = await createTestApp(runner);
  });

  it('should update the package.json', async () => {
    const tree = await runner.runSchematic('ng-add', {}, appTree);
    const packageJson = JSON.parse(getFileContent(tree, '/package.json')) as PackageJson;
    const dependencies = packageJson.dependencies;

    expect(dependencies['@angular/cdk']).toBe('~0.0.0-PLACEHOLDER');
    expect(Object.keys(dependencies))
      .withContext('Expected the modified "dependencies" to be sorted alphabetically.')
      .toEqual(Object.keys(dependencies).sort());
    expect(runner.tasks.some(task => task.name === 'node-package'))
      .withContext('Expected the package manager to be scheduled in order to update lock files.')
      .toBe(true);
  });

  it('should respect version range from CLI ng-add command', async () => {
    // Simulates the behavior of the CLI `ng add` command. The command inserts the
    // requested package version into the `package.json` before the actual schematic runs.
    addPackageToPackageJson(appTree, '@angular/cdk', '^9.0.0');

    const tree = await runner.runSchematic('ng-add', {}, appTree);
    const packageJson = JSON.parse(getFileContent(tree, '/package.json')) as PackageJson;
    const dependencies = packageJson.dependencies;

    expect(dependencies['@angular/cdk']).toBe('^9.0.0');
    expect(runner.tasks.some(task => task.name === 'node-package'))
      .withContext(
        'Expected the package manager to not run since the CDK version ' + 'was already inserted.',
      )
      .toBe(false);
  });
});

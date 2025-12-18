import {sync as glob} from 'glob';
import {join, dirname} from 'path';
import {readFileSync, writeFileSync, mkdirSync} from 'fs';

// When the common CDK harness tests are copied into the Bazel bin, they maintain
// the same relative paths as in the source code which puts them outside of the Angular
// workspace. This file copies the files into the workspace so they can compiled correctly
// and updates some relative imports to be absolute.

const directory = import.meta.dirname;
const targetDirectory = join(directory, 'src', 'cdk-tests');
const testsDirectory = 'src/cdk/testing/tests';
const replacements = new Map([
  // Paths that will be replaced so that they can be resolved against the `node_modules`.
  [`'../../keycodes'`, `'@angular/cdk/keycodes'`],
  [`'../../platform'`, `'@angular/cdk/platform'`],
  [`'../../testing'`, `'@angular/cdk/testing'`],
  [`'../../component-harness'`, `'@angular/cdk/testing'`],
  [`'../../test-element'`, `'@angular/cdk/testing'`],
  [`'../../testing/testbed'`, `'@angular/cdk/testing/testbed'`],
]);

glob(['**/*.ts', '**/*.html'], {
  // Bazel will put the files outside the workspace.
  cwd: join(directory, '../..', testsDirectory),
  absolute: true,
  // Don't copy in any of the tests so that they're not executed.
  // We'll run the shared tests by importing them into `vitest.spec.ts`.
  ignore: ['**/*.spec.ts'],
}).forEach(file => {
  let content = readFileSync(file, 'utf8');
  replacements.forEach((newStr, oldStr) => (content = content.replaceAll(oldStr, newStr)));
  const targetFilename = join(targetDirectory, file.split(testsDirectory).pop());
  mkdirSync(dirname(targetFilename), {recursive: true});
  writeFileSync(targetFilename, content);
});

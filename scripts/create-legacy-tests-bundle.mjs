#!/usr/bin/env node

import babel from '@babel/core';
import child_process from 'child_process';
import esbuild from 'esbuild';
import fs from 'fs';
import {sync as globSync} from 'glob';
import module from 'module';
import {dirname, join, relative} from 'path';
import * as sass from 'sass';
import url from 'url';
import tsNode from 'ts-node';

const containingDir = dirname(url.fileURLToPath(import.meta.url));
const projectDir = join(containingDir, '../');
const packagesDir = join(projectDir, 'src/');
const legacyTsconfigPath = join(projectDir, 'src/tsconfig-legacy.json');

// Some tooling utilities might be written in TS and we do not want to rewrite them
// in JavaScript just for this legacy script. We can use ts-node for such scripts.
tsNode.register({project: join(containingDir, 'tsconfig.json')});

const require = module.createRequire(import.meta.url);
const sassImporterUtil = require('../tools/sass/local-sass-importer.ts');

const distDir = join(projectDir, 'dist/');
const nodeModulesDir = join(projectDir, 'node_modules/');
const outFile = join(distDir, 'legacy-test-bundle.spec.js');
const ngcBinFile = join(nodeModulesDir, '@angular/compiler-cli/bundles/src/bin/ngc.js');
const legacyOutputDir = join(distDir, 'legacy-test-out');

/** Sass importer used for resolving `@angular/<..>` imports. */
const localPackageSassImporter = sassImporterUtil.createLocalAngularPackageImporter(packagesDir);

/**
 * This script builds the whole library in `angular/components` together with its
 * spec files into a single IIFE bundle.
 *
 * The bundle can then be used in the legacy Saucelabs or Browserstack tests. Bundling
 * helps with running the Angular linker on framework packages, and also avoids unnecessary
 * complexity with maintaining module resolution at runtime through e.g. SystemJS.
 */
async function main() {
  // Wait for all Sass compilations to finish.
  await compileSassFiles();

  // Build the project with Ngtsc so that external resources are inlined.
  await compileProjectWithNgtsc();

  const specEntryPointFile = await createEntryPointSpecFile();

  // Copy tsconfig so that ESBuild can leverage its path mappings.
  const esbuildTsconfig = join(legacyOutputDir, 'tsconfig-esbuild.json');
  await fs.promises.cp(join(packagesDir, 'bazel-tsconfig-build.json'), esbuildTsconfig);

  const result = await esbuild.build({
    bundle: true,
    sourceRoot: projectDir,
    platform: 'browser',
    format: 'iife',
    target: 'es2015',
    outfile: outFile,
    treeShaking: false,
    logLevel: 'info',
    tsconfig: esbuildTsconfig,
    plugins: [createLinkerEsbuildPlugin()],
    stdin: {contents: specEntryPointFile, resolveDir: projectDir},
  });

  if (result.errors.length) {
    throw Error('Could not build legacy test bundle. See errors above.');
  }
}

/**
 * Compiles all non-partial Sass files in the project and writes them next
 * to their source files. The files are written into the source root as
 * this simplifies the resolution within the standalone Angular compiler.
 *
 * Given that the legacy tests should only run on CI, it is acceptable to
 * write to the checked-in source tree. The files remain untracked unless
 * explicitly added.
 */
async function compileSassFiles() {
  const sassFiles = globSync('src/**/!(_*|theme).scss', {cwd: projectDir, absolute: true});
  const writeTasks = [];

  let count = 0;
  for (const file of sassFiles) {
    const outRelativePath = relative(projectDir, file).replace(/\.scss$/, '.css');
    const outPath = join(projectDir, outRelativePath);
    const content = renderSassFile(file).css;

    count++;
    console.error(`Compiled ${count}/${sassFiles.length} files`);

    writeTasks.push(async () => {
      console.info('Compiled, now writing:', outRelativePath);
      await fs.promises.mkdir(dirname(outPath), {recursive: true});
      await fs.promises.writeFile(outPath, content);
    });
  }

  // Start all writes and wait for them to finish.
  await Promise.all(writeTasks.map(task => task()));
}

/**
 * Compiles the project using the Angular compiler in order to produce JS output of
 * the packages and tests. This step is important in order to full-compile all
 * exported components of the library (inlining external stylesheets or templates).
 */
async function compileProjectWithNgtsc() {
  // Build the project with Ngtsc so that external resources are inlined.
  const ngcProcess = child_process.spawnSync(
    'node',
    [ngcBinFile, '--project', legacyTsconfigPath],
    {shell: true, stdio: 'inherit'},
  );

  if (ngcProcess.error || ngcProcess.status !== 0) {
    throw Error('Unable to compile tests and library. See error above.');
  }
}

/**
 * Queries for all spec files in the built output and creates a single
 * ESM entry-point file which imports all the spec files.
 *
 * This spec file can then be used as entry-point for ESBuild in order
 * to bundle all specs in an IIFE file.
 */
async function createEntryPointSpecFile() {
  const testFiles = globSync('**/*.spec.js', {absolute: true, cwd: legacyOutputDir});

  let specEntryPointFile = `import './test/angular-test.init.ts';`;
  let i = 0;
  const testNamespaces = [];

  for (const file of testFiles) {
    const relativePath = relative(projectDir, file);
    const specifier = `./${relativePath.replace(/\\/g, '/')}`;
    const testNamespace = `__${i++}`;

    testNamespaces.push(testNamespace);
    specEntryPointFile += `import * as ${testNamespace} from '${specifier}';\n`;
  }

  for (const namespaceId of testNamespaces) {
    // We generate a side-effect invocation that references the test import. This
    // is necessary to trick `ESBuild` in preserving the imports. Unfortunately the
    // test files would be dead-code eliminated otherwise because the specs are part
    // of folders with `package.json` files setting the `"sideEffects: false"` field.
    specEntryPointFile += `new Function('x', 'return x')(${namespaceId});\n`;
  }

  return specEntryPointFile;
}

/** Helper function to render a Sass file. */
function renderSassFile(inputFile) {
  return sass.compile(inputFile, {
    loadPaths: [nodeModulesDir, projectDir],
    importers: [localPackageSassImporter],
  });
}

/** Plugin that links node modules using the Angular compiler CLI. */
function createLinkerEsbuildPlugin() {
  return {
    name: 'ng-link-esbuild',
    setup: build => {
      build.onLoad({filter: /fesm2022/}, async args => {
        const filePath = args.path;
        const content = await fs.promises.readFile(filePath, 'utf8');
        const {code} = await babel.transformAsync(content, {
          filename: filePath,
          compact: false,
          plugins: [['@angular/compiler-cli/linker/babel', {linkerJitMode: true}]],
        });

        return {contents: code};
      });
    },
  };
}

main().catch(e => {
  console.error(e);
  process.exitCode = 1;
});

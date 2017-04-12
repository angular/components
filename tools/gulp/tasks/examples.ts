import {task, watch} from 'gulp';
import {join} from 'path';
import {main as tsc} from '@angular/tsc-wrapped';
import {SOURCE_ROOT, DIST_BUNDLES, DIST_EXAMPLES} from '../constants';
import {sequenceTask, sassBuildTask, copyTask, triggerLivereload} from '../util/task_helpers';
import {createRollupBundle} from '../util/rollup-helper';
import {transpileFile} from '../util/ts-compiler';
import {buildModuleEntry, composeRelease} from '../util/package-build';
import {ScriptTarget, ModuleKind} from 'typescript';
import {writeFileSync} from 'fs';

// There are no type definitions available for these imports.
const inlineResources = require('../../../scripts/release/inline-resources');
const uglify = require('uglify-js');

const examplesRoot = join(SOURCE_ROOT, 'examples');
const tsconfigPath = join(examplesRoot, 'tsconfig-build.json');

// Paths to the different output directories.
const examplesOut = DIST_EXAMPLES;
const bundlesDir = DIST_BUNDLES;

const examplesMain = join(examplesOut, 'public_api.js');

task('examples:clean-build', sequenceTask('clean', 'examples:build'));

task('examples:build', sequenceTask(
  // The examples depend on the library. Build the library first.
  'library:build',
  // Build ESM and copy HTML assets to the dist.
  ['examples:build:esm', 'examples:assets:html'],
  // Inline assets into ESM output.
  'examples:assets:inline',
  // Build bundles on top of inlined ESM output.
  'examples:build:bundles',
));

task('examples:release', ['examples:clean-build'], () => composeRelease('examples'));

/**
 * TypeScript compilation tasks. Tasks are creating ESM, FESM, UMD bundles for releases.
 **/

task('examples:build:esm', () => tsc(tsconfigPath, {basePath: examplesRoot}));
task('examples:build:bundles', () => buildModuleEntry(examplesMain, 'examples'));

/**
 * Asset tasks. Copying and inlining CSS, HTML files into the ESM output.
 **/

task('examples:assets:html', copyTask(join(examplesRoot, '**/*.+(html|css)'), examplesOut));
task('examples:assets:inline', () => inlineResources(examplesOut));

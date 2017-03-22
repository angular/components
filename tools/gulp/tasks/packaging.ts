import {join} from 'path';
import {task, watch} from 'gulp';
import {main as ngc} from '@angular/compiler-cli';
import {PROJECT_ROOT, COMPONENTS_DIR} from '../constants';
import {SOURCE_ROOT, DIST_BUNDLES, DIST_MATERIAL, UGLIFYJS_OPTIONS} from '../constants';
import {sequenceTask} from '../util/task_helpers';

// There are no type definitions available for these imports.
const runSequence = require('run-sequence');


const libraryRoot = join(SOURCE_ROOT, 'lib');
const tsconfigPath = join(libraryRoot, 'tsconfig.json');

task('build:package', sequenceTask(
  'clean',
  ['build:package:ngc', 'library:assets'],
  // Inline assets into ESM output.
  'library:assets:inline',
));


task('build:package:ngc', () => ngc(tsconfigPath, {basePath: libraryRoot}));

import * as gulp from 'gulp';
import * as path from 'path';
import gulpMerge = require('merge2');

import {srcDir, DIST_COMPONENTS_ROOT, PROJECT_ROOT} from '../constants';
import {sassBuildTask, tsBuildTask, execTask, copyTask} from '../task_helpers';

// No typings for this.
const inlineResources = require('../../../scripts/release/inline-resources');

const componentsDir = path.join(srcDir, 'lib');


export function watchComponents() {
  gulp.watch(path.join(componentsDir, '**/*.ts'), [':build:components:ts']);
  gulp.watch(path.join(componentsDir, '**/*.scss'), [':build:components:scss']);
  gulp.watch(path.join(componentsDir, '**/*.html'), [':build:components:assets']);
}


gulp.task(':build:components:ts', tsBuildTask(componentsDir));

gulp.task(':build:components:assets',
          copyTask(path.join(componentsDir, '*/**/*.!(ts|spec.ts)'), DIST_COMPONENTS_ROOT));

gulp.task(':build:components:scss', sassBuildTask(
  DIST_COMPONENTS_ROOT, componentsDir, [path.join(componentsDir, 'core/style')]
));

gulp.task('build:components', [
  ':build:components:ts',
  ':build:components:assets',
  ':build:components:scss'
], function() {
  inlineResources([DIST_COMPONENTS_ROOT]);
});

gulp.task(':build:components:ngc', ['build:components'], execTask(
  '@angular/compiler-cli', 'ngc', ['-p', path.relative(PROJECT_ROOT, componentsDir)]
));

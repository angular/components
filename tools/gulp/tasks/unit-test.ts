import gulp = require('gulp');
import path = require('path');
import gulpMerge = require('merge2');

import {PROJECT_ROOT, DIST_COMPONENTS_ROOT} from '../constants';
import {sequenceTask} from '../task_helpers';

const karma = require('karma');
const runSequence = require('run-sequence');

gulp.task(':build:test:vendor', function() {
  const npmVendorFiles = [
    '@angular', 'core-js/client', 'hammerjs', 'rxjs', 'systemjs/dist', 'zone.js/dist'
  ];

  return gulpMerge(
    npmVendorFiles.map(function(root) {
      const glob = path.join(root, '**/*.+(js|js.map)');
      return gulp.src(path.join('node_modules', glob))
        .pipe(gulp.dest(path.join('dist/vendor', root)));
    }));
});

gulp.task(':test:deps', sequenceTask(
  'clean',
  [
    ':build:test:vendor',
    ':build:components:assets',
    ':build:components:scss',
    ':build:components:spec',
  ]
));

gulp.task(':test:watch', sequenceTask(':test:deps', ':watch:components:spec'));

gulp.task(':test:deps:inline', sequenceTask(':test:deps', ':inline-resources'));

// Use `gulp test` when running unit tests locally. This uses watch mode to recompile
// tests and does not inline resources.
gulp.task('test', [':test:watch'], (done: () => void) => {
  new karma.Server({
    configFile: path.join(PROJECT_ROOT, 'test/karma.conf.js')
  }, done).start();
});

// Use `gulp test:single-run` for ci. This will not watch sources and will incline resources.
gulp.task('test:single-run', [':test:deps:inline'], (done: () => void) => {
  new karma.Server({
    configFile: path.join(PROJECT_ROOT, 'test/karma.conf.js'),
    singleRun: true
  }, done).start();
});

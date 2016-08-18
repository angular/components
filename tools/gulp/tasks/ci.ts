import gulp = require('gulp');
import {execTask} from '../task_helpers';


gulp.task('ci:lint', ['ci:forbidden-identifiers', 'lint']);
gulp.task('ci:test', ['test:single-run'], function() {
  process.exit(0);
});
gulp.task('ci:e2e', ['e2e']);
gulp.task('ci:extract-metadata', [':build:components:ngc']);
gulp.task('ci:forbidden-identifiers', function() {
  require('../../../scripts/ci/forbidden-identifiers.js');
});

gulp.task('ci:check-circular-deps', ['build:release'], execTask('madge', ['--circular', './dist']));

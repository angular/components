import gulp = require('gulp');


gulp.task('ci:lint', ['lint']);
gulp.task('ci:test', ['test:single-run'], function() {
  process.exit(0);
});
gulp.task('ci:e2e', ['e2e']);
gulp.task('ci:extract-metadata', [':build:components:ngc']);
gulp.task('ci:forbidden-identifiers', function() {
  require('../../../scripts/ci/forbidden-identifiers.js');
});

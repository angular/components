import gulp = require('gulp');


gulp.task('docs', [':docs:md-to-html']);
gulp.task(':docs:md-to-html', () => {
  return gulp.src(['*.md'])
});

import gulp = require('gulp');
const markdown = require('gulp-markdown');
const transform = require('gulp-transform');


const EXAMPLE_PATTERN = /<!--\W*example\(([^)]+)\)\W*-->/g;


gulp.task('docs', () => {
  return gulp.src(['src/lib/**/*.md'])
      .pipe(markdown())
      .pipe(transform((content: string) =>
          content.toString().replace(EXAMPLE_PATTERN, (match: string, name: string) =>
              `<div example="${name}"></div>`)))
      .pipe(gulp.dest('dist/docs'));
});

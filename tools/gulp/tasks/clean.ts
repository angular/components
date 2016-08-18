import {src, task} from 'gulp';
const gulpClean = require('gulp-clean');


task('clean', function() {
  return src('dist', { read: false })
    .pipe(gulpClean());
});
task(':clean:spec', function() {
  return src('dist/**/*.spec.*', { read: false })
    .pipe(gulpClean());
});
task(':clean:assets', function() {
  return src('dist/**/*+(.html|.css)', { read: false })
    .pipe(gulpClean());
});

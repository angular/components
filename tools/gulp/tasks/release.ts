import gulp = require('gulp');
import gulpRunSequence = require('run-sequence');


gulp.task('build:release', function(done: () => void) {
  // Synchronously run those tasks.
  gulpRunSequence(
    'clean',
    ':build:components:ngc',
    [':clean:spec', ':clean:assets'],
    done
  );
});

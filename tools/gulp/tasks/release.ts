import child_process = require('child_process');
import fs = require('fs');
import gulp = require('gulp');
import gulpRunSequence = require('run-sequence');
import path = require('path');

import {execTask} from '../task_helpers';
import {DIST_COMPONENTS_ROOT} from '../constants';


gulp.task('build:release', function(done: () => void) {
  // Synchronously run those tasks.
  gulpRunSequence(
    'clean',
    ':build:components:ngc',
    [':clean:spec', ':clean:assets'],
    done
  );
});


/** Make sure we're logged in. */
gulp.task(':publish:whoami', execTask('npm', ['whoami'], {
  silent: true,
  errMessage: 'You must be logged in to publish.'
}));
gulp.task(':publish:logout', execTask('npm', ['logout']));
gulp.task(':publish', function(done: () => void) {
  const exec: any = child_process.execSync;
  const currentDir = process.cwd();

  fs.readdirSync(DIST_COMPONENTS_ROOT)
    .forEach(dirName => {
      const componentPath = path.join(DIST_COMPONENTS_ROOT, dirName);
      const stat = fs.statSync(componentPath);

      if (!stat.isDirectory()) {
        return;
      }

      process.chdir(componentPath);
      exec('npm publish');
    });
  process.chdir(currentDir);
});

gulp.task('publish', function(done: () => void) {
  gulpRunSequence(
    ':publish:whoami',
    'build:release',
    ':publish',
    ':publish:logout',
    done
  );
});

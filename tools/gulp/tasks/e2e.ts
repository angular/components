import * as gulp from 'gulp';
import * as path from 'path';
import gulpMerge = require('merge2');
import gulpRunSequence = require('run-sequence');

import {SOURCE_ROOT, DIST_ROOT, PROJECT_ROOT, NPM_VENDOR_FILES} from '../constants';
import {tsBuildTask, sassBuildTask, copyTask, buildAppTask, execNodeTask} from '../task_helpers';
import {watchComponents} from './components';

const gulpServer = require('gulp-server-livereload');


const appDir = path.join(SOURCE_ROOT, 'e2e-app');
const outDir = DIST_ROOT;


export function watchE2eApp() {
  gulp.watch(path.join(appDir, '**/*.ts'), [':build:e2eapp:ts']);
  gulp.watch(path.join(appDir, '**/*.scss'), [':build:e2eapp:scss']);
  gulp.watch(path.join(appDir, '**/*.html'), [':build:e2eapp:assets']);
}

gulp.task(':build:e2eapp:vendor', function() {
  return gulpMerge(
    NPM_VENDOR_FILES.map(function(root) {
      const glob = path.join(root, '**/*.+(js|js.map)');
      return gulp.src(path.join('node_modules', glob))
        .pipe(gulp.dest(path.join('dist/vendor', root)));
    }));
});

gulp.task(':build:e2eapp:ts', [':build:components:ts'], tsBuildTask(appDir));
gulp.task(':build:e2eapp:scss', [':build:components:scss'], sassBuildTask(outDir, appDir, []));
gulp.task(':build:e2eapp:assets', copyTask(appDir, outDir));

gulp.task('build:e2eapp', buildAppTask('e2eapp'));


let stopE2eServer: () => void = null;
gulp.task('serve:e2eapp', ['build:e2eapp'], function() {
  const stream = gulp.src('dist')
    .pipe(gulpServer({
      livereload: false,
      fallback: 'index.html',
      port: 4200
    }));

  watchComponents();
  watchE2eApp();

  stopE2eServer = () => { stream.emit('kill'); };
  return stream;
});

gulp.task(':serve:e2eapp:stop', function() {
  if (stopE2eServer) {
    stopE2eServer();
  }
});

gulp.task(':test:protractor:setup', execNodeTask('protractor', 'webdriver-manager', ['update']));

gulp.task(':test:protractor', execNodeTask(
  'protractor', [path.join(PROJECT_ROOT, 'test/protractor.conf.js')]
));

gulp.task(':e2e:done', function() {
  process.exit(0);
});

gulp.task('e2e', function(done: () => void) {
  gulpRunSequence(
    ':test:protractor:setup',
    'serve:e2eapp',
    ':test:protractor',
    ':serve:e2eapp:stop',
    ':e2e:done',
    done
  );
});

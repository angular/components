import * as gulp from 'gulp';
import * as path from 'path';

import gulpMerge = require('merge2');
const gulpServer = require('gulp-server-livereload');

import {DIST_ROOT, NPM_VENDOR_FILES, SOURCE_ROOT} from '../constants';
import {sassBuildTask, tsBuildTask, copyTask, buildAppTask} from '../task_helpers';
import {watchComponents} from './components';


const appDir = path.join(SOURCE_ROOT, 'demo-app');
const outDir = DIST_ROOT;


export function watchDevelopmentApp() {
  gulp.watch(path.join(appDir, '**/*.ts'), [':build:devapp:ts']);
  gulp.watch(path.join(appDir, '**/*.scss'), [':build:devapp:scss']);
  gulp.watch(path.join(appDir, '**/*.html'), [':build:devapp:assets']);
}


gulp.task(':build:devapp:vendor', function() {
  return gulpMerge(
    NPM_VENDOR_FILES.map(function(root) {
      const glob = path.join(root, '**/*.+(js|js.map)');
      return gulp.src(path.join('node_modules', glob))
        .pipe(gulp.dest(path.join('dist/vendor', root)));
    }));
});


gulp.task(':build:devapp:ts', [':build:components:ts'], tsBuildTask(appDir));
gulp.task(':build:devapp:scss', [':build:components:scss'], sassBuildTask(outDir, appDir, []));
gulp.task(':build:devapp:assets', copyTask(appDir, outDir));

gulp.task('build:devapp', buildAppTask('devapp'));

gulp.task('serve:devapp', ['build:devapp'], function() {
  const stream = gulp.src('dist')
    .pipe(gulpServer({
      livereload: true,
      fallback: 'index.html',
      port: 4200
    }));

  watchComponents();
  watchDevelopmentApp();
  return stream;
});


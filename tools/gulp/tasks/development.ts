import {task, watch} from 'gulp';
import {DIST_ROOT, SOURCE_ROOT, PROJECT_ROOT, DIST_BUNDLES, DIST_MATERIAL} from '../constants';
import {
  sassBuildTask, tsBuildTask, copyTask, buildAppTask, sequenceTask, triggerLivereload,
  serverTask
} from '../util/task_helpers';
import {join} from 'path';
import {copyFiles} from '../util/copy-files';

const appDir = join(SOURCE_ROOT, 'demo-app');
const outDir = join(DIST_ROOT, 'packages', 'demo-app');

/** Array of vendors that are required to serve the demo-app. */
const appVendors = [
  '@angular', 'systemjs', 'zone.js', 'rxjs', 'hammerjs', 'core-js', 'web-animations-js'
];

/** Glob that matches all required vendors for the demo-app. */
const vendorGlob = `+(${appVendors.join('|')})/**/*.+(html|css|js|map)`;

task(':watch:devapp', () => {
  watch(join(appDir, '**/*.ts'), [':build:devapp:ts', triggerLivereload]);
  watch(join(appDir, '**/*.scss'), [':build:devapp:scss', triggerLivereload]);
  watch(join(appDir, '**/*.html'), [':build:devapp:assets', triggerLivereload]);
});

/** Path to the demo-app tsconfig file. */
const tsconfigPath = join(appDir, 'tsconfig-build.json');

task(':build:devapp:ts', tsBuildTask(tsconfigPath));
task(':build:devapp:scss', sassBuildTask(outDir, appDir));
task(':build:devapp:assets', copyTask(appDir, outDir));
task('build:devapp', buildAppTask('devapp'));

task(':serve:devapp', serverTask(outDir, true));

task('serve:devapp', ['build:devapp'], sequenceTask(
  [':serve:devapp', 'material:watch', ':watch:devapp']
));

/** Task that copies all vendors into the demo-app package. Allows hosting the app on firebase. */
task('build-deploy:devapp', ['build:devapp'], () => {
  copyFiles(join(PROJECT_ROOT, 'node_modules'), vendorGlob, join(outDir, 'node_modules'));
  copyFiles(DIST_BUNDLES, '*.+(js|map)', join(outDir, 'dist/bundles'));
  copyFiles(DIST_MATERIAL, '**/prebuilt/*.+(css|map)', join(outDir, 'dist/packages/material'));
});

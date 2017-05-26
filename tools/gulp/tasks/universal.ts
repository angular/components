import {task} from 'gulp';
import {DIST_RELEASES, DIST_ROOT, SOURCE_ROOT} from '../constants';
import {
  sassBuildTask, ngcBuildTask, tsBuildTask, copyTask, sequenceTask, execTask,
} from '../util/task_helpers';
import {join} from 'path';
import {copySync} from 'fs-extra';

const appDir = join(SOURCE_ROOT, 'universal-app');
const outDir = join(DIST_ROOT, 'packages', 'universal-app');

/** Path to the universal-app tsconfig files. */
const tsconfigAppPath = join(appDir, 'tsconfig-build.json');
const tsconfigServerPath = join(outDir, 'tsconfig-server.json');

/** Glob that matches all assets that need to copied to the dist. */
const assetsGlob = join(appDir, '**/*.+(html|css|json)');

/** Glob that matches all server files that should be copied to the dist. */
const serverGlob = join(appDir, 'server.ts');

/** Path to the compiled server file. Running this file just dumps the HTML output for now. */
const serverFile = join(outDir, 'server.js');

task('universal:test', ['universal:build'], execTask('node', [serverFile]));

task('universal:build', sequenceTask(
  'clean',
  ['material:build-release', 'cdk:build-release'],
  'universal:copy-release',
  ['universal:build-app', 'universal:copy-server-files'],
  'universal:build-server-ts'
));

task('universal:build-app', sequenceTask(
  ['universal:build-app-ts', 'universal:build-app-scss', 'universal:copy-app-assets']
));

task('universal:build-app-ts', ngcBuildTask(tsconfigAppPath));
task('universal:build-app-scss', sassBuildTask(outDir, appDir));
task('universal:copy-app-assets', copyTask(assetsGlob, outDir));

task('universal:build-server-ts', tsBuildTask(tsconfigServerPath));
task('universal:copy-server-files', copyTask(serverGlob, outDir));

// As a workaround for https://github.com/angular/angular/issues/12249, we need to
// copy the Material and CDK ESM output inside of the universal-app output.
task('universal:copy-release', () => {
  copySync(join(DIST_RELEASES, 'material'), join(outDir, 'material'));
  copySync(join(DIST_RELEASES, 'cdk'), join(outDir, 'cdk'));
});

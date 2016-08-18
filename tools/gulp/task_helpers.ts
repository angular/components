import * as child_process from 'child_process';
import * as fs from 'fs';
import * as gulp from 'gulp';
import * as gulpTs from 'gulp-typescript';
import * as path from 'path';


/** Those imports lack typings. */
const gulpMerge = require('merge2');
const gulpRunSequence = require('run-sequence');
const gulpSass = require('gulp-sass');
const gulpSourcemaps = require('gulp-sourcemaps');
const resolveBin = require('resolve-bin');


/** If the string passed in is a glob, returns it, otherwise append '**\/*' to it. */
function _globify(maybeGlob: string, suffix = '**/*') {
  return maybeGlob.indexOf('*') != -1 ? maybeGlob : path.join(maybeGlob, suffix);
}


/** Create a TS Build Task, based on the options. */
export function tsBuildTask(tsConfigPath: string) {
  const tsConfigDir = tsConfigPath;
  if (fs.existsSync(path.join(tsConfigDir, 'tsconfig.json'))) {
    // Append tsconfig.json
    tsConfigPath = path.join(tsConfigDir, 'tsconfig.json');
  }

  return () => {
    const tsConfig: any = JSON.parse(fs.readFileSync(tsConfigPath, 'utf-8'));
    const dest: string = path.join(tsConfigDir, tsConfig['compilerOptions']['outDir']);

    const tsProject = gulpTs.createProject(tsConfigPath, {
      typescript: require('typescript')
    });

    let pipe = tsProject.src()
      .pipe(gulpSourcemaps.init())
      .pipe(gulpTs(tsProject));
    let dts = pipe.dts.pipe(gulp.dest(dest));

    return gulpMerge([
      dts,
      pipe
        .pipe(gulpSourcemaps.write('.'))
        .pipe(gulp.dest(dest))
    ]);
  };
}


/** Create a SASS Build Task. */
export function sassBuildTask(dest: string, root: string, includePaths: string[]) {
  const sassOptions = { includePaths };

  return () => {
    return gulp.src(_globify(root, '**/*.scss'))
      .pipe(gulpSourcemaps.init())
      .pipe(gulpSass(sassOptions).on('error', gulpSass.logError))
      .pipe(gulpSourcemaps.write('.'))
      .pipe(gulp.dest(dest));
  };
}


/** Create a Gulp task that executes a process. */
export interface ExecTaskOptions {
  silent?: boolean;
  errMessage?: string;
}

export function execTask(binPath: string, args: string[], options: ExecTaskOptions = {}) {
  return (done: (err?: string) => void) => {
    const childProcess = child_process.spawn(binPath, args);

    if (!options.silent) {
      childProcess.stdout.on('data', (data: string) => {
        process.stdout.write(data);
      });

      childProcess.stderr.on('data', (data: string) => {
        process.stderr.write(data);
      });
    }

    childProcess.on('close', (code: number) => {
      if (code != 0) {
        if (options.errMessage === undefined) {
          done('Process failed with code ' + code);
        } else {
          done(options.errMessage);
        }
        return;
      }
      done();
    });
  }
}

export function execNodeTask(packageName: string, executable: string[] | string, args?: string[]) {
  if (!args) {
    args = <string[]>executable;
    executable = undefined;
  }

  return (done: () => void) => {
    resolveBin(packageName, { executable: executable }, function (err: any, binPath: string) {
      if (err) {
        console.error(err);
        throw err;
      }

      // Forward to execTask.
      execTask(binPath, args)(done);
    });
  }
}


/** Copy files from a glob to a destination. */
export function copyTask(srcGlobOrDir: string, outRoot: string) {
  return () => {
    return gulp.src(path.join(_globify(srcGlobOrDir))).pipe(gulp.dest(outRoot));
  }
}


/** Build an task that depends on all application build tasks. */
export function buildAppTask(appName: string) {
  const buildTasks = ['vendor', 'ts', 'scss', 'assets']
    .map(taskName => `:build:${appName}:${taskName}`);

  return (done: () => void) => {
    gulpRunSequence(
      'clean',
      ['build:components', ...buildTasks],
      done
    );
  };
}

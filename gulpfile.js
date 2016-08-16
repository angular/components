'use strict';
/**
 * This file needs to be JavaScript and is read by gulp.
 */
// Global imports.
const child_process = require('child_process');
const fs = require('fs');
const gulp = require('gulp');
const path = require('path');
const resolveBin = require('resolve-bin');

// Other imports.
const inlineResources = require('./scripts/release/inline-resources');
const karma = require('karma');

// Gulp plugins.
const gulpClean = require('gulp-clean');
const gulpServer = require('gulp-server-livereload');
const gulpMerge = require('merge2');
const gulpRunSequence = require('run-sequence');
const gulpSass = require('gulp-sass');
const gulpSourcemaps = require('gulp-sourcemaps');
const gulpTs = require('gulp-typescript');


// Directories.
const srcDir = path.join(__dirname, 'src');
const componentsDir = path.join(srcDir, 'lib');
const devAppDir = path.join(srcDir, 'demo-app');
const e2eAppDir = path.join(srcDir, 'e2e-app');

const outDir = 'dist';
const outLibDir = path.join(outDir, '@angular2-material');


/**
 * Create a TS Build Task, based on the options.
 */
function createTsBuildTask(options) {
  const tsConfigDir = options.tsConfigPath;
  const tsConfigPath = path.join(tsConfigDir, 'tsconfig.json');
  const tsConfig = JSON.parse(fs.readFileSync(tsConfigPath, 'utf-8'));
  const dest = path.join(tsConfigDir, tsConfig.compilerOptions.outDir);

  return function() {
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

/**
 * Create a SASS Build Task.
 */
function createSassBuildTask(options) {
  const dest = options.dest;
  const glob = path.join(options.root, '**/*.scss');
  const sassOptions = {
    includePaths: options.includePaths
  };

  return function() {
    return gulp.src(glob)
      .pipe(gulpSourcemaps.init())
      .pipe(gulpSass(sassOptions).on('error', gulpSass.logError))
      .pipe(gulpSourcemaps.write(dest))
      .pipe(gulp.dest(dest));
  };
}


/**
 * Create a Gulp task that executes a process.
 */
function createExecTask(packageName, executable, args) {
  if (!args) {
    args = executable;
    executable = undefined;
  }
  return function(done) {
    resolveBin(packageName, { executable: executable }, function (err, binPath) {
      child_process.exec(`${binPath} ${args.join(' ')}`, function (error) {
        if (error) {
          console.error(error);
          throw error;
        } else {
          done();
        }
      });
    });
  }
}

/***************************************************************************************************
 * Components Build Tasks.
 */
gulp.task(':build:components:ts', createTsBuildTask({ tsConfigPath: componentsDir }));
gulp.task(':build:components:assets', function() {
  return gulp.src(path.join(componentsDir, '*/**/*.!(ts|spec.ts)'))
    .pipe(gulp.dest(outLibDir));
});
gulp.task(':build:components:scss', function() {
  const cssTask = createSassBuildTask({
    dest: outLibDir,
    root: componentsDir,
    includePaths: path.join(componentsDir, 'core/style')
  });
  // Also copy over the SCSS for the components.
  return gulpMerge([
    cssTask(),
    gulp.src(path.join(componentsDir, '**/*.scss'))
      .pipe(gulp.dest(outLibDir))
  ]);
});
gulp.task('build:components', [
  ':build:components:ts',
  ':build:components:assets',
  ':build:components:scss'
], function() {
  inlineResources([outLibDir]);
});
gulp.task(':build:components:ngc', ['build:components'], createExecTask(
  '@angular/compiler-cli', 'ngc', ['-p', path.relative(__dirname, componentsDir)]
));


/***************************************************************************************************
 * Vendor files Build Tasks.
 */
gulp.task(':build:vendor', function() {
  const npmVendorFiles = [
    'core-js/client', 'zone.js/dist', 'hammerjs', 'systemjs/dist', 'rxjs', '@angular', 'hammerjs'
  ];

  return gulpMerge(
    npmVendorFiles.map(function(root) {
      const glob = path.join(root, '**/*.+(js|js.map)');
      return gulp.src(path.join('node_modules', glob))
        .pipe(gulp.dest(path.join('dist/vendor', root)));
    }));
});


/***************************************************************************************************
 * DevApp Build Tasks.
 */
gulp.task(':build:devapp:ts', [':build:components:ts'], createTsBuildTask({ tsConfigPath: devAppDir }));
gulp.task(':build:devapp:scss', [':build:components:scss'], createSassBuildTask({
  dest: outDir,
  root: devAppDir,
  // Change this once we have a better strategy for releasing SCSS files.
  includePaths: [
    path.join(componentsDir, 'core/style'),
    componentsDir
  ]
}));
gulp.task(':build:devapp:assets', function() {
  return gulp.src(path.join(devAppDir, '**/*'))
    .pipe(gulp.dest(outDir));
});

gulp.task('build:devapp', [
  'build:components',
  ':build:vendor',
  ':build:devapp:ts',
  ':build:devapp:scss',
  ':build:devapp:assets'
]);

/***************************************************************************************************
 * DevApp Build Tasks.
 */
gulp.task(':build:e2eapp:ts', [':build:components:ts'], createTsBuildTask({ tsConfigPath: e2eAppDir }));
gulp.task(':build:e2eapp:scss', [':build:components:scss'], createSassBuildTask({
  dest: outDir,
  root: e2eAppDir,
  // Change this once we have a better strategy for releasing SCSS files.
  includePaths: [
    path.join(componentsDir, 'core/style'),
    componentsDir
  ]
}));
gulp.task(':build:e2eapp:assets', function() {
  return gulp.src(path.join(e2eAppDir, '**/*'))
    .pipe(gulp.dest(outDir));
});

gulp.task('build:e2eapp', [
  'build:components',
  ':build:vendor',
  ':build:e2eapp:ts',
  ':build:e2eapp:scss',
  ':build:e2eapp:assets'
]);


/***************************************************************************************************
 * Global tasks.
 */
gulp.task('default', ['help']);

gulp.task('help', function() {
  const tasks = Object.keys(gulp.tasks)
    .filter(x => !x.startsWith(':'))
    .filter(x => !x.startsWith('ci:'))
    .filter(x => x != 'default')
    .sort();

  console.log(`\nHere's a list of supported tasks:\n   `, tasks.join('\n    '));
  console.log(`\nYou're probably looking for "test" or "serve:devapp".\n\n`);
});

gulp.task('build', ['build:devapp']);

gulp.task('clean', function() {
  return gulp.src('dist', { read: false })
    .pipe(gulpClean());
});
gulp.task(':clean:spec', function() {
  return gulp.src('dist/**/*.spec.*', { read: false })
    .pipe(gulpClean());
});
gulp.task(':clean:assets', function() {
  return gulp.src('dist/**/*+(.html|.css)', { read: false })
    .pipe(gulpClean());
});

gulp.task('lint', createExecTask('tslint', ['-c', 'tslint.json', '\'src/**/*.ts\'']));
gulp.task('stylelint', createExecTask(
  'stylelint', ['stylelint', '\'src/**/*.scss\'', '--config stylelint-config.json', '--syntax scss']
));

/***************************************************************************************************
 * Watch Tasks.
 */
gulp.task(':watch:components', ['build:components'], function() {
  return gulp.watch(path.join(componentsDir, '**/*'), ['build:components']);
});


/***************************************************************************************************
 * Serve Tasks.
 */
gulp.task('serve:devapp', ['build:devapp'], function() {
  const stream = gulp.src('dist')
    .pipe(gulpServer({
      livereload: true,
      fallback: 'index.html',
      port: 4200
    }));

  gulp.watch(path.join(componentsDir, '**/*.ts'), [':build:components:ts']);
  gulp.watch(path.join(componentsDir, '**/*.scss'), [':build:components:scss']);
  gulp.watch(path.join(componentsDir, '**/*.html'), [':build:components:assets']);
  gulp.watch(path.join(devAppDir, '**/*.ts'), [':build:devapp:ts']);
  gulp.watch(path.join(devAppDir, '**/*.scss'), [':build:devapp:scss']);
  gulp.watch(path.join(devAppDir, '**/*.html'), [':build:devapp:assets']);

  return stream;
});


let stopE2eServer = null;
gulp.task('serve:e2eapp', ['build:e2eapp'], function(done) {
  const stream = gulp.src('dist')
    .pipe(gulpServer({
      livereload: false,
      fallback: 'index.html',
      port: 4200
    }));

  gulp.watch(path.join(componentsDir, '**/*.ts'), [':build:components:ts']);
  gulp.watch(path.join(componentsDir, '**/*.scss'), [':build:components:scss']);
  gulp.watch(path.join(componentsDir, '**/*.html'), [':build:components:assets']);
  gulp.watch(path.join(e2eAppDir, '**/*.ts'), [':build:e2eapp:ts']);
  gulp.watch(path.join(e2eAppDir, '**/*.scss'), [':build:e2eapp:scss']);
  gulp.watch(path.join(e2eAppDir, '**/*.html'), [':build:e2eapp:assets']);

  stopE2eServer = function() {
    stream.emit('kill');
    done();
  };
});

gulp.task(':serve:e2eapp:stop', function() {
  if (stopE2eServer) {
    stopE2eServer();
  }
});


/***************************************************************************************************
 * Tests.
 */
gulp.task('test', [':build:vendor', 'build:components'], function(done) {
  new karma.Server({
    configFile: path.join(__dirname, 'test/karma.conf.js')
  }, done).start();
});

gulp.task('test:single-run', [':build:vendor', 'build:components'], function(done) {
  new karma.Server({
    configFile: path.join(__dirname, 'test/karma.conf.js'),
    singleRun: true
  }, done).start();
});

gulp.task(':test:protractor:setup', createExecTask('protractor', 'webdriver-manager', ['update']));

gulp.task(':test:protractor', createExecTask(
  'protractor', [path.join(__dirname, 'test/protractor.conf.js')]
));

gulp.task(':test:protractor:and-stop', function(done) {
  gulpRunSequence(
    ':test:protractor',
    ':serve:e2eapp:stop',
    done
  );
});

gulp.task(':e2e:done', function() {
  process.exit(0);
});

gulp.task('e2e', function(done) {
  gulpRunSequence(
    ':test:protractor:setup',
    ['serve:e2eapp', ':test:protractor:and-stop'],
    ':e2e:done',
    done
  );
});


/***************************************************************************************************
 * Release builds.
 */
gulp.task('build:release', function(done) {
  // Synchronously run those tasks.
  gulpRunSequence(
    'clean',
    ':build:components:ngc',
    [':clean:spec', ':clean:assets'],
    done
  );
});


/***************************************************************************************************
 * Continuous Integration.
 */
gulp.task('ci:lint', ['lint', 'stylelint']);
gulp.task('ci:test', ['test:single-run']);
gulp.task('ci:e2e', ['e2e']);
gulp.task('ci:extract-metadata', [':build:components:ngc']);
gulp.task('ci:forbidden-identifiers', function() {
  require('./scripts/ci/forbidden-identifiers.js');
});

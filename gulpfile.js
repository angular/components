'use strict';
/**
 * This file needs to be JavaScript and is read by gulp.
 */
// Global imports.
const fs = require('fs');
const gulp = require('gulp');
const path = require('path');

// Other imports.
const inlineResources = require('./scripts/release/inline-resources');

// Gulp plugins.
const gulpClean = require('gulp-clean');
const gulpTs = require('gulp-typescript');
const gulpMerge = require('merge2');
const gulpSass = require('gulp-sass');
const gulpSourcemaps = require('gulp-sourcemaps');
const gulpLiveServer = require('gulp-live-server');


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
function makeTsBuildTask(options) {
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

    if (tsConfig.compilerOptions.sourceMap) {
      if (!tsConfig.compilerOptions.inlineSources) {
        pipe = pipe.pipe(gulpSourcemaps.write(dest));
      } else {
        pipe = pipe.pipe(gulpSourcemaps.write());
      }
    }

    return gulpMerge([dts, pipe.pipe(gulp.dest(dest))]);
  };
}

/**
 * Create a SASS Build Task.
 */
function makeSassBuildTask(options) {
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


/***************************************************************************************************
 * Components Build Tasks.
 */
gulp.task('build:components:ts', makeTsBuildTask({ tsConfigPath: componentsDir }));
gulp.task('build:components:assets', function() {
  return gulp.src(path.join(componentsDir, '*/**/*.!(ts|spec.ts)'))
    .pipe(gulp.dest(outLibDir));
});
gulp.task('build:components:scss', function() {
  const cssTask = makeSassBuildTask({
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
  'build:components:ts',
  'build:components:assets',
  'build:components:scss'
], function() {
  inlineResources([outLibDir]);
});

/***************************************************************************************************
 * DevApp Build Tasks.
 */
gulp.task('build:devapp:ts', ['build:components:ts'], makeTsBuildTask({ tsConfigPath: devAppDir }));
gulp.task('build:devapp:scss', ['build:components:scss'], makeSassBuildTask({
  dest: outDir,
  root: devAppDir,
  // Change this once we have a better strategy for releasing SCSS files.
  includePaths: [
    path.join(componentsDir, 'core/style'),
    componentsDir
  ]
}));
gulp.task('build:devapp:assets', function() {
  return gulp.src(path.join(devAppDir, '**/*'))
    .pipe(gulp.dest(outDir));
});
gulp.task('build:devapp:vendor', function() {
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

gulp.task('build:devapp', [
  'build:components',
  'build:devapp:vendor',
  'build:devapp:ts',
  'build:devapp:scss',
  'build:devapp:assets'
]);

/***************************************************************************************************
 * DevApp Build Tasks.
 */
gulp.task('build:e2eapp:ts', ['build:components:ts'], makeTsBuildTask({ tsConfigPath: e2eAppDir }));
gulp.task('build:e2eapp:scss', ['build:components:scss'], makeSassBuildTask({
  dest: outDir,
  root: e2eAppDir,
  // Change this once we have a better strategy for releasing SCSS files.
  includePaths: [
    path.join(componentsDir, 'core/style'),
    componentsDir
  ]
}));
gulp.task('build:e2eapp:assets', function() {
  return gulp.src(path.join(e2eAppDir, '**/*'))
    .pipe(gulp.dest(outDir));
});
gulp.task('build:e2eapp:vendor', function() {
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

gulp.task('build:e2eapp', [
  'build:components',
  'build:e2eapp:vendor',
  'build:e2eapp:ts',
  'build:e2eapp:scss',
  'build:e2eapp:assets'
]);


/***************************************************************************************************
 * Global tasks.
 */
gulp.task('build', ['build:devapp']);

gulp.task('clean', function () {
  return gulp.src('dist', { read: false })
    .pipe(gulpClean());
});


/***************************************************************************************************
 * Watch Tasks.
 */
gulp.task('watch:components', ['build:components'], function() {
  gulp.watch(path.join(componentsDir, '**/*'), ['build:components']);
});

gulp.task('watch:devapp', ['watch:components', 'build:devapp'], function() {
  gulp.watch(path.join(devAppDir, '**/*'), ['build:devapp']);
});


/***************************************************************************************************
 * Serve Tasks.
 */
gulp.task('serve:devapp', ['build:devapp'], function() {
  const server = gulpLiveServer('scripts/serve-dist.js');

  server.start();
  function reload(file) {
    server.notify(file);
  }

  gulp.watch(path.join(componentsDir, '**/*.ts'), ['build:components:ts'], reload);
  gulp.watch(path.join(componentsDir, '**/*.scss'), ['build:components:scss'], reload);
  gulp.watch(path.join(componentsDir, '**/*.html'), ['build:components:assets'], reload);
  gulp.watch(path.join(devAppDir, '**/*.ts'), ['build:devapp:ts'], reload);
  gulp.watch(path.join(devAppDir, '**/*.scss'), ['build:devapp:scss'], reload);
  gulp.watch(path.join(devAppDir, '**/*.html'), ['build:devapp:assets'], reload);
});

gulp.task('serve:e2eapp', ['build:e2eapp'], function() {
  const server = gulpLiveServer('scripts/serve-dist.js');

  server.start();
  function reload(file) {
    server.notify.apply(server, [file]);
  }

  gulp.watch(path.join(componentsDir, '**/*.ts'), ['build:components:ts'], reload);
  gulp.watch(path.join(componentsDir, '**/*.scss'), ['build:components:scss'], reload);
  gulp.watch(path.join(componentsDir, '**/*.html'), ['build:components:assets'], reload);
  gulp.watch(path.join(e2eAppDir, '**/*.ts'), ['build:e2eapp:ts'], reload);
  gulp.watch(path.join(e2eAppDir, '**/*.scss'), ['build:e2eapp:scss'], reload);
  gulp.watch(path.join(e2eAppDir, '**/*.html'), ['build:e2eapp:assets'], reload);
});

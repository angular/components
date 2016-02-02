var fs = require('fs');
var path = require('path');

// Import the require hook. Enables us to require TS files natively.
require('ts-node/register');

var mergeTrees = require('broccoli-merge-trees');
var BroccoliTypescript = require('./tools/broccoli/broccoli-typescript').default;
var BroccoliSass = require('broccoli-sass');
var broccoliAutoprefixer = require('broccoli-autoprefixer');
var BroccoliTs2Dart = require('./tools/broccoli/broccoli-ts2dart').default;
var Funnel = require('broccoli-funnel');

var autoprefixerOptions = require('./build/autoprefixer-options');

module.exports = function(defaults) {
  var cssTree = getCssTree('src');

  var tsAppTree = getAppTree('src/');
  var dartAppTree = new BroccoliTs2Dart('src/', {
    generateLibraryName: true,
    generateSourceMap: false,
    translateBuiltins: true,
  });

  return mergeTrees([
    tsAppTree,
    cssTree,
    dartAppTree,
  ]);
};

/**
 * Get the tree for all TypeScript sources.
 */
function getAppTree(folder) {
  var options = JSON.parse(fs.readFileSync(path.join(folder, 'tsconfig.json'), 'utf-8'))
                    .compilerOptions;
  var tsTree = new BroccoliTypescript(folder, options);
  var tsSrcTree = new Funnel(folder, {
    include: ['**/*.ts'],
    allowEmpty: true
  });

  var jsTree = new Funnel(folder, {
    include: ['**/*.js'],
    allowEmpty: true
  });

  var assetTree = new Funnel(folder, {
    include: ['**/*.*'],
    exclude: ['**/*.ts', '**/*.js', 'src/tsconfig.json'],
    allowEmpty: true
  });

  var vendorJsTree = new Funnel('node_modules', {
    files: [
      'angular2/bundles/angular2-polyfills.js',
      'angular2/bundles/angular2.dev.js',
      'angular2/bundles/http.dev.js',
      'angular2/bundles/router.dev.js',
      'angular2/bundles/upgrade.dev.js',
      'rxjs/bundles/Rx.js',
      'systemjs/dist/system.src.js',
      'systemjs/dist/system-polyfills.src.js'
    ],
    destDir: 'vendor'
  });

  return mergeTrees([assetTree, tsSrcTree, tsTree, jsTree, vendorJsTree], { overwrite: true });
}



/** Walk a directory and return a list of file names. */
function walk(dir) {
  const dirs = fs.readdirSync(dir)
      .filter(file => fs.statSync(path.join(dir, file)).isDirectory());
  if (!dirs.length) {
    return [dir];
  }

  return dirs.reduce((previous, current) => {
      return previous.concat(walk(path.join(dir, current)));
  }, [dir]);
}



/** Gets the tree for all of the components' CSS. */
function getCssTree(root) {
  const trees = walk(root)
      .reduce((previous, current) => {
        const dir = current.startsWith(root) ? current.substr(root.length) : current;
        const scssFiles = fs.readdirSync(current)
            .filter(file => path.extname(file) === '.scss')
            .map(file => path.basename(file, '.scss'));

        return scssFiles.map(filename => {
          return new BroccoliSass(
            [current, 'src/core/style'],
            path.join('.', filename + '.scss'),
            path.join(dir, filename + '.css')
          );
        }).concat(previous);
  }, []);

  return broccoliAutoprefixer(mergeTrees(trees), autoprefixerOptions);
}


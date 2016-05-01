Error.stackTraceLimit = Infinity;

jasmine.DEFAULT_TIMEOUT_INTERVAL = 4000;

__karma__.loaded = function() {};


/**
 * Gets map of module alias to location or package.
 * @param dir Directory name under `src/` for create a map for.
 */
function getPathsMap(dir) {
  return Object.keys(window.__karma__.files)
    .filter(not(isSpecFile))
    .filter(function(x) { return new RegExp('^/base/dist/' + dir + '/.*\\.js$').test(x); })
    .reduce(function(pathsMapping, appPath) {
      var pathToReplace = new RegExp('^/base/dist/' + dir + '/');
      var moduleName = appPath.replace(pathToReplace, './').replace(/\.js$/, '');
      pathsMapping[moduleName] = appPath + '?' + window.__karma__.files[appPath];
      return pathsMapping;
    }, {});
}

System.config({
  baseURL: '/base/dist',
  packages: {
    'components': {
      format: 'cjs',
      map: getPathsMap('components'),
      defaultExtension: 'js'
    },
    'core': {
      format: 'cjs',
      map: getPathsMap('core'),
      defaultExtension: 'js'
    },
    '@angular/core': {
      main: 'index.js',
      format: 'cjs',
      defaultExtension: 'js',
    },
    '@angular/compiler': {
      main: 'index.js',
      format: 'cjs',
      defaultExtension: 'js'
    },
    '@angular/common': {
      main: 'index.js',
      format: 'cjs',
      defaultExtension: 'js'
    },
    '@angular/http': {
      main: 'index.js',
      format: 'cjs',
      defaultExtension: 'js'
    },
    '@angular/router': {
      main: 'index.js',
      format: 'cjs',
      defaultExtension: 'js'
    },
    '@angular/platform-browser': {
      main: 'index.js',
      format: 'cjs',
      defaultExtension: 'js'
    },
    '@angular/platform-browser-dynamic': {
      main: 'index.js',
      format: 'cjs',
      defaultExtension: 'js'
    },
    '@angular/testing': {
      main: 'index.js',
      format: 'cjs',
      defaultExtension: 'js'
    },
    '@angular/testing/browser': {
      main: 'index.js',
      format: 'cjs',
      defaultExtension: 'js'
    },
    'rxjs': {
      defaultExtension: 'js'
    }
  }
});


/**
 * Bootstrap the browser testing providers from Angular2. The equivalent code in TypeScript
 * would be:
 *
 * <code>
 *   import {setBaseTestProviders} from '@angular/core/testing';
 *   import * as browser from '@angular/platform-browser-dynamic/testing';
 *
 *   setBaseTestProviders(browser.TEST_BROWSER_PLATFORM_PROVIDERS,
 *                        browser.TEST_BROWSER_APPLICATION_PROVIDERS);
 * </code>
 *
 * See https://github.com/angular/angular/blob/master/CHANGELOG.md#200-beta2-2016-01-28
 *
 * Followed by the normal import of all spec files, then bootstrap Karma.
 */
Promise.all([
  System.import('@angular/core/testing'),
  System.import('@angular/platform-browser-dynamic/testing'),
]).then(function(imports) {
  var testing = imports[0];
  var browser = imports[1];
  testing.setBaseTestProviders(browser.TEST_BROWSER_PLATFORM_PROVIDERS,
                               browser.TEST_BROWSER_APPLICATION_PROVIDERS);

  return Promise.all(
    Object.keys(window.__karma__.files)
      .filter(isSpecFile)
      .map(function(moduleName) {
        return System.import(moduleName).then(function(module) {
          if (module.hasOwnProperty('main')) {
            return module.main();
          } else {
            return module;
          }
        });
      }));
}).then(function() {
  __karma__.start();
}, function(error) {
  __karma__.error(error.stack || error);
});

function isSpecFile(path) {
  return /\.spec\.js$/.test(path);
}

function not(fn) {
  return function() {
    return !fn.apply(this, arguments);
  };
}

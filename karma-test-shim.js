Error.stackTraceLimit = Infinity;

jasmine.DEFAULT_TIMEOUT_INTERVAL = 1000;

__karma__.loaded = function() {};


/**
 * Gets map of module alias to location or package.
 * @param dir Directory name under `src/` for create a map for.
 * @param core Is that a map of the core files
 */
function getPathsMap(dir, core) {
  return Object.keys(window.__karma__.files)
    .filter(!!core ? isCoreFile : isComponentsFile)
    .reduce(function(pathsMapping, appPath) {
      var pathToReplace = new RegExp('^/base/dist/' + dir + '/');
      var moduleName = appPath.replace(pathToReplace, './').replace(/\.js$/, '');
      pathsMapping[moduleName] = appPath + '?' + window.__karma__.files[appPath];
    return pathsMapping;
  }, {});
}

System.config({
  packages: {
    'base/dist/components': {
      defaultExtension: false,
      format: 'register',
      map: getPathsMap('components')
    },
    'base/dist/core': {
      defaultExtension: false,
      format: 'register',
      map: getPathsMap('core', true)
    }
  }
});

System.import('angular2/platform/browser').then(function(browser_adapter) {
  // TODO: once beta is out we should change this code to use a "test platform"
  browser_adapter.BrowserDomAdapter.makeCurrent();
}).then(function() {
  return Promise.all(
    Object.keys(window.__karma__.files)
      .filter(onlySpecFiles)
      .map(function(moduleName) {
        return System.import(moduleName);
      }));
}).then(function() {
  __karma__.start();
}, function(error) {
  __karma__.error(error.stack || error);
});

function isCoreFile(filePath) {
  return /^\/base\/dist\/core\/(?!spec)([a-z0-9-_\/]+)\.js$/.test(filePath);
}

function isComponentsFile(filePath) {
  return /^\/base\/dist\/components\/(?!spec)([a-z0-9-_\/]+)\.js$/.test(filePath);
}

function onlySpecFiles(path) {
  return /\.spec\.js$/.test(path);
}

const {runfiles} = require('@bazel/runfiles');
const {customLaunchers, platformMap} = require('./browser-providers');

// Since we load a Karma plugin directly from the sources, we load the NodeJS require
// patch. This is needed as the TypeScript output uses absolute manifest paths between files.
// TODO: Consider removing if we switch the repository to `ts_project`, or if the linker
// symlinks the workspace root by default.
runfiles.patchRequire();

module.exports = karmaConfig => {
  const config = {
    plugins: [
      require(runfiles.resolveWorkspaceRelative('tools/saucelabs-bazel/launcher/index.js')),
    ],
    customLaunchers: customLaunchers,
    browserNoActivityTimeout: 90000,
    browserDisconnectTimeout: 90000,
    browserDisconnectTolerance: 2,
    captureTimeout: 90000,
    browsers: platformMap.saucelabs,
    transports: ['polling'],
    // Configure the Karma spec reporter so that spec timing is captured.
    specReporter: {
      showSpecTiming: true,
    },
  };

  // Setup the Karma spec reporter so that debugging of slow tests on CI is easier.
  // Note that we need to override it using `defineProperty` because otherwise
  // `@bazel/concatjs` always appends the `progress` reporter that causes unreadable
  // console output on CI.
  Object.defineProperty(config, 'reporters', {
    get: () => ['spec'],
    set: () => {},
    enumerable: true,
  });


  karmaConfig.set(config);
};

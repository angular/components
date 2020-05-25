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
    transports: ['polling', 'websocket'],
  };

  karmaConfig.set(config);
};

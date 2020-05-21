const {readFileSync} = require('fs');
const {customLaunchers, platformMap} = require('./browser-providers');

module.exports = karmaConfig => {
  const config = {
    plugins: [
      require('karma-sauce-launcher')
    ],
    customLaunchers: customLaunchers,
    sauceLabs: {
      testName: 'Angular Material Unit Tests',
      startConnect: false,
      recordVideo: false,
      recordScreenshots: false,
      idleTimeout: 600,
      commandTimeout: 600,
      maxDuration: 5400,
    },
    browserNoActivityTimeout: 300000,
    browserDisconnectTimeout: 180000,
    browserDisconnectTolerance: 3,
    captureTimeout: 180000,
    browsers: platformMap.saucelabs,

    // Try Websocket for a faster transmission first. Fallback to polling if necessary.
    transports: ['websocket', 'polling'],
  };

  // The tunnel identifier has been written to a stamped genrule that access the tunnel
  // identifier through a volatile status key. This ensures that test and build results
  // are not invalidated whenever the tunnel identifier changes (which it does for each PR).
  const tunnelIdentifier = readFileSync(
      require.resolve('../saucelabs_tunnel_identifier.txt'), 'utf8');

  config.sauceLabs.build = tunnelIdentifier;
  config.sauceLabs.tunnelIdentifier = tunnelIdentifier;

  karmaConfig.set(config);
};

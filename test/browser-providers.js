'use strict';

/*
 * Browser Configuration for the different jobs in the CI.
 * Target can be either: BS (Browserstack) | SL (Saucelabs) | TC (Travis CI) | null (To not run)
 */
const browserConfig = {
  'ChromeHeadlessCI':  { target: 'TC', poolId: 1 },
  'FirefoxHeadless':   { target: 'TC', poolId: 1 },
  'IE11':              { target: null },
  'Edge':              { target: 'BS', poolId: 1 },
  'Android4.4':        { target: null },
  'Android5':          { target: null },
  'Safari10':          { target: 'BS', poolId: 1 },
  'Safari11':          { target: 'BS', poolId: 2 },
  'iOS10':             { target: null },
  'iOS11':             { target: 'BS', poolId: 2 },
  'WindowsPhone':      { target: null }
};

/** Exports all available remote browsers. */
exports.customLaunchers = require('./remote_browsers.json');

/** Exports a map of configured browsers, which should run on the CI. */
exports.platformMap = {
  'browserstack': buildConfiguration('BS'),
  'travis': buildConfiguration('TC'),
};

/** Build a list of configuration for the specified platform. */
function buildConfiguration(platform) {
  const platformConfig = {};

  Object.keys(browserConfig).forEach(browserName => {
    const config = browserConfig[browserName];

    if (config.target !== platform || !config.poolId) {
      return;
    }

    if (!platformConfig[config.poolId]) {
      platformConfig[config.poolId] = [];
    }

    // For browsers that run on Travis CI the browser name shouldn't be prefixed with the shortcut
    // of Travis. The different Karma launchers only work with the plain browser name (e.g Firefox)
    if (platform !== 'TC') {
      browserName = `${platform}_${browserName.toUpperCase()}`;
    }

    platformConfig[config.poolId].push(browserName);
  });

  return platformConfig;
}

/** Decode the token for Travis to use. */
function decodeToken(token) {
  return (token || '').split('').reverse().join('');
}

/** Ensures that the Travis access keys work properly. */
if (process.env.TRAVIS) {
  process.env.BROWSER_STACK_ACCESS_KEY = decodeToken(process.env.BROWSER_STACK_ACCESS_KEY);
}

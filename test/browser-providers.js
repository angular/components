'use strict';

/*
 * Browser Configuration for the different jobs in the CI.
 *
 *   - local: Launches the browser locally on the current operating system.
 *   - browserstack: Launches the browser within BrowserStack
 */
const browserConfig = {
  'ChromeHeadlessCI':  { unitTest: {target: 'local', }},
  'FirefoxHeadless':   { unitTest: {target: 'local', }},
  'ChromeBeta':        { unitTest: {target: null, }},
  'FirefoxBeta':       { unitTest: {target: null, }},
  'ChromeDev':         { unitTest: {target: null, }},
  'FirefoxDev':        { unitTest: {target: null, }},
  'IE9':               { unitTest: {target: null, }},
  'IE10':              { unitTest: {target: null, }},
  'IE11':              { unitTest: {target: null, }},
  'Edge':              { unitTest: {target: 'browserstack', }},
  'Android4.1':        { unitTest: {target: null, }},
  'Android4.2':        { unitTest: {target: null, }},
  'Android4.3':        { unitTest: {target: null, }},
  'Android4.4':        { unitTest: {target: null, }},
  'Android5':          { unitTest: {target: null, }},
  'Safari7':           { unitTest: {target: null, }},
  'Safari8':           { unitTest: {target: null, }},
  'Safari9':           { unitTest: {target: null, }},
  'Safari10':          { unitTest: {target: 'browserstack', }},
  'iOS7':              { unitTest: {target: null, }},
  'iOS8':              { unitTest: {target: null, }},
  'iOS9':              { unitTest: {target: null, }},
  'iOS10':             { unitTest: {target: null, }},
  'iOS11':             { unitTest: {target: 'browserstack', }},
  'WindowsPhone':      { unitTest: {target: null, }}
};

/** Exports all available remote browsers. */
exports.customLaunchers = require('./remote_browsers.json');

/** Exports a map of configured browsers, which should run in the given platform. */
exports.platformMap = {
  'browserstack': buildConfiguration('unitTest', 'browserstack'),
  'local': buildConfiguration('unitTest', 'local'),
};

/** Build a list of configuration (custom launcher names). */
function buildConfiguration(type, target) {
  const targetBrowsers = Object.keys(browserConfig)
    .map(browserName => [browserName, browserConfig[browserName][type]])
    .filter(([, config]) => config.target === target)
    .map(([browserName]) => browserName);

  // For browsers that run locally, the browser name shouldn't be prefixed with the target
  // platform. We only prefix the external platforms in order to distinguish between
  // local and remote browsers in our "customLaunchers" for Karma.
  if (target === 'local') {
    return targetBrowsers;
  }

  return targetBrowsers.map(browserName => {
    return `${target.toUpperCase()}_${browserName.toUpperCase()}`
  });
}
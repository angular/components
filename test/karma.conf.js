const path = require('path');
const {customLaunchers, platformMap} = require('./browser-providers');

module.exports = (config) => {

  config.set({
    basePath: path.join(__dirname, '..'),
    frameworks: ['jasmine'],
    plugins: [
      require('karma-jasmine'),
      require('karma-browserstack-launcher'),
      require('karma-chrome-launcher'),
      require('karma-firefox-launcher'),
      require('karma-sourcemap-loader'),
      require('karma-coverage')
    ],
    files: [
      {pattern: 'node_modules/core-js/client/core.js', included: true, watched: false},
      {pattern: 'node_modules/tslib/tslib.js', included: true, watched: false},
      {pattern: 'node_modules/systemjs/dist/system.src.js', included: true, watched: false},
      {pattern: 'node_modules/zone.js/dist/zone.js', included: true, watched: false},
      {pattern: 'node_modules/zone.js/dist/proxy.js', included: true, watched: false},
      {pattern: 'node_modules/zone.js/dist/sync-test.js', included: true, watched: false},
      {pattern: 'node_modules/zone.js/dist/jasmine-patch.js', included: true, watched: false},
      {pattern: 'node_modules/zone.js/dist/async-test.js', included: true, watched: false},
      {pattern: 'node_modules/zone.js/dist/fake-async-test.js', included: true, watched: false},
      {pattern: 'node_modules/hammerjs/hammer.min.js', included: true, watched: false},
      {pattern: 'node_modules/hammerjs/hammer.min.js.map', included: false, watched: false},
      {pattern: 'node_modules/moment/min/moment-with-locales.min.js', included: true, watched: false},

      // Include all Angular dependencies
      {pattern: 'node_modules/@angular/**/*', included: false, watched: false},
      {pattern: 'node_modules/rxjs/**/*', included: false, watched: false},

      {pattern: 'test/karma-test-shim.js', included: true, watched: false},

      // Include a Material theme in the test suite.
      {pattern: 'dist/packages/**/core/theming/prebuilt/indigo-pink.css', included: true, watched: true},

      // Includes all package tests and source files into karma. Those files will be watched.
      // This pattern also matches all all sourcemap files and TypeScript files for debugging.
      {pattern: 'dist/packages/**/*', included: false, watched: true},
    ],

    customLaunchers: customLaunchers,

    preprocessors: {
      'dist/packages/**/*.js': ['sourcemap']
    },

    reporters: ['dots'],
    autoWatch: false,

    coverageReporter: {
      type : 'json-summary',
      dir : 'dist/coverage/',
      subdir: '.'
    },

    sauceLabs: {
      testName: 'material2',
      startConnect: false,
      recordVideo: false,
      recordScreenshots: false,
      idleTimeout: 600,
      commandTimeout: 600,
      maxDuration: 5400,
    },

    browserStack: {
      project: 'material2',
      startTunnel: false,
      retryLimit: 1,
      timeout: 600,
      pollingTimeout: 20000,
      video: false,
    },

    browserDisconnectTimeout: 20000,
    browserNoActivityTimeout: 240000,
    browserDisconnectTolerance: 1,
    captureTimeout: 120000,

    browsers: ['ChromeHeadlessLocal'],
    singleRun: false,

    browserConsoleLogOptions: {
      terminal: true,
      level: 'log'
    },

    client: {
      jasmine: {
        // TODO(jelbourn): re-enable random test order once we can de-flake existing issues.
        random: false
      }
    }
  });

  if (process.env['TRAVIS']) {
    const buildId = `TravisCI ${process.env.TRAVIS_BUILD_ID}`;
    const tunnelIdentifier = process.env.TRAVIS_JOB_ID;

    if (process.env['TRAVIS_PULL_REQUEST'] === 'false'
        && process.env['MODE'] === "test-travis-1") {

      config.preprocessors['dist/packages/**/!(*+(.|-)spec).js'] = ['coverage'];
      config.reporters.push('coverage');
    }

    // The MODE variable is the indicator of what row in the test matrix we're running.
    // It will look like "test-<platform>[-poolId], where platform is one of 'browserstack' or
    // 'travis'. Pool ids allow running different browsers on the same
    // platform, but in different CI jobs.
    const [, platform, poolId] = process.env.MODE.split('-');

    if (platform === 'browserstack') {
      config.browserStack.build = buildId;
      config.browserStack.tunnelIdentifier = tunnelIdentifier;
      console.log(`Setting up Browserstack launcher. Connecting to tunnel: "${tunnelIdentifier}"`);
    } else if (platform !== 'travis') {
      throw new Error(`Platform "${platform}" is unknown. Exiting..`);
    }

    config.browsers = platformMap[platform][parseInt(poolId)];
  }
};

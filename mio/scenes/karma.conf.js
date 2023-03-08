// Karma configuration file, see link for more information
// https://karma-runner.github.io/0.13/config/configuration-file.html
const {customLaunchers} = require('../karma-custom-launchers');
const path = require('path');

// TODO(bazel): drop non-bazel
const isBazel = !!process.env['TEST_TARGET'];
if (isBazel) {
  // Resolve CHROME_BIN and CHROMEDRIVER_BIN from relative paths to absolute paths within the
  // runfiles tree so that subprocesses spawned in a different working directory can still find them.
  process.env.CHROME_BIN = path.resolve(process.env.CHROME_BIN);
  process.env.CHROMEDRIVER_BIN = path.resolve(process.env.CHROMEDRIVER_BIN);
}

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-firefox-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage-istanbul-reporter'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    client: {
      clearContext: false // leave Jasmine Spec Runner output visible in browser
    },
    coverageIstanbulReporter: {
      dir: require('path').join(__dirname, '../../coverage/scenes'),
      reports: ['html', 'lcovonly', 'text-summary'],
      fixWebpackSourcePaths: true
    },
    reporters: ['progress', 'kjhtml'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: [isBazel ? 'ChromeHeadlessNoSandbox' : 'ChromeHeadlessLocal'],
    singleRun: false,
    customLaunchers: customLaunchers,
    restartOnFileChange: true
  });


  if (process.env['TRAVIS']) {
    config.browsers = [isBazel ? 'ChromeHeadlessNoSandbox' : 'ChromeHeadlessCI', 'FirefoxHeadless']
  }
};

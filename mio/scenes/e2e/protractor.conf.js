// @ts-check
// Protractor configuration file, see link for more information
// https://github.com/angular/protractor/blob/master/lib/config.ts

const { StacktraceOption } = require('jasmine-spec-reporter/built/configuration');
const { SpecReporter } = require('jasmine-spec-reporter');
const path = require('path');

// TODO(bazel): drop non-bazel
const isBazel = !!process.env['TEST_TARGET'];
if (isBazel) {
    // Resolve CHROME_BIN and CHROMEDRIVER_BIN from relative paths to absolute paths within the
    // runfiles tree so that subprocesses spawned in a different working directory can still find them.
    process.env.CHROME_BIN = path.resolve(process.env.CHROME_BIN);
    process.env.CHROMEDRIVER_BIN = path.resolve(process.env.CHROMEDRIVER_BIN);
}

/**
 * @type { import("protractor").Config }
 */
const config = {
  allScriptsTimeout: 11000,
  specs: [
    './src/**/*.e2e-spec.ts'
  ],
  chromeDriver: process.env.CHROMEDRIVER_BIN,
  capabilities: {
    'browserName': 'chrome',
    chromeOptions: {
      binary: isBazel
        ? path.resolve(process.env.CHROME_BIN)
        : require('puppeteer').executablePath(),
      args: [
        '--no-sandbox',
        '--headless',
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--hide-scrollbars',
        '--mute-audio',
      ],
    }
  },
  directConnect: true,
  baseUrl: 'http://localhost:4200/',
  framework: 'jasmine',
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 30000,
    print: function() {}
  },
  onPrepare() {
    if (!isBazel) {
      require('ts-node').register({
        project: require('path').join(__dirname, './tsconfig.json')
      });
    }
    jasmine.getEnv().addReporter(new SpecReporter({ spec: { displayStacktrace: StacktraceOption.PRETTY } }));
  }
};

if (isBazel) {
  config.chromeDriver = process.env.CHROMEDRIVER_BIN;
}

exports.config = config;

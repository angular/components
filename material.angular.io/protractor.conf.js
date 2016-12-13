// Protractor configuration file, see link for more information
// https://github.com/angular/protractor/blob/master/docs/referenceConf.js

/*global jasmine */
const SpecReporter = require('jasmine-spec-reporter');

let config = {
  allScriptsTimeout: 11000,
  specs: [
    './e2e/**/*.e2e-spec.ts'
  ],
  capabilities: {
    'browserName': 'chrome'
  },
  baseUrl: 'http://localhost:4200/',
  framework: 'jasmine',
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 30000,
    print: function() {}
  },
  useAllAngular2AppRoots: true,
  beforeLaunch: function() {
    require('ts-node').register({
      project: 'e2e'
    });
  },
  onPrepare: function() {
    jasmine.getEnv().addReporter(new SpecReporter());
  }
};


if (process.env['TRAVIS']) {

  config.sauceUser = process.env['SAUCE_USERNAME'];
  config.sauceKey = process.env['SAUCE_ACCESS_KEY'].split('').reverse().join('');

  config.capabilities = {
    'browserName': 'chrome',
    'tunnel-identifier': process.env['TRAVIS_JOB_NUMBER'],
    'build': process.env['TRAVIS_JOB_NUMBER'],
    'name': 'Material 2 Docs E2E'
  };

}

exports.config = config;

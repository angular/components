/**
 * Configuration for running e2e tests with Protractor.
 */
exports.config = {
  framework: 'jasmine2',
  useAllAngular2AppRoots: true,

  baseUrl: 'http://localhost:4200/',
  specs: ['../dist/e2e/button-e2e-spec.js'],

  // Specific options for jasmine.
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 60000
  },

  sauceUser: process.env.SAUCE_USERNAME,
  sauceKey: process.env.SAUCE_ACCESS_KEY,
};

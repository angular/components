exports.config = {
  useAllAngular2AppRoots: true,
  allScriptsTimeout: 120000,
  getPageTimeout: 120000,
  jasmineNodeOpts: {
    defaultTimeoutInterval: 120000,
  },

  // Since we want to use async/await we don't want to mix up with selenium's promise
  // manager. In order to enforce this, we disable the promise manager.
  SELENIUM_PROMISE_MANAGER: false,
};

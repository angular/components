/** Map of custom launchers that will be provided to Karma. */
exports.customLaunchers = {
  ChromeHeadlessNoSandbox: {
    base: 'ChromeHeadless',
    flags: [
      '--window-size=1024,768',

      // config required for bazel sandboxing
      '--no-sandbox',
      '--headless',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--hide-scrollbars',
      '--mute-audio'
    ],
  },
  ChromeHeadlessLocal: {
    base: 'ChromeHeadless',
    flags: [
      '--window-size=1024,768'
    ]
  },
  ChromeHeadlessCI: {
    base: 'ChromeHeadless',
    flags: [
      '--window-size=1024,768',
      '--no-sandbox'
    ]
  },
  FirefoxHeadless: {
    base: 'Firefox',
    flags: [
      '-headless'
    ]
  },
};

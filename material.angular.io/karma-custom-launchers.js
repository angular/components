/** Map of custom launchers that will be provided to Karma. */
exports.customLaunchers = {
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

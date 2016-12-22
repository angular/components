
// Unique place to configure the browsers which are used in the different CI jobs in Sauce Labs (SL)
// and BrowserStack (BS).
// If the target is set to null, then the browser is not run anywhere during CI.
// If a category becomes empty (e.g. BS and required), then the corresponding job must be commented
// out in Travis configuration.
const configuration = {
  'Chrome':       { unitTest: {target: 'SL'}, e2e: {target: null}},
  'Firefox':      { unitTest: {target: 'SL'}, e2e: {target: null}},
  'ChromeBeta':   { unitTest: {target: null}, e2e: {target: null}},
  'FirefoxBeta':  { unitTest: {target: null}, e2e: {target: null}},
  'ChromeDev':    { unitTest: {target: null}, e2e: {target: null}},
  'FirefoxDev':   { unitTest: {target: null}, e2e: {target: null}},
  'IE9':          { unitTest: {target: null}, e2e: {target: null}},
  'IE10':         { unitTest: {target: null}, e2e: {target: null}},
  'IE11':         { unitTest: {target: null}, e2e: {target: null}},
  'Edge':         { unitTest: {target: null}, e2e: {target: null}},
  'Android4.1':   { unitTest: {target: null}, e2e: {target: null}},
  'Android4.2':   { unitTest: {target: null}, e2e: {target: null}},
  'Android4.3':   { unitTest: {target: null}, e2e: {target: null}},
  'Android4.4':   { unitTest: {target: null}, e2e: {target: null}},
  'Android5':     { unitTest: {target: null}, e2e: {target: null}},
  'Safari7':      { unitTest: {target: null}, e2e: {target: null}},
  'Safari8':      { unitTest: {target: null}, e2e: {target: null}},
  'Safari9':      { unitTest: {target: 'BS'}, e2e: {target: null}},
  'iOS7':         { unitTest: {target: null}, e2e: {target: null}},
  'iOS8':         { unitTest: {target: null}, e2e: {target: null}},
  'iOS9':         { unitTest: {target: 'BS'}, e2e: {target: null}},
  'WindowsPhone': { unitTest: {target: 'BS'}, e2e: {target: null}}
};

exports.customLaunchers = {
  'ChromeNoSandbox': {
    base: 'Chrome',
    flags: ['--no-sandbox']
  },
  'SL_CHROME': {
    base: 'SauceLabs',
    browserName: 'chrome',
    version: 'latest'
  },
  'SL_CHROMEBETA': {
    base: 'SauceLabs',
    browserName: 'chrome',
    version: 'beta'
  },
  'SL_CHROMEDEV': {
    base: 'SauceLabs',
    browserName: 'chrome',
    version: 'dev'
  },
  'SL_FIREFOX': {
    base: 'SauceLabs',
    browserName: 'firefox',
    version: 'latest'
  },
  'SL_FIREFOXBETA': {
    base: 'SauceLabs',
    browserName: 'firefox',
    version: 'beta'
  },
  'SL_FIREFOXDEV': {
    base: 'SauceLabs',
    browserName: 'firefox',
    version: 'dev'
  },
  'SL_SAFARI7': {
    base: 'SauceLabs',
    browserName: 'safari',
    platform: 'OS X 10.9',
    version: '7'
  },
  'SL_SAFARI8': {
    base: 'SauceLabs',
    browserName: 'safari',
    platform: 'OS X 10.10',
    version: '8'
  },
  'SL_SAFARI9': {
    base: 'SauceLabs',
    browserName: 'safari',
    platform: 'OS X 10.11',
    version: '9.0'
  },
  'SL_IOS7': {
    base: 'SauceLabs',
    browserName: 'iphone',
    platform: 'OS X 10.10',
    version: '7.1'
  },
  'SL_IOS8': {
    base: 'SauceLabs',
    browserName: 'iphone',
    platform: 'OS X 10.10',
    version: '8.4'
  },
  'SL_IOS9': {
    base: 'SauceLabs',
    browserName: 'iphone',
    platform: 'OS X 10.10',
    version: '9.1'
  },
  'SL_IE9': {
    base: 'SauceLabs',
    browserName: 'internet explorer',
    platform: 'Windows 2008',
    version: '9'
  },
  'SL_IE10': {
    base: 'SauceLabs',
    browserName: 'internet explorer',
    platform: 'Windows 2012',
    version: '10'
  },
  'SL_IE11': {
    base: 'SauceLabs',
    browserName: 'internet explorer',
    platform: 'Windows 8.1',
    version: '11'
  },
  'SL_EDGE': {
    base: 'SauceLabs',
    browserName: 'microsoftedge',
    platform: 'Windows 10',
    version: '14'
  },
  'SL_ANDROID4.1': {
    base: 'SauceLabs',
    browserName: 'android',
    platform: 'Linux',
    version: '4.1'
  },
  'SL_ANDROID4.2': {
    base: 'SauceLabs',
    browserName: 'android',
    platform: 'Linux',
    version: '4.2'
  },
  'SL_ANDROID4.3': {
    base: 'SauceLabs',
    browserName: 'android',
    platform: 'Linux',
    version: '4.3'
  },
  'SL_ANDROID4.4': {
    base: 'SauceLabs',
    browserName: 'android',
    platform: 'Linux',
    version: '4.4'
  },
  'SL_ANDROID5': {
    base: 'SauceLabs',
    browserName: 'android',
    platform: 'Linux',
    version: '5.1'
  },

  'BS_CHROME': {
    base: 'BrowserStack',
    browser: 'chrome',
    os: 'OS X',
    os_version: 'Yosemite'
  },
  'BS_FIREFOX': {
    base: 'BrowserStack',
    browser: 'firefox',
    os: 'Windows',
    os_version: '10'
  },
  'BS_SAFARI7': {
    base: 'BrowserStack',
    browser: 'safari',
    os: 'OS X',
    os_version: 'Mavericks'
  },
  'BS_SAFARI8': {
    base: 'BrowserStack',
    browser: 'safari',
    os: 'OS X',
    os_version: 'Yosemite'
  },
  'BS_SAFARI9': {
    base: 'BrowserStack',
    browser: 'safari',
    os: 'OS X',
    os_version: 'El Capitan'
  },
  'BS_IOS7': {
    base: 'BrowserStack',
    device: 'iPhone 5S',
    os: 'ios',
    os_version: '7.0',
    resolution: '1024x768'
  },
  'BS_IOS8': {
    base: 'BrowserStack',
    device: 'iPhone 6',
    os: 'ios',
    os_version: '8.3',
    resolution: '1024x768'
  },
  'BS_IOS9': {
    base: 'BrowserStack',
    device: 'iPhone 6S',
    os: 'ios',
    os_version: '9.0',
    resolution: '1024x768'
  },
  'BS_IE9': {
    base: 'BrowserStack',
    browser: 'ie',
    browser_version: '9.0',
    os: 'Windows',
    os_version: '7'
  },
  'BS_IE10': {
    base: 'BrowserStack',
    browser: 'ie',
    browser_version: '10.0',
    os: 'Windows',
    os_version: '8'
  },
  'BS_IE11': {
    base: 'BrowserStack',
    browser: 'ie',
    browser_version: '11.0',
    os: 'Windows',
    os_version: '10'
  },
  'BS_EDGE': {
    base: 'BrowserStack',
    browser: 'edge',
    os: 'Windows',
    os_version: '10'
  },
  'BS_WINDOWSPHONE' : {
    base: 'BrowserStack',
    device: 'Nokia Lumia 930',
    os: 'winphone',
    os_version: '8.1'
  },
  'BS_ANDROID5': {
    base: 'BrowserStack',
    device: 'Google Nexus 5',
    os: 'android',
    os_version: '5.0'
  },
  'BS_ANDROID4.4': {
    base: 'BrowserStack',
    device: 'HTC One M8',
    os: 'android',
    os_version: '4.4'
  },
  'BS_ANDROID4.3': {
    base: 'BrowserStack',
    device: 'Samsung Galaxy S4',
    os: 'android',
    os_version: '4.3'
  },
  'BS_ANDROID4.2': {
    base: 'BrowserStack',
    device: 'Google Nexus 4',
    os: 'android',
    os_version: '4.2'
  },
  'BS_ANDROID4.1': {
    base: 'BrowserStack',
    device: 'Google Nexus 7',
    os: 'android',
    os_version: '4.1'
  }
};

exports.platformMap = {
  'saucelabs': buildConfiguration('unitTest', 'SL'),
  'browserstack': buildConfiguration('unitTest', 'BS'),
};


/** Decode the token for Travis to use. */
function decode(str) {
  return (str || '').split('').reverse().join('');
}

/** Setup the access keys */
if (process.env.TRAVIS) {
  process.env.SAUCE_ACCESS_KEY = decode(process.env.SAUCE_ACCESS_KEY);
  process.env.BROWSER_STACK_ACCESS_KEY = decode(process.env.BROWSER_STACK_ACCESS_KEY);
}

/**
 * Build a list of configuration for the specified type and tunnel target.
 * @returns {string[]}
 */
function buildConfiguration(type, target) {
  return Object.keys(configuration)
    .map(item => [item, configuration[item][type]])
    .filter(([item, conf]) => conf.target == target)
    .map(([item, conf]) => `${target}_${item.toUpperCase()}`);
}

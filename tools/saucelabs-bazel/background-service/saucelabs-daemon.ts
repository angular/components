import * as chalk from 'chalk';
import {Builder, promise, WebDriver} from 'selenium-webdriver';
import {Browser, getUniqueId} from '../browser';
import {IpcServer} from './ipc';

const defaultCapabilities = {
  startConnect: false,
  recordVideo: false,
  recordScreenshots: false,
  idleTimeout: 90,
  // These represent the maximum values supported by Saucelabs.
  // See: https://wiki.saucelabs.com/display/DOCS/Test+Configuration+Options
  commandTimeout: 600,
  maxDuration: 10800,
};

interface RemoteBrowser {
  id: string;
  state: 'acquired'|'free'|'launching';
  driver: WebDriver|null;
}

interface BrowserTest {
  testId: number;
  pageUrl: string;
  requestedBrowserId: string;
}

export class SaucelabsDaemon {
  private _pendingTests = new Map<RemoteBrowser, BrowserTest>();
  _browsers = new Set<RemoteBrowser>();
  private _runningTests = new Map<number, RemoteBrowser>();
  private _server = new IpcServer(this);
  private _baseCapabilities = {...defaultCapabilities, ...this._userCapabilities};
  private _keepAliveIntervalId: NodeJS.Timeout|null = null;

  constructor(
      private _username: string, private _accessKey: string,
      private _userCapabilities: object = {}) {
    // Starts the heartbeat for browsers.
    this._keepAliveLoop();
  }

  async launchBrowsers(browsers: Browser[]) {
    return Promise.all(browsers.map(async browser => {
      const browserId = getUniqueId(browser);
      const capabilities = {...this._baseCapabilities, ...browser};
      const launched: RemoteBrowser = {state: 'launching', driver: null, id: browserId};

      console.debug(`Capabilities for ${browser.browserName}:`, JSON.stringify(capabilities));

      // Keep track of the launched browser. We do this before it even completed the
      // launch as we can then handle scheduled tests when the browser is still launching.
      this._browsers.add(launched);

      // See the following link for public API of the selenium server.
      // https://wiki.saucelabs.com/display/DOCS/Instant+Selenium+Node.js+Tests
      const driver =
          await new Builder()
              .withCapabilities(capabilities)
              .usingServer(
                  `http://${this._username}:${this._accessKey}@ondemand.saucelabs.com:80/wd/hub`)
              .build();

      const sessionId = (await driver.getSession()).getId();
      console.info(chalk.yellow(
          `Started browser ${browser.browserName} on Saucelabs: ` +
          `https://saucelabs.com/tests/${sessionId}`));

      // Mark the browser as available after launch completion.
      launched.state = 'free';
      launched.driver = driver;

      // If a test has been scheduled before the browser completed launching, run
      // it now given that the browser is ready now.
      if (this._pendingTests.has(launched)) {
        this._startBrowserTest(launched, this._pendingTests.get(launched)!);
      }
    }));
  }

  async quitAllBrowsers() {
    this._browsers.forEach(b => {
      if (b.driver !== null) {
        b.driver.quit();
      }
    });
    this._browsers.clear();
    this._runningTests.clear();
    this._pendingTests.clear();
  }

  async shutdown() {
    await this.quitAllBrowsers();
    if (this._keepAliveIntervalId !== null) {
      clearInterval(this._keepAliveIntervalId);
    }
  }

  endTest(testId: number) {
    if (!this._runningTests.has(testId)) {
      return;
    }

    const browser = this._runningTests.get(testId)!;
    browser.state = 'free';
    this._runningTests.delete(testId);
  }

  startTest(test: BrowserTest): boolean {
    const browsers = this._findMatchingBrowsers(test.requestedBrowserId);
    if (browsers.length === null) {
      return false;
    }

    // Find the first available browser and start the test.
    for (const browser of browsers) {
      if (browser.state === 'acquired') {
        continue;
      } else if (browser.state === 'launching') {
        if (this._pendingTests.has(browser)) {
          return false;
        } else {
          this._pendingTests.set(browser, test);
          return true;
        }
      }

      this._startBrowserTest(browser, test);
      return true;
    }
    return false;
  }

  private _startBrowserTest(browser: RemoteBrowser, test: BrowserTest) {
    this._runningTests.set(test.testId, browser);
    browser.state = 'acquired';
    browser.driver!.get(test.pageUrl);
  }

  private _findMatchingBrowsers(browserId: string): RemoteBrowser[] {
    const browsers: RemoteBrowser[] = [];
    for (let browser of this._browsers) {
      if (browser.id === browserId) {
        browsers.push(browser);
      }
    }
    return browsers;
  }

  // Implements a heartbeat for Saucelabs browsers as they could end up not receiving any
  // commands when the daemon is unused (i.e. Bazel takes a while to start tests).
  // https://saucelabs.com/blog/selenium-tips-how-to-coordinate-multiple-browsers-in-sauce-ondemand.
  private _keepAliveLoop = async () => {
    const pendingCommands: promise.Promise<any>[] = [];
    for (const browser of this._browsers) {
      if (browser.driver !== null) {
        pendingCommands.push(browser.driver.getTitle());
      }
    }
    await Promise.all(pendingCommands);
    console.debug(`${Date().toLocaleString()}: Refreshed ${pendingCommands.length} browsers.`);
    this._keepAliveIntervalId = setTimeout(this._keepAliveLoop, 20 * 1000);
  }
}

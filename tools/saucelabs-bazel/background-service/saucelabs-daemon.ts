import * as chalk from 'chalk';
import {Builder, WebDriver} from 'selenium-webdriver';
import {Browser, getUniqueId} from '../browser';
import {IpcServer} from './ipc';

const defaultCapabilities = {
  recordVideo: false,
  recordScreenshots: false,
  idleTimeout: 90,
  // These represent the maximum values supported by Saucelabs.
  // See: https://wiki.saucelabs.com/display/DOCS/Test+Configuration+Options
  commandTimeout: 600,
  maxDuration: 10800,
  extendedDebugging: true,
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
  /**
   * Map of browsers and their pending tests. If a browser is acquired on the
   * remote selenium server, the browser is not immediately ready. If the browser
   * becomes active, the pending tests will be started.
   */
  private _pendingTests = new Map<RemoteBrowser, BrowserTest>();

  /** List of active browsers that are managed by the daemon. */
  private _activeBrowsers = new Set<RemoteBrowser>();

  /** Map that contains test ids with their acquired browser. */
  private _runningTests = new Map<number, RemoteBrowser>();

  /** Server used for communication with the Karma launcher. */
  private _server = new IpcServer(this);

  /** Base selenium capabilities that will be added to each browser. */
  private _baseCapabilities = {...defaultCapabilities, ...this._userCapabilities};

  /** Id of the keep alive interval that ensures no remote browsers time out. */
  private _keepAliveIntervalId: NodeJS.Timeout|null = null;

  constructor(
      private _username: string, private _accessKey: string,
      private _buildName: string, private _userCapabilities: object = {}) {
    // Starts the keep alive loop for all active browsers, running every 15 seconds.
    this._keepAliveIntervalId = setInterval(
        () => this._keepAliveBrowsers(), 15_000);
  }

  async launchBrowsers(browsers: Browser[]) {
    return Promise.all(browsers.map(async (browser, id) => {
      const browserId = getUniqueId(browser);
      const capabilities: any = {'sauce-options': {...this._baseCapabilities, ...browser}};
      const launched: RemoteBrowser = {state: 'launching', driver: null, id: browserId};
      const browserDescription = `${this._buildName} - ${browser.browserName} - #${id+1}`;

      console.debug(`Capabilities for ${browser.browserName}:`, JSON.stringify(capabilities));
      console.debug(`  > Browser-ID: `, browserId);

      // Set `sauce:options` to provide a build name for the remote browser instances.
      // This helps with debugging. Also ensures the W3C protocol is used.
      // See. https://wiki.saucelabs.com/display/DOCS/Test+Configuration+Options
     // capabilities['sauce:options'] = {
     //   name: browserDescription,
     //   build: browserDescription,
     // }

      // Keep track of the launched browser. We do this before it even completed the
      // launch as we can then handle scheduled tests when the browser is still launching.
      this._activeBrowsers.add(launched);

      // See the following link for public API of the selenium server.
      // https://wiki.saucelabs.com/display/DOCS/Instant+Selenium+Node.js+Tests
      const driver =
          await new Builder()
              .withCapabilities(capabilities)
              .usingServer(
                  `http://${this._username}:${this._accessKey}@ondemand.saucelabs.com:80/wd/hub`)
              .build();
        
      // Only wait 30 seconds to load a test page.
      await driver.manage().setTimeouts({pageLoad: 30000});

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
    this._activeBrowsers.forEach(b => {
      if (b.driver !== null) {
        b.driver.quit();
      }
    });
    this._activeBrowsers.clear();
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
      // If the browser is acquired, continue searching.
      if (browser.state === 'acquired') {
        continue;
      } 
      // If the browser is launching, check if it can be pre-claimed so that
      // the test starts once the browser is ready. If it's already claimed,
      // continue searching.
      if (browser.state === 'launching') {
        if (this._pendingTests.has(browser)) {
          continue;
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

  private async _startBrowserTest(browser: RemoteBrowser, test: BrowserTest) {
    this._runningTests.set(test.testId, browser);
    browser.state = 'acquired';

    try {
      console.debug(`Opening test url for #${test.testId}: ${test.pageUrl}`);
      await browser.driver!.get(test.pageUrl);
      console.debug(`Test page loaded for #${test.testId}.`);
    } catch (e) {
      console.error('Could not start browser test with id', test.testId, test.pageUrl);
    }
  }

  private _findMatchingBrowsers(browserId: string): RemoteBrowser[] {
    const browsers: RemoteBrowser[] = [];
    for (let browser of this._activeBrowsers) {
      if (browser.id === browserId) {
        browsers.push(browser);
      }
    }
    return browsers;
  }

  // Implements a heartbeat for Saucelabs browsers as they could end up not receiving any
  // commands when the daemon is unused (i.e. Bazel takes a while to start tests).
  // https://saucelabs.com/blog/selenium-tips-how-to-coordinate-multiple-browsers-in-sauce-ondemand.
  async _keepAliveBrowsers() {
    const pendingCommands: Promise<any>[] = [];
    for (const browser of this._activeBrowsers) {
      if (browser.driver !== null) {
        pendingCommands.push(browser.driver.getTitle());
      }
    }
    await Promise.all(pendingCommands);
    console.debug(`${Date().toLocaleString()}: Refreshed ${pendingCommands.length} browsers.`);
  }
}

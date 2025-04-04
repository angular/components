import {HarnessLoader, parallel} from '../../testing';
import {
  SeleniumWebDriverHarnessEnvironment,
  waitForAngularReady,
} from '../../testing/selenium-webdriver';
import * as webdriver from 'selenium-webdriver';
import {crossEnvironmentSpecs} from './cross-environment.spec';
import {MainComponentHarness} from './harnesses/main-component-harness';
import {Options, setDefaultService, ServiceBuilder} from 'selenium-webdriver/chrome';
import path from 'path';

// Tests are flaky on CI unless we increase the timeout.
jasmine.DEFAULT_TIMEOUT_INTERVAL = 10_000; // 10 seconds

if (process.env['TEST_SERVER_PORT'] === undefined) {
  console.error(`Test running outside of a "web_test" target. No browser found.`);
  process.exit(1);
}

const projectRoot = path.resolve(__dirname, '../../../');
const port = process.env['TEST_SERVER_PORT'];

const chromeDriver = path.join(projectRoot, process.env['CHROMEDRIVER']!);
const chromiumBin = path.join(projectRoot, process.env['CHROMIUM_BIN']!);

setDefaultService(
  new ServiceBuilder(chromeDriver).enableVerboseLogging().loggingTo('/tmp/test.txt').build(),
);

// Kagekiri is available globally in the browser. We declare it here so we can use it in the
// browser-side script passed to `By.js`.
declare const kagekiri: {
  querySelectorAll: (selector: string, root: Element) => NodeListOf<Element>;
};

describe('WebDriverHarnessEnvironment', () => {
  let wd: webdriver.WebDriver;

  async function piercingQueryFn(selector: string, root: () => webdriver.WebElement) {
    return wd.findElements(
      webdriver.By.js((s: string, r: Element) => kagekiri.querySelectorAll(s, r), selector, root()),
    );
  }

  async function activeElement() {
    return wd.switchTo().activeElement();
  }

  beforeAll(async () => {
    wd = await new webdriver.Builder()
      .forBrowser('chrome')
      .setChromeOptions(
        new Options().setChromeBinaryPath(chromiumBin).addArguments('--no-sandbox').headless(),
      )
      .build();

    // Ideally we would refresh the page and wait for Angular to stabilize on each test.
    // We don't do it, because it causes Webdriver to eventually time out. Instead we go to
    // the page once and reset the component state before the test (see `beforeEach` below).
    await wd.get(`http://localhost:${port}/component-harness`);
    await waitForAngularReady(wd);
  });

  beforeEach(async () => {
    await wd.findElement({id: 'reset-state'}).click();
    await wd.sleep(500);
  });

  afterAll(async () => {
    await wd.quit();
  });

  describe('environment specific', () => {
    describe('HarnessLoader', () => {
      let loader: HarnessLoader;

      beforeEach(() => {
        loader = SeleniumWebDriverHarnessEnvironment.loader(wd);
      });

      it('should create HarnessLoader from WebDriverHarnessEnvironment', () => {
        expect(loader).not.toBeNull();
      });
    });

    describe('ComponentHarness', () => {
      let harness: MainComponentHarness;

      beforeEach(async () => {
        harness =
          await SeleniumWebDriverHarnessEnvironment.loader(wd).getHarness(MainComponentHarness);
      });

      it('can get elements outside of host', async () => {
        const globalEl = await harness.globalEl();
        expect(await globalEl.text()).toBe('I am a sibling!');
      });

      it('should get correct text excluding certain selectors', async () => {
        const results = await harness.subcomponentAndSpecialHarnesses();
        const subHarnessHost = await results[0].host();

        expect(await subHarnessHost.text({exclude: 'h2'})).toBe('ProtractorTestBedOther');
        expect(await subHarnessHost.text({exclude: 'li'})).toBe('List of test tools');
      });

      it('should be able to retrieve the WebElement from a WebDriverElement', async () => {
        const element = SeleniumWebDriverHarnessEnvironment.getNativeElement(await harness.host());
        expect(await element.getTagName()).toBe('test-main');
      });
    });

    describe('shadow DOM interaction', () => {
      it('should not pierce shadow boundary by default', async () => {
        const harness =
          await SeleniumWebDriverHarnessEnvironment.loader(wd).getHarness(MainComponentHarness);
        expect(await harness.shadows()).toEqual([]);
      });

      it('should pierce shadow boundary when using piercing query', async () => {
        const harness = await SeleniumWebDriverHarnessEnvironment.loader(wd, {
          queryFn: piercingQueryFn,
        }).getHarness(MainComponentHarness);
        const shadows = await harness.shadows();
        expect(
          await parallel(() => {
            return shadows.map(el => el.text());
          }),
        ).toEqual(['Shadow 1', 'Shadow 2']);
      });

      it('should allow querying across shadow boundary', async () => {
        const harness = await SeleniumWebDriverHarnessEnvironment.loader(wd, {
          queryFn: piercingQueryFn,
        }).getHarness(MainComponentHarness);
        expect(await (await harness.deepShadow()).text()).toBe('Shadow 2');
      });
    });
  });

  describe('environment independent', () =>
    crossEnvironmentSpecs(
      () => SeleniumWebDriverHarnessEnvironment.loader(wd),
      () => SeleniumWebDriverHarnessEnvironment.loader(wd).getHarness(MainComponentHarness),
      async () => (await activeElement()).getAttribute('id'),
    ));
});

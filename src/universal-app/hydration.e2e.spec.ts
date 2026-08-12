import * as webdriver from 'selenium-webdriver';
import {createE2eWebDriver} from '../e2e-app/e2e-setup';

const {builder, port} = createE2eWebDriver();

describe('hydration e2e', () => {
  let wd: webdriver.WebDriver;

  beforeAll(async () => {
    wd = await builder.build();
  });

  afterAll(async () => {
    await wd.quit();
  });

  beforeEach(async () => {
    await wd.get(`http://localhost:${port}/`);
    await wd.wait(webdriver.until.elementLocated(webdriver.By.css('.render-marker')), 5000);
  });

  it('should enable hydration', async () => {
    const hydrationState = await getHydrationState();
    const logs = await wd.manage().logs().get(webdriver.logging.Type.BROWSER);

    expect(hydrationState.hydratedComponents).toBeGreaterThan(0);
    expect(logs.map(log => log.message).filter(msg => msg.includes('NG0500'))).toEqual([]);
  });

  it('should not skip hydration on any components', async () => {
    const hydrationState = await getHydrationState();
    expect(hydrationState.componentsSkippedHydration).toBe(0);
  });

  /** Gets the hydration state from the current app. */
  async function getHydrationState() {
    return wd.executeScript<{
      hydratedComponents: number;
      componentsSkippedHydration: number;
    }>(() => {
      const devModeWindow = window as Window &
        typeof globalThis & {
          ngDevMode: {
            hydratedComponents: number;
            componentsSkippedHydration: number;
          };
        };

      return {
        hydratedComponents: devModeWindow.ngDevMode.hydratedComponents,
        componentsSkippedHydration: devModeWindow.ngDevMode.componentsSkippedHydration,
      };
    });
  }
});

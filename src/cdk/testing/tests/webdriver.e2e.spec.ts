import 'jasmine';
import * as path from 'path';
import {Builder, By, WebDriver} from 'selenium-webdriver';
import {Options, ServiceBuilder} from 'selenium-webdriver/chrome';

describe('wait for Angular', () => {
  let wd: WebDriver;

  beforeAll(async () => {
    wd = await new Builder()
        .forBrowser('chrome')

        // For local development only
        .setChromeService(new ServiceBuilder(path.join(__dirname, 'chromedriver')))

        .setChromeOptions(
            new Options()
                .headless()
        )
        .build();
  });

  afterAll(async () => {
    await wd.quit();
  });

  it('works', async () => {
    await wd.get('https://material.angular.io');
    const header = await wd.findElement(By.css('.mat-h1'));
    expect(await header.getText()).toBe('Angular Material');
  });
});

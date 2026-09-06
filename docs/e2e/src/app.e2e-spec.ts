/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as webdriver from 'selenium-webdriver';
import {createE2eWebDriver} from '../../../src/e2e-app/e2e-setup';
import {MaterialDocsAppPage} from './app.po';

const {builder, port} = createE2eWebDriver();

describe('Material Docs App', () => {
  let wd: webdriver.WebDriver;
  let page: MaterialDocsAppPage;

  beforeAll(async () => {
    wd = await builder.build();
  });

  afterAll(async () => {
    await wd.quit();
  });

  beforeEach(() => {
    page = new MaterialDocsAppPage(wd, `http://localhost:${port}/`);
  });

  it('should display welcome message', async () => {
    await page.navigateTo();
    expect(await page.getTitleText()).toEqual('Angular Material');
  });

  afterEach(async () => {
    // Assert that there are no application errors emitted from the browser
    const logs = await wd.manage().logs().get(webdriver.logging.Type.BROWSER);
    const errors = logs.filter(
      log =>
        log.level.name === 'SEVERE' &&
        !log.message.includes('ERR_ACCESS_DENIED') &&
        !log.message.includes('ERR_INTERNET_DISCONNECTED'),
    );
    expect(errors).toEqual([]);
  });
});

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as webdriver from 'selenium-webdriver';

export class MaterialDocsAppPage {
  constructor(
    private _wd: webdriver.WebDriver,
    private _baseUrl: string,
  ) {}

  async navigateTo() {
    await this._wd.get(this._baseUrl);
    await this._wd.wait(
      webdriver.until.elementLocated(
        webdriver.By.css('app-homepage header .docs-header-headline .mat-h1'),
      ),
      10000,
    );
  }

  async getTitleText() {
    const el = await this._wd.findElement(
      webdriver.By.css('app-homepage header .docs-header-headline .mat-h1'),
    );
    return el.getText();
  }
}

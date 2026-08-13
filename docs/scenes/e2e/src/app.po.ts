/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as webdriver from 'selenium-webdriver';

export class AppPage {
  constructor(
    private _wd: webdriver.WebDriver,
    private _baseUrl: string,
  ) {}

  async navigateTo(component: string): Promise<void> {
    await this._wd.get(`${this._baseUrl}/${component}`);
    await this._wd.wait(
      webdriver.until.elementLocated(webdriver.By.tagName('app-scene-viewer')),
      10000,
    );
  }
}

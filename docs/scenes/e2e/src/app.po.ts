/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {browser} from 'protractor';

export class AppPage {
  async navigateTo(component: string): Promise<unknown> {
    return browser.get(browser.baseUrl + '/' + component);
  }
}

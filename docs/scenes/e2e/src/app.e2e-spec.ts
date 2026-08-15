/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as webdriver from 'selenium-webdriver';
import {createE2eWebDriver} from '../../../../src/e2e-app/e2e-setup';
import {AppPage} from './app.po';
import {screenshot} from '../screenshot';

const {builder, port} = createE2eWebDriver();

describe('screenshot scenes for each component', () => {
  // These tests simply serve as a convenient way to take snapshots of different pages,
  // they are not actually testing anything
  let wd: webdriver.WebDriver;
  let page: AppPage;

  const components = [
    'autocomplete',
    'badge',
    'bottom-sheet',
    'button',
    'button-toggle',
    'card',
    'checkbox',
    'chips',
    'core',
    'datepicker',
    'dialog',
    'divider',
    'expansion',
    'form-field',
    'grid-list',
    'icon',
    'input',
    'list',
    'menu',
    'paginator',
    'progress-bar',
    'progress-spinner',
    'radio',
    'ripple',
    'select',
    'sidenav',
    'slide-toggle',
    'slider',
    'sort',
    'stepper',
    'snack-bar',
    'table',
    'tabs',
    'toolbar',
    'tooltip',
    'tree',
  ];

  beforeAll(async () => {
    wd = await builder.build();
  });

  afterAll(async () => {
    await wd.quit();
  });

  beforeEach(() => {
    page = new AppPage(wd, `http://localhost:${port}`);
  });

  for (const comp of components) {
    it(`screenshot for ${comp} scene`, async () => {
      await page.navigateTo(comp);
      await screenshot(comp, wd);
    });
  }
});

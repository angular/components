/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as webdriver from 'selenium-webdriver';
import {Options, setDefaultService, ServiceBuilder} from 'selenium-webdriver/chrome';
import {runfiles} from '@bazel/runfiles';

declare const jasmine: any;

export interface E2eWebDriverContext {
  builder: webdriver.Builder;
  port: string;
}

/**
 * Helper to set up a headless Chrome WebDriver builder for e2e tests running within web_test.
 */
export function createE2eWebDriver(): E2eWebDriverContext {
  if (typeof jasmine !== 'undefined' && jasmine.DEFAULT_TIMEOUT_INTERVAL) {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10_000;
  }

  if (process.env['TEST_SERVER_PORT'] === undefined) {
    console.error(`Test running outside of a "web_test" target. No browser found.`);
    process.exit(1);
  }

  const port = process.env['TEST_SERVER_PORT']!;

  const chromeDriver = runfiles.resolve(process.env['CHROMEDRIVER']!.replace(/^(\.\.\/)+/, ''));
  const chromiumBin = runfiles.resolve(
    process.env['CHROME_HEADLESS_BIN']!.replace(/^(\.\.\/)+/, ''),
  );

  setDefaultService(
    new ServiceBuilder(chromeDriver).enableVerboseLogging().loggingTo('/tmp/test.txt').build(),
  );

  const builder = new webdriver.Builder()
    .forBrowser('chrome')
    .setChromeOptions(
      new Options().setChromeBinaryPath(chromiumBin).addArguments('--no-sandbox').headless(),
    );

  return {builder, port};
}

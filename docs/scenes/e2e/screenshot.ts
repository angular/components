/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as fs from 'fs';
import * as path from 'path';
import * as webdriver from 'selenium-webdriver';

const OUTPUT_DIR = path.join(__dirname, '..', '..', 'src', 'assets', 'screenshots');

export class Screenshot {
  /** The filename used to store the screenshot. */
  get filename(): string {
    return (
      this.id
        .toLowerCase()
        .replace(/\s/g, '_')
        .replace(/[^/a-z0-9_-]+/g, '') + '.scene.png'
    );
  }

  /** The full path to the screenshot */
  get fullPath(): string {
    return path.resolve(OUTPUT_DIR, this.filename);
  }

  constructor(
    readonly id: string,
    private _wd: webdriver.WebDriver,
  ) {}

  async takeScreenshot() {
    const el = await this._wd.findElement(webdriver.By.css('app-scene-viewer'));
    const png = await el.takeScreenshot();
    this.storeScreenshot(png);
  }

  /** Replaces the existing screenshot with the newly generated one. */
  storeScreenshot(png: string) {
    try {
      if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, {recursive: true});
      }
      fs.writeFileSync(this.fullPath, png, {encoding: 'base64'});
    } catch {
      // In read-only test sandbox environments, writing to source tree is not permitted.
    }
  }
}

export function screenshot(id: string, wd: webdriver.WebDriver): Promise<void> {
  const s = new Screenshot(id, wd);
  return s.takeScreenshot();
}

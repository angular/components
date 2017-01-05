import * as fs from 'fs';
import * as gulp from 'gulp';
import * as path from 'path';
import {browser} from 'protractor';

export class Screenshot {
  id: string;

  /**
   * The filename used to store the screenshot
   * @returns {string}
   */
  get filename() {
    return this.id
        .toLowerCase()
        .replace(/[ :\/]/g, '_')
        .replace(/[^/a-z0-9_]+/g, '')
      + '.screenshot.png';
  }

  /**
   * The full path to the screenshot
   * @returns {string}
   */
  get path() {
    return path.resolve(__dirname, '..', 'screenshots', this.filename);
  }

  /**
   * @param {string} id A unique identifier used for the screenshot
   */
  constructor(id: string) {
    this.id   = id;
    browser.takeScreenshot().then(png => this.storeScreenshot(png));
  }

  /**
   * Replaces the existing screenshot with the newly generated one.
   */
  storeScreenshot(png: any) {
    var dir = path.resolve(__dirname, '..', 'screenshots');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, 0o744);
    }
    fs.writeFileSync(this.path, png, {encoding: 'base64'});
  }
}


export function screenshot(id: string) {
  return new Screenshot(id);
}

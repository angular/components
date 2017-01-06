import * as fs from 'fs';
import * as gulp from 'gulp';
import * as path from 'path';
import {browser} from 'protractor';


function initializeEnvironment(jasmine: any) {
  var reporter = new jasmine.JsApiReporter({});
  reporter.specStarted = function(result: any) {
    jasmine.getEnv().currentSpec = result.fullName;
  };
  jasmine.getEnv().addReporter(reporter);
}

initializeEnvironment(jasmine);

export class Screenshot {
  id: string;
  dir: string = '/tmp/angular-material2-build/screenshots/';

  /** The filename used to store the screenshot. */
  get filename(): string {
    return this.id
        .toLowerCase()
        .replace(/\s/g, '_')
        .replace(/[^/a-z0-9_]+/g, '')
      + '.screenshot.png';
  }

  /** The full path to the screenshot */
  get fullPath(): string {
    return path.resolve(this.dir, this.filename);
  }

  constructor(id: string) {
    this.id   = `${jasmine.getEnv().currentSpec} ${id}`;
    browser.takeScreenshot().then(png => this.storeScreenshot(png));
  }

  /** Replaces the existing screenshot with the newly generated one. */
  storeScreenshot(png: any) {
    if (!fs.existsSync(this.dir)) {
      fs.mkdirSync(this.dir, '744');
    }

    if (fs.existsSync(this.dir)) {
      fs.writeFileSync(this.fullPath, png, {encoding: 'base64' });
    }
  }
}

export function screenshot(id: string) {
  return new Screenshot(id);
}

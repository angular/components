import * as fs from 'fs';
import * as path from 'path';
import {by, element} from 'protractor';

const OUTPUT_DIR = path.join(__dirname, '..', '..', 'src', 'assets', 'screenshots');


export class Screenshot {
  /** The filename used to store the screenshot. */
  get filename(): string {
    return this.id
        .toLowerCase()
        .replace(/\s/g, '_')
        .replace(/[^/a-z0-9_-]+/g, '')
      + '.scene.png';
  }

  /** The full path to the screenshot */
  get fullPath(): string {
    return path.resolve(OUTPUT_DIR, this.filename);
  }

  constructor(readonly id: string) {}

  async takeScreenshot() {
    const png = await element(by.tagName('app-scene-viewer')).takeScreenshot();
    this.storeScreenshot(png);
  }

  /** Replaces the existing screenshot with the newly generated one. */
  storeScreenshot(png: string) {
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, '444');
    }

    if (fs.existsSync(OUTPUT_DIR)) {
      fs.writeFileSync(this.fullPath, png, {encoding: 'base64' });
    }
  }
}

export function screenshot(id: string): Promise<void> {
  const s = new Screenshot(id);
  return s.takeScreenshot();
}

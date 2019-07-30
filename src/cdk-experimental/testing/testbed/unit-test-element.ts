/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  clearElement,
  dispatchMouseEvent,
  isTextInput,
  triggerBlur,
  triggerFocus,
  typeInElement
} from '@angular/cdk/testing';
import {TestElement} from '../test-element';

/** A `TestElement` implementation for unit tests. */
export class UnitTestElement implements TestElement {
  constructor(readonly element: Element, private _stabilize: () => Promise<void>) {}

  async blur(): Promise<void> {
    await this._stabilize();
    triggerBlur(this.element as HTMLElement);
    await this._stabilize();
  }

  async clear(): Promise<void> {
    await this._stabilize();
    if (!isTextInput(this.element)) {
      throw Error('Attempting to clear an invalid element');
    }
    clearElement(this.element);
    await this._stabilize();
  }

  async click(): Promise<void> {
    await this._stabilize();
    dispatchMouseEvent(this.element, 'click');
    await this._stabilize();
  }

  async focus(): Promise<void> {
    await this._stabilize();
    triggerFocus(this.element as HTMLElement);
    await this._stabilize();
  }

  async getCssValue(property: string): Promise<string> {
    await this._stabilize();
    // TODO(mmalerba): Consider adding value normalization if we run into common cases where its
    //  needed.
    return getComputedStyle(this.element).getPropertyValue(property);
  }

  async hover(): Promise<void> {
    await this._stabilize();
    dispatchMouseEvent(this.element, 'mouseenter');
    await this._stabilize();
  }

  async sendKeys(keys: string): Promise<void> {
    await this._stabilize();
    typeInElement(this.element as HTMLElement, keys);
    await this._stabilize();
  }

  async text(): Promise<string> {
    await this._stabilize();
    return (this.element.textContent || '').trim();
  }

  async getAttribute(name: string): Promise<string|null> {
    await this._stabilize();
    let value = this.element.getAttribute(name);
    // If cannot find attribute in the element, also try to find it in property,
    // this is useful for input/textarea tags.
    if (value === null && name in this.element) {
      // We need to cast the element so we can access its properties via string indexing.
      return (this.element as unknown as {[key: string]: string|null})[name];
    }
    return value;
  }

  async hasClass(name: string): Promise<boolean> {
    await this._stabilize();
    return this.element.classList.contains(name);
  }
}

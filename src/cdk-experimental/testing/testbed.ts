/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  dispatchFakeEvent,
  dispatchKeyboardEvent,
  dispatchMouseEvent,
  triggerBlur,
  triggerFocus
} from '@angular/cdk/testing';
import {ComponentFixture} from '@angular/core/testing';

import {
  AbstractHarnessEnvironment,
  ComponentHarness,
  ComponentHarnessConstructor,
  HarnessEnvironment,
  LocatorFactory
} from './component-harness';
import {TestElement} from './test-element';

/**
 * Locator implementation for testbed.
 * Note that, this locator is exposed for internal usage, please do not use it.
 */
export class TestbedHarnessEnvironment extends AbstractHarnessEnvironment<Element> {
  protected constructor(rawRootElement: Element, private _stabilize: () => Promise<void>) {
    super(rawRootElement);
  }

  static create(fixture: ComponentFixture<unknown>): HarnessEnvironment {
    const stabilize = async () => {
      fixture.detectChanges();
      await fixture.whenStable();
    };
    return new TestbedHarnessEnvironment(fixture.nativeElement, stabilize);
  }

  static async harnessForFixtureRoot<T extends ComponentHarness>(
      fixture: ComponentFixture<unknown>, harnessType: ComponentHarnessConstructor<T>): Promise<T> {
    const stabilize = async () => {
      fixture.detectChanges();
      await fixture.whenStable();
    };
    const environment = new TestbedHarnessEnvironment(fixture.nativeElement, stabilize);
    await environment._stabilize();
    return environment.createHarness(harnessType, fixture.nativeElement);
  }

  documentRootLocatorFactory(): LocatorFactory {
    let element = this.rawRootElement;
    while (element.parentElement) {
      element = element.parentElement;
    }
    return new TestbedHarnessEnvironment(element, this._stabilize);
  }

  protected createTestElement(element: Element): TestElement {
    return new UnitTestElement(element, this._stabilize);
  }

  protected createHarness<T extends ComponentHarness>(
      harnessType: ComponentHarnessConstructor<T>, element: Element): T {
    return new harnessType(new TestbedHarnessEnvironment(element, this._stabilize));
  }

  protected createEnvironment(element: Element): HarnessEnvironment {
    return new TestbedHarnessEnvironment(element, this._stabilize);
  }

  protected async getRawElement(selector: string): Promise<Element | null> {
    await this._stabilize();
    return this.rawRootElement.querySelector(selector) || null;
  }

  protected async getAllRawElements(selector: string): Promise<Element[]> {
    await this._stabilize();
    return Array.prototype.slice.call(this.rawRootElement.querySelectorAll(selector));
  }
}

class UnitTestElement implements TestElement {
  constructor(readonly element: Element, private _stabilize: () => Promise<void>) {}

  async blur(): Promise<void> {
    await this._stabilize();
    triggerBlur(this.element as HTMLElement);
    await this._stabilize();
  }

  async clear(): Promise<void> {
    await this._stabilize();
    if (!this._isTextInput(this.element)) {
      throw Error('Attempting to clear an invalid element');
    }
    triggerFocus(this.element as HTMLElement);
    this.element.value = '';
    dispatchFakeEvent(this.element, 'input');
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
    triggerFocus(this.element as HTMLElement);
    for (const key of keys) {
      const keyCode = key.charCodeAt(0);
      dispatchKeyboardEvent(this.element, 'keydown', keyCode);
      dispatchKeyboardEvent(this.element, 'keypress', keyCode);
      if (this._isTextInput(this.element)) {
        this.element.value += key;
      }
      dispatchKeyboardEvent(this.element, 'keyup', keyCode);
      if (this._isTextInput(this.element)) {
        dispatchFakeEvent(this.element, 'input');
      }
    }
    await this._stabilize();
  }

  async text(): Promise<string> {
    await this._stabilize();
    return this.element.textContent || '';
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

  private _isTextInput(element: Element): element is HTMLInputElement | HTMLTextAreaElement {
    return element.nodeName.toLowerCase() === 'input' ||
      element.nodeName.toLowerCase() === 'textarea' ;
  }
}

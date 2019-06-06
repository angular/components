/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentFixture} from '@angular/core/testing';
import {
  ComponentHarness,
  ComponentHarnessConstructor,
  HarnessLoader,
  LocatorFactory
} from '../component-harness';
import {AbstractHarnessEnvironment} from '../harness-environment';
import {TestElement} from '../test-element';
import {UnitTestElement} from './unit-test-element';

/**
 * Locator implementation for testbed.
 * Note that, this locator is exposed for internal usage, please do not use it.
 */
export class TestbedHarnessEnvironment extends AbstractHarnessEnvironment<Element> {
  protected constructor(rawRootElement: Element, private _stabilize: () => Promise<void>) {
    super(rawRootElement);
  }

  static create(fixture: ComponentFixture<unknown>): HarnessLoader {
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
    return environment.createComponentHarness(harnessType, fixture.nativeElement);
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

  protected createComponentHarness<T extends ComponentHarness>(
      harnessType: ComponentHarnessConstructor<T>, element: Element): T {
    return new harnessType(new TestbedHarnessEnvironment(element, this._stabilize));
  }

  protected createHarnessLoader(element: Element): HarnessLoader {
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

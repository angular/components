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
import {HarnessEnvironment} from '../harness-environment';
import {TestElement} from '../test-element';
import {UnitTestElement} from './unit-test-element';

/** A `HarnessEnvironment` implementation for Angular's Testbed. */
export class TestbedHarnessEnvironment extends HarnessEnvironment<Element> {
  protected constructor(rawRootElement: Element, private _stabilize: () => Promise<void>) {
    super(rawRootElement);
  }

  /** Creates a `HarnessLoader` rooted at the given fixture's root element. */
  static create(fixture: ComponentFixture<unknown>): HarnessLoader {
    const stabilize = async () => {
      fixture.detectChanges();
      await fixture.whenStable();
    };
    return new TestbedHarnessEnvironment(fixture.nativeElement, stabilize);
  }

  /**
   * Creates an instance of the given harness type, using the fixture's root element as the
   * harness's host element. This method should be used when creating a harness for the root element
   * of a fixture, as components do not have the correct selector when they are created as the root
   * of the fixture.
   */
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

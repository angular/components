/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {TestElement} from './test-element';

/** An async function that returns a promise of the given type when called. */
export type AsyncFn<T> = () => Promise<T>;

export interface HarnessEnvironment {
  findRequired(selector: string): Promise<HarnessEnvironment>;
  findOptional(selector: string): Promise<HarnessEnvironment | null>;
  findAll(selector: string): Promise<HarnessEnvironment[]>;
  requiredHarness<T extends ComponentHarness>(harness: ComponentHarnessConstructor<T>): Promise<T>;
  optionalHarness<T extends ComponentHarness>(harness: ComponentHarnessConstructor<T>):
      Promise<T | null>;
  allHarnesses<T extends ComponentHarness>(harness: ComponentHarnessConstructor<T>): Promise<T[]>;
}

export interface LocatorFactory {
  rootElement(): TestElement;
  requiredLocator(selector: string): AsyncFn<TestElement>;
  requiredLocator<T extends ComponentHarness>(harness: ComponentHarnessConstructor<T>): AsyncFn<T>;
  optionalLocator(selector: string): AsyncFn<TestElement | null>;
  optionalLocator<T extends ComponentHarness>(harness: ComponentHarnessConstructor<T>):
      AsyncFn<T | null>;
  allLocator(selector: string): AsyncFn<TestElement[]>;
  allLocator<T extends ComponentHarness>(harness: ComponentHarnessConstructor<T>): AsyncFn<T[]>;
}

/** Interface that is used to find elements in the DOM and create harnesses for them. */
export abstract class AbstractHarnessEnvironment<E> implements HarnessEnvironment, LocatorFactory {
  protected constructor(protected rawRootElement: E) {}

  abstract findAll(selector: string): Promise<HarnessEnvironment[]>;

  protected abstract createTestElement(element: E): TestElement;

  protected abstract createHarness<T extends ComponentHarness>(
      harnessType: ComponentHarnessConstructor<T>, element: E): T;

  protected abstract getAllRawElements(selector: string): Promise<E[]>;

  rootElement(): TestElement {
    return this.createTestElement(this.rawRootElement);
  }

  requiredLocator(selector: string): AsyncFn<TestElement>;
  requiredLocator<T extends ComponentHarness>(harness: ComponentHarnessConstructor<T>): AsyncFn<T>;
  requiredLocator<T extends ComponentHarness>(
      arg: string | ComponentHarnessConstructor<T>): AsyncFn<TestElement | T> {
    return async () => {
      const result = await this._createTestElementOrHarness(arg);
      if (result) {
        return result;
      }
      const selector = typeof arg === 'string' ? arg : arg.hostSelector;
      throw Error(`Expected to find element matching selector: "${selector}", but none was found`);
    };
  }

  optionalLocator(selector: string): AsyncFn<TestElement | null>;
  optionalLocator<T extends ComponentHarness>(harness: ComponentHarnessConstructor<T>):
      AsyncFn<T | null>;
  optionalLocator<T extends ComponentHarness>(
      arg: string | ComponentHarnessConstructor<T>): AsyncFn<TestElement | T | null> {
    return async () => {
      return this._createTestElementOrHarness(arg);
    };
  }

  allLocator(selector: string): AsyncFn<TestElement[]>;
  allLocator<T extends ComponentHarness>(harness: ComponentHarnessConstructor<T>): AsyncFn<T[]>;
  allLocator<T extends ComponentHarness>(
      arg: string | ComponentHarnessConstructor<T>): AsyncFn<TestElement[] | T[]> {
    return async () => {
      if (typeof arg === 'string') {
        return (await this.getAllRawElements(arg)).map(e => this.createTestElement(e));
      } else {
        return (await this.getAllRawElements(arg.hostSelector))
            .map(e => this.createHarness(arg, e));
      }
    };
  }

  requiredHarness<T extends ComponentHarness>(harness: ComponentHarnessConstructor<T>): Promise<T> {
    return this.requiredLocator(harness)();
  }

  optionalHarness<T extends ComponentHarness>(harness: ComponentHarnessConstructor<T>):
    Promise<T | null> {
    return this.optionalLocator(harness)();
  }

  allHarnesses<T extends ComponentHarness>(harness: ComponentHarnessConstructor<T>): Promise<T[]> {
    return this.allLocator(harness)();
  }

  async findRequired(selector: string): Promise<HarnessEnvironment> {
    const environment = (await this.findAll(selector))[0];
    if (!environment) {
      throw Error(`Expected to find element matching selector: "${selector}", but none was found`);
    }
    return environment;
  }

  async findOptional(selector: string): Promise<HarnessEnvironment | null> {
    return (await this.findAll(selector))[0] || null;
  }

  private async _createTestElementOrHarness<T extends ComponentHarness>(
      arg: string | ComponentHarnessConstructor<T>): Promise<TestElement | T | null> {
    if (typeof arg === 'string') {
      const element = (await this.getAllRawElements(arg))[0];
      return this.createTestElement(element) || null;
    } else {
      const element = (await this.getAllRawElements(arg.hostSelector))[0];
      return this.createHarness(arg, element) || null;
    }
  }
}

/**
 * Base Component Harness
 * This base component harness provides the basic ability to locate element and
 * sub-component harness. It should be inherited when defining user's own
 * harness.
 */
export abstract class ComponentHarness {
  constructor(private readonly locatorFacotry: LocatorFactory) {}

  async host() {
    return this.locatorFacotry.rootElement();
  }

  protected requiredLocator(selector: string): AsyncFn<TestElement>;
  protected requiredLocator<T extends ComponentHarness>(harness: ComponentHarnessConstructor<T>):
      AsyncFn<T>;
  protected requiredLocator(arg: any): any {
    return this.locatorFacotry.requiredLocator(arg);
  }

  protected optionalLocator(selector: string): AsyncFn<TestElement | null>;
  protected optionalLocator<T extends ComponentHarness>(harness: ComponentHarnessConstructor<T>):
      AsyncFn<T | null>;
  protected optionalLocator(arg: any): any {
    return this.locatorFacotry.optionalLocator(arg);
  }

  protected allLocator(selector: string): AsyncFn<TestElement[]>;
  protected allLocator<T extends ComponentHarness>(harness: ComponentHarnessConstructor<T>):
      AsyncFn<T[]>;
  protected allLocator(arg: any): any {
    return this.locatorFacotry.allLocator(arg);
  }
}

/** Constructor for a ComponentHarness subclass. */
export interface ComponentHarnessConstructor<T extends ComponentHarness> {
  new(environment: HarnessEnvironment): T;

  hostSelector: string;
}

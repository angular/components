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

export interface HarnessLoader {
  findRequired(selector: string): Promise<HarnessLoader>;
  findOptional(selector: string): Promise<HarnessLoader | null>;
  findAll(selector: string): Promise<HarnessLoader[]>;
  requiredHarness<T extends ComponentHarness>(harness: ComponentHarnessConstructor<T>): Promise<T>;
  optionalHarness<T extends ComponentHarness>(harness: ComponentHarnessConstructor<T>):
      Promise<T | null>;
  allHarnesses<T extends ComponentHarness>(harness: ComponentHarnessConstructor<T>): Promise<T[]>;
}

export interface LocatorFactory {
  documentRootLocatorFactory(): LocatorFactory;
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
export abstract class AbstractHarnessEnvironment<E> implements HarnessLoader, LocatorFactory {
  protected constructor(protected rawRootElement: E) {}

  abstract documentRootLocatorFactory(): LocatorFactory;

  protected abstract createTestElement(element: E): TestElement;

  protected abstract createComponentHarness<T extends ComponentHarness>(
      harnessType: ComponentHarnessConstructor<T>, element: E): T;

  protected abstract createHarnessLoader(element: E): HarnessLoader;

  protected abstract getRawElement(selector: string): Promise<E | null>;

  protected abstract getAllRawElements(selector: string): Promise<E[]>;

  rootElement(): TestElement {
    return this.createTestElement(this.rawRootElement);
  }

  requiredLocator(selector: string): AsyncFn<TestElement>;
  requiredLocator<T extends ComponentHarness>(harness: ComponentHarnessConstructor<T>): AsyncFn<T>;
  requiredLocator<T extends ComponentHarness>(
      arg: string | ComponentHarnessConstructor<T>): AsyncFn<TestElement | T> {
    return async () => {
      if (typeof arg === 'string') {
        const element = await this.getRawElement(arg);
        if (element) {
          return this.createTestElement(element);
        }
      } else {
        const element = await this.getRawElement(arg.hostSelector);
        if (element) {
          return this.createComponentHarness(arg, element);
        }
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
      if (typeof arg === 'string') {
        const element = await this.getRawElement(arg);
        return element ? this.createTestElement(element) : null;
      } else {
        const element = await this.getRawElement(arg.hostSelector);
        return element ? this.createComponentHarness(arg, element) : null;
      }
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
            .map(e => this.createComponentHarness(arg, e));
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

  async findRequired(selector: string): Promise<HarnessLoader> {
    const element = await this.getRawElement(selector);
    if (element) {
      return this.createHarnessLoader(element);
    }
    throw Error(`Expected to find element matching selector: "${selector}", but none was found`);
  }

  async findOptional(selector: string): Promise<HarnessLoader | null> {
    const element = await this.getRawElement(selector);
    return element ? this.createHarnessLoader(element) : null;
  }

  async findAll(selector: string): Promise<HarnessLoader[]> {
    return (await this.getAllRawElements(selector)).map(e => this.createHarnessLoader(e));
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

  protected documentRootLocatorFactory(): LocatorFactory {
    return this.locatorFacotry.documentRootLocatorFactory();
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
  new(locatorFactory: LocatorFactory): T;

  hostSelector: string;
}

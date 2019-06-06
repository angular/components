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

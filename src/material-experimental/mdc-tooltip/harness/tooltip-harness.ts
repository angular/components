/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentHarness, HarnessPredicate, TestElement} from '@angular/cdk-experimental/testing';
import {TooltipHarnessFilters} from './tooltip-harness-filters';

/**
 * Harness for interacting with a standard mat-tooltip in tests.
 * @dynamic
 */
export class MatTooltipHarness extends ComponentHarness {
  private _panel = this.documentRootLocatorFactory().locatorFor('.mat-tooltip');
  private _optionalPanel = this.documentRootLocatorFactory().locatorForOptional('.mat-tooltip');
  static hostSelector = '.mat-tooltip-trigger';

  /**
   * Gets a `HarnessPredicate` that can be used to search
   * for a tooltip trigger with specific attributes.
   * @param options Options for narrowing the search.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(options: TooltipHarnessFilters = {}): HarnessPredicate<MatTooltipHarness> {
    return new HarnessPredicate(MatTooltipHarness)
        .addOption('id', options.id,
             async (harness, id) => (await harness.getAttribute('id')) === id);
  }

  /** Opens the tooltip. */
  async open(): Promise<void> {
    return (await this.host()).hover();
  }

  /** Closes the tooltip. */
  async close(): Promise<void> {
    return (await this.host()).movePointerAway();
  }

  /** Gets whether the tooltip is open. */
  async isOpen(): Promise<boolean> {
    return !!(await this._optionalPanel());
  }

  /** Gets a promise for the tooltip panel's text. */
  async getTooltipText(): Promise<string> {
    const panel = await this._optionalPanel();
    return panel ? panel.text() : '';
  }

  /** Gets the overlay that contains the tooltip content. */
  async getTooltipElement(): Promise<TestElement> {
    return this._panel();
  }

  /** Gets an attribute value from the tooltip trigger. */
  async getAttribute(attributeName: string): Promise<string|null> {
    return (await this.host()).getAttribute(attributeName);
  }
}

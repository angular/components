/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ComponentHarness} from '@angular/cdk/testing';

/**
 * Base class for custom form-field control harnesses. Harnesses for
 * custom controls with form-fields need to implement this interface.
 */
export abstract class MatFormFieldControlHarness extends ComponentHarness {}

/**
 * Shared behavior for `MatFormFieldControlHarness` implementations
 */
export abstract class MatFormFieldControlHarnessBase extends MatFormFieldControlHarness {
  private readonly _floatingLabelSelector = '.mdc-floating-label';

  /** Gets the text content of the floating label, if it exists. */
  async getLabel(): Promise<string | null> {
    const documentRootLocator = this.documentRootLocatorFactory();
    const labelId = await (await this.host()).getAttribute('aria-labelledby');
    const hostId = await (await this.host()).getAttribute('id');

    if (labelId) {
      // First option, try to fetch the label using the `aria-labelledby`
      // attribute.
      const labelEl = await documentRootLocator.locatorForOptional(
        `${this._floatingLabelSelector}[id="${labelId}"]`,
      )();
      return labelEl ? labelEl.text() : null;
    } else if (hostId) {
      // Fallback option, try to match the id of the input with the `for`
      // attribute of the label.
      const labelEl = await documentRootLocator.locatorForOptional(
        `${this._floatingLabelSelector}[for="${hostId}"]`,
      )();
      return labelEl ? labelEl.text() : null;
    }
    return null;
  }
}

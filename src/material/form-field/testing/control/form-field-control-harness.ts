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
  /**
   * Gets the label for the control, if it exists. This might be provided by a label element or by
   * the `aria-label` attribute.
   */
  async getLabel(): Promise<string | null> {
    const documentRootLocator = this.documentRootLocatorFactory();
    const labelId = await (await this.host()).getAttribute('aria-labelledby');
    const labelText = await (await this.host()).getAttribute('aria-label');
    const hostId = await (await this.host()).getAttribute('id');

    if (labelId) {
      // First, try to find the label by following [aria-labelledby]
      const labelEl = await documentRootLocator.locatorForOptional(`[id="${labelId}"]`)();
      return labelEl ? labelEl.text() : null;
    } else if (labelText) {
      // If that doesn't work, return [aria-label] if it exists
      return labelText;
    } else if (hostId) {
      // Finally, search the DOM for a label that points to the host element
      const labelEl = await documentRootLocator.locatorForOptional(`[for="${hostId}"]`)();
      return labelEl ? labelEl.text() : null;
    }
    return null;
  }
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentHarness} from '@angular/cdk-experimental/testing';

/**
 * Harness for interacting with a grid's chip input in tests.
 * @dynamic
 */
export class MatChipInputHarness extends ComponentHarness {
  static hostSelector = 'input.mat-mdc-chip-input';

  /** Gets a promise for the disabled state. */
  async isDisabled(): Promise<boolean> {
    const ariaSelected = (await this.host()).getAttribute('disabled');
    return await ariaSelected === 'true';
  }

  /** Gets a promise for the placeholder text. */
  async getPlaceholder(): Promise<string|null> {
    return (await this.host()).getAttribute('placeholder');
  }
}

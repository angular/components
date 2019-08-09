/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {MatChipHarness} from './chip-harness';

/**
 * Harness for interacting with a mat-chip-option in tests.
 * @dynamic
 */
export class MatChipOptionHarness extends MatChipHarness {
  static hostSelector = 'mat-basic-chip-option, mat-chip-option';

  async isSelected(): Promise<boolean> {
    const ariaSelected = (await this.host()).getAttribute('aria-selected');
    return await ariaSelected === 'true';
  }
}

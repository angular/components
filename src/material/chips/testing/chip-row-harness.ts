/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {TestKey} from '@angular/cdk/testing';
import {MatChipEditInputHarness} from './chip-edit-input-harness';
import {MatChipHarness} from './chip-harness';
import {ChipEditInputHarnessFilters} from './chip-harness-filters';

/** Harness for interacting with a mat-chip-row in tests. */
export class MatChipRowHarness extends MatChipHarness {
  static override hostSelector = '.mat-mdc-chip-row';

  /** Whether the chip is editable. */
  async isEditable(): Promise<boolean> {
    return (await this.host()).hasClass('mat-mdc-chip-editable');
  }

  /** Whether the chip is currently being edited. */
  async isEditing(): Promise<boolean> {
    return (await this.host()).hasClass('mat-mdc-chip-editing');
  }

  /** Sets the chip row into an editing state, if it is editable. */
  async startEditing(): Promise<void> {
    if (!(await this.isEditable())) {
      throw new Error('Cannot begin editing a chip that is not editable.');
    }
    return (await this.host()).dispatchEvent('click');
  }

  /** Stops editing the chip, if it was in the editing state. */
  async finishEditing(): Promise<void> {
    if (await this.isEditing()) {
      await (await this.host()).sendKeys(TestKey.ENTER);
    }
  }

  /** Gets the edit input inside the chip row. */
  async getEditInput(filter: ChipEditInputHarnessFilters = {}): Promise<MatChipEditInputHarness> {
    return this.locatorFor(MatChipEditInputHarness.with(filter))();
  }
}

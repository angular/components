/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ContentContainerComponentHarness, HarnessPredicate, TestKey} from '@angular/cdk/testing';
import {MatChipAvatarHarness} from './chip-avatar-harness';
import {
  ChipAvatarHarnessFilters,
  ChipHarnessFilters,
  ChipRemoveHarnessFilters
} from './chip-harness-filters';
import {MatChipRemoveHarness} from './chip-remove-harness';

/** Harness for interacting with a standard selectable Angular Material chip in tests. */
export class MatChipHarness extends ContentContainerComponentHarness {
  /** The selector for the host element of a `MatChip` instance. */
  static hostSelector = '.mat-chip';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a `MatChipHarness` that meets
   * certain criteria.
   * @param options Options for filtering which chip instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with<T extends typeof MatChipHarness>(options: ChipHarnessFilters = {}):
    HarnessPredicate<InstanceType<T>> {
    return new HarnessPredicate(MatChipHarness, options)
      .addOption('text', options.text, (harness, label) => {
        return HarnessPredicate.stringMatches(harness.getText(), label);
      }) as unknown as HarnessPredicate<InstanceType<T>>;
  }

  /** Gets the text of the chip. */
  async getText(): Promise<string> {
    return (await this.host()).text({
      exclude: '.mat-chip-avatar, .mat-chip-trailing-icon, .mat-icon'
    });
  }

  /** Whether the chip is disabled. */
  async isDisabled(): Promise<boolean> {
    return (await this.host()).hasClass('mat-chip-disabled');
  }

  /** Removes the given chip. Only applies if it's removable. */
  async remove(): Promise<void> {
    await (await this.host()).sendKeys(TestKey.DELETE);
  }

  /**
   * Gets the remove button inside of a chip.
   * @param filter Optionally filters which remove buttons are included.
   */
  async getRemoveButton(filter: ChipRemoveHarnessFilters = {}): Promise<MatChipRemoveHarness> {
    return this.locatorFor(MatChipRemoveHarness.with(filter))();
  }

  /**
   * Gets the avatar inside a chip.
   * @param filter Optionally filters which avatars are included.
   */
  async getAvatar(filter: ChipAvatarHarnessFilters = {}): Promise<MatChipAvatarHarness | null> {
    return this.locatorForOptional(MatChipAvatarHarness.with(filter))();
  }
}

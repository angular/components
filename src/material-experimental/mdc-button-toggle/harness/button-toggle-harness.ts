/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentHarness, HarnessPredicate} from '@angular/cdk-experimental/testing';
import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {ButtonToggleHarnessFilters} from './button-toggle-harness-filters';

/**
 * Harness for interacting with a mat-button-toggle in tests.
 * @dynamic
 */
export class MatButtonToggleHarness extends ComponentHarness {
  static hostSelector = 'mat-button-toggle';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a toggle with specific attributes.
   * @param options Options for narrowing the search:
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(options: ButtonToggleHarnessFilters = {}): HarnessPredicate<MatButtonToggleHarness> {
    return new HarnessPredicate(MatButtonToggleHarness)
      .addOption('name', options.name,
          async (harness, name) => (await harness.getName()) === name)
      .addOption('label', options.label,
          (harness, label) => HarnessPredicate.stringMatches(harness.getText(), label));
  }

  private _label = this.locatorFor('.mat-button-toggle-label-content');
  private _button = this.locatorFor('.mat-button-toggle-button');

  /** Gets a boolean promise indicating if the button toggle is checked. */
  async isChecked(): Promise<boolean> {
    const checked = (await this._button()).getAttribute('aria-pressed');
    return coerceBooleanProperty(await checked);
  }

  /** Gets a boolean promise indicating if the button toggle is disabled. */
  async isDisabled(): Promise<boolean> {
    const disabled = (await this._button()).getAttribute('disabled');
    return coerceBooleanProperty(await disabled);
  }

  /** Gets a promise for the button toggle's name. */
  async getName(): Promise<string | null> {
    return (await this._button()).getAttribute('name');
  }

  /** Gets a promise for the button toggle's aria-label. */
  async getAriaLabel(): Promise<string | null> {
    return (await this._button()).getAttribute('aria-label');
  }

  /** Gets a promise for the button toggles's aria-labelledby. */
  async getAriaLabelledby(): Promise<string | null> {
    return (await this._button()).getAttribute('aria-labelledby');
  }

  /** Gets a promise for the button toggle's text. */
  async getText(): Promise<string> {
    return (await this._label()).text();
  }

  /** Focuses the toggle and returns a void promise that indicates when the action is complete. */
  async focus(): Promise<void> {
    return (await this._button()).focus();
  }

  /** Blurs the toggle and returns a void promise that indicates when the action is complete. */
  async blur(): Promise<void> {
    return (await this._button()).blur();
  }

  /**
   * Toggle the checked state of the buttons toggle and returns
   * a void promise that indicates when the action is complete.
   */
  async toggle(): Promise<void> {
    return (await this._button()).click();
  }

  /**
   * Puts the button toggle in a checked state by toggling it if it's currently unchecked, or doing
   * nothing if it is already checked. Returns a void promise that indicates when the action is
   * complete.
   */
  async check(): Promise<void> {
    if (!(await this.isChecked())) {
      await this.toggle();
    }
  }

  /**
   * Puts the button toggle in an unchecked state by toggling it if it is currently checked, or
   * doing nothing if it's already unchecked. Returns a void promise that indicates when the action
   * is complete.
   */
  async uncheck(): Promise<void> {
    if (await this.isChecked()) {
      await this.toggle();
    }
  }
}

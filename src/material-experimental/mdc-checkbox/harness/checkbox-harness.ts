/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentHarness, HarnessPredicate} from '@angular/cdk-experimental/testing';
import {coerceBooleanProperty} from '@angular/cdk/coercion';

/**
 * Harness for interacting with a standard mat-checkbox in tests.
 * @dynamic
 */
export class MatCheckboxHarness extends ComponentHarness {
  static hostSelector = 'mat-checkbox';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a checkbox with specific attributes.
   * @param options Options for narrowing the search:
   *   - `label` finds a checkbox with specific label text.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(options: {label?: string | RegExp} = {}): HarnessPredicate<MatCheckboxHarness> {
    return new HarnessPredicate(MatCheckboxHarness)
        .addOption('label', options.label,
            (harness, label) => HarnessPredicate.stringMatches(harness.getLabelText(), label));
  }

  private _label = this.locatorFor('.mat-checkbox-label');
  private _input = this.locatorFor('input');

  /** Gets a boolean promise indicating if the checkbox is checked. */
  async isChecked(): Promise<boolean> {
    const checked = (await this._input()).getAttribute('checked');
    return coerceBooleanProperty(await checked);
  }

  /** Gets a boolean promise indicating if the checkbox is in an indeterminate state. */
  async isIndeterminate(): Promise<boolean> {
    const indeterminate = (await this._input()).getAttribute('indeterminate');
    return coerceBooleanProperty(await indeterminate);
  }

  /** Gets a boolean promise indicating if the checkbox is disabled. */
  async isDisabled(): Promise<boolean> {
    const disabled = (await this._input()).getAttribute('disabled');
    return coerceBooleanProperty(await disabled);
  }

  /** Gets a boolean promise indicating if the checkbox is required. */
  async isRequired(): Promise<boolean> {
    const required = (await this._input()).getAttribute('required');
    return coerceBooleanProperty(await required);
  }

  /** Gets a boolean promise indicating if the checkbox is valid. */
  async isValid(): Promise<boolean> {
    const invalid = (await this.host()).hasClass('ng-invalid');
    return !(await invalid);
  }

  /** Gets a promise for the checkbox's name. */
  async getName(): Promise<string | null> {
    return (await this._input()).getAttribute('name');
  }

  /** Gets a promise for the checkbox's value. */
  async getValue(): Promise<string | null> {
    return (await this._input()).getAttribute('value');
  }

  /** Gets a promise for the checkbox's aria-label. */
  async getAriaLabel(): Promise<string | null> {
    return (await this._input()).getAttribute('aria-label');
  }

  /** Gets a promise for the checkbox's aria-labelledby. */
  async getAriaLabelledby(): Promise<string | null> {
    return (await this._input()).getAttribute('aria-labelledby');
  }

  /** Gets a promise for the checkbox's label text. */
  async getLabelText(): Promise<string> {
    return (await this._label()).text();
  }

  /** Focuses the checkbox and returns a void promise that indicates when the action is complete. */
  async foucs(): Promise<void> {
    return (await this._input()).focus();
  }

  /** Blurs the checkbox and returns a void promise that indicates when the action is complete. */
  async blur(): Promise<void> {
    return (await this._input()).blur();
  }

  /**
   * Toggle the checked state of the checkbox and returns a void promise that indicates when the
   * action is complete.
   */
  async toggle(): Promise<void> {
    return (await this._input()).click();
  }

  /**
   * Puts the checkbox in a checked state by toggling it if it is currently unchecked, or doing
   * nothing if it is already checked. Returns a void promise that indicates when the action is
   * complete.
   */
  async check(): Promise<void> {
    if (!(await this.isChecked())) {
      await this.toggle();
    }
  }

  /**
   * Puts the checkbox in an unchecked state by toggling it if it is currently checked, or doing
   * nothing if it is already unchecked. Returns a void promise that indicates when the action is
   * complete.
   */
  async uncheck(): Promise<void> {
    if (await this.isChecked()) {
      await this.toggle();
    }
  }
}

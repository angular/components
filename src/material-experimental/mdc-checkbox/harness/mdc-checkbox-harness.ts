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
 * Harness for interacting with a MDC-based mat-checkbox in tests.
 * @dynamic
 */
export class MatCheckboxHarness extends ComponentHarness {
  static hostSelector = 'mat-checkbox';

  static with(options: {label: string | RegExp}): HarnessPredicate<MatCheckboxHarness> {
    return new HarnessPredicate(MatCheckboxHarness)
        .addOption('label', options.label,
            (harness, label) => HarnessPredicate.stringMatches(harness.getLabelText(), label));
  }

  private _label = this.locatorFor('label');
  private _input = this.locatorFor('input');

  async isChecked(): Promise<boolean> {
    const checked = (await this._input()).getAttribute('checked');
    return coerceBooleanProperty(await checked);
  }

  async isIndeterminate(): Promise<boolean> {
    const indeterminate = (await this._input()).getAttribute('indeterminate');
    return coerceBooleanProperty(await indeterminate);
  }

  async isDisabled(): Promise<boolean> {
    const disabled = (await this._input()).getAttribute('disabled');
    return coerceBooleanProperty(await disabled);
  }

  async isRequired(): Promise<boolean> {
    const required = (await this._input()).getAttribute('required');
    return coerceBooleanProperty(await required);
  }

  async isValid(): Promise<boolean> {
    const invalid = (await this.host()).hasClass('ng-invalid');
    return !(await invalid);
  }

  async getName(): Promise<string | null> {
    return (await this._input()).getAttribute('name');
  }

  async getValue(): Promise<string | null> {
    return (await this._input()).getAttribute('value');
  }

  async getAriaLabel(): Promise<string | null> {
    return (await this._input()).getAttribute('aria-label');
  }

  async getAriaLabelledby(): Promise<string | null> {
    return (await this._input()).getAttribute('aria-labelledby');
  }

  async getLabelText(): Promise<string> {
    return (await this._label()).text();
  }

  async foucs(): Promise<void> {
    return (await this._input()).focus();
  }

  async blur(): Promise<void> {
    return (await this._input()).blur();
  }

  async toggle(): Promise<void> {
    return (await this._input()).click();
  }

  async check(): Promise<void> {
    if (!(await this.isChecked())) {
      await this.toggle();
    }
  }

  async uncheck(): Promise<void> {
    if (await this.isChecked()) {
      await this.toggle();
    }
  }
}

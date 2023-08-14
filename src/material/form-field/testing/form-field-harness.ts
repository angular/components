/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  ComponentHarness,
  ComponentHarnessConstructor,
  HarnessPredicate,
  HarnessQuery,
  parallel,
} from '@angular/cdk/testing';
import {ErrorHarnessFilters, MatErrorHarness} from './error-harness';
import {MatInputHarness} from '@angular/material/input/testing';
import {MatFormFieldControlHarness} from '@angular/material/form-field/testing/control';
import {MatSelectHarness} from '@angular/material/select/testing';
import {
  MatDatepickerInputHarness,
  MatDateRangeInputHarness,
} from '@angular/material/datepicker/testing';
import {FormFieldHarnessFilters} from './form-field-harness-filters';

/** Possible harnesses of controls which can be bound to a form-field. */
export type FormFieldControlHarness =
  | MatInputHarness
  | MatSelectHarness
  | MatDatepickerInputHarness
  | MatDateRangeInputHarness;

export class MatFormFieldHarness extends ComponentHarness {
  private _prefixContainer = this.locatorForOptional('.mat-mdc-form-field-text-prefix');
  private _suffixContainer = this.locatorForOptional('.mat-mdc-form-field-text-suffix');
  private _label = this.locatorForOptional('.mdc-floating-label');
  private _hints = this.locatorForAll('.mat-mdc-form-field-hint');
  private _inputControl = this.locatorForOptional(MatInputHarness);
  private _selectControl = this.locatorForOptional(MatSelectHarness);
  private _datepickerInputControl = this.locatorForOptional(MatDatepickerInputHarness);
  private _dateRangeInputControl = this.locatorForOptional(MatDateRangeInputHarness);
  private _textField = this.locatorFor('.mat-mdc-text-field-wrapper');
  private _errorHarness = MatErrorHarness;

  static hostSelector = '.mat-mdc-form-field';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a form field with specific
   * attributes.
   * @param options Options for filtering which form field instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with<T extends MatFormFieldHarness>(
    this: ComponentHarnessConstructor<T>,
    options: FormFieldHarnessFilters = {},
  ): HarnessPredicate<T> {
    return new HarnessPredicate(this, options)
      .addOption('floatingLabelText', options.floatingLabelText, async (harness, text) =>
        HarnessPredicate.stringMatches(await harness.getLabel(), text),
      )
      .addOption(
        'hasErrors',
        options.hasErrors,
        async (harness, hasErrors) => (await harness.hasErrors()) === hasErrors,
      )
      .addOption(
        'isValid',
        options.isValid,
        async (harness, isValid) => (await harness.isControlValid()) === isValid,
      );
  }

  /** Gets the appearance of the form-field. */
  async getAppearance(): Promise<'fill' | 'outline'> {
    const textFieldEl = await this._textField();
    if (await textFieldEl.hasClass('mdc-text-field--outlined')) {
      return 'outline';
    }
    return 'fill';
  }

  /** Whether the form-field has a label. */
  async hasLabel(): Promise<boolean> {
    return (await this._label()) !== null;
  }

  /** Whether the label is currently floating. */
  async isLabelFloating(): Promise<boolean> {
    const labelEl = await this._label();
    return labelEl !== null ? await labelEl.hasClass('mdc-floating-label--float-above') : false;
  }

  /** Gets the label of the form-field. */
  async getLabel(): Promise<string | null> {
    const labelEl = await this._label();
    return labelEl ? labelEl.text() : null;
  }

  /** Whether the form-field has errors. */
  async hasErrors(): Promise<boolean> {
    return (await this.getTextErrors()).length > 0;
  }

  /** Whether the form-field is disabled. */
  async isDisabled(): Promise<boolean> {
    return (await this.host()).hasClass('mat-form-field-disabled');
  }

  /** Whether the form-field is currently autofilled. */
  async isAutofilled(): Promise<boolean> {
    return (await this.host()).hasClass('mat-form-field-autofilled');
  }

  /**
   * Gets the harness of the control that is bound to the form-field. Only
   * default controls such as "MatInputHarness" and "MatSelectHarness" are
   * supported.
   */
  async getControl(): Promise<FormFieldControlHarness | null>;

  /**
   * Gets the harness of the control that is bound to the form-field. Searches
   * for a control that matches the specified harness type.
   */
  async getControl<X extends MatFormFieldControlHarness>(
    type: ComponentHarnessConstructor<X>,
  ): Promise<X | null>;

  /**
   * Gets the harness of the control that is bound to the form-field. Searches
   * for a control that matches the specified harness predicate.
   */
  async getControl<X extends MatFormFieldControlHarness>(
    type: HarnessPredicate<X>,
  ): Promise<X | null>;

  // Implementation of the "getControl" method overload signatures.
  async getControl<X extends MatFormFieldControlHarness>(type?: HarnessQuery<X>) {
    if (type) {
      return this.locatorForOptional(type)();
    }
    const [select, input, datepickerInput, dateRangeInput] = await parallel(() => [
      this._selectControl(),
      this._inputControl(),
      this._datepickerInputControl(),
      this._dateRangeInputControl(),
    ]);

    // Match the datepicker inputs first since they can also have a `MatInput`.
    return datepickerInput || dateRangeInput || select || input;
  }

  /** Gets the theme color of the form-field. */
  async getThemeColor(): Promise<'primary' | 'accent' | 'warn'> {
    const hostEl = await this.host();
    const [isAccent, isWarn] = await parallel(() => {
      return [hostEl.hasClass('mat-accent'), hostEl.hasClass('mat-warn')];
    });
    if (isAccent) {
      return 'accent';
    } else if (isWarn) {
      return 'warn';
    }
    return 'primary';
  }

  /** Gets error messages which are currently displayed in the form-field. */
  async getTextErrors(): Promise<string[]> {
    const errors = await this.getErrors();
    return parallel(() => errors.map(e => e.getText()));
  }

  /** Gets all of the error harnesses in the form field. */
  async getErrors(filter: ErrorHarnessFilters = {}): Promise<MatErrorHarness[]> {
    return this.locatorForAll(this._errorHarness.with(filter))();
  }

  /** Gets hint messages which are currently displayed in the form-field. */
  async getTextHints(): Promise<string[]> {
    const hints = await this._hints();
    return parallel(() => hints.map(e => e.text()));
  }

  /** Gets the text inside the prefix element. */
  async getPrefixText(): Promise<string> {
    const prefix = await this._prefixContainer();
    return prefix ? prefix.text() : '';
  }

  /** Gets the text inside the suffix element. */
  async getSuffixText(): Promise<string> {
    const suffix = await this._suffixContainer();
    return suffix ? suffix.text() : '';
  }

  /**
   * Whether the form control has been touched. Returns "null"
   * if no form control is set up.
   */
  async isControlTouched(): Promise<boolean | null> {
    if (!(await this._hasFormControl())) {
      return null;
    }
    return (await this.host()).hasClass('ng-touched');
  }

  /**
   * Whether the form control is dirty. Returns "null"
   * if no form control is set up.
   */
  async isControlDirty(): Promise<boolean | null> {
    if (!(await this._hasFormControl())) {
      return null;
    }
    return (await this.host()).hasClass('ng-dirty');
  }

  /**
   * Whether the form control is valid. Returns "null"
   * if no form control is set up.
   */
  async isControlValid(): Promise<boolean | null> {
    if (!(await this._hasFormControl())) {
      return null;
    }
    return (await this.host()).hasClass('ng-valid');
  }

  /**
   * Whether the form control is pending validation. Returns "null"
   * if no form control is set up.
   */
  async isControlPending(): Promise<boolean | null> {
    if (!(await this._hasFormControl())) {
      return null;
    }
    return (await this.host()).hasClass('ng-pending');
  }

  /** Checks whether the form-field control has set up a form control. */
  private async _hasFormControl(): Promise<boolean> {
    const hostEl = await this.host();
    // If no form "NgControl" is bound to the form-field control, the form-field
    // is not able to forward any control status classes. Therefore if either the
    // "ng-touched" or "ng-untouched" class is set, we know that it has a form control
    const [isTouched, isUntouched] = await parallel(() => [
      hostEl.hasClass('ng-touched'),
      hostEl.hasClass('ng-untouched'),
    ]);
    return isTouched || isUntouched;
  }
}

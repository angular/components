import {
  Input,
  Directive,
  forwardRef,
  Provider,
} from '@angular/core';
import {
  AbstractControl,
  ValidationErrors,
  Validator,
  Validators,
  NG_VALIDATORS,
} from '@angular/forms';

export const MD_CHECKBOX_REQUIRED_VALIDATOR: Provider = {
  provide: NG_VALIDATORS,
  useExisting: forwardRef(() => MdCheckboxRequiredValidator),
  multi: true
  };

@Directive({
  selector:
  'md-checkbox[required][formControlName],' +
  'md-checkbox[required][formControl],md-checkbox[required][ngModel]',
  providers: [MD_CHECKBOX_REQUIRED_VALIDATOR],
  host: {'[attr.required]': 'required ? "" : null'}
})
export class MdCheckboxRequiredValidator implements Validator {
  validate(c: AbstractControl): ValidationErrors|null {
    return this.required ? Validators.requiredTrue(c) : null;
  }

  private _required: boolean;
  private _onChange: () => void;

  @Input()
  get required(): boolean|string { return this._required; }

  set required(value: boolean|string) {
    this._required = value != null && value !== false && `${value}` !== 'false';
    if (this._onChange) {
      this._onChange();
    }
  }

  registerOnValidatorChange(fn: () => void): void { this._onChange = fn; }
}


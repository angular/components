import {
  Directive,
  forwardRef,
  Provider,
} from '@angular/core';
import {
  CheckboxRequiredValidator,
  NG_VALIDATORS,
} from '@angular/forms';

export const _MdCheckboxRequiredValidator = CheckboxRequiredValidator;

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
export class MdCheckboxRequiredValidator extends _MdCheckboxRequiredValidator {}

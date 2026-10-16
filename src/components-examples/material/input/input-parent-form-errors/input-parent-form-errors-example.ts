import {Component} from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  FormGroupDirective,
  NgForm,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import {ErrorStateMatcher} from '@angular/material/core';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';

/** Validates that the `password` and `confirmPassword` controls of a form group match. */
const passwordsMatchValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
  const password = group.get('password')?.value;
  const confirmPassword = group.get('confirmPassword')?.value;
  return password === confirmPassword ? null : {passwordsMismatch: true};
};

/**
 * Error state matcher that also shows the parent form group's `passwordsMismatch` error
 * once the user has interacted with the control or the form has been submitted.
 */
export class PasswordsMismatchErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    if (!control) {
      return false;
    }

    const hasInteracted = control.dirty || control.touched || !!form?.submitted;
    const hasError = control.invalid || !!control.parent?.hasError('passwordsMismatch');
    return hasInteracted && hasError;
  }
}

/**
 * @title Input with errors from a parent form group
 */
@Component({
  selector: 'input-parent-form-errors-example',
  templateUrl: 'input-parent-form-errors-example.html',
  styleUrl: 'input-parent-form-errors-example.css',
  imports: [MatFormFieldModule, MatInputModule, ReactiveFormsModule],
})
export class InputParentFormErrorsExample {
  protected passwordForm = new FormGroup(
    {
      password: new FormControl('', Validators.required),
      confirmPassword: new FormControl('', Validators.required),
    },
    {validators: passwordsMatchValidator},
  );

  protected matcher = new PasswordsMismatchErrorStateMatcher();
}

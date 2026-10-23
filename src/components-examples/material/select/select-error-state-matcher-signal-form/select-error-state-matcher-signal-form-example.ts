import {Component, signal} from '@angular/core';
import {ErrorStateMatcher} from '@angular/material/core';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import {Field, form, FormField, pattern, required} from '@angular/forms/signals';

/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState() {
    return false;
  }
  isSignalErrorState(field: Field<unknown> | null): boolean {
    const isSubmitting = (field && field().submitting()) ?? false;
    return !!(field && field().invalid() && (field().dirty() || field().touched() || isSubmitting));
  }
}

/** @title Select with a custom ErrorStateMatcher (signal forms) */
@Component({
  selector: 'select-error-state-matcher-signal-form-example',
  templateUrl: 'select-error-state-matcher-signal-form-example.html',
  imports: [MatFormFieldModule, MatSelectModule, FormField, MatInputModule],
})
export class SelectErrorStateMatcherSignalFormExample {
  private _validPattern = /^valid$/;

  protected selectFormField = form(signal('valid'), p => {
    required(p);
    pattern(p, this._validPattern);
  });

  protected nativeSelectFormField = form(signal('valid'), p => {
    required(p);
    pattern(p, this._validPattern);
  });

  protected matcher = new MyErrorStateMatcher();
}

import {Component, signal} from '@angular/core';
import {email, form, FormField, required} from '@angular/forms/signals';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';

/** @title Form field with error messages (signal forms) */
@Component({
  selector: 'form-field-error-signal-form-example',
  templateUrl: 'form-field-error-signal-form-example.html',
  styleUrl: 'form-field-error-signal-form-example.css',
  imports: [MatFormFieldModule, MatInputModule, FormField],
})
export class FormFieldErrorSignalFormExample {
  protected email = form(signal(''), p => {
    required(p, {message: 'You must enter a value'});
    email(p, {message: 'Not a valid email'});
  });
}

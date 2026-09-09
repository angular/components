import {Component, signal} from '@angular/core';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {email, form, FormField, required} from '@angular/forms/signals';

/**
 * @title Input with error messages (signal form)
 */
@Component({
  selector: 'input-errors-signal-form-example',
  templateUrl: 'input-errors-signal-form-example.html',
  styleUrl: 'input-errors-signal-form-example.css',
  imports: [MatFormFieldModule, MatInputModule, FormField],
})
export class InputErrorsSignalFormExample {
  private _emailModel = signal('');

  protected emailForm = form(this._emailModel, schemaPath => {
    (required(schemaPath), email(schemaPath));
  });
}

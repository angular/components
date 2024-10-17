import {Component} from '@angular/core';
import {FormControl, Validators, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {map} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {AsyncPipe, JsonPipe} from '@angular/common';
import {CdkListbox, CdkOption} from '@angular/cdk/listbox';

/** @title Listbox with forms validation. */
@Component({
  selector: 'cdk-listbox-forms-validation-example',
  exportAs: 'cdkListboxFormsValidationExample',
  templateUrl: 'cdk-listbox-forms-validation-example.html',
  styleUrl: 'cdk-listbox-forms-validation-example.css',
  imports: [CdkListbox, FormsModule, ReactiveFormsModule, CdkOption, AsyncPipe, JsonPipe],
})
export class CdkListboxFormsValidationExample {
  signs = [
    'Rat',
    'Ox',
    'Tiger',
    'Rabbit',
    'Dragon',
    'Snake',
    'Horse',
    'Goat',
    'Monkey',
    'Rooster',
    'Dog',
    'Pig',
  ];
  invalid: Observable<boolean>;

  constructor() {
    this.invalid = this.signCtrl.valueChanges.pipe(
      map(() => this.signCtrl.touched && !this.signCtrl.valid),
    );
  }

  // #docregion errors
  signCtrl = new FormControl<string[]>([], Validators.required);

  getErrors() {
    const errors = [];
    if (this.signCtrl.hasError('required')) {
      errors.push('You must enter your zodiac sign');
    }

    return errors.length ? errors : null;
  }
  // #enddocregion errors
}

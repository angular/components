import {Component, signal} from '@angular/core';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import {form, FormField} from '@angular/forms/signals';

/** @title Select with multiple selection (signal forms) */
@Component({
  selector: 'select-multiple-signal-form-example',
  templateUrl: 'select-multiple-signal-form-example.html',
  imports: [MatFormFieldModule, MatSelectModule, FormField],
})
export class SelectMultipleSignalFormExample {
  toppings = form(signal<string[]>([]));
  toppingList = ['Extra cheese', 'Mushroom', 'Onion', 'Pepperoni', 'Sausage', 'Tomato'] as const;
}

import {Component, signal} from '@angular/core';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import {form, FormField} from '@angular/forms/signals';

/** @title Select with custom trigger text (signal forms) */
@Component({
  selector: 'select-custom-trigger-signal-form-example',
  templateUrl: 'select-custom-trigger-signal-form-example.html',
  styleUrl: 'select-custom-trigger-signal-form-example.css',
  imports: [MatFormFieldModule, MatSelectModule, FormField],
})
export class SelectCustomTriggerSignalFormExample {
  protected toppingsField = form(signal<string[]>([]));

  protected toppingList = [
    'Extra cheese',
    'Mushroom',
    'Onion',
    'Pepperoni',
    'Sausage',
    'Tomato',
  ] as const;
}

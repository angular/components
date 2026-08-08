import {JsonPipe} from '@angular/common';
import {Component, signal} from '@angular/core';
import {form, FormField} from '@angular/forms/signals';
import {MatCheckboxModule} from '@angular/material/checkbox';

/** @title Checkboxes with signal forms */
@Component({
  selector: 'checkbox-signal-forms-example',
  templateUrl: 'checkbox-signal-forms-example.html',
  styleUrl: 'checkbox-signal-forms-example.css',
  imports: [FormField, MatCheckboxModule, JsonPipe],
})
export class CheckboxSignalFormsExample {
  readonly toppingsFormModel = signal({
    pepperoni: false,
    extracheese: false,
    mushroom: false,
  });

  readonly toppingsForm = form(this.toppingsFormModel);
}

import {JsonPipe} from '@angular/common';
import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {FormBuilder, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatCheckboxModule} from '@angular/material/checkbox';

/** @title Checkboxes with reactive forms */
@Component({
  selector: 'checkbox-reactive-forms-example',
  templateUrl: 'checkbox-reactive-forms-example.html',
  styleUrl: 'checkbox-reactive-forms-example.css',
  imports: [FormsModule, ReactiveFormsModule, MatCheckboxModule, JsonPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckboxReactiveFormsExample {
  private readonly _formBuilder = inject(FormBuilder);

  readonly toppings = this._formBuilder.group({
    pepperoni: false,
    extracheese: false,
    mushroom: false,
  });
}

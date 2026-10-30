import {Component, signal} from '@angular/core';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import {form, FormField} from '@angular/forms/signals';

/** @title Select with selectable null options (signal forms) */
@Component({
  selector: 'select-selectable-null-signal-form-example',
  templateUrl: 'select-selectable-null-signal-form-example.html',
  imports: [MatFormFieldModule, MatSelectModule, MatInputModule, FormField],
})
export class SelectSelectableNullSignalFormExample {
  private _model = signal<number | null>(null);

  protected myNullableForm = form(this._model);

  protected options = [
    {label: 'None', value: null},
    {label: 'One', value: 1},
    {label: 'Two', value: 2},
    {label: 'Three', value: 3},
  ] as const;
}

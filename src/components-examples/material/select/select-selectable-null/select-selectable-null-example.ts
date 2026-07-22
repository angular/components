import {Component} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';

/** @title Select with selectable null options */
@Component({
  selector: 'select-selectable-null-example',
  templateUrl: 'select-selectable-null-example.html',
  imports: [MatFormFieldModule, MatSelectModule, MatInputModule, FormsModule],
})
export class SelectSelectableNullExample {
  value: number | null = null;
  options = [
    {label: 'None', value: null},
    {label: 'One', value: 1},
    {label: 'Two', value: 2},
    {label: 'Three', value: 3},
  ];
}

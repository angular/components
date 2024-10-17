import {Component} from '@angular/core';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatListModule} from '@angular/material/list';
interface Shoes {
  value: string;
  name: string;
}
/**
 * @title List with single selection using Reactive Forms
 */
@Component({
  selector: 'list-single-selection-example',
  templateUrl: 'list-single-selection-example.html',
  imports: [MatListModule, FormsModule, ReactiveFormsModule],
})
export class ListSingleSelectionExample {
  form: FormGroup;
  shoes: Shoes[] = [
    {value: 'boots', name: 'Boots'},
    {value: 'clogs', name: 'Clogs'},
    {value: 'loafers', name: 'Loafers'},
    {value: 'moccasins', name: 'Moccasins'},
    {value: 'sneakers', name: 'Sneakers'},
  ];
  shoesControl = new FormControl();

  constructor() {
    this.form = new FormGroup({
      clothes: this.shoesControl,
    });
  }
}

import {Component} from '@angular/core';
import {NgFor} from '@angular/common';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';

/**
 * @title Testing with MatSelectHarness
 */
@Component({
  selector: 'select-harness-example',
  templateUrl: 'select-harness-example.html',
  standalone: true,
  imports: [MatFormFieldModule, MatSelectModule, NgFor],
})
export class SelectHarnessExample {
  foods = [
    {value: 'steak-0', viewValue: 'Steak'},
    {value: 'pizza-1', viewValue: 'Pizza'},
    {value: 'tacos-2', viewValue: 'Tacos'},
  ];
}

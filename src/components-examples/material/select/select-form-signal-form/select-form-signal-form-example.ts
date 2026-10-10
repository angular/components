import {Component, signal} from '@angular/core';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import {form, FormField} from '@angular/forms/signals';

interface Food {
  value: string;
  viewValue: string;
}

interface Car {
  value: string;
  viewValue: string;
}

/**
 * @title Select in a form (signal forms)
 */
@Component({
  selector: 'select-form-signal-form-example',
  templateUrl: 'select-form-signal-form-example.html',
  imports: [FormField, MatFormFieldModule, MatSelectModule, MatInputModule],
})
export class SelectFormSignalFormExample {
  protected selectedValue = form(signal(''));
  protected selectedCar = form(signal(''));

  protected foods: Food[] = [
    {value: 'steak-0', viewValue: 'Steak'},
    {value: 'pizza-1', viewValue: 'Pizza'},
    {value: 'tacos-2', viewValue: 'Tacos'},
  ];

  protected cars: Car[] = [
    {value: 'volvo', viewValue: 'Volvo'},
    {value: 'saab', viewValue: 'Saab'},
    {value: 'mercedes', viewValue: 'Mercedes'},
  ];
}

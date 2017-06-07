import {Component} from '@angular/core';


@Component({
  moduleId: module.id,
  selector: 'select-form-example',
  templateUrl: 'select-form-example.html',
})
export class SelectFormExample {
  selectedValue: string;

  foods = [
    {value: 'steak-0', viewValue: 'Steak'},
    {value: 'pizza-1', viewValue: 'Pizza'},
    {value: 'tacos-2', viewValue: 'Tacos'}
  ];
}

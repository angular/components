import {Component} from '@angular/core';


@Component({
  selector: 'select-header-example',
  templateUrl: './select-header-example.html',
})
export class SelectHeaderExample {
  selectedValue: string;
  withWater: boolean;

  foods = [
    {value: 'steak-0', viewValue: 'Steak'},
    {value: 'pizza-1', viewValue: 'Pizza'},
    {value: 'tacos-2', viewValue: 'Tacos'},
    {value: 'sandwich-3', viewValue: 'Sandwich'},
    {value: 'chips-4', viewValue: 'Chips'},
    {value: 'eggs-5', viewValue: 'Eggs'},
    {value: 'pasta-6', viewValue: 'Pasta'},
    {value: 'sushi-7', viewValue: 'Sushi'},
  ];
}

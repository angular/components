import {Component} from '@angular/core';


@Component({
  selector: 'select-form-example',
  templateUrl: './select-form-example.html',
})
export class SelectHeaderExample {
  selectedValue: string;
  searchString: string;

  initialFoods = [
    { value: 'steak-0', viewValue: 'Steak' },
    { value: 'pizza-1', viewValue: 'Pizza' },
    { value: 'tacos-2', viewValue: 'Tacos' },
    { value: 'sandwich-3', viewValue: 'Sandwich' },
    { value: 'chips-4', viewValue: 'Chips' },
    { value: 'eggs-5', viewValue: 'Eggs' },
    { value: 'pasta-6', viewValue: 'Pasta' },
    { value: 'sushi-7', viewValue: 'Sushi' },
  ];

  foods = this.initialFoods.slice();

  filterFoods() {
    this.foods = this.searchString ? this.initialFoods.filter(item => {
      return item.viewValue.toLowerCase().indexOf(this.searchString.toLowerCase()) > -1;
    }) : this.initialFoods.slice();
  }
}

import {Component} from '@angular/core';


@Component({
  moduleId: module.id,
  selector: 'select-overview-example',
  templateUrl: 'select-overview-example.html',
})
export class SelectOverviewExample {
  foods = [
    {value: 'steak-0', viewValue: 'Steak'},
    {value: 'pizza-1', viewValue: 'Pizza'},
    {value: 'tacos-2', viewValue: 'Tacos'}
  ];
}

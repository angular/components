import {Component} from '@angular/core';

export interface Food {
  value: string;
  viewValue: string;
}

/**
 * @title Select with custom trigger label separator
 */
@Component({
  selector: 'select-custom-trigger-label-separator-example',
  templateUrl: 'select-custom-trigger-label-separator-example.html',
  styleUrls: ['select-custom-trigger-label-separator-example.css'],
})
export class SelectCustomTriggerLabelSeparatorExample {
  foods: Food[] = [
    {value: 'steak-0', viewValue: 'Steak'},
    {value: 'pizza-1', viewValue: 'Pizza'},
    {value: 'tacos-2', viewValue: 'Tacos'}
  ];
}

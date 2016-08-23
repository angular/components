import {Component} from '@angular/core';

@Component({
  moduleId: module.id,
  selector: 'select-demo',
  templateUrl: 'select-demo.html'
})
export class SelectDemo {

  private disabled: boolean = false;
  private items: Array<any> =
  [
    { name: 'Amsterdam', value: '1', disabled: true },
    { name: 'Birmingham', value: '2', disabled: false },
    { name: 'Dortmund', value: '3', disabled: false },
    { name: 'Gothenburg', value: '4', disabled: true },
    { name: 'London', value: '5', disabled: false },
    { name: 'Seville', value: '6', disabled: true }
  ];
  private item: string = '3';
  private change(value: any) {
    console.log('Changed data: ', value);
  }
}

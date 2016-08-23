import {Component} from '@angular/core';

@Component({
  moduleId: module.id,
  selector: 'multiselect',
  templateUrl: 'multiselect-demo.html'
})
export class MultiselectDemo {
  private disabled: boolean = false;
  private items: Array<any> =
  [
    { name: 'Amsterdam', value: '1' },
    { name: 'Birmingham', value: '2' },
    { name: 'Dortmund', value: '3' },
    { name: 'Gothenburg', value: '4' },
    { name: 'London', value: '5' },
    { name: 'Seville', value: '6' }
  ];
  private item: Array<any> = [{ name: 'Birmingham', value: '2' }, { name: 'Dortmund', value: '3' }];
  private change(value: any) {
    console.log('Changed data: ', value);
  }
}

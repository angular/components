import {Component} from '@angular/core';

@Component({
  moduleId: module.id,
  selector: 'autocomplete-demo',
  templateUrl: 'autocomplete-demo.html'
})
export class AutocompleteDemo {
  private disabled: boolean = false;
  private items: Array<any> = [
    { name: 'Amsterdam', value: '1' },
    { name: 'Birmingham', value: '2' },
    { name: 'Dortmund', value: '3' },
    { name: 'Gothenburg', value: '4' },
    { name: 'London', value: '5' },
    { name: 'Seville', value: '6' }
  ];
  private item: any;
  private change(value: any) {
    console.log('Changed data: ', value);
  }
}

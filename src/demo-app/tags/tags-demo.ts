import {Component} from '@angular/core';

@Component({
  moduleId: module.id,
  selector: 'tags-demo',
  templateUrl: 'tags-demo.html'
})
export class TagsDemo {
  private disabled: boolean = false;
  private tags: Array<any> =
  [
    { name: 'Amsterdam', value: '1' },
    { name: 'Birmingham', value: '2' },
    { name: 'Dortmund', value: '3' },
    { name: 'Gothenburg', value: '4' },
    { name: 'London', value: '5' },
    { name: 'Seville', value: '6' }
  ];
  private tag: Array<any> = [
    { name: 'Dortmund', value: '3' },
    { name: 'Gothenburg', value: '4' }
  ];
  private change(value: any) {
    console.log('Changed data: ', value);
  }
}

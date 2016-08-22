import {Component} from '@angular/core';

@Component({
  moduleId: module.id,
  selector: 'accordion-demo',
  templateUrl: 'accordion-demo.html'
})
export class AccordionDemo {
  private accordions: Array<any> = [
    { title: 'Dynamic Title 1', content: 'Dynamic content 1' },
    { title: 'Dynamic Title 2', content: 'Dynamic content 2', disabled: true },
    { title: 'Dynamic Title 3', content: 'Dynamic content 3', active: true }
  ];

  multiple: boolean = false;
}
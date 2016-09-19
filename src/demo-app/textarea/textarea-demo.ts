import {Component} from '@angular/core';

@Component({
  moduleId: module.id,
  selector: 'textarea-demo',
  templateUrl: 'textarea-demo.html',
  styleUrls: ['textarea-demo.css'],
})

export class TextareaDemo {
  dividerColor: boolean;
  requiredField: boolean;
  floatingLabel: boolean;
  name: string;
}
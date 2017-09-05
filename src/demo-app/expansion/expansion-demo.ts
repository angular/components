import {Component, ViewEncapsulation} from '@angular/core';

@Component({
  moduleId: module.id,
  selector: 'expansion-demo',
  styleUrls: ['expansion-demo.css'],
  templateUrl: 'expansion-demo.html',
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: false,
})
export class ExpansionDemo {
  displayMode = 'default';
  multi = false;
  togglePosition = 'end';
  disabled = false;
  showPanel3 = true;
  expandedHeight: string;
  collapsedHeight: string;
}

import {Component} from '@angular/core';


@Component({
  moduleId: module.id,
  selector: 'progress-circle-configurable-example',
  templateUrl: 'progress-circle-configurable-example.html',
  styleUrls: ['progress-circle-configurable-example.css'],
})
export class ProgressCircleConfigurableExample {
  color = 'praimry';
  mode = 'determinate';
  value = 50;
}

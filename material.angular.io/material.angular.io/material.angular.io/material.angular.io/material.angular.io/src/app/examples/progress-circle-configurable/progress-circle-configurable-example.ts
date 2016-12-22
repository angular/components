import {Component} from '@angular/core';


@Component({
  selector: 'progress-circle-configurable-example',
  templateUrl: './progress-circle-configurable-example.html',
  styleUrls: ['./progress-circle-configurable-example.css'],
})
export class ProgressSpinnerConfigurableExample {
  color = 'praimry';
  mode = 'determinate';
  value = 50;
}

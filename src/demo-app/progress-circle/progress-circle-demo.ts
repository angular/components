import {Component} from '@angular/core';
import {MdButton} from '@angular2-material/button/button';
import {MdProgressCircle, MdSpinner} from '@angular2-material/progress-circle/progress-circle';

@Component({
  //MODULE //MODULE //MODULE //MODULE //MODULE //MODULE //MODULE //MODULE //MODULE //MODULE //MODULE moduleId: module.id,
  selector: 'progress-circle-demo',
  templateUrl: 'progress-circle-demo.html',
  styleUrls: ['progress-circle-demo.css'],
})
export class ProgressCircleDemo {
  progressValue: number = 40;

  step(val: number) {
    this.progressValue += val;
  }

}

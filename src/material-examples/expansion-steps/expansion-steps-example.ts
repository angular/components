import {Component} from '@angular/core';


@Component({
  selector: 'expansion-overview-example',
  templateUrl: 'expansion-overview-example.html',
})
export class ExpansionStepsExample {
  public step = 0;

  openEvent(stepNumb: number) {
    this.step = stepNumb;
  }
  
  nextStep() {
    this.step++;
  }
  
  prevStep() {
    this.step--;
  }
}
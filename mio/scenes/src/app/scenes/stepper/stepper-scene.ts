import {Component, NgModule, ViewEncapsulation} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatStepperModule} from '@angular/material/stepper';
import {MatInputModule} from '@angular/material/input';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-stepper-scene',
  templateUrl: './stepper-scene.html',
  styleUrls: ['./stepper-scene.scss']
})
export class StepperScene {
}

@NgModule({
  imports: [
    MatButtonModule,
    MatStepperModule,
    MatInputModule,
  ],
  exports: [StepperScene],
  declarations: [StepperScene]
})
export class StepperSceneModule {
}


import {Component, NgModule, ViewEncapsulation} from '@angular/core';
import {MatLegacyButtonModule as MatButtonModule} from '@angular/material/legacy-button';
import {MatStepperModule} from '@angular/material/stepper';
import {MatLegacyInputModule as MatInputModule} from '@angular/material/legacy-input';

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


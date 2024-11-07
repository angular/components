import {Component, ViewEncapsulation} from '@angular/core';
import {MatStepperModule} from '@angular/material/stepper';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-stepper-scene',
  templateUrl: './stepper-scene.html',
  styleUrls: ['./stepper-scene.scss'],
  standalone: true,
  imports: [MatStepperModule, MatFormFieldModule, MatInputModule]
})
export class StepperScene {}

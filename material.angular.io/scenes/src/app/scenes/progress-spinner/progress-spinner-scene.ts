import {Component, ViewEncapsulation} from '@angular/core';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';


@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-input-scene',
  templateUrl: './progress-spinner-scene.html',
  styleUrls: ['./progress-spinner-scene.scss'],
  standalone: true,
  imports: [MatProgressSpinnerModule]
})
export class ProgressSpinnerScene {}

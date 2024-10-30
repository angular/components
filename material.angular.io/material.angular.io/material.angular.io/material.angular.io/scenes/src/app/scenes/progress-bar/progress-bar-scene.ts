import {Component, ViewEncapsulation} from '@angular/core';
import {MatProgressBarModule} from '@angular/material/progress-bar';


@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-progress-bar-scene',
  templateUrl: './progress-bar-scene.html',
  styleUrls: ['./progress-bar-scene.scss'],
  standalone: true,
  imports: [MatProgressBarModule]
})
export class ProgressBarScene {}

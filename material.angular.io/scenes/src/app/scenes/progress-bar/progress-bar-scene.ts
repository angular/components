import {Component, NgModule, ViewEncapsulation} from '@angular/core';
import {MatLegacyProgressBarModule as MatProgressBarModule} from '@angular/material/legacy-progress-bar';


@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-progress-bar-scene',
  templateUrl: './progress-bar-scene.html',
  styleUrls: ['./progress-bar-scene.scss']
})
export class ProgressBarScene {
}

@NgModule({
  imports: [
    MatProgressBarModule
  ],
  exports: [ProgressBarScene],
  declarations: [ProgressBarScene]
})
export class ProgressBarSceneModule {}


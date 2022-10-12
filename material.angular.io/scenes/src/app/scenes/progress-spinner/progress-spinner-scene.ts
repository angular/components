import {Component, NgModule, ViewEncapsulation} from '@angular/core';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';


@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-input-scene',
  templateUrl: './progress-spinner-scene.html',
  styleUrls: ['./progress-spinner-scene.scss']
})
export class ProgressSpinnerScene {}

@NgModule({
  imports: [
    MatProgressSpinnerModule
  ],
  exports: [ProgressSpinnerScene],
  declarations: [ProgressSpinnerScene]
})
export class ProgressSpinnerSceneModule {}


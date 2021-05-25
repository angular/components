import {Component, NgModule, ViewEncapsulation} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-core-scene',
  templateUrl: './core-scene.html',
  styleUrls: ['./core-scene.scss']
})
export class CoreScene {
}

@NgModule({
  imports: [
    MatIconModule
  ],
  exports: [CoreScene],
  declarations: [CoreScene]
})
export class ChipsSceneModule {}


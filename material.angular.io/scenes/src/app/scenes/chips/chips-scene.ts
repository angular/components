import {Component, NgModule, ViewEncapsulation} from '@angular/core';
import {MatLegacyChipsModule as MatChipsModule} from '@angular/material/legacy-chips';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-chips-scene',
  templateUrl: './chips-scene.html',
  styleUrls: ['./chips-scene.scss']
})
export class ChipsScene {
}

@NgModule({
  imports: [
    MatChipsModule
  ],
  exports: [ChipsScene],
  declarations: [ChipsScene]
})
export class ChipsSceneModule {}


import {Component, NgModule, ViewEncapsulation} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-icon-scene',
  templateUrl: './icon-scene.html',
  styleUrls: ['./icon-scene.scss']
})
export class IconScene {
}

@NgModule({
  imports: [
    MatIconModule
  ],
  exports: [IconScene],
  declarations: [IconScene]
})
export class IconSceneModule {}

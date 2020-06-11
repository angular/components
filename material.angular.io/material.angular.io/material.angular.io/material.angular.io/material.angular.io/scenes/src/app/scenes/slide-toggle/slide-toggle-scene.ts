import {Component, NgModule, ViewEncapsulation} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';


@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-slide-toggle-scene',
  templateUrl: './slide-toggle-scene.html',
  styleUrls: ['./slide-toggle-scene.scss']
})
export class SlideToggleScene {
}

@NgModule({
  imports: [
    MatIconModule,
    MatSlideToggleModule,
  ],
  exports: [SlideToggleScene],
  declarations: [SlideToggleScene]
})
export class SlideToggleSceneModule {}

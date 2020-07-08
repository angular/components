import {Component, NgModule, ViewEncapsulation} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatListModule} from '@angular/material/list';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-divider-scene',
  templateUrl: './divider-scene.html',
  styleUrls: ['./divider-scene.scss']
})
export class DividerScene {
}

@NgModule({
  imports: [
    MatIconModule,
    MatListModule,
  ],
  exports: [DividerScene],
  declarations: [DividerScene]
})
export class DividerSceneModule {}


import {Component, NgModule, ViewEncapsulation} from '@angular/core';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatIconModule} from '@angular/material/icon';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-button-toggle-scene',
  templateUrl: './placeholder-scene.html',
  styleUrls: ['./placeholder-scene.scss']
})
export class PlaceHolderScene {}

@NgModule({
  imports: [
    MatButtonToggleModule,
    MatIconModule,
  ],
  exports: [PlaceHolderScene],
  declarations: [PlaceHolderScene]
})
export class InputSceneModule {}


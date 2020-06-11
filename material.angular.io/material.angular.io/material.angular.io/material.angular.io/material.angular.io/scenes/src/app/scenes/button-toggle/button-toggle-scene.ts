import {Component, NgModule, ViewEncapsulation} from '@angular/core';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatIconModule} from '@angular/material/icon';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-button-toggle-scene',
  templateUrl: './button-toggle-scene.html',
})
export class ButtonToggleScene {}

@NgModule({
  imports: [
    MatButtonToggleModule,
    MatIconModule,
  ],
  exports: [ButtonToggleScene],
  declarations: [ButtonToggleScene]
})
export class InputSceneModule {}


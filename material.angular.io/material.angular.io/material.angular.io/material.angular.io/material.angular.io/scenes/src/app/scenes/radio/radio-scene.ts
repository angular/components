import {Component, NgModule, ViewEncapsulation} from '@angular/core';
import {MatLegacyRadioModule as MatRadioModule} from '@angular/material/legacy-radio';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-radio-scene',
  templateUrl: './radio-scene.html',
  styleUrls: ['./radio-scene.scss']
})
export class RadioScene {
}

@NgModule({
  imports: [
    MatRadioModule,
  ],
  exports: [RadioScene],
  declarations: [RadioScene]
})
export class RadioSceneModule {
}


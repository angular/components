import {Component, NgModule, ViewEncapsulation} from '@angular/core';
import {MatLegacyFormFieldModule as MatFormFieldModule} from '@angular/material/legacy-form-field';
import {FormsModule} from '@angular/forms';
import {MatLegacyInputModule as MatInputModule} from '@angular/material/legacy-input';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-input-scene',
  templateUrl: './input-scene.html',
  styleUrls: ['./input-scene.scss']
})
export class InputScene {
}

@NgModule({
  imports: [
    MatFormFieldModule,
    FormsModule,
    MatInputModule,
  ],
  exports: [InputScene],
  declarations: [InputScene]
})
export class InputSceneModule {}


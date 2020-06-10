import {Component, NgModule, ViewEncapsulation} from '@angular/core';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {FormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';

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
    MatIconModule,
    FormsModule,
    MatInputModule,
  ],
  exports: [InputScene],
  declarations: [InputScene]
})
export class InputSceneModule {}


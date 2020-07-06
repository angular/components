import {Component, NgModule, ViewEncapsulation} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatBadgeModule} from '@angular/material/badge';
import {MatButtonModule} from '@angular/material/button';
import {MatInputModule} from '@angular/material/input';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-form-field-scene',
  templateUrl: './form-field-scene.html',
})
export class FormFieldScene {
}

@NgModule({
  imports: [
    MatIconModule,
    MatBadgeModule,
    MatInputModule,
    MatButtonModule,
  ],
  exports: [FormFieldScene],
  declarations: [FormFieldScene]
})
export class FormFieldSceneModule {}


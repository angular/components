import {Component, NgModule, ViewEncapsulation} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
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
    MatInputModule,
  ],
  exports: [FormFieldScene],
  declarations: [FormFieldScene]
})
export class FormFieldSceneModule {}


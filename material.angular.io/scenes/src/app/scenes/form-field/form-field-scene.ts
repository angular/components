import {Component, ViewEncapsulation} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-form-field-scene',
  templateUrl: './form-field-scene.html',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
  ],
})
export class FormFieldScene {}

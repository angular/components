import {Component} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';

/** @title Form field appearance variants */
@Component({
  selector: 'form-field-appearance-example',
  templateUrl: 'form-field-appearance-example.html',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatIconModule],
})
export class FormFieldAppearanceExample {}

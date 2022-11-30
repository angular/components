import {Component} from '@angular/core';
import {FormControl} from '@angular/forms';
import {ThemePalette} from '@angular/material/core';

/** @title Form field theming */
@Component({
  selector: 'form-field-theming-example',
  templateUrl: 'form-field-theming-example.html',
  styleUrls: ['form-field-theming-example.css'],
})
export class FormFieldThemingExample {
  colorControl = new FormControl('primary' as ThemePalette);
}

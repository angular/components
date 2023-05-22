import {Component} from '@angular/core';
import {MatSelectModule} from '@angular/material/select';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';

/** @title Form field with hints */
@Component({
  selector: 'form-field-hint-example',
  templateUrl: 'form-field-hint-example.html',
  styleUrls: ['form-field-hint-example.css'],
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatSelectModule],
})
export class FormFieldHintExample {}

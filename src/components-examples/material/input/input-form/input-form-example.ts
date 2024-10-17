import {Component} from '@angular/core';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormsModule} from '@angular/forms';

/**
 * @title Inputs in a form
 */
@Component({
  selector: 'input-form-example',
  templateUrl: 'input-form-example.html',
  styleUrl: 'input-form-example.css',
  imports: [FormsModule, MatFormFieldModule, MatInputModule],
})
export class InputFormExample {}

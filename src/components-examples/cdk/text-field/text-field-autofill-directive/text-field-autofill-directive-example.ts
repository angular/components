import {Component} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {NgIf} from '@angular/common';
import {TextFieldModule} from '@angular/cdk/text-field';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';

/** @title Monitoring autofill state with cdkAutofill */
@Component({
  selector: 'text-field-autofill-directive-example',
  templateUrl: './text-field-autofill-directive-example.html',
  styleUrls: ['./text-field-autofill-directive-example.css'],
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, TextFieldModule, NgIf, MatButtonModule],
})
export class TextFieldAutofillDirectiveExample {
  firstNameAutofilled: boolean;
  lastNameAutofilled: boolean;
}

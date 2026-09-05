import {TextFieldModule} from '@angular/cdk/text-field';
import {Component} from '@angular/core';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';

/** @title Auto-resizing textarea */
@Component({
  selector: 'text-field-autosize-textarea-example',
  templateUrl: './text-field-autosize-textarea-example.html',
  imports: [MatFormFieldModule, MatInputModule, TextFieldModule],
})
export class TextFieldAutosizeTextareaExample {}

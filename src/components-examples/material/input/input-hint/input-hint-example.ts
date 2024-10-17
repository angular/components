import {Component} from '@angular/core';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormsModule} from '@angular/forms';

/**
 * @title Input with hints
 */
@Component({
  selector: 'input-hint-example',
  templateUrl: 'input-hint-example.html',
  styleUrl: 'input-hint-example.css',
  imports: [FormsModule, MatFormFieldModule, MatInputModule],
})
export class InputHintExample {}

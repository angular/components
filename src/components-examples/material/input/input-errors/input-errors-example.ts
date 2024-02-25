import {Component} from '@angular/core';
import {FormControl, Validators, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';

/**
 * @title Input with error messages
 */
@Component({
  selector: 'input-errors-example',
  templateUrl: 'input-errors-example.html',
  styleUrl: 'input-errors-example.css',
  standalone: true,
  imports: [FormsModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule],
})
export class InputErrorsExample {
  emailFormControl = new FormControl('', [Validators.required, Validators.email]);
}

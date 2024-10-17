import {Component} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {FormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';

/**
 * @title Input with a clear button
 */
@Component({
  selector: 'input-clearable-example',
  templateUrl: './input-clearable-example.html',
  styleUrl: './input-clearable-example.css',
  imports: [MatFormFieldModule, MatInputModule, FormsModule, MatButtonModule, MatIconModule],
})
export class InputClearableExample {
  value = 'Clear me';
}

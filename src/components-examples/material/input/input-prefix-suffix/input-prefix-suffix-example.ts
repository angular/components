import {Component} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormsModule} from '@angular/forms';

/**
 * @title Inputs with prefixes and suffixes
 */
@Component({
  selector: 'input-prefix-suffix-example',
  templateUrl: 'input-prefix-suffix-example.html',
  styleUrls: ['input-prefix-suffix-example.css'],
  standalone: true,
  imports: [FormsModule, MatFormFieldModule, MatInputModule, MatIconModule],
})
export class InputPrefixSuffixExample {}

import {Component} from '@angular/core';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormsModule} from '@angular/forms';

/**
 * @title Basic Inputs
 */
@Component({
  selector: 'input-overview-example',
  styleUrl: 'input-overview-example.css',
  templateUrl: 'input-overview-example.html',
  imports: [FormsModule, MatFormFieldModule, MatInputModule],
})
export class InputOverviewExample {}

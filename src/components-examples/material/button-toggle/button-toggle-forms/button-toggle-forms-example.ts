import {Component} from '@angular/core';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatButtonToggleModule} from '@angular/material/button-toggle';

/**
 * @title Button-toggles with forms
 */
@Component({
  selector: 'button-toggle-forms-example',
  templateUrl: 'button-toggle-forms-example.html',
  standalone: true,
  imports: [MatButtonToggleModule, FormsModule, ReactiveFormsModule],
})
export class ButtonToggleFormsExample {
  fontStyleControl = new FormControl('');
  fontStyle?: string;
}

import {ChangeDetectionStrategy, Component} from '@angular/core';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatButtonToggleModule} from '@angular/material/button-toggle';

/**
 * @title Button-toggles with forms
 */
@Component({
  selector: 'button-toggle-forms-example',
  templateUrl: 'button-toggle-forms-example.html',
  imports: [MatButtonToggleModule, FormsModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonToggleFormsExample {
  fontStyleControl = new FormControl('');
  fontStyle?: string;
}

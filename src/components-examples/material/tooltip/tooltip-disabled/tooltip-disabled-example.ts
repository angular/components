import {Component} from '@angular/core';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatButtonModule} from '@angular/material/button';

/**
 * @title Tooltip that can be disabled
 */
@Component({
  selector: 'tooltip-disabled-example',
  templateUrl: 'tooltip-disabled-example.html',
  styleUrl: 'tooltip-disabled-example.css',
  imports: [MatButtonModule, MatTooltipModule, MatCheckboxModule, FormsModule, ReactiveFormsModule],
})
export class TooltipDisabledExample {
  disabled = new FormControl(false);
}

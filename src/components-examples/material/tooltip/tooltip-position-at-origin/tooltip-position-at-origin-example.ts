import {Component} from '@angular/core';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatButtonModule} from '@angular/material/button';

/**
 * @title Basic tooltip
 */
@Component({
  selector: 'tooltip-position-at-origin-example',
  templateUrl: 'tooltip-position-at-origin-example.html',
  styleUrls: ['tooltip-position-at-origin-example.css'],
  standalone: true,
  imports: [MatButtonModule, MatTooltipModule, MatCheckboxModule, FormsModule, ReactiveFormsModule],
})
export class TooltipPositionAtOriginExample {
  enabled = new FormControl(false);
}

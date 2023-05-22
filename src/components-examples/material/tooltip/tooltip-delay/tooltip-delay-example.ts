import {Component} from '@angular/core';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatButtonModule} from '@angular/material/button';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';

/**
 * @title Tooltip with a show and hide delay
 */
@Component({
  selector: 'tooltip-delay-example',
  templateUrl: 'tooltip-delay-example.html',
  styleUrls: ['tooltip-delay-example.css'],
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatTooltipModule,
  ],
})
export class TooltipDelayExample {
  showDelay = new FormControl(1000);
  hideDelay = new FormControl(2000);
}

import {Component} from '@angular/core';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';

/** @title Select with no option ripple */
@Component({
  selector: 'select-no-ripple-example',
  templateUrl: 'select-no-ripple-example.html',
  standalone: true,
  imports: [MatFormFieldModule, MatSelectModule],
})
export class SelectNoRippleExample {}

import {Component} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonToggleModule} from '@angular/material/button-toggle';

/**
 * @title Exclusive selection
 */
@Component({
  selector: 'button-toggle-exclusive-example',
  templateUrl: 'button-toggle-exclusive-example.html',
  styleUrls: ['button-toggle-exclusive-example.css'],
  standalone: true,
  imports: [MatButtonToggleModule, MatIconModule],
})
export class ButtonToggleExclusiveExample {}

import {Component} from '@angular/core';

/**
 * @title Menu positions
 */
@Component({
  selector: 'menu-positions-example',
  templateUrl: 'menu-positions-example.html',
  styleUrls: ['menu-positions-example.css'],
})
export class MenuPositionsExample {
  xPosition = 'after';
  yPosition = 'below';
  overlapTrigger = false;
}

import {Component} from '@angular/core';
import {MatMenuModule} from '@angular/material/menu';
import {MatButtonModule} from '@angular/material/button';

/**
 * @title Menu positioning
 */
@Component({
  selector: 'menu-position-example',
  templateUrl: 'menu-position-example.html',
  standalone: true,
  imports: [MatButtonModule, MatMenuModule],
})
export class MenuPositionExample {}

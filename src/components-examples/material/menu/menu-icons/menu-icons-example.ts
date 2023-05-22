import {Component} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatMenuModule} from '@angular/material/menu';
import {MatButtonModule} from '@angular/material/button';

/**
 * @title Menu with icons
 */
@Component({
  selector: 'menu-icons-example',
  templateUrl: 'menu-icons-example.html',
  standalone: true,
  imports: [MatButtonModule, MatMenuModule, MatIconModule],
})
export class MenuIconsExample {}

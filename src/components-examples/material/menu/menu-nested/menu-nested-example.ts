import {Component} from '@angular/core';
import {MatMenuModule} from '@angular/material/menu';
import {MatButtonModule} from '@angular/material/button';

/**
 * @title Nested menu
 */
@Component({
  selector: 'menu-nested-example',
  templateUrl: 'menu-nested-example.html',
  standalone: true,
  imports: [MatButtonModule, MatMenuModule],
})
export class MenuNestedExample {}

import {Component} from '@angular/core';
import {Menu, MenuContent} from '@angular/aria/menu';
import {SimpleMenu, SimpleMenuItem, SimpleMenuItemIcon, SimpleMenuItemText} from '../simple-menu';

/**
 * @title Menu standalone example.
 */
@Component({
  selector: 'menu-standalone-example',
  exportAs: 'MenuStandaloneExample',
  templateUrl: 'menu-standalone-example.html',
  styleUrl: '../menu-example.css',
  standalone: true,
  imports: [Menu, MenuContent, SimpleMenu, SimpleMenuItem, SimpleMenuItemIcon, SimpleMenuItemText],
})
export class MenuStandaloneExample {}

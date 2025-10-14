import {afterRenderEffect, Component, viewChildren} from '@angular/core';
import {Menu, MenuItem} from '@angular/aria/menu';
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
  imports: [Menu, SimpleMenu, SimpleMenuItem, SimpleMenuItemIcon, SimpleMenuItemText],
})
export class MenuStandaloneExample {}

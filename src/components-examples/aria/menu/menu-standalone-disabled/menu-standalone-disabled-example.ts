import {Component} from '@angular/core';
import {Menu, MenuContent} from '@angular/aria/menu';
import {SimpleMenu, SimpleMenuItem, SimpleMenuItemIcon, SimpleMenuItemText} from '../simple-menu';

/**
 * @title Disabled standalone menu example.
 */
@Component({
  selector: 'menu-standalone-disabled-example',
  templateUrl: 'menu-standalone-disabled-example.html',
  styleUrl: '../menu-example.css',
  imports: [Menu, MenuContent, SimpleMenu, SimpleMenuItem, SimpleMenuItemIcon, SimpleMenuItemText],
})
export class MenuStandaloneDisabledExample {}

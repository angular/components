import {Component} from '@angular/core';
import {MenuTrigger} from '@angular/aria/menu';
import {SimpleMenu, SimpleMenuItem, SimpleMenuItemIcon, SimpleMenuItemText} from '../simple-menu';

/** @title Menu trigger example. */
@Component({
  selector: 'menu-trigger-example',
  exportAs: 'MenuTriggerExample',
  templateUrl: 'menu-trigger-example.html',
  styleUrl: '../menu-example.css',
  standalone: true,
  imports: [SimpleMenu, SimpleMenuItem, SimpleMenuItemIcon, SimpleMenuItemText, MenuTrigger],
})
export class MenuTriggerExample {}

import {Component} from '@angular/core';
import {MenuTrigger, MenuContent} from '@angular/aria/menu';
import {SimpleMenu, SimpleMenuItem, SimpleMenuItemIcon, SimpleMenuItemText} from '../simple-menu';

/** @title Menu trigger example. */
@Component({
  selector: 'menu-trigger-example',
  exportAs: 'MenuTriggerExample',
  templateUrl: 'menu-trigger-example.html',
  styleUrl: '../menu-example.css',
  standalone: true,
  imports: [
    MenuContent,
    MenuTrigger,
    SimpleMenu,
    SimpleMenuItem,
    SimpleMenuItemIcon,
    SimpleMenuItemText,
  ],
})
export class MenuTriggerExample {}

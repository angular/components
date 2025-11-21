import {Component} from '@angular/core';
import {
  SimpleMenu,
  SimpleMenuBar,
  SimpleMenuBarItem,
  SimpleMenuItem,
  SimpleMenuItemIcon,
  SimpleMenuItemShortcut,
  SimpleMenuItemText,
} from '../simple-menu';
import {MenuContent} from '@angular/aria/menu';

/** @title Menu bar example. */
@Component({
  selector: 'menu-bar-example',
  templateUrl: 'menu-bar-example.html',
  styleUrl: '../menu-example.css',
  imports: [
    SimpleMenu,
    SimpleMenuBar,
    SimpleMenuBarItem,
    SimpleMenuItem,
    SimpleMenuItemIcon,
    SimpleMenuItemText,
    SimpleMenuItemShortcut,
    MenuContent,
  ],
})
export class MenuBarExample {}

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

/** @title Disabled menu bar example. */
@Component({
  selector: 'menu-bar-disabled-example',
  templateUrl: 'menu-bar-disabled-example.html',
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
export class MenuBarDisabledExample {}

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
  exportAs: 'MenuBarExample',
  templateUrl: 'menu-bar-example.html',
  styleUrl: '../menu-example.css',
  standalone: true,
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

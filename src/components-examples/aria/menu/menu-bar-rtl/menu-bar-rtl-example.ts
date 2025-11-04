import {Dir} from '@angular/cdk/bidi';
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

/** @title Menu bar RTL example. */
@Component({
  selector: 'menu-bar-rtl-example',
  exportAs: 'MenuBarRTLExample',
  templateUrl: 'menu-bar-rtl-example.html',
  styleUrl: '../menu-example.css',
  standalone: true,
  imports: [
    Dir,
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
export class MenuBarRTLExample {}

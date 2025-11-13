import {Component, viewChild} from '@angular/core';
import {Menu, MenuContent} from '@angular/aria/menu';
import {
  SimpleMenu,
  SimpleMenuItem,
  SimpleMenuItemIcon,
  SimpleMenuItemShortcut,
  SimpleMenuItemText,
} from '../simple-menu';

/** @title Context menu example. */
@Component({
  selector: 'menu-context-example',
  templateUrl: 'menu-context-example.html',
  styleUrl: '../menu-example.css',
  imports: [
    SimpleMenu,
    SimpleMenuItem,
    SimpleMenuItemText,
    SimpleMenuItemIcon,
    SimpleMenuItemShortcut,
    MenuContent,
  ],
})
export class MenuContextExample {
  menu = viewChild<Menu<string>>(Menu);

  close(event: FocusEvent) {
    const menu = this.menu();
    const relatedTarget = event.relatedTarget as HTMLElement | null;

    if (menu && !menu.element.contains(relatedTarget)) {
      menu!.close();
    }
  }

  open(event: MouseEvent) {
    const menu = this.menu();

    if (menu) {
      event.preventDefault();

      menu.element.style.top = `${event.clientY}px`;
      menu.element.style.left = `${event.clientX}px`;

      menu.open();
    }
  }
}

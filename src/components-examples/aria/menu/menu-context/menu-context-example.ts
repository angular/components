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
  exportAs: 'MenuContextExample',
  templateUrl: 'menu-context-example.html',
  styleUrl: '../menu-example.css',
  standalone: true,
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
      menu.close();
      menu.element.style.visibility = 'hidden';
    }
  }

  open(event: MouseEvent) {
    const menu = this.menu();
    menu?.closeAll();

    if (menu) {
      event.preventDefault();

      menu.element.style.visibility = 'visible';
      menu.element.style.top = `${event.clientY}px`;
      menu.element.style.left = `${event.clientX}px`;

      setTimeout(() => menu._pattern.first());
    }
  }
}

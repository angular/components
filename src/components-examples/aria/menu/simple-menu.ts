import {Menu, MenuBar, MenuItem, MenuTrigger} from '@angular/aria/menu';
import {afterRenderEffect, Directive, effect, inject} from '@angular/core';

@Directive({
  selector: '[ng-menu]',
  hostDirectives: [{directive: Menu}],
  host: {
    class: 'example-menu',
    popover: 'manual',
    '(beforetoggle)': 'onBeforeToggle()',
  },
})
export class SimpleMenu {
  menu = inject(Menu);

  constructor() {
    afterRenderEffect(() => {
      this.menu.visible() ? this.menu.element.showPopover() : this.menu.element.hidePopover();
    });
  }

  onBeforeToggle() {
    const parent = this.menu.parent() as MenuItem<string>;

    if (!parent) {
      return;
    }

    const parentEl = parent.element;
    const parentRect = parentEl.getBoundingClientRect();
    const menuRect = this.menu.element.getBoundingClientRect();

    const scrollX = window.scrollX;
    const scrollY = window.scrollY;

    const top = parentRect.y + scrollY - 5;
    const bottom = parentRect.y + scrollY + parentRect.height + 6;

    if (parent.parent instanceof MenuBar) {
      const rtlOffset = this.menu.textDirection() === 'rtl' ? menuRect.width - parentRect.width : 0;
      this.menu.element.style.left = `${parentRect.left + scrollX - rtlOffset}px`;
      this.menu.element.style.top = `${bottom}px`;
    } else if (parent instanceof MenuTrigger) {
      this.menu.element.style.left = `${parentRect.left + scrollX}px`;
      this.menu.element.style.top = `${parentRect.bottom + scrollY + 2}px`;
    } else {
      const rtlOffset =
        this.menu.textDirection() === 'rtl' ? menuRect.width + parentRect.width + 12 : 0;
      this.menu.element.style.left = `${parentRect.right + scrollX + 6 - rtlOffset}px`;
      this.menu.element.style.top = `${top}px`;
    }
  }
}

@Directive({
  selector: '[ng-menu-bar]',
  hostDirectives: [{directive: MenuBar}],
  host: {class: 'example-menu-bar'},
})
export class SimpleMenuBar {}

@Directive({
  selector: '[ng-menu-bar-item]',
  hostDirectives: [{directive: MenuItem, inputs: ['value', 'submenu']}],
  host: {class: 'example-menu-bar-item'},
})
export class SimpleMenuBarItem {
  menuItem = inject(MenuItem);

  constructor() {
    effect(() => this.menuItem.searchTerm.set(this.menuItem.value()));
  }
}

@Directive({
  selector: '[ng-menu-item]',
  hostDirectives: [{directive: MenuItem, inputs: ['value', 'disabled', 'submenu']}],
  host: {class: 'example-menu-item'},
})
export class SimpleMenuItem {
  menuItem = inject(MenuItem);

  constructor() {
    effect(() => this.menuItem.searchTerm.set(this.menuItem.value()));
  }
}

@Directive({
  selector: '[ng-menu-item-icon]',
  host: {
    'aria-hidden': 'true',
    class: 'example-icon material-symbols-outlined',
  },
})
export class SimpleMenuItemIcon {}

@Directive({
  selector: '[ng-menu-item-text]',
  host: {class: 'example-menu-item-text'},
})
export class SimpleMenuItemText {}

@Directive({
  selector: '[ng-menu-item-shortcut]',
  host: {
    'aria-hidden': 'true',
    class: 'example-menu-item-shortcut',
  },
})
export class SimpleMenuItemShortcut {}

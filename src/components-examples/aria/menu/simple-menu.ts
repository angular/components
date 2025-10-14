import {Menu, MenuBar, MenuItem, MenuTrigger} from '@angular/aria/menu';
import {afterRenderEffect, Directive, effect, inject} from '@angular/core';

@Directive({
  selector: '[menu]',
  hostDirectives: [{directive: Menu, inputs: ['parent']}],
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
      this.menu.isVisible() ? this.menu.element.showPopover() : this.menu.element.hidePopover();
    });
  }

  onBeforeToggle() {
    const parent = this.menu.parent() as MenuItem<string>;

    if (!parent) {
      return;
    }

    const parentEl = parent.element;
    const parentRect = parentEl.getBoundingClientRect();

    if (parent.parent instanceof MenuBar) {
      this.menu.element.style.left = `${parentRect.left}px`;
      this.menu.element.style.top = `${parentRect.bottom + 6}px`;
    } else if (parent instanceof MenuTrigger) {
      this.menu.element.style.left = `${parentRect.left}px`;
      this.menu.element.style.top = `${parentRect.bottom + 2}px`;
    } else {
      this.menu.element.style.left = `${parentRect.right + 6}px`;
      this.menu.element.style.top = `${parentRect.top - 5}px`;
    }
  }
}

@Directive({
  selector: '[menu-bar]',
  hostDirectives: [{directive: MenuBar}],
  host: {class: 'example-menu-bar'},
})
export class SimpleMenuBar {}

@Directive({
  selector: '[menu-bar-item]',
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
  selector: '[menu-item]',
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
  selector: '[menu-item-icon]',
  host: {
    'aria-hidden': 'true',
    class: 'material-symbols-outlined',
  },
})
export class SimpleMenuItemIcon {}

@Directive({
  selector: '[menu-item-text]',
  host: {class: 'example-menu-item-text'},
})
export class SimpleMenuItemText {}

@Directive({
  selector: '[menu-item-shortcut]',
  host: {
    'aria-hidden': 'true',
    class: 'example-menu-item-shortcut',
  },
})
export class SimpleMenuItemShortcut {}

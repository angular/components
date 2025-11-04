/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {signal, WritableSignal} from '@angular/core';
import {MenuPattern, MenuBarPattern, MenuItemPattern, MenuTriggerPattern} from './menu';
import {createKeyboardEvent} from '@angular/cdk/testing/private';
import {ModifierKeys} from '@angular/cdk/testing';

// Test types
type TestMenuItem = MenuItemPattern<string> & {
  disabled: WritableSignal<boolean>;
  submenu: WritableSignal<MenuPattern<string> | undefined>;
};

// Keyboard event helpers
const up = () => createKeyboardEvent('keydown', 38, 'ArrowUp');
const down = () => createKeyboardEvent('keydown', 40, 'ArrowDown');
const home = () => createKeyboardEvent('keydown', 36, 'Home');
const end = () => createKeyboardEvent('keydown', 35, 'End');
const enter = () => createKeyboardEvent('keydown', 13, 'Enter');
const escape = () => createKeyboardEvent('keydown', 27, 'Escape');
const right = () => createKeyboardEvent('keydown', 39, 'ArrowRight');
const left = () => createKeyboardEvent('keydown', 37, 'ArrowLeft');
const space = () => createKeyboardEvent('keydown', 32, ' ');

function clickMenuItem(items: MenuItemPattern<any>[], index: number, mods?: ModifierKeys) {
  return {
    target: items[index].element(),
    shiftKey: mods?.shift,
    ctrlKey: mods?.control,
  } as unknown as PointerEvent;
}

function getMenuTriggerPattern() {
  const element = signal(document.createElement('button'));
  const submenu = signal<MenuPattern<string> | undefined>(undefined);
  const trigger = new MenuTriggerPattern<string>({
    element,
    menu: submenu,
  });
  return trigger;
}

function getMenuBarPattern(values: string[]) {
  const items = signal<TestMenuItem[]>([]);

  const menubar = new MenuBarPattern<string>({
    items: items,
    activeItem: signal(undefined),
    orientation: signal('horizontal'),
    textDirection: signal('ltr'),
    multi: signal(false),
    selectionMode: signal('explicit'),
    value: signal([]),
    wrap: signal(true),
    typeaheadDelay: signal(0.5),
    softDisabled: signal(true),
    focusMode: signal('activedescendant'),
    element: signal(document.createElement('div')),
  });

  items.set(
    values.map((v, index) => {
      const element = document.createElement('div');
      element.role = 'menuitem';
      return new MenuItemPattern({
        value: signal(v),
        id: signal(`menuitem-${index}`),
        disabled: signal(false),
        searchTerm: signal(v),
        parent: signal(menubar),
        element: signal(element),
        submenu: signal(undefined),
      }) as TestMenuItem;
    }),
  );

  return menubar;
}

function getMenuPattern(
  parent: undefined | MenuItemPattern<string> | MenuTriggerPattern<string>,
  values: string[],
) {
  const items = signal<TestMenuItem[]>([]);

  const menu = new MenuPattern<string>({
    id: signal('menu-1'),
    items: items,
    parent: signal(parent) as any,
    activeItem: signal(undefined),
    typeaheadDelay: signal(0.5),
    wrap: signal(true),
    softDisabled: signal(true),
    multi: signal(false),
    focusMode: signal('activedescendant'),
    textDirection: signal('ltr'),
    orientation: signal('vertical'),
    selectionMode: signal('explicit'),
    element: signal(document.createElement('div')),
  });

  items.set(
    values.map((v, index) => {
      const element = document.createElement('div');
      element.role = 'menuitem';
      menu.inputs.element()?.appendChild(element);
      return new MenuItemPattern({
        value: signal(v),
        id: signal(`menuitem-${index}`),
        disabled: signal(false),
        searchTerm: signal(v),
        parent: signal(menu),
        element: signal(element),
        submenu: signal(undefined),
      }) as TestMenuItem;
    }),
  );

  if (parent instanceof MenuTriggerPattern) {
    (parent.menu as WritableSignal<MenuPattern<string>>).set(menu);
    parent.inputs.element()?.appendChild(menu.inputs.element()!);
  } else if (parent instanceof MenuItemPattern) {
    (parent.submenu as WritableSignal<MenuPattern<string>>).set(menu);
    parent.inputs.element()?.appendChild(menu.inputs.element()!);
  }

  menu.inputs.activeItem.set(items()[0]);
  return menu;
}

describe('Standalone Menu Pattern', () => {
  let menu: MenuPattern<string>;
  let submenu: MenuPattern<string>;

  beforeEach(() => {
    menu = getMenuPattern(undefined, ['a', 'b', 'c']);
    submenu = getMenuPattern(menu.inputs.items()[0], ['d', 'e']);
  });

  describe('Navigation', () => {
    it('should focus the first item by default', () => {
      expect(menu.inputs.activeItem()).toBe(menu.inputs.items()[0]);
    });

    it('should move the active item with the up and down arrows', () => {
      menu.onKeydown(down());
      expect(menu.inputs.activeItem()).toBe(menu.inputs.items()[1]);
      menu.onKeydown(up());
      expect(menu.inputs.activeItem()).toBe(menu.inputs.items()[0]);
    });

    it('should wrap navigation when reaching the top or bottom', () => {
      menu.onKeydown(up());
      expect(menu.inputs.activeItem()).toBe(menu.inputs.items()[2]);
      menu.onKeydown(down());
      expect(menu.inputs.activeItem()).toBe(menu.inputs.items()[0]);
    });

    it('should move focus to the first and last items with home and end', () => {
      menu.onKeydown(end());
      expect(menu.inputs.activeItem()).toBe(menu.inputs.items()[2]);
      menu.onKeydown(home());
      expect(menu.inputs.activeItem()).toBe(menu.inputs.items()[0]);
    });

    it('should move focus on mouse over a menu item', () => {
      const menuItem = menu.inputs.items()[1];
      menu.onMouseOver({target: menuItem.element()} as unknown as MouseEvent);
      expect(menu.inputs.activeItem()).toBe(menuItem);
    });

    describe('Typeahead', () => {
      function delay(amount: number) {
        return new Promise(resolve => setTimeout(resolve, amount));
      }

      it('should move the active item to the next item that starts with the typed character', async () => {
        const menu = getMenuPattern(undefined, ['Apple', 'Banana', 'Cherry']);
        const items = menu.inputs.items();

        const b = createKeyboardEvent('keydown', 66, 'b');
        menu.onKeydown(b);
        await delay(500);
        expect(menu.inputs.activeItem()).toBe(items[1]);

        const c = createKeyboardEvent('keydown', 67, 'c');
        menu.onKeydown(c);
        await delay(500);
        expect(menu.inputs.activeItem()).toBe(items[2]);
      });

      it('should support multi-character typeahead', async () => {
        const menu = getMenuPattern(undefined, ['Cabbage', 'Chard', 'Cherry', 'Cilantro']);

        const c = createKeyboardEvent('keydown', 67, 'c');
        const h = createKeyboardEvent('keydown', 72, 'h');
        const e = createKeyboardEvent('keydown', 69, 'e');

        menu.onKeydown(c);
        expect(menu.inputs.activeItem()?.value()).toBe('Chard');

        menu.onKeydown(h);
        expect(menu.inputs.activeItem()?.value()).toBe('Chard');

        menu.onKeydown(e);
        expect(menu.inputs.activeItem()?.value()).toBe('Cherry');

        await delay(500);
        menu.onKeydown(c);
        expect(menu.inputs.activeItem()?.value()).toBe('Cilantro');
      });

      it('should wrap when reaching the end of the list during typeahead', async () => {
        const menu = getMenuPattern(undefined, ['Apple', 'Banana', 'Avocado']);
        const items = menu.inputs.items();
        menu.inputs.activeItem.set(items[1]);

        const a = createKeyboardEvent('keydown', 65, 'a');
        menu.onKeydown(a);
        await delay(500);
        expect(menu.inputs.activeItem()).toBe(items[2]);

        menu.onKeydown(a);
        await delay(500);
        expect(menu.inputs.activeItem()).toBe(items[0]);
      });

      it('should not move the active item if no item matches the typed character', async () => {
        const menu = getMenuPattern(undefined, ['Apple', 'Banana', 'Cherry']);
        const items = menu.inputs.items();
        menu.inputs.activeItem.set(items[0]);

        const z = createKeyboardEvent('keydown', 90, 'z');
        menu.onKeydown(z);
        await delay(500);
        expect(menu.inputs.activeItem()).toBe(items[0]);
      });
    });
  });

  describe('Selection', () => {
    it('should select an item on click', () => {
      const items = menu.inputs.items();
      menu.inputs.onSelect = jasmine.createSpy('onSelect');
      menu.onClick(clickMenuItem(items, 1));
      expect(menu.inputs.onSelect).toHaveBeenCalledWith('b');
    });

    it('should select an item on enter', () => {
      const items = menu.inputs.items();
      menu.inputs.activeItem.set(items[1]);
      menu.inputs.onSelect = jasmine.createSpy('onSelect');

      menu.onKeydown(enter());
      expect(menu.inputs.onSelect).toHaveBeenCalledWith('b');
    });

    it('should select an item on space', () => {
      const items = menu.inputs.items();
      menu.inputs.activeItem.set(items[1]);
      menu.inputs.onSelect = jasmine.createSpy('onSelect');

      menu.onKeydown(space());
      expect(menu.inputs.onSelect).toHaveBeenCalledWith('b');
    });

    it('should not select a disabled item', () => {
      const items = menu.inputs.items() as TestMenuItem[];
      items[1].disabled.set(true);
      menu.inputs.activeItem.set(items[1]);
      menu.inputs.onSelect = jasmine.createSpy('onSelect');

      menu.onClick(clickMenuItem(items, 1));
      expect(menu.inputs.onSelect).not.toHaveBeenCalled();

      menu.onKeydown(enter());
      expect(menu.inputs.onSelect).not.toHaveBeenCalled();

      menu.onKeydown(space());
      expect(menu.inputs.onSelect).not.toHaveBeenCalled();
    });
  });

  describe('Expansion and Collapse', () => {
    it('should be expanded by default', () => {
      expect(menu.isVisible()).toBe(true);
      expect(submenu.isVisible()).toBe(false);
    });

    it('should expand submenu on click', () => {
      menu.onClick(clickMenuItem(menu.inputs.items(), 0));
      expect(submenu.isVisible()).toBe(true);
    });

    it('should open submenu on arrow right', () => {
      menu.onKeydown(right());
      expect(submenu.isVisible()).toBe(true);
    });

    it('should close submenu on arrow left', () => {
      menu.onKeydown(right());
      expect(submenu.isVisible()).toBe(true);

      submenu.onKeydown(left());
      expect(submenu.isVisible()).toBe(false);
    });

    it('should close submenu on click outside', () => {
      menu.onClick(clickMenuItem(menu.inputs.items(), 0));
      expect(submenu.isVisible()).toBe(true);

      submenu.onFocusOut(new FocusEvent('focusout', {relatedTarget: null}));
      expect(submenu.isVisible()).toBe(false);
    });

    it('should expand submenu on enter', () => {
      menu.onKeydown(enter());
      expect(submenu.isVisible()).toBe(true);
    });

    it('should expand submenu on space', () => {
      menu.onKeydown(space());
      expect(submenu.isVisible()).toBe(true);
    });

    it('should close submenu on escape', () => {
      menu.onKeydown(right());
      expect(submenu.isVisible()).toBe(true);

      submenu.onKeydown(escape());
      expect(submenu.isVisible()).toBe(false);
    });

    it('should close submenu on arrow left', () => {
      menu.onKeydown(right());
      expect(submenu.isVisible()).toBe(true);

      submenu.onKeydown(left());
      expect(submenu.isVisible()).toBe(false);
    });

    it('should open submenu on mouseover', () => {
      const menuItem = menu.inputs.items()[0];
      menu.onMouseOver({target: menuItem.element()} as unknown as MouseEvent);
      expect(submenu.isVisible()).toBe(true);
    });

    it('should close on selecting an item on click', () => {
      menu.onClick(clickMenuItem(menu.inputs.items(), 0));
      expect(submenu.isVisible()).toBe(true);

      submenu.onClick(clickMenuItem(submenu.inputs.items(), 0));
      expect(submenu.isVisible()).toBe(false);
    });

    it('should close on selecting an item on enter', () => {
      menu.onClick(clickMenuItem(menu.inputs.items(), 0));
      expect(submenu.isVisible()).toBe(true);

      submenu.onKeydown(enter());
      expect(submenu.isVisible()).toBe(false);
    });

    it('should close on selecting an item on space', () => {
      menu.onClick(clickMenuItem(menu.inputs.items(), 0));
      expect(submenu.isVisible()).toBe(true);

      submenu.onKeydown(space());
      expect(submenu.isVisible()).toBe(false);
    });

    it('should close on focus out from the menu', () => {
      menu.onClick(clickMenuItem(menu.inputs.items(), 0));
      expect(submenu.isVisible()).toBe(true);

      submenu.onFocusOut(new FocusEvent('focusout', {relatedTarget: null}));
      expect(submenu.isVisible()).toBe(false);
    });

    it('should close a submenu on focus out', () => {
      const parentMenuItem = menu.inputs.items()[0];
      menu.onMouseOver({target: parentMenuItem.element()} as unknown as MouseEvent);
      expect(submenu.isVisible()).toBe(true);
      expect(submenu.isFocused()).toBe(false);

      submenu.onFocusOut(new FocusEvent('focusout', {relatedTarget: document.body}));
      expect(submenu.isVisible()).toBe(false);
    });

    it('should close an unfocused submenu on mouse out', () => {
      menu.onMouseOver({target: menu.inputs.items()[0].element()} as unknown as MouseEvent);
      expect(submenu.isVisible()).toBe(true);

      submenu.onMouseOut({relatedTarget: document.body} as unknown as MouseEvent);
      expect(submenu.isVisible()).toBe(false);
    });

    it('should not close an unfocused submenu on mouse out if the parent menu is hovered', () => {
      const parentMenuItem = menu.inputs.items()[0];
      menu.onMouseOver({target: parentMenuItem.element()} as unknown as MouseEvent);
      expect(submenu.isVisible()).toBe(true);
      submenu.onMouseOut({relatedTarget: parentMenuItem.element()} as unknown as MouseEvent);
      expect(submenu.isVisible()).toBe(true);
    });
  });
});

describe('Menu Trigger Pattern', () => {
  let menu: MenuPattern<string>;
  let trigger: MenuTriggerPattern<string>;
  let submenu: MenuPattern<string> | undefined;

  beforeEach(() => {
    trigger = getMenuTriggerPattern();
    menu = getMenuPattern(trigger, ['a', 'b', 'c']);
    submenu = getMenuPattern(menu.inputs.items()[0], ['d', 'e']);
  });

  describe('Navigation', () => {
    it('should navigate to the first item on click', () => {
      trigger.onClick();
      expect(menu.inputs.activeItem()).toBe(menu.inputs.items()[0]);
    });

    it('should navigate to the first item on arrow down', () => {
      trigger.onKeydown(down());
      expect(menu.inputs.activeItem()).toBe(menu.inputs.items()[0]);
    });

    it('should navigate to the last item on arrow up', () => {
      trigger.onKeydown(up());
      expect(menu.inputs.activeItem()).toBe(menu.inputs.items()[2]);
    });

    it('should navigate to the first item on enter', () => {
      trigger.onKeydown(enter());
      expect(menu.inputs.activeItem()).toBe(menu.inputs.items()[0]);
    });

    it('should navigate to the first item on space', () => {
      trigger.onKeydown(space());
      expect(menu.inputs.activeItem()).toBe(menu.inputs.items()[0]);
    });
  });

  describe('Expansion and Collapse', () => {
    it('should be closed by default', () => {
      expect(trigger.expanded()).toBe(false);
      expect(menu.isVisible()).toBe(false);
      expect(submenu?.isVisible()).toBe(false);
    });

    it('should open on click', () => {
      trigger.onClick();
      expect(trigger.expanded()).toBe(true);
      expect(menu.isVisible()).toBe(true);
      expect(submenu?.isVisible()).toBe(false);
    });

    it('should close on second click', () => {
      trigger.onClick();
      expect(trigger.expanded()).toBe(true);
      expect(menu.isVisible()).toBe(true);

      trigger.onClick();
      expect(trigger.expanded()).toBe(false);
      expect(menu.isVisible()).toBe(false);
    });

    it('should open on arrow down', () => {
      trigger.onKeydown(down());
      expect(trigger.expanded()).toBe(true);
      expect(menu.isVisible()).toBe(true);
      expect(submenu?.isVisible()).toBe(false);
    });

    it('should open on arrow up', () => {
      trigger.onKeydown(up());
      expect(trigger.expanded()).toBe(true);
      expect(menu.isVisible()).toBe(true);
      expect(submenu?.isVisible()).toBe(false);
    });

    it('should open on space', () => {
      trigger.onKeydown(space());
      expect(trigger.expanded()).toBe(true);
      expect(menu.isVisible()).toBe(true);
      expect(submenu?.isVisible()).toBe(false);
    });

    it('should open on enter', () => {
      trigger.onKeydown(enter());
      expect(trigger.expanded()).toBe(true);
      expect(menu.isVisible()).toBe(true);
      expect(submenu?.isVisible()).toBe(false);
    });

    it('should close on escape', () => {
      trigger.onKeydown(down());
      expect(trigger.expanded()).toBe(true);
      expect(menu.isVisible()).toBe(true);

      menu.onKeydown(escape());
      expect(trigger.expanded()).toBe(false);
      expect(menu.isVisible()).toBe(false);
    });

    it('should close on selecting an item on click', () => {
      trigger.onClick();
      expect(trigger.expanded()).toBe(true);
      expect(menu.isVisible()).toBe(true);
      expect(submenu?.isVisible()).toBe(false);

      menu.onClick(clickMenuItem(menu.inputs.items(), 0));
      expect(trigger.expanded()).toBe(true);
      expect(menu.isVisible()).toBe(true);
      expect(submenu?.isVisible()).toBe(true);

      submenu?.onClick(clickMenuItem(submenu.inputs.items(), 0));
      expect(trigger.expanded()).toBe(false);
      expect(menu.isVisible()).toBe(false);
      expect(submenu?.isVisible()).toBe(false);
    });

    it('should close on selecting an item on enter', () => {
      trigger.onKeydown(down());
      expect(trigger.expanded()).toBe(true);
      expect(menu.isVisible()).toBe(true);
      expect(submenu?.isVisible()).toBe(false);

      menu.onKeydown(right());
      expect(submenu?.isVisible()).toBe(true);

      submenu?.onKeydown(enter());
      expect(trigger.expanded()).toBe(false);
      expect(menu.isVisible()).toBe(false);
      expect(submenu?.isVisible()).toBe(false);
    });

    it('should close on selecting an item on space', () => {
      trigger.onKeydown(down());
      expect(trigger.expanded()).toBe(true);
      expect(menu.isVisible()).toBe(true);
      expect(submenu?.isVisible()).toBe(false);

      menu.onKeydown(right());
      expect(submenu?.isVisible()).toBe(true);

      submenu?.onKeydown(space());
      expect(trigger.expanded()).toBe(false);
      expect(menu.isVisible()).toBe(false);
      expect(submenu?.isVisible()).toBe(false);
    });

    it('should close the trigger on focus out from the menu', () => {
      trigger.onKeydown(down());
      menu.onFocusOut(new FocusEvent('focusout', {relatedTarget: null}));
      expect(trigger.expanded()).toBe(false);
      expect(menu.isVisible()).toBe(false);
      expect(submenu?.isVisible()).toBe(false);
    });
  });
});

describe('Menu Bar Pattern', () => {
  let menuA: MenuPattern<string>;
  let menuB: MenuPattern<string>;
  let menuC: MenuPattern<string>;
  let menubar: MenuBarPattern<string>;

  beforeEach(() => {
    menubar = getMenuBarPattern(['a', 'b', 'c']);
    menuA = getMenuPattern(menubar.inputs.items()[0], ['apple', 'avocado']);
    menuB = getMenuPattern(menubar.inputs.items()[1], ['banana', 'blueberry']);
    menuC = getMenuPattern(menubar.inputs.items()[2], ['cherry', 'cranberry']);
  });

  describe('Navigation', () => {
    it('should navigate to the first item on arrow down', () => {
      const menubarItems = menubar.inputs.items();
      menubar.inputs.activeItem.set(menubarItems[0]);
      menubar.onKeydown(down());

      expect(menuA.isVisible()).toBe(true);
      expect(menuA.inputs.activeItem()).toBe(menuA.inputs.items()[0]);
    });

    it('should navigate to the last item on arrow up', () => {
      const menubarItems = menubar.inputs.items();
      menubar.inputs.activeItem.set(menubarItems[0]);
      menubar.onKeydown(up());

      expect(menuA.isVisible()).toBe(true);
      expect(menuA.inputs.activeItem()).toBe(menuA.inputs.items()[1]);
    });

    it('should navigate to the first item on enter', () => {
      const menubarItems = menubar.inputs.items();
      menubar.inputs.activeItem.set(menubarItems[0]);
      menubar.onKeydown(enter());

      expect(menuA.isVisible()).toBe(true);
      expect(menuA.inputs.activeItem()).toBe(menuA.inputs.items()[0]);
    });

    it('should navigate to the first item on space', () => {
      const menubarItems = menubar.inputs.items();
      menubar.inputs.activeItem.set(menubarItems[0]);
      menubar.onKeydown(space());

      expect(menuA.isVisible()).toBe(true);
      expect(menuA.inputs.activeItem()).toBe(menuA.inputs.items()[0]);
    });

    it('should navigate to a menubar item on mouse over', () => {
      const menubarItems = menubar.inputs.items();
      menubar.onClick(clickMenuItem(menubarItems, 0));
      expect(menuA.isVisible()).toBe(true);
      expect(menuB.isVisible()).toBe(false);

      const mouseOverEvent = {target: menubarItems[1].element()} as unknown as MouseEvent;
      menubar.onMouseOver(mouseOverEvent);

      expect(menuA.isVisible()).toBe(false);
      expect(menuB.isVisible()).toBe(true);
      expect(menubar.inputs.activeItem()).toBe(menubarItems[1]);
    });

    it('should focus the first item of the next menubar item on arrow right', () => {
      const menubarItems = menubar.inputs.items();
      menubar.onClick(clickMenuItem(menubarItems, 0)); // open menuA
      expect(menuA.isVisible()).toBe(true);

      menuA.onKeydown(right());

      expect(menuA.isVisible()).toBe(false);
      expect(menuB.isVisible()).toBe(true);
      expect(menuB.inputs.activeItem()).toBe(menuB.inputs.items()[0]);
    });

    it('should focus the first item of the previous menubar item on arrow left', () => {
      const menubarItems = menubar.inputs.items();
      menubar.onClick(clickMenuItem(menubarItems, 1)); // open menuB
      expect(menuB.isVisible()).toBe(true);

      menuB.onKeydown(left());

      expect(menuB.isVisible()).toBe(false);
      expect(menuA.isVisible()).toBe(true);
      expect(menuA.inputs.activeItem()).toBe(menuA.inputs.items()[0]);
    });
  });

  describe('Expansion and Collapse', () => {
    it('should be collapsed by default', () => {
      const menubarItems = menubar.inputs.items();
      expect(menubarItems[0].expanded()).toBe(false);
      expect(menubarItems[1].expanded()).toBe(false);
      expect(menubarItems[2].expanded()).toBe(false);

      expect(menuA.isVisible()).toBe(false);
      expect(menuB.isVisible()).toBe(false);
      expect(menuC.isVisible()).toBe(false);
    });

    it('should expand on click', () => {
      const menubarItems = menubar.inputs.items();
      menubar.onClick(clickMenuItem(menubarItems, 0));

      expect(menubarItems[0].expanded()).toBe(true);
      expect(menubarItems[1].expanded()).toBe(false);
      expect(menubarItems[2].expanded()).toBe(false);

      expect(menuA.isVisible()).toBe(true);
      expect(menuB.isVisible()).toBe(false);
      expect(menuC.isVisible()).toBe(false);
    });

    it('should collapse on second click', () => {
      const menubarItems = menubar.inputs.items();
      menubar.onClick(clickMenuItem(menubarItems, 0));

      expect(menubarItems[0].expanded()).toBe(true);
      expect(menuA.isVisible()).toBe(true);

      menubar.onClick(clickMenuItem(menubarItems, 0));

      expect(menubarItems[0].expanded()).toBe(false);
      expect(menuA.isVisible()).toBe(false);
    });

    it('should expand on arrow down', () => {
      const menubarItems = menubar.inputs.items();
      menubar.inputs.activeItem.set(menubarItems[0]);
      menubar.onKeydown(down());

      expect(menubarItems[0].expanded()).toBe(true);
      expect(menuA.isVisible()).toBe(true);
    });

    it('should expand on arrow up', () => {
      const menubarItems = menubar.inputs.items();
      menubar.inputs.activeItem.set(menubarItems[0]);
      menubar.onKeydown(up());

      expect(menubarItems[0].expanded()).toBe(true);
      expect(menuA.isVisible()).toBe(true);
    });

    it('should expand on space', () => {
      const menubarItems = menubar.inputs.items();
      menubar.inputs.activeItem.set(menubarItems[0]);
      menubar.onKeydown(space());

      expect(menubarItems[0].expanded()).toBe(true);
      expect(menuA.isVisible()).toBe(true);
    });

    it('should expand on enter', () => {
      const menubarItems = menubar.inputs.items();
      menubar.inputs.activeItem.set(menubarItems[0]);
      menubar.onKeydown(enter());

      expect(menubarItems[0].expanded()).toBe(true);
      expect(menuA.isVisible()).toBe(true);
    });

    it('should close on escape', () => {
      const menubarItems = menubar.inputs.items();
      menubar.onClick(clickMenuItem(menubarItems, 0));
      expect(menubarItems[0].expanded()).toBe(true);
      expect(menuA.isVisible()).toBe(true);

      menuA.onKeydown(escape());

      expect(menubarItems[0].expanded()).toBe(false);
      expect(menuA.isVisible()).toBe(false);
    });

    it('should close on selecting an item on click', () => {
      const menubarItems = menubar.inputs.items();
      menubar.onClick(clickMenuItem(menubarItems, 0));
      expect(menuA.isVisible()).toBe(true);

      menuA.onClick(clickMenuItem(menuA.inputs.items(), 0));

      expect(menubarItems[0].expanded()).toBe(false);
      expect(menuA.isVisible()).toBe(false);
    });

    it('should close on selecting an item on enter', () => {
      const menubarItems = menubar.inputs.items();
      menubar.onClick(clickMenuItem(menubarItems, 0));
      expect(menuA.isVisible()).toBe(true);

      menuA.onKeydown(enter());

      expect(menubarItems[0].expanded()).toBe(false);
      expect(menuA.isVisible()).toBe(false);
    });

    it('should close on selecting an item on space', () => {
      const menubarItems = menubar.inputs.items();
      menubar.onClick(clickMenuItem(menubarItems, 0));
      expect(menuA.isVisible()).toBe(true);

      menuA.onKeydown(space());

      expect(menubarItems[0].expanded()).toBe(false);
      expect(menuA.isVisible()).toBe(false);
    });

    it('should close on focus out from the menu', () => {
      const menubarItems = menubar.inputs.items();
      menubar.onClick(clickMenuItem(menubarItems, 0));
      expect(menuA.isVisible()).toBe(true);

      menuA.onFocusOut(new FocusEvent('focusout', {relatedTarget: null}));

      expect(menubarItems[0].expanded()).toBe(false);
      expect(menuA.isVisible()).toBe(false);
    });

    it('should close on arrow right on a leaf menu item', () => {
      const menubarItems = menubar.inputs.items();
      menubar.onClick(clickMenuItem(menubarItems, 0));
      expect(menuA.isVisible()).toBe(true);

      menuA.onKeydown(right());

      expect(menuA.isVisible()).toBe(false);
      expect(menubarItems[0].expanded()).toBe(false);
    });

    it('should close on arrow left on a root menu item', () => {
      const menubarItems = menubar.inputs.items();
      menubar.onClick(clickMenuItem(menubarItems, 1));
      expect(menuB.isVisible()).toBe(true);

      menuB.onKeydown(left());

      expect(menuB.isVisible()).toBe(false);
      expect(menubarItems[1].expanded()).toBe(false);
    });

    it('should expand the next menu bar item on arrow right on a leaf menu item', () => {
      const menubarItems = menubar.inputs.items();
      menubar.onClick(clickMenuItem(menubarItems, 0));

      menuA.onKeydown(right());

      expect(menuB.isVisible()).toBe(true);
      expect(menubarItems[1].expanded()).toBe(true);
      expect(menubar.inputs.activeItem()).toBe(menubarItems[1]);
    });

    it('should expand the previous menu bar item on arrow left on a root menu item', () => {
      const menubarItems = menubar.inputs.items();
      menubar.onClick(clickMenuItem(menubarItems, 1));

      menuB.onKeydown(left());

      expect(menuA.isVisible()).toBe(true);
      expect(menubarItems[0].expanded()).toBe(true);
      expect(menubar.inputs.activeItem()).toBe(menubarItems[0]);
    });
  });
});

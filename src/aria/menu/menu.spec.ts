import {Component, DebugElement} from '@angular/core';
import {ComponentFixture, TestBed, fakeAsync, tick} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {Menu, MenuBar, MenuItem, MenuTrigger} from './menu';

describe('Standalone Menu Pattern', () => {
  let fixture: ComponentFixture<StandaloneMenuExample>;

  const keydown = (element: Element, key: string, modifierKeys: {} = {}) => {
    element.dispatchEvent(
      new KeyboardEvent('keydown', {
        key,
        bubbles: true,
        ...modifierKeys,
      }),
    );
    fixture.detectChanges();
  };

  const mouseover = (element: Element) => {
    element.dispatchEvent(new MouseEvent('mouseover', {bubbles: true}));
    fixture.detectChanges();
  };

  const mouseout = (element: Element) => {
    element.dispatchEvent(new MouseEvent('mouseout', {bubbles: true}));
    fixture.detectChanges();
  };

  const click = (element: Element, eventInit?: PointerEventInit) => {
    element.dispatchEvent(new PointerEvent('click', {bubbles: true, ...eventInit}));
    fixture.detectChanges();
  };

  const focusout = (element: Element, relatedTarget?: EventTarget) => {
    element.dispatchEvent(new FocusEvent('focusout', {bubbles: true, relatedTarget}));
    fixture.detectChanges();
  };

  function setupMenu() {
    TestBed.configureTestingModule({});
    fixture = TestBed.createComponent(StandaloneMenuExample);
    fixture.detectChanges();
    getItem('Apple')?.focus();
  }

  function getMenu(): HTMLElement {
    return fixture.debugElement.query(By.directive(Menu)).nativeElement as HTMLElement;
  }

  function getItem(text: string): HTMLElement | null {
    const items = fixture.debugElement
      .queryAll(By.directive(MenuItem))
      .map((debugEl: DebugElement) => debugEl.nativeElement as HTMLElement);
    return items.find(item => item.textContent?.trim() === text) || null;
  }

  describe('Navigation', () => {
    beforeEach(() => setupMenu());

    it('should focus the first item by default', () => {
      expect(getItem('Apple')?.tabIndex).toBe(0);
    });

    it('should move the active item with the up and down arrows', () => {
      const apple = getItem('Apple');
      const banana = getItem('Banana');

      keydown(apple!, 'ArrowDown');
      expect(document.activeElement).toBe(banana);

      keydown(banana!, 'ArrowUp');
      expect(document.activeElement).toBe(apple);
    });

    it('should wrap navigation when reaching the top or bottom', () => {
      const apple = getItem('Apple');
      const cherry = getItem('Cherry');

      keydown(apple!, 'ArrowUp');
      expect(document.activeElement).toBe(cherry);

      keydown(cherry!, 'ArrowDown');
      expect(document.activeElement).toBe(apple);
    });

    it('should move focus to the first and last items with home and end', () => {
      const apple = getItem('Apple');
      const cherry = getItem('Cherry');

      keydown(apple!, 'End');
      expect(document.activeElement).toBe(cherry);

      keydown(cherry!, 'Home');
      expect(document.activeElement).toBe(apple);
    });

    it('should move focus on mouse over a menu item', () => {
      const banana = getItem('Banana');
      mouseover(banana!);
      expect(document.activeElement).toBe(banana);
    });

    describe('Typeahead', () => {
      it('should move the active item to the next item that starts with the typed character', fakeAsync(() => {
        const apple = getItem('Apple');
        const banana = getItem('Banana');

        keydown(apple!, 'b');
        expect(document.activeElement).toBe(banana);
      }));

      it('should support multi-character typeahead', fakeAsync(() => {
        const apple = getItem('Apple');
        const banana = getItem('Banana');
        const berries = getItem('Berries');

        keydown(apple!, 'b');
        expect(document.activeElement).toBe(banana);

        tick(100);
        keydown(document.activeElement!, 'e');

        expect(document.activeElement).toBe(berries);
      }));

      it('should wrap when reaching the end of the list during typeahead', fakeAsync(() => {
        const apple = getItem('Apple');
        const cherry = getItem('Cherry');

        // Start at cherry by pressing End
        keydown(apple!, 'End');
        expect(document.activeElement).toBe(cherry);

        // Type 'a', which should wrap to 'Apple'
        keydown(document.activeElement!, 'a');
        expect(document.activeElement).toBe(apple);
      }));

      it('should not move the active item if no item matches the typed character', fakeAsync(() => {
        const apple = getItem('Apple');

        keydown(apple!, 'z');
        expect(document.activeElement).toBe(apple);
      }));
    });
  });

  describe('Selection', () => {
    beforeEach(() => setupMenu());

    it('should select an item on click', () => {
      const banana = getItem('Banana');
      spyOn(fixture.componentInstance, 'onSubmit');

      click(banana!);
      expect(fixture.componentInstance.onSubmit).toHaveBeenCalledWith('Banana');
    });

    it('should select an item on enter', () => {
      const banana = getItem('Banana');
      spyOn(fixture.componentInstance, 'onSubmit');

      keydown(document.activeElement!, 'ArrowDown'); // Move focus to Banana
      expect(document.activeElement).toBe(banana);

      keydown(banana!, 'Enter');
      expect(fixture.componentInstance.onSubmit).toHaveBeenCalledWith('Banana');
    });

    it('should select an item on space', () => {
      const banana = getItem('Banana');
      spyOn(fixture.componentInstance, 'onSubmit');

      keydown(document.activeElement!, 'ArrowDown'); // Move focus to Banana
      expect(document.activeElement).toBe(banana);

      keydown(banana!, ' ');
      expect(fixture.componentInstance.onSubmit).toHaveBeenCalledWith('Banana');
    });

    it('should not select a disabled item', () => {
      const cherry = getItem('Cherry');
      spyOn(fixture.componentInstance, 'onSubmit');

      click(cherry!);
      expect(fixture.componentInstance.onSubmit).not.toHaveBeenCalled();

      keydown(document.activeElement!, 'End');
      expect(document.activeElement).toBe(cherry);

      keydown(cherry!, 'Enter');
      expect(fixture.componentInstance.onSubmit).not.toHaveBeenCalled();

      keydown(cherry!, ' ');
      expect(fixture.componentInstance.onSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Expansion', () => {
    function getSubmenu(): HTMLElement | null {
      const menus = fixture.debugElement.queryAll(By.directive(Menu));
      return menus.length > 1 ? (menus[1].nativeElement as HTMLElement) : null;
    }

    function isSubmenuExpanded(): boolean {
      const berries = getItem('Berries');
      return berries?.getAttribute('aria-expanded') === 'true';
    }

    beforeEach(() => setupMenu());

    it('should be expanded by default', () => {
      expect(getMenu()).not.toBeNull();
      expect(isSubmenuExpanded()).toBe(false);
    });

    it('should expand submenu on click', () => {
      const berries = getItem('Berries');
      click(berries!);
      expect(isSubmenuExpanded()).toBe(true);
    });

    it('should open submenu on arrow right', () => {
      const apple = getItem('Apple');
      const banana = getItem('Banana');
      const berries = getItem('Berries');
      const blueberry = getItem('Blueberry');

      keydown(apple!, 'ArrowDown');
      keydown(banana!, 'ArrowDown');
      keydown(berries!, 'ArrowRight');

      expect(isSubmenuExpanded()).toBe(true);
      expect(document.activeElement).toBe(blueberry);
    });

    it('should close submenu on arrow left', () => {
      const apple = getItem('Apple');
      const banana = getItem('Banana');
      const berries = getItem('Berries');
      const blueberry = getItem('Blueberry');

      keydown(apple!, 'ArrowDown');
      keydown(banana!, 'ArrowDown');
      keydown(berries!, 'ArrowRight');
      keydown(blueberry!, 'ArrowLeft');

      expect(isSubmenuExpanded()).toBe(false);
      expect(document.activeElement).toBe(berries);
    });

    it('should close submenu on click outside', () => {
      const berries = getItem('Berries');
      const blueberry = getItem('Blueberry');

      click(berries!);
      expect(isSubmenuExpanded()).toBe(true);

      focusout(blueberry!, document.body);
      expect(isSubmenuExpanded()).toBe(false);
    });

    it('should expand submenu on enter', () => {
      const apple = getItem('Apple');
      const banana = getItem('Banana');
      const berries = getItem('Berries');
      const blueberry = getItem('Blueberry');

      keydown(apple!, 'ArrowDown');
      keydown(banana!, 'ArrowDown');
      keydown(berries!, 'Enter');

      expect(isSubmenuExpanded()).toBe(true);
      expect(document.activeElement).toBe(blueberry);
    });

    it('should expand submenu on space', () => {
      const apple = getItem('Apple');
      const banana = getItem('Banana');
      const berries = getItem('Berries');
      const blueberry = getItem('Blueberry');

      keydown(apple!, 'ArrowDown');
      keydown(banana!, 'ArrowDown');
      keydown(berries!, ' ');

      expect(isSubmenuExpanded()).toBe(true);
      expect(document.activeElement).toBe(blueberry);
    });

    it('should close submenu on escape', () => {
      const apple = getItem('Apple');
      const banana = getItem('Banana');
      const berries = getItem('Berries');
      const blueberry = getItem('Blueberry');

      keydown(apple!, 'ArrowDown');
      keydown(banana!, 'ArrowDown');
      keydown(berries!, 'ArrowRight');

      expect(isSubmenuExpanded()).toBe(true);
      expect(document.activeElement).toBe(blueberry);

      keydown(blueberry!, 'Escape');

      expect(isSubmenuExpanded()).toBe(false);
      expect(document.activeElement).toBe(berries);
    });

    it('should open submenu on mouseover', fakeAsync(() => {
      const berries = getItem('Berries');
      mouseover(berries!);
      tick();
      expect(isSubmenuExpanded()).toBe(true);
    }));

    it('should close on selecting an item on click', () => {
      spyOn(fixture.componentInstance, 'onSubmit');
      click(getItem('Berries')!); // open submenu
      expect(isSubmenuExpanded()).toBe(true);

      click(getItem('Blueberry')!);

      expect(fixture.componentInstance.onSubmit).toHaveBeenCalledWith('Blueberry');
      expect(isSubmenuExpanded()).toBe(false);
    });

    it('should close on selecting an item on enter', () => {
      spyOn(fixture.componentInstance, 'onSubmit');
      const apple = getItem('Apple');
      const banana = getItem('Banana');
      const berries = getItem('Berries');
      const blueberry = getItem('Blueberry');

      keydown(apple!, 'ArrowDown');
      keydown(banana!, 'ArrowDown');
      keydown(berries!, 'Enter'); // open submenu

      expect(document.activeElement).toBe(blueberry);

      keydown(blueberry!, 'Enter');

      expect(fixture.componentInstance.onSubmit).toHaveBeenCalledWith('Blueberry');
      expect(isSubmenuExpanded()).toBe(false);
    });

    it('should close on selecting an item on space', () => {
      spyOn(fixture.componentInstance, 'onSubmit');
      const apple = getItem('Apple');
      const banana = getItem('Banana');
      const berries = getItem('Berries');
      const blueberry = getItem('Blueberry');

      keydown(apple!, 'ArrowDown');
      keydown(banana!, 'ArrowDown');
      keydown(berries!, ' '); // open submenu

      expect(document.activeElement).toBe(blueberry);

      keydown(blueberry!, ' ');

      expect(fixture.componentInstance.onSubmit).toHaveBeenCalledWith('Blueberry');
      expect(isSubmenuExpanded()).toBe(false);
    });

    it('should close a submenu on focus out', () => {
      const apple = getItem('Apple');
      const banana = getItem('Banana');
      const berries = getItem('Berries');
      const blueberry = getItem('Blueberry');

      keydown(apple!, 'ArrowDown');
      keydown(banana!, 'ArrowDown');
      keydown(berries!, 'ArrowRight');
      expect(isSubmenuExpanded()).toBe(true);
      expect(document.activeElement).toBe(blueberry);

      const externalElement = document.createElement('button');
      document.body.appendChild(externalElement);

      focusout(blueberry!, externalElement);

      expect(isSubmenuExpanded()).toBe(false);
      externalElement.remove();
    });

    it('should close an unfocused submenu on mouse out', fakeAsync(() => {
      const berries = getItem('Berries');
      const submenu = getSubmenu();

      mouseover(berries!);
      tick();
      expect(isSubmenuExpanded()).toBe(true);

      mouseout(berries!);
      mouseout(submenu!);
      tick(500);

      expect(isSubmenuExpanded()).toBe(false);
    }));

    it('should not close an unfocused submenu on mouse out if the parent menu is hovered', fakeAsync(() => {
      const berries = getItem('Berries');
      const submenu = getSubmenu();

      mouseover(berries!);
      tick();
      expect(isSubmenuExpanded()).toBe(true);

      mouseout(berries!);
      mouseover(submenu!);
      tick(500);
      expect(isSubmenuExpanded()).toBe(true);
    }));
  });
});

describe('Menu Trigger Pattern', () => {
  let fixture: ComponentFixture<MenuTriggerExample>;

  const keydown = (element: Element, key: string, modifierKeys: {} = {}) => {
    element.dispatchEvent(
      new KeyboardEvent('keydown', {
        key,
        bubbles: true,
        ...modifierKeys,
      }),
    );
    fixture.detectChanges();
  };

  const click = (element: Element, eventInit?: PointerEventInit) => {
    element.dispatchEvent(new PointerEvent('click', {bubbles: true, ...eventInit}));
    fixture.detectChanges();
  };

  const focusout = (element: Element, relatedTarget?: EventTarget) => {
    element.dispatchEvent(new FocusEvent('focusout', {bubbles: true, relatedTarget}));
    fixture.detectChanges();
  };

  function setupMenu() {
    TestBed.configureTestingModule({});
    fixture = TestBed.createComponent(MenuTriggerExample);
    fixture.detectChanges();
    getItem('Apple')?.focus();
  }

  function getTrigger(): HTMLElement {
    return fixture.debugElement.query(By.directive(MenuTrigger)).nativeElement as HTMLElement;
  }

  function getMenu(): HTMLElement | null {
    const menu = fixture.debugElement.query(By.directive(Menu));
    return menu ? (menu.nativeElement as HTMLElement) : null;
  }

  function getItem(text: string): HTMLElement | null {
    const items = fixture.debugElement
      .queryAll(By.directive(MenuItem))
      .map((debugEl: DebugElement) => debugEl.nativeElement as HTMLElement);
    return items.find(item => item.textContent?.trim() === text) || null;
  }

  function isExpanded(): boolean {
    return getTrigger().getAttribute('aria-expanded') === 'true';
  }

  describe('Navigation', () => {
    beforeEach(() => setupMenu());

    it('should navigate to the first item on click', () => {
      click(getTrigger());
      expect(document.activeElement).toBe(getItem('Apple'));
    });

    it('should navigate to the first item on arrow down', () => {
      const trigger = getTrigger();
      keydown(trigger, 'ArrowDown');
      expect(document.activeElement).toBe(getItem('Apple'));
    });

    it('should navigate to the last item on arrow up', () => {
      const trigger = getTrigger();
      keydown(trigger, 'ArrowUp');
      expect(document.activeElement).toBe(getItem('Cherry'));
    });

    it('should navigate to the first item on enter', () => {
      const trigger = getTrigger();
      keydown(trigger, 'Enter');
      expect(document.activeElement).toBe(getItem('Apple'));
    });

    it('should navigate to the first item on space', () => {
      const trigger = getTrigger();
      keydown(trigger, ' ');
      expect(document.activeElement).toBe(getItem('Apple'));
    });
  });

  describe('Expansion', () => {
    beforeEach(() => setupMenu());

    it('should be closed by default', () => {
      expect(isExpanded()).toBe(false);
    });

    it('should open on click', () => {
      click(getTrigger());
      expect(isExpanded()).toBe(true);
    });

    it('should close on second click', () => {
      const trigger = getTrigger();
      click(trigger);
      expect(isExpanded()).toBe(true);

      click(trigger);
      expect(isExpanded()).toBe(false);
    });

    it('should open on arrow down', () => {
      keydown(getTrigger(), 'ArrowDown');
      expect(isExpanded()).toBe(true);
    });

    it('should open on arrow up', () => {
      keydown(getTrigger(), 'ArrowUp');
      expect(isExpanded()).toBe(true);
    });

    it('should open on space', () => {
      keydown(getTrigger(), ' ');
      expect(isExpanded()).toBe(true);
    });

    it('should open on enter', () => {
      keydown(getTrigger(), 'Enter');
      expect(isExpanded()).toBe(true);
    });

    it('should close on escape', () => {
      const trigger = getTrigger();
      click(trigger);
      expect(isExpanded()).toBe(true);

      keydown(getMenu()!, 'Escape');
      expect(isExpanded()).toBe(false);
      expect(document.activeElement).toBe(trigger);
    });

    it('should close on selecting an item on click', () => {
      click(getTrigger());
      click(getItem('Apple')!);
      expect(isExpanded()).toBe(false);
    });

    it('should close on selecting an item on enter', () => {
      click(getTrigger());
      keydown(getItem('Apple')!, 'Enter');
      expect(isExpanded()).toBe(false);
    });

    it('should close on selecting an item on space', () => {
      click(getTrigger());
      keydown(getItem('Apple')!, ' ');
      expect(isExpanded()).toBe(false);
    });

    it('should close the trigger on focus out from the menu', () => {
      click(getTrigger());
      expect(isExpanded()).toBe(true);

      focusout(getMenu()!, document.body);
      expect(isExpanded()).toBe(false);
    });
  });
});

describe('Menu Bar Pattern', () => {
  let fixture: ComponentFixture<MenuBarExample>;

  const keydown = (element: Element, key: string, modifierKeys: {} = {}) => {
    element.dispatchEvent(
      new KeyboardEvent('keydown', {
        key,
        bubbles: true,
        ...modifierKeys,
      }),
    );
    fixture.detectChanges();
  };

  const mouseover = (element: Element) => {
    element.dispatchEvent(new MouseEvent('mouseover', {bubbles: true}));
    fixture.detectChanges();
  };

  const click = (element: Element, eventInit?: PointerEventInit) => {
    element.dispatchEvent(new PointerEvent('click', {bubbles: true, ...eventInit}));
    fixture.detectChanges();
  };

  const focusout = (element: Element, relatedTarget?: EventTarget) => {
    element.dispatchEvent(new FocusEvent('focusout', {bubbles: true, relatedTarget}));
    fixture.detectChanges();
  };

  function setupMenu() {
    TestBed.configureTestingModule({});
    fixture = TestBed.createComponent(MenuBarExample);
    fixture.detectChanges();
    getMenuBarItem('File')?.focus();
  }

  function getMenu(): HTMLElement | null {
    const menu = fixture.debugElement.query(By.directive(Menu));
    return menu ? (menu.nativeElement as HTMLElement) : null;
  }

  function getMenuBarItem(text: string): HTMLElement | null {
    const items = fixture.debugElement
      .query(By.directive(MenuBar))
      .queryAll(By.directive(MenuItem));
    return (
      items.find(item => item.nativeElement.textContent?.trim() === text)?.nativeElement || null
    );
  }

  function getMenuItem(text: string): HTMLElement | null {
    const items = fixture.debugElement
      .queryAll(By.directive(MenuItem))
      .map((debugEl: DebugElement) => debugEl.nativeElement as HTMLElement);
    return items.find(item => item.textContent?.trim() === text) || null;
  }

  function isExpanded(menuBarItemText: string): boolean {
    return getMenuBarItem(menuBarItemText)?.getAttribute('aria-expanded') === 'true';
  }

  describe('Navigation', () => {
    beforeEach(() => {
      setupMenu();
      getMenuBarItem('File')?.focus();
    });

    it('should navigate to the first item on arrow down', () => {
      const file = getMenuBarItem('File');
      const edit = getMenuBarItem('Edit');
      const view = getMenuBarItem('View');
      keydown(file!, 'ArrowRight');
      keydown(edit!, 'ArrowRight');
      keydown(view!, 'ArrowDown');
      expect(document.activeElement).toBe(getMenuItem('Zoom In'));
    });

    it('should navigate to the last item on arrow up', () => {
      const file = getMenuBarItem('File');
      const edit = getMenuBarItem('Edit');
      const view = getMenuBarItem('View');
      keydown(file!, 'ArrowRight');
      keydown(edit!, 'ArrowRight');
      keydown(view!, 'ArrowUp');
      expect(document.activeElement).toBe(getMenuItem('Full Screen'));
    });

    it('should navigate to the first item on enter', () => {
      const file = getMenuBarItem('File');
      const edit = getMenuBarItem('Edit');
      const view = getMenuBarItem('View');
      keydown(file!, 'ArrowRight');
      keydown(edit!, 'ArrowRight');
      keydown(view!, 'Enter');
      expect(document.activeElement).toBe(getMenuItem('Zoom In'));
    });

    it('should navigate to the first item on space', () => {
      const file = getMenuBarItem('File');
      const edit = getMenuBarItem('Edit');
      const view = getMenuBarItem('View');
      keydown(file!, 'ArrowRight');
      keydown(edit!, 'ArrowRight');
      keydown(view!, ' ');
      expect(document.activeElement).toBe(getMenuItem('Zoom In'));
    });

    it('should navigate to a menubar item on mouse over', () => {
      const edit = getMenuBarItem('Edit');
      mouseover(edit!);
      expect(document.activeElement).toBe(edit);
    });

    it('should focus the first item of the next menubar item on arrow right', () => {
      const edit = getMenuBarItem('Edit');
      const file = getMenuBarItem('File');
      const view = getMenuBarItem('View');
      const documentation = getMenuBarItem('Documentation');
      const zoomIn = getMenuItem('Zoom In');

      keydown(file!, 'ArrowRight');
      keydown(edit!, 'ArrowRight');
      keydown(view!, 'ArrowDown');

      keydown(zoomIn!, 'ArrowRight');
      expect(document.activeElement).toBe(documentation);
    });

    it('should focus the first item of the previous menubar item on arrow left', () => {
      const edit = getMenuBarItem('Edit');
      const file = getMenuBarItem('File');
      const view = getMenuBarItem('View');
      const undo = getMenuItem('Undo');
      const zoomIn = getMenuItem('Zoom In');

      keydown(file!, 'ArrowRight');
      keydown(edit!, 'ArrowRight');
      keydown(view!, 'ArrowDown');

      keydown(zoomIn!, 'ArrowLeft');
      expect(document.activeElement).toBe(undo);
    });
  });

  describe('Expansion', () => {
    beforeEach(() => setupMenu());

    it('should be collapsed by default', () => {
      expect(isExpanded('View')).toBe(false);
    });

    it('should expand on click', () => {
      click(getMenuBarItem('View')!);
      expect(isExpanded('View')).toBe(true);
    });

    it('should collapse on second click', () => {
      const view = getMenuBarItem('View');
      click(view!);
      expect(isExpanded('View')).toBe(true);

      click(view!);
      expect(isExpanded('View')).toBe(false);
    });

    it('should expand on arrow down', () => {
      const file = getMenuBarItem('File');
      const edit = getMenuBarItem('Edit');
      const view = getMenuBarItem('View');
      keydown(file!, 'ArrowRight');
      keydown(edit!, 'ArrowRight');
      keydown(view!, 'ArrowDown');
      expect(isExpanded('View')).toBe(true);
    });

    it('should expand on arrow up', () => {
      const file = getMenuBarItem('File');
      const edit = getMenuBarItem('Edit');
      const view = getMenuBarItem('View');
      keydown(file!, 'ArrowRight');
      keydown(edit!, 'ArrowRight');
      keydown(view!, 'ArrowUp');
      expect(isExpanded('View')).toBe(true);
    });

    it('should expand on space', () => {
      const file = getMenuBarItem('File');
      const edit = getMenuBarItem('Edit');
      const view = getMenuBarItem('View');
      keydown(file!, 'ArrowRight');
      keydown(edit!, 'ArrowRight');
      keydown(view!, ' ');
      expect(isExpanded('View')).toBe(true);
    });

    it('should expand on enter', () => {
      const file = getMenuBarItem('File');
      const edit = getMenuBarItem('Edit');
      const view = getMenuBarItem('View');
      keydown(file!, 'ArrowRight');
      keydown(edit!, 'ArrowRight');
      keydown(view!, 'Enter');
      expect(isExpanded('View')).toBe(true);
    });

    it('should close on escape', () => {
      const view = getMenuBarItem('View');
      click(view!);
      expect(isExpanded('View')).toBe(true);

      keydown(getMenu()!, 'Escape');
      expect(isExpanded('View')).toBe(false);
      expect(document.activeElement).toBe(view);
    });

    it('should close on selecting an item on click', () => {
      click(getMenuBarItem('View')!);
      click(getMenuItem('Zoom In')!);
      expect(isExpanded('View')).toBe(false);
    });

    it('should close on selecting an item on enter', () => {
      const view = getMenuBarItem('View');
      click(view!);
      keydown(view!, 'ArrowDown');
      keydown(getMenuItem('Zoom In')!, 'Enter');
      expect(isExpanded('View')).toBe(false);
    });

    it('should close on selecting an item on space', () => {
      const view = getMenuBarItem('View');
      click(view!);
      keydown(view!, 'ArrowDown');
      keydown(getMenuItem('Zoom In')!, ' ');
      expect(isExpanded('View')).toBe(false);
    });

    it('should close on focus out from the menu', () => {
      click(getMenuBarItem('View')!);
      expect(isExpanded('View')).toBe(true);

      focusout(getMenu()!, document.body);
      expect(isExpanded('View')).toBe(false);
    });

    it('should close on arrow right on a leaf menu item', () => {
      const view = getMenuBarItem('View');
      click(view!);
      expect(isExpanded('View')).toBe(true);

      keydown(getMenuItem('Zoom In')!, 'ArrowRight');
      expect(isExpanded('View')).toBe(false);
    });

    it('should close on arrow left on a root menu item', () => {
      const view = getMenuBarItem('View');
      click(view!);
      keydown(view!, 'ArrowDown');
      keydown(getMenuItem('Zoom In')!, 'ArrowLeft');
      expect(isExpanded('View')).toBe(false);
    });

    it('should expand the next menu bar item on arrow right on a leaf menu item', () => {
      const view = getMenuBarItem('View');
      const zoomIn = getMenuItem('Zoom In');
      click(view!);

      expect(isExpanded('View')).toBe(true);
      expect(document.activeElement).toBe(view);

      keydown(view!, 'ArrowDown');
      expect(document.activeElement).toBe(zoomIn);

      keydown(zoomIn!, 'ArrowRight');
      expect(isExpanded('View')).toBe(false);
      expect(isExpanded('Help')).toBe(true);
    });

    it('should expand the previous menu bar item on arrow left on a root menu item', () => {
      const view = getMenuBarItem('View');
      const zoomIn = getMenuItem('Zoom In');
      click(view!);

      expect(isExpanded('View')).toBe(true);
      expect(document.activeElement).toBe(view);

      keydown(view!, 'ArrowDown');
      expect(document.activeElement).toBe(zoomIn);

      keydown(zoomIn!, 'ArrowLeft');
      expect(isExpanded('View')).toBe(false);
      expect(isExpanded('Edit')).toBe(true);
    });
  });
});

@Component({
  template: `
<div ngMenu (onSubmit)="onSubmit($event)">
  <div ngMenuItem value='Apple' searchTerm='Apple'>Apple</div>
  <div ngMenuItem value='Banana' searchTerm='Banana'>Banana</div>
  <div ngMenuItem value='Berries' searchTerm='Berries' #berriesItem="ngMenuItem" [submenu]="berriesMenu">Berries</div>

  <div ngMenu [parent]="berriesItem" #berriesMenu="ngMenu">
    <div ngMenuItem value='Blueberry' searchTerm='Blueberry'>Blueberry</div>
    <div ngMenuItem value='Blackberry' searchTerm='Blackberry'>Blackberry</div>
    <div ngMenuItem value='Strawberry' searchTerm='Strawberry'>Strawberry</div>
  </div>

  <div ngMenuItem value='Cherry' searchTerm='Cherry' [disabled]="true">Cherry</div>
</div>
  `,
  imports: [Menu, MenuItem],
})
class StandaloneMenuExample {
  onSubmit(value: string) {}
}

@Component({
  template: `
<button ngMenuTrigger #menuTrigger="ngMenuTrigger" [submenu]="menu">Open menu</button>

<div ngMenu #menu="ngMenu" [parent]="menuTrigger">
  <div ngMenuItem value='Apple' searchTerm='Apple'>Apple</div>
  <div ngMenuItem value='Banana' searchTerm='Banana'>Banana</div>
  <div ngMenuItem value='Berries' searchTerm='Berries' #berriesItem="ngMenuItem" [submenu]="berriesMenu">Berries</div>

  <div ngMenu [parent]="berriesItem" #berriesMenu="ngMenu">
    <div ngMenuItem value='Blueberry' searchTerm='Blueberry'>Blueberry</div>
    <div ngMenuItem value='Blackberry' searchTerm='Blackberry'>Blackberry</div>
    <div ngMenuItem value='Strawberry' searchTerm='Strawberry'>Strawberry</div>
  </div>

  <div ngMenuItem value='Cherry' searchTerm='Cherry'>Cherry</div>
</div>
  `,
  imports: [Menu, MenuItem, MenuTrigger],
})
class MenuTriggerExample {}

@Component({
  template: `
<div ngMenuBar>
  <div ngMenuItem value='File' searchTerm='File'>File</div>
  <div ngMenuItem value='Edit' searchTerm='Edit' [submenu]="editMenu" #editItem="ngMenuItem">Edit</div>

  <div ngMenu [parent]="editItem" #editMenu="ngMenu">
    <div ngMenuItem value='Undo' searchTerm='Undo'>Undo</div>
    <div ngMenuItem value='Redo' searchTerm='Redo'>Redo</div>
  </div>

  <div ngMenuItem #viewItem="ngMenuItem" [submenu]="viewMenu" value='View' searchTerm='View'>View</div>

  <div ngMenu [parent]="viewItem" #viewMenu="ngMenu">
    <div ngMenuItem value='Zoom In' searchTerm='Zoom In'>Zoom In</div>
    <div ngMenuItem value='Zoom Out' searchTerm='Zoom Out'>Zoom Out</div>
    <div ngMenuItem value='Full Screen' searchTerm='Full Screen'>Full Screen</div>
  </div>

  <div ngMenuItem #helpItem="ngMenuItem" [submenu]="helpMenu" value='Help' searchTerm='Help'>Help</div>

  <div ngMenu [parent]="helpItem" #helpMenu="ngMenu">
    <div ngMenuItem value='Documentation' searchTerm='Documentation'>Documentation</div>
    <div ngMenuItem value='About' searchTerm='About'>About</div>
  </div>
</div>
  `,
  imports: [Menu, MenuBar, MenuItem],
})
class MenuBarExample {}

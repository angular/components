import {
  Component,
  DebugElement,
  ChangeDetectionStrategy,
  signal,
  ViewChild,
  inject,
  ChangeDetectorRef,
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {OverlayModule} from '@angular/cdk/overlay';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {provideFakeDirectionality} from '@angular/cdk/testing/private';
import {Menu} from './menu';
import {MenuBar} from './menu-bar';
import {MenuContent} from './menu-content';
import {MenuItem} from './menu-item';
import {MenuTrigger} from './menu-trigger';
import {waitForMicrotasks} from '../private/testing/test-helpers';

describe('Standalone Menu Pattern', () => {
  let fixture: ComponentFixture<StandaloneMenuExample>;

  const keydown = async (element: Element, key: string, modifierKeys: {} = {}) => {
    element.dispatchEvent(
      new KeyboardEvent('keydown', {
        key,
        bubbles: true,
        ...modifierKeys,
      }),
    );
    await fixture.whenStable();
  };

  const mouseover = async (element: Element) => {
    element.dispatchEvent(new MouseEvent('mouseover', {bubbles: true}));
    await new Promise(resolve => setTimeout(resolve, 0));
    await fixture.whenStable();
  };

  const mouseout = async (element: Element) => {
    element.dispatchEvent(new MouseEvent('mouseout', {bubbles: true}));
    await fixture.whenStable();
  };

  const click = async (element: Element, eventInit?: PointerEventInit) => {
    element.dispatchEvent(new PointerEvent('click', {bubbles: true, ...eventInit}));
    await fixture.whenStable();
  };

  const focusout = async (element: Element, relatedTarget?: EventTarget) => {
    element.dispatchEvent(new FocusEvent('focusout', {bubbles: true, relatedTarget}));
    await fixture.whenStable();
  };

  async function setupMenu(opts?: {textDirection: 'ltr' | 'rtl'}) {
    TestBed.configureTestingModule({
      providers: [provideFakeDirectionality(opts?.textDirection ?? 'ltr')],
    });
    fixture = TestBed.createComponent(StandaloneMenuExample);
    await fixture.whenStable();
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

  describe('dynamic updates', () => {
    it('should update item order correctly after items are shuffled', async () => {
      TestBed.configureTestingModule({imports: [ShuffledMenuExample]});
      const shuffledFixture = TestBed.createComponent(ShuffledMenuExample);
      shuffledFixture.detectChanges();
      const menuDirective = shuffledFixture.debugElement
        .query(By.directive(Menu))
        .injector.get(Menu);

      const itemsBefore = menuDirective._pattern.inputs.items();
      expect(itemsBefore.length).toBe(3);
      expect(itemsBefore[0].element()?.textContent?.trim()).toBe('Apple');

      // Shuffle items: move first item to the end
      const items = (shuffledFixture.componentInstance as unknown as ShuffledMenuExample).items();
      const firstItem = items.shift()!;
      items.push(firstItem);
      (shuffledFixture.componentInstance as unknown as ShuffledMenuExample).items.set([...items]);
      shuffledFixture.detectChanges();
      await waitForMicrotasks();

      const itemsAfter = menuDirective._pattern.inputs.items();
      expect(itemsAfter.length).toBe(3);
      expect(itemsAfter[0].element()?.textContent?.trim()).toBe('Banana');
    });
  });

  describe('Navigation', () => {
    beforeEach(async () => await setupMenu());

    it('should focus the first item by default', () => {
      expect(getItem('Apple')?.tabIndex).toBe(0);
    });

    it('should move the active item with the up and down arrows', async () => {
      const apple = getItem('Apple');
      const banana = getItem('Banana');

      await keydown(apple!, 'ArrowDown');
      expect(document.activeElement).toBe(banana);

      await keydown(banana!, 'ArrowUp');
      expect(document.activeElement).toBe(apple);
    });

    it('should wrap navigation when reaching the top or bottom', async () => {
      const apple = getItem('Apple');
      const cherry = getItem('Cherry');

      await keydown(apple!, 'ArrowUp');
      expect(document.activeElement).toBe(cherry);

      await keydown(cherry!, 'ArrowDown');
      expect(document.activeElement).toBe(apple);
    });

    it('should move focus to the first and last items with home and end', async () => {
      const apple = getItem('Apple');
      const cherry = getItem('Cherry');

      await keydown(apple!, 'End');
      expect(document.activeElement).toBe(cherry);

      await keydown(cherry!, 'Home');
      expect(document.activeElement).toBe(apple);
    });

    it('should move focus on mouse over a menu item', async () => {
      const banana = getItem('Banana');
      await mouseover(banana!);
      expect(document.activeElement).toBe(banana);
    });

    describe('Typeahead', () => {
      it('should move the active item to the next item that starts with the typed character', async () => {
        const apple = getItem('Apple');
        const banana = getItem('Banana');

        await keydown(apple!, 'b');
        expect(document.activeElement).toBe(banana);
      });

      it('should support multi-character typeahead', async () => {
        const apple = getItem('Apple');
        const banana = getItem('Banana');
        const berries = getItem('Berries');

        await keydown(apple!, 'b');
        expect(document.activeElement).toBe(banana);

        await keydown(document.activeElement!, 'e');
        expect(document.activeElement).toBe(berries);
      });

      it('should wrap when reaching the end of the list during typeahead', async () => {
        const apple = getItem('Apple');
        const cherry = getItem('Cherry');

        // Start at cherry by pressing End
        await keydown(apple!, 'End');
        expect(document.activeElement).toBe(cherry);

        // Type 'a', which should wrap to 'Apple'
        await keydown(document.activeElement!, 'a');
        expect(document.activeElement).toBe(apple);
      });

      it('should not move the active item if no item matches the typed character', async () => {
        const apple = getItem('Apple');

        await keydown(apple!, 'z');
        expect(document.activeElement).toBe(apple);
      });
    });
  });

  describe('Selection', () => {
    beforeEach(async () => await setupMenu());

    it('should select an item on click', async () => {
      const banana = getItem('Banana');
      spyOn(fixture.componentInstance, 'itemSelected');

      await click(banana!);
      expect(fixture.componentInstance.itemSelected).toHaveBeenCalledWith('Banana');
    });

    it('should select an item on enter', async () => {
      const banana = getItem('Banana');
      spyOn(fixture.componentInstance, 'itemSelected');

      await keydown(document.activeElement!, 'ArrowDown'); // Move focus to Banana
      expect(document.activeElement).toBe(banana);

      await keydown(banana!, 'Enter');
      expect(fixture.componentInstance.itemSelected).toHaveBeenCalledWith('Banana');
    });

    it('should select an item on space', async () => {
      const banana = getItem('Banana');
      spyOn(fixture.componentInstance, 'itemSelected');

      await keydown(document.activeElement!, 'ArrowDown'); // Move focus to Banana
      expect(document.activeElement).toBe(banana);

      await keydown(banana!, ' ');
      expect(fixture.componentInstance.itemSelected).toHaveBeenCalledWith('Banana');
    });

    it('should not select a disabled item', async () => {
      const cherry = getItem('Cherry');
      spyOn(fixture.componentInstance, 'itemSelected');

      await click(cherry!);
      expect(fixture.componentInstance.itemSelected).not.toHaveBeenCalled();

      await keydown(document.activeElement!, 'End');
      expect(document.activeElement).toBe(cherry);

      await keydown(cherry!, 'Enter');
      expect(fixture.componentInstance.itemSelected).not.toHaveBeenCalled();

      await keydown(cherry!, ' ');
      expect(fixture.componentInstance.itemSelected).not.toHaveBeenCalled();
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

    beforeEach(async () => await setupMenu());

    it('should be expanded by default', () => {
      expect(getMenu()).not.toBeNull();
      expect(isSubmenuExpanded()).toBe(false);
    });

    it('should expand submenu on click', async () => {
      const berries = getItem('Berries');
      await click(berries!);
      expect(isSubmenuExpanded()).toBe(true);
    });

    it('should open submenu on arrow right', async () => {
      const apple = getItem('Apple');
      const banana = getItem('Banana');
      const berries = getItem('Berries');

      await keydown(apple!, 'ArrowDown');
      await keydown(banana!, 'ArrowDown');
      await keydown(berries!, 'ArrowRight');

      expect(isSubmenuExpanded()).toBe(true);
      expect(document.activeElement).toBe(getItem('Blueberry'));
    });

    it('should close submenu on arrow left', async () => {
      const apple = getItem('Apple');
      const banana = getItem('Banana');
      const berries = getItem('Berries');

      await keydown(apple!, 'ArrowDown');
      await keydown(banana!, 'ArrowDown');
      await keydown(berries!, 'ArrowRight');
      const blueberry = getItem('Blueberry');
      await keydown(blueberry!, 'ArrowLeft');

      expect(isSubmenuExpanded()).toBe(false);
      expect(document.activeElement).toBe(berries);
    });

    it('should close submenu on click outside', async () => {
      const berries = getItem('Berries');

      await click(berries!);
      expect(isSubmenuExpanded()).toBe(true);

      await focusout(getItem('Blueberry')!, document.body);
      expect(isSubmenuExpanded()).toBe(false);
    });

    it('should expand submenu on enter', async () => {
      const apple = getItem('Apple');
      const banana = getItem('Banana');
      const berries = getItem('Berries');

      await keydown(apple!, 'ArrowDown');
      await keydown(banana!, 'ArrowDown');
      await keydown(berries!, 'Enter');

      expect(isSubmenuExpanded()).toBe(true);
      expect(document.activeElement).toBe(getItem('Blueberry'));
    });

    it('should expand submenu on space', async () => {
      const apple = getItem('Apple');
      const banana = getItem('Banana');
      const berries = getItem('Berries');

      await keydown(apple!, 'ArrowDown');
      await keydown(banana!, 'ArrowDown');
      await keydown(berries!, ' ');

      expect(isSubmenuExpanded()).toBe(true);
      expect(document.activeElement).toBe(getItem('Blueberry'));
    });

    it('should close submenu on escape', async () => {
      const apple = getItem('Apple');
      const banana = getItem('Banana');
      const berries = getItem('Berries');

      await keydown(apple!, 'ArrowDown');
      await keydown(banana!, 'ArrowDown');
      await keydown(berries!, 'ArrowRight');

      expect(isSubmenuExpanded()).toBe(true);
      const blueberry = getItem('Blueberry');
      expect(document.activeElement).toBe(blueberry);

      await keydown(blueberry!, 'Escape');

      expect(isSubmenuExpanded()).toBe(false);
      expect(document.activeElement).toBe(berries);
    });

    it('should open submenu on mouseover', async () => {
      const berries = getItem('Berries');
      await mouseover(berries!);
      expect(isSubmenuExpanded()).toBe(true);
    });

    it('should close on selecting an item on click', async () => {
      spyOn(fixture.componentInstance, 'itemSelected');
      await click(getItem('Berries')!); // open submenu
      expect(isSubmenuExpanded()).toBe(true);

      await click(getItem('Blueberry')!);

      expect(fixture.componentInstance.itemSelected).toHaveBeenCalledWith('Blueberry');
      expect(isSubmenuExpanded()).toBe(false);
    });

    it('should close on selecting an item on enter', async () => {
      spyOn(fixture.componentInstance, 'itemSelected');
      const apple = getItem('Apple');
      const banana = getItem('Banana');
      const berries = getItem('Berries');

      await keydown(apple!, 'ArrowDown');
      await keydown(banana!, 'ArrowDown');
      await keydown(berries!, 'Enter'); // open submenu
      const blueberry = getItem('Blueberry');

      expect(document.activeElement).toBe(blueberry);

      await keydown(blueberry!, 'Enter');

      expect(fixture.componentInstance.itemSelected).toHaveBeenCalledWith('Blueberry');
      expect(isSubmenuExpanded()).toBe(false);
    });

    it('should close on selecting an item on space', async () => {
      spyOn(fixture.componentInstance, 'itemSelected');
      const apple = getItem('Apple');
      const banana = getItem('Banana');
      const berries = getItem('Berries');

      await keydown(apple!, 'ArrowDown');
      await keydown(banana!, 'ArrowDown');
      await keydown(berries!, ' '); // open submenu
      const blueberry = getItem('Blueberry');

      expect(document.activeElement).toBe(blueberry);

      await keydown(blueberry!, ' ');

      expect(fixture.componentInstance.itemSelected).toHaveBeenCalledWith('Blueberry');
      expect(isSubmenuExpanded()).toBe(false);
    });

    it('should close a submenu on focus out', async () => {
      const apple = getItem('Apple');
      const banana = getItem('Banana');
      const berries = getItem('Berries');

      await keydown(apple!, 'ArrowDown');
      await keydown(banana!, 'ArrowDown');
      await keydown(berries!, 'ArrowRight');
      expect(isSubmenuExpanded()).toBe(true);
      const blueberry = getItem('Blueberry');
      expect(document.activeElement).toBe(blueberry);

      const externalElement = document.createElement('button');
      document.body.appendChild(externalElement);

      await focusout(blueberry!, externalElement);

      expect(isSubmenuExpanded()).toBe(false);
      externalElement.remove();
    });

    it('should close an unfocused submenu on mouse out', async () => {
      const berries = getItem('Berries');
      const submenu = getSubmenu();

      await mouseover(berries!);
      expect(isSubmenuExpanded()).toBe(true);

      await mouseout(berries!);
      await mouseout(submenu!);

      expect(isSubmenuExpanded()).toBe(false);
    });

    it('should not close an unfocused submenu on mouse out if the parent menu is hovered', async () => {
      const berries = getItem('Berries');
      const submenu = getSubmenu();

      await mouseover(berries!);
      expect(isSubmenuExpanded()).toBe(true);

      await mouseout(berries!);
      await mouseover(submenu!);
      expect(isSubmenuExpanded()).toBe(true);
    });
  });

  describe('RTL', () => {
    function isSubmenuExpanded(): boolean {
      const berries = getItem('Berries');
      return berries?.getAttribute('aria-expanded') === 'true';
    }

    beforeEach(async () => await setupMenu({textDirection: 'rtl'}));

    it('should open submenu on arrow left', async () => {
      const apple = getItem('Apple');
      const banana = getItem('Banana');
      const berries = getItem('Berries');

      await keydown(apple!, 'ArrowDown');
      await keydown(banana!, 'ArrowDown');
      await keydown(berries!, 'ArrowLeft');

      expect(isSubmenuExpanded()).toBe(true);
      expect(document.activeElement).toBe(getItem('Blueberry'));
    });

    it('should close submenu on arrow right', async () => {
      const apple = getItem('Apple');
      const banana = getItem('Banana');
      const berries = getItem('Berries');

      await keydown(apple!, 'ArrowDown');
      await keydown(banana!, 'ArrowDown');
      await keydown(berries!, 'ArrowLeft');
      const blueberry = getItem('Blueberry');
      await keydown(blueberry!, 'ArrowRight');

      expect(isSubmenuExpanded()).toBe(false);
      expect(document.activeElement).toBe(berries);
    });
  });

  it('should not reset default state on hover triggers expansion', async () => {
    fixture = TestBed.createComponent(StandaloneMenuExample);
    await fixture.whenStable();

    const berries = getItem('Berries');
    await mouseover(berries!);
    expect(berries?.getAttribute('data-active')).toBe('true');
  });

  it('should be able to set an aria-label on a menu item', async () => {
    fixture = TestBed.createComponent(StandaloneMenuExample);
    await fixture.whenStable();

    const item = getItem('Apple');
    expect(item?.getAttribute('aria-label')).toBeFalsy();

    fixture.componentInstance.firstItemAriaLabel.set('Apple item label');
    await fixture.whenStable();
    expect(item?.getAttribute('aria-label')).toBe('Apple item label');
  });

  describe('softDisabled', () => {
    it('should skip disabled items during navigation when softDisabled is false', async () => {
      await setupMenu();
      fixture.componentInstance.softDisabled.set(false);
      await fixture.whenStable();

      const apple = getItem('Apple')!;
      const berries = getItem('Berries');

      await keydown(apple, 'ArrowUp');
      expect(document.activeElement).toBe(berries);
    });

    it('should focus disabled items during navigation when softDisabled is true', async () => {
      await setupMenu();
      fixture.componentInstance.softDisabled.set(true);
      await fixture.whenStable();

      const apple = getItem('Apple')!;
      const cherry = getItem('Cherry');

      await keydown(apple!, 'ArrowUp');
      expect(document.activeElement).toBe(cherry);
    });
  });

  describe('role override', () => {
    it('should allow overriding the default menuitem role', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [MenuItemRoleOverrideExample],
      });
      const roleFixture = TestBed.createComponent(MenuItemRoleOverrideExample);
      roleFixture.detectChanges();

      const items = roleFixture.debugElement
        .queryAll(By.directive(MenuItem))
        .map(debugEl => debugEl.nativeElement as HTMLElement);

      expect(items[0].getAttribute('role')).toBe('menuitemradio');
      expect(items[1].getAttribute('role')).toBe('menuitemcheckbox');

      roleFixture.componentInstance.customRole.set('menuitem');
      roleFixture.detectChanges();
      expect(items[1].getAttribute('role')).toBe('menuitem');
    });
  });

  describe('structural validations', () => {
    let consoleSpy: jasmine.Spy;

    beforeEach(() => {
      consoleSpy = spyOn(console, 'warn');
    });

    afterEach(async () => {
      TestBed.resetTestingModule();
      await setupMenu();
    });

    it('should warn when duplicate values are detected inside ngMenu', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [MenuWithDuplicateValues],
      });
      const duplicateFixture = TestBed.createComponent(MenuWithDuplicateValues);
      duplicateFixture.detectChanges();

      expect(consoleSpy).toHaveBeenCalledWith("Duplicate value 'item0' detected inside ngMenu.");
    });

    it('should warn when ngMenuItem is outside ngMenu or ngMenuBar', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [MenuItemOutsideMenu],
      });
      const noMenuFixture = TestBed.createComponent(MenuItemOutsideMenu);
      noMenuFixture.detectChanges();

      expect(consoleSpy).toHaveBeenCalledWith(
        'ngMenuItem must be placed inside an ngMenu or ngMenuBar container.',
      );
    });
  });
});

describe('Menu Trigger Pattern', () => {
  let fixture: ComponentFixture<MenuTriggerExample>;

  const focusin = async (element: Element) => {
    element.dispatchEvent(new FocusEvent('focusin', {bubbles: true}));
    await fixture.whenStable();
  };

  const keydown = async (element: Element, key: string, modifierKeys: {} = {}) => {
    await focusin(element);
    element.dispatchEvent(
      new KeyboardEvent('keydown', {
        key,
        bubbles: true,
        ...modifierKeys,
      }),
    );
    await fixture.whenStable();
  };

  const click = async (element: Element, eventInit?: PointerEventInit) => {
    await focusin(element);
    element.dispatchEvent(new PointerEvent('click', {bubbles: true, ...eventInit}));
    await fixture.whenStable();
  };

  const focusout = async (element: Element, relatedTarget?: EventTarget) => {
    element.dispatchEvent(new FocusEvent('focusout', {bubbles: true, relatedTarget}));
    await fixture.whenStable();
  };

  async function setupMenu() {
    fixture = TestBed.createComponent(MenuTriggerExample);
    await fixture.whenStable();
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
    beforeEach(async () => await setupMenu());

    it('should navigate to the first item on click', async () => {
      await click(getTrigger());
      expect(document.activeElement).toBe(getItem('Apple'));
    });

    it('should navigate to the first item on arrow down', async () => {
      const trigger = getTrigger();
      await keydown(trigger, 'ArrowDown');
      expect(document.activeElement).toBe(getItem('Apple'));
    });

    it('should navigate to the last item on arrow up', async () => {
      const trigger = getTrigger();
      await keydown(trigger, 'ArrowUp');
      expect(document.activeElement).toBe(getItem('Cherry'));
    });

    it('should navigate to the first item on enter', async () => {
      const trigger = getTrigger();
      await keydown(trigger, 'Enter');
      expect(document.activeElement).toBe(getItem('Apple'));
    });

    it('should navigate to the first item on space', async () => {
      const trigger = getTrigger();
      await keydown(trigger, ' ');
      expect(document.activeElement).toBe(getItem('Apple'));
    });
  });

  describe('Expansion', () => {
    beforeEach(async () => await setupMenu());

    it('should be closed by default', () => {
      expect(isExpanded()).toBe(false);
    });

    it('should open on click', async () => {
      await click(getTrigger());
      expect(isExpanded()).toBe(true);
    });

    it('should close on second click', async () => {
      const trigger = getTrigger();
      await click(trigger);
      expect(isExpanded()).toBe(true);

      await click(trigger);
      expect(isExpanded()).toBe(false);
    });

    it('should open on arrow down', async () => {
      await keydown(getTrigger(), 'ArrowDown');
      expect(isExpanded()).toBe(true);
    });

    it('should open on arrow up', async () => {
      await keydown(getTrigger(), 'ArrowUp');
      expect(isExpanded()).toBe(true);
    });

    it('should open on space', async () => {
      await keydown(getTrigger(), ' ');
      expect(isExpanded()).toBe(true);
    });

    it('should open on enter', async () => {
      await keydown(getTrigger(), 'Enter');
      expect(isExpanded()).toBe(true);
    });

    it('should close on escape', async () => {
      const trigger = getTrigger();
      await click(trigger);
      expect(isExpanded()).toBe(true);

      await keydown(getMenu()!, 'Escape');
      expect(isExpanded()).toBe(false);
      expect(document.activeElement).toBe(trigger);
    });

    it('should close on selecting an item on click', async () => {
      await click(getTrigger());
      await click(getItem('Apple')!);
      expect(isExpanded()).toBe(false);
    });

    it('should close on selecting an item on enter', async () => {
      await click(getTrigger());
      await keydown(getItem('Apple')!, 'Enter');
      expect(isExpanded()).toBe(false);
    });

    it('should close on selecting an item on space', async () => {
      await click(getTrigger());
      await keydown(getItem('Apple')!, ' ');
      expect(isExpanded()).toBe(false);
    });

    it('should close the trigger on focus out from the menu', async () => {
      await click(getTrigger());
      expect(isExpanded()).toBe(true);

      await focusout(getMenu()!, document.body);
      expect(isExpanded()).toBe(false);
    });
  });

  describe('Selection', () => {
    beforeEach(async () => await setupMenu());

    it('should select an item on click', async () => {
      spyOn(fixture.componentInstance, 'itemSelected');
      await click(getTrigger());
      await click(getItem('Apple')!);
      expect(fixture.componentInstance.itemSelected).toHaveBeenCalledWith('Apple');
    });
  });
});

describe('CDK Overlay Menu Pattern', () => {
  let fixture: ComponentFixture<CdkOverlayMenuExample>;

  const focusin = async (element: Element) => {
    element.dispatchEvent(new FocusEvent('focusin', {bubbles: true}));
    await fixture.whenStable();
  };

  const keydown = async (element: Element, key: string, modifierKeys: {} = {}) => {
    await focusin(element);
    element.dispatchEvent(
      new KeyboardEvent('keydown', {
        key,
        bubbles: true,
        ...modifierKeys,
      }),
    );
    await fixture.whenStable();
    await waitForMicrotasks();
    await fixture.whenStable();
  };

  const click = async (element: Element, eventInit?: PointerEventInit) => {
    await focusin(element);
    element.dispatchEvent(new PointerEvent('click', {bubbles: true, ...eventInit}));
    await fixture.whenStable();
    await waitForMicrotasks();
    await fixture.whenStable();
  };

  async function setupMenu() {
    fixture = TestBed.createComponent(CdkOverlayMenuExample);
    await fixture.whenStable();
  }

  function getTrigger(): HTMLElement {
    return fixture.debugElement.query(By.directive(MenuTrigger)).nativeElement as HTMLElement;
  }

  function getItem(text: string): HTMLElement | null {
    const items = fixture.debugElement
      .queryAll(By.directive(MenuItem))
      .map((debugEl: DebugElement) => debugEl.nativeElement as HTMLElement);
    return items.find(item => item.textContent?.trim() === text) || null;
  }

  beforeEach(async () => await setupMenu());

  it('should focus the first item when opened via arrow down', async () => {
    await keydown(getTrigger(), 'ArrowDown');
    expect(document.activeElement).toBe(getItem('Apple'));
  });

  it('should focus the first item when opened via enter', async () => {
    await keydown(getTrigger(), 'Enter');
    expect(document.activeElement).toBe(getItem('Apple'));
  });

  it('should focus the first item when opened via space', async () => {
    await keydown(getTrigger(), ' ');
    expect(document.activeElement).toBe(getItem('Apple'));
  });

  it('should focus the first item when opened via click', async () => {
    await click(getTrigger());
    expect(document.activeElement).toBe(getItem('Apple'));
  });

  it('should focus the first item stably when opened, closed via escape, and opened again', async () => {
    const trigger = getTrigger();

    // First open
    await keydown(trigger, 'Enter');
    expect(document.activeElement).toBe(getItem('Apple'));

    // Close via escape
    await keydown(getItem('Apple')!, 'Escape');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(trigger);

    // Explicitly clear cached menu before second open
    fixture.componentInstance.clearMenu();
    await fixture.whenStable();

    // Second open
    await keydown(trigger, 'Enter');
    expect(document.activeElement).toBe(getItem('Apple'));
  });

  it('should set type="button" by default on button triggers', () => {
    expect(getTrigger().getAttribute('type')).toBe('button');
  });
});

describe('Menu Bar Pattern', () => {
  let fixture: ComponentFixture<MenuBarExample>;

  const keydown = async (element: Element, key: string, modifierKeys: {} = {}) => {
    element.dispatchEvent(
      new KeyboardEvent('keydown', {
        key,
        bubbles: true,
        ...modifierKeys,
      }),
    );
    await fixture.whenStable();
  };

  const mouseover = async (element: Element) => {
    element.dispatchEvent(new MouseEvent('mouseover', {bubbles: true}));
    await fixture.whenStable();
  };

  const click = async (element: Element, eventInit?: PointerEventInit) => {
    element.dispatchEvent(new PointerEvent('click', {bubbles: true, ...eventInit}));
    await fixture.whenStable();
  };

  const focusout = async (element: Element, relatedTarget?: EventTarget) => {
    element.dispatchEvent(new FocusEvent('focusout', {bubbles: true, relatedTarget}));
    await fixture.whenStable();
  };

  async function setupMenu(opts?: {textDirection: 'ltr' | 'rtl'}) {
    TestBed.configureTestingModule({
      providers: [provideFakeDirectionality(opts?.textDirection ?? 'ltr')],
    });
    fixture = TestBed.createComponent(MenuBarExample);
    await fixture.whenStable();
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

  describe('dynamic updates', () => {
    it('should update item order correctly after items are shuffled', async () => {
      TestBed.configureTestingModule({imports: [ShuffledMenuBarExample]});
      const shuffledFixture = TestBed.createComponent(ShuffledMenuBarExample);
      shuffledFixture.detectChanges();
      const menuBarDirective = shuffledFixture.debugElement
        .query(By.directive(MenuBar))
        .injector.get(MenuBar);

      const itemsBefore = menuBarDirective._pattern.inputs.items();
      expect(itemsBefore.length).toBe(3);
      expect(itemsBefore[0].element()?.textContent?.trim()).toBe('File');

      // Shuffle items: move first item to the end
      const items = (
        shuffledFixture.componentInstance as unknown as ShuffledMenuBarExample
      ).items();
      const firstItem = items.shift()!;
      items.push(firstItem);
      (shuffledFixture.componentInstance as unknown as ShuffledMenuBarExample).items.set([
        ...items,
      ]);
      shuffledFixture.detectChanges();
      await waitForMicrotasks();

      const itemsAfter = menuBarDirective._pattern.inputs.items();
      expect(itemsAfter.length).toBe(3);
      expect(itemsAfter[0].element()?.textContent?.trim()).toBe('Edit');
    });
  });

  describe('Navigation', () => {
    beforeEach(async () => await setupMenu());

    it('should navigate to the first item on arrow down', async () => {
      const file = getMenuBarItem('File');
      const edit = getMenuBarItem('Edit');
      const view = getMenuBarItem('View');
      await keydown(file!, 'ArrowRight');
      await keydown(edit!, 'ArrowRight');
      await keydown(view!, 'ArrowDown');
      expect(document.activeElement).toBe(getMenuItem('Zoom In'));
    });

    it('should navigate to the last item on arrow up', async () => {
      const file = getMenuBarItem('File');
      const edit = getMenuBarItem('Edit');
      const view = getMenuBarItem('View');
      await keydown(file!, 'ArrowRight');
      await keydown(edit!, 'ArrowRight');
      await keydown(view!, 'ArrowUp');
      expect(document.activeElement).toBe(getMenuItem('Full Screen'));
    });

    it('should navigate to the first item on enter', async () => {
      const file = getMenuBarItem('File');
      const edit = getMenuBarItem('Edit');
      const view = getMenuBarItem('View');
      await keydown(file!, 'ArrowRight');
      await keydown(edit!, 'ArrowRight');
      await keydown(view!, 'Enter');
      expect(document.activeElement).toBe(getMenuItem('Zoom In'));
    });

    it('should navigate to the first item on space', async () => {
      const file = getMenuBarItem('File');
      const edit = getMenuBarItem('Edit');
      const view = getMenuBarItem('View');
      await keydown(file!, 'ArrowRight');
      await keydown(edit!, 'ArrowRight');
      await keydown(view!, ' ');
      expect(document.activeElement).toBe(getMenuItem('Zoom In'));
    });

    it('should navigate to a menubar item on mouse over', async () => {
      const edit = getMenuBarItem('Edit');
      await mouseover(edit!);
      expect(document.activeElement).toBe(edit);
    });

    it('should focus the first item of the next menubar item on arrow right', async () => {
      const edit = getMenuBarItem('Edit');
      const file = getMenuBarItem('File');
      const view = getMenuBarItem('View');
      const documentation = getMenuBarItem('Documentation');
      const zoomIn = getMenuItem('Zoom In');

      await keydown(file!, 'ArrowRight');
      await keydown(edit!, 'ArrowRight');
      await keydown(view!, 'ArrowDown');

      await keydown(zoomIn!, 'ArrowRight');
      expect(document.activeElement).toBe(documentation);
    });

    it('should focus the first item of the previous menubar item on arrow left', async () => {
      const edit = getMenuBarItem('Edit');
      const file = getMenuBarItem('File');
      const view = getMenuBarItem('View');
      const undo = getMenuItem('Undo');
      const zoomIn = getMenuItem('Zoom In');

      await keydown(file!, 'ArrowRight');
      await keydown(edit!, 'ArrowRight');
      await keydown(view!, 'ArrowDown');

      await keydown(zoomIn!, 'ArrowLeft');
      expect(document.activeElement).toBe(undo);
    });
  });

  describe('Expansion', () => {
    beforeEach(async () => await setupMenu());

    it('should be collapsed by default', () => {
      expect(isExpanded('View')).toBe(false);
    });

    it('should expand on click', async () => {
      await click(getMenuBarItem('View')!);
      expect(isExpanded('View')).toBe(true);
    });

    it('should collapse on second click', async () => {
      const view = getMenuBarItem('View');
      await click(view!);
      expect(isExpanded('View')).toBe(true);

      await click(view!);
      expect(isExpanded('View')).toBe(false);
    });

    it('should expand on arrow down', async () => {
      const file = getMenuBarItem('File');
      const edit = getMenuBarItem('Edit');
      const view = getMenuBarItem('View');
      await keydown(file!, 'ArrowRight');
      await keydown(edit!, 'ArrowRight');
      await keydown(view!, 'ArrowDown');
      expect(isExpanded('View')).toBe(true);
    });

    it('should expand on arrow up', async () => {
      const file = getMenuBarItem('File');
      const edit = getMenuBarItem('Edit');
      const view = getMenuBarItem('View');
      await keydown(file!, 'ArrowRight');
      await keydown(edit!, 'ArrowRight');
      await keydown(view!, 'ArrowUp');
      expect(isExpanded('View')).toBe(true);
    });

    it('should expand on space', async () => {
      const file = getMenuBarItem('File');
      const edit = getMenuBarItem('Edit');
      const view = getMenuBarItem('View');
      await keydown(file!, 'ArrowRight');
      await keydown(edit!, 'ArrowRight');
      await keydown(view!, ' ');
      expect(isExpanded('View')).toBe(true);
    });

    it('should expand on enter', async () => {
      const file = getMenuBarItem('File');
      const edit = getMenuBarItem('Edit');
      const view = getMenuBarItem('View');
      await keydown(file!, 'ArrowRight');
      await keydown(edit!, 'ArrowRight');
      await keydown(view!, 'Enter');
      expect(isExpanded('View')).toBe(true);
    });

    it('should close on escape', async () => {
      const view = getMenuBarItem('View');
      await click(view!);
      expect(isExpanded('View')).toBe(true);

      await keydown(getMenu()!, 'Escape');
      expect(isExpanded('View')).toBe(false);
      expect(document.activeElement).toBe(view);
    });

    it('should close on selecting an item on click', async () => {
      await click(getMenuBarItem('View')!);
      await click(getMenuItem('Zoom In')!);
      expect(isExpanded('View')).toBe(false);
    });

    it('should close on selecting an item on enter', async () => {
      const view = getMenuBarItem('View');
      await click(view!);
      await keydown(view!, 'ArrowDown');
      await keydown(getMenuItem('Zoom In')!, 'Enter');
      expect(isExpanded('View')).toBe(false);
    });

    it('should close on selecting an item on space', async () => {
      const view = getMenuBarItem('View');
      await click(view!);
      await keydown(view!, 'ArrowDown');
      await keydown(getMenuItem('Zoom In')!, ' ');
      expect(isExpanded('View')).toBe(false);
    });

    it('should close on focus out from the menu', async () => {
      await click(getMenuBarItem('View')!);
      expect(isExpanded('View')).toBe(true);

      await focusout(getMenu()!, document.body);
      expect(isExpanded('View')).toBe(false);
    });

    it('should close on arrow right on a leaf menu item', async () => {
      const view = getMenuBarItem('View');
      await click(view!);
      expect(isExpanded('View')).toBe(true);

      await keydown(getMenuItem('Zoom In')!, 'ArrowRight');
      expect(isExpanded('View')).toBe(false);
    });

    it('should close on arrow left on a root menu item', async () => {
      const view = getMenuBarItem('View');
      await click(view!);
      await keydown(view!, 'ArrowDown');
      await keydown(getMenuItem('Zoom In')!, 'ArrowLeft');
      expect(isExpanded('View')).toBe(false);
    });

    it('should expand the next menu bar item on arrow right on a leaf menu item', async () => {
      const view = getMenuBarItem('View');
      const zoomIn = getMenuItem('Zoom In');
      await click(view!);

      expect(isExpanded('View')).toBe(true);
      expect(document.activeElement).toBe(view);

      await keydown(view!, 'ArrowDown');
      expect(document.activeElement).toBe(zoomIn);

      await keydown(zoomIn!, 'ArrowRight');
      expect(isExpanded('View')).toBe(false);
      expect(isExpanded('Help')).toBe(true);
    });

    it('should expand the previous menu bar item on arrow left on a root menu item', async () => {
      const view = getMenuBarItem('View');
      const zoomIn = getMenuItem('Zoom In');
      await click(view!);

      expect(isExpanded('View')).toBe(true);
      expect(document.activeElement).toBe(view);

      await keydown(view!, 'ArrowDown');
      expect(document.activeElement).toBe(zoomIn);

      await keydown(zoomIn!, 'ArrowLeft');
      expect(isExpanded('View')).toBe(false);
      expect(isExpanded('Edit')).toBe(true);
    });
  });

  describe('RTL', () => {
    beforeEach(async () => await setupMenu({textDirection: 'rtl'}));

    it('should focus the first item of the next menubar item on arrow left', async () => {
      const edit = getMenuBarItem('Edit');
      const file = getMenuBarItem('File');
      const view = getMenuBarItem('View');
      const documentation = getMenuBarItem('Documentation');
      const zoomIn = getMenuItem('Zoom In');

      await keydown(file!, 'ArrowLeft');
      await keydown(edit!, 'ArrowLeft');
      await keydown(view!, 'ArrowDown');

      await keydown(zoomIn!, 'ArrowLeft');
      expect(document.activeElement).toBe(documentation);
    });

    it('should focus the first item of the previous menubar item on arrow right', async () => {
      const edit = getMenuBarItem('Edit');
      const file = getMenuBarItem('File');
      const view = getMenuBarItem('View');
      const undo = getMenuItem('Undo');
      const zoomIn = getMenuItem('Zoom In');

      await keydown(file!, 'ArrowLeft');
      await keydown(edit!, 'ArrowLeft');
      await keydown(view!, 'ArrowDown');

      await keydown(zoomIn!, 'ArrowRight');
      expect(document.activeElement).toBe(undo);
    });
  });
});

@Component({
  template: `
    <div ngMenu [softDisabled]="softDisabled()" [expansionDelay]="0" (itemSelected)="itemSelected($event)">
      <ng-template ngMenuContent>
        <div
          ngMenuItem
          value='Apple'
          searchTerm='Apple'
          [attr.aria-label]="firstItemAriaLabel()">Apple</div>
        <div ngMenuItem value='Banana' searchTerm='Banana'>Banana</div>
        <div ngMenuItem value='Berries' searchTerm='Berries' [submenu]="berriesMenu">Berries</div>

        <div ngMenu [expansionDelay]="0" #berriesMenu="ngMenu">
          <ng-template ngMenuContent>
            <div ngMenuItem value='Blueberry' searchTerm='Blueberry'>Blueberry</div>
            <div ngMenuItem value='Blackberry' searchTerm='Blackberry'>Blackberry</div>
            <div ngMenuItem value='Strawberry' searchTerm='Strawberry'>Strawberry</div>
          </ng-template>
        </div>

        <div ngMenuItem value='Cherry' searchTerm='Cherry' [disabled]="true">Cherry</div>
      </ng-template>
    </div>
  `,
  imports: [Menu, MenuItem, MenuContent],
  changeDetection: ChangeDetectionStrategy.Eager,
})
class StandaloneMenuExample {
  firstItemAriaLabel = signal<string | null>(null);
  softDisabled = signal(true);

  itemSelected(value: string) {}
}

@Component({
  template: `
    <button ngMenuTrigger [menu]="menu">Open menu</button>

    <div ngMenu [expansionDelay]="0" #menu="ngMenu" (itemSelected)="itemSelected($event)">
      <ng-template ngMenuContent>
        <div ngMenuItem value='Apple' searchTerm='Apple'>Apple</div>
        <div ngMenuItem value='Banana' searchTerm='Banana'>Banana</div>
        <div ngMenuItem value='Berries' searchTerm='Berries' [submenu]="berriesMenu">Berries</div>

        <div ngMenu [expansionDelay]="0" #berriesMenu="ngMenu">
          <ng-template ngMenuContent>
            <div ngMenuItem value='Blueberry' searchTerm='Blueberry'>Blueberry</div>
            <div ngMenuItem value='Blackberry' searchTerm='Blackberry'>Blackberry</div>
            <div ngMenuItem value='Strawberry' searchTerm='Strawberry'>Strawberry</div>
          </ng-template>
        </div>

        <div ngMenuItem value='Cherry' searchTerm='Cherry'>Cherry</div>
      </ng-template>
    </div>
  `,
  imports: [Menu, MenuItem, MenuTrigger, MenuContent],
  changeDetection: ChangeDetectionStrategy.Eager,
})
class MenuTriggerExample {
  itemSelected(value: string) {}
}

@Component({
  template: `
    <div ngMenuBar>
      <div ngMenuItem value='File' searchTerm='File'>File</div>
      <div ngMenuItem value='Edit' searchTerm='Edit' [submenu]="editMenu">Edit</div>

      <div ngMenu [expansionDelay]="0" #editMenu="ngMenu">
        <ng-template ngMenuContent>
          <div ngMenuItem value='Undo' searchTerm='Undo'>Undo</div>
          <div ngMenuItem value='Redo' searchTerm='Redo'>Redo</div>
        </ng-template>
      </div>

      <div ngMenuItem [submenu]="viewMenu" value='View' searchTerm='View'>View</div>

      <div ngMenu [expansionDelay]="0" #viewMenu="ngMenu">
        <ng-template ngMenuContent>
          <div ngMenuItem value='Zoom In' searchTerm='Zoom In'>Zoom In</div>
          <div ngMenuItem value='Zoom Out' searchTerm='Zoom Out'>Zoom Out</div>
          <div ngMenuItem value='Full Screen' searchTerm='Full Screen'>Full Screen</div>
        </ng-template>
      </div>

      <div ngMenuItem [submenu]="helpMenu" value='Help' searchTerm='Help'>Help</div>

      <div ngMenu [expansionDelay]="0" #helpMenu="ngMenu">
        <ng-template ngMenuContent>
          <div ngMenuItem value='Documentation' searchTerm='Documentation'>Documentation</div>
          <div ngMenuItem value='About' searchTerm='About'>About</div>
        </ng-template>
      </div>
    </div>
  `,
  imports: [Menu, MenuBar, MenuItem, MenuContent],
  changeDetection: ChangeDetectionStrategy.Eager,
})
class MenuBarExample {}

@Component({
  template: `
    <div ngMenu>
      @for (item of items(); track item) {
        <div ngMenuItem [value]="item.value">{{item.value}}</div>
      }
    </div>
  `,
  imports: [Menu, MenuItem],
  changeDetection: ChangeDetectionStrategy.Eager,
})
class ShuffledMenuExample {
  items = signal([{value: 'Apple'}, {value: 'Banana'}, {value: 'Cherry'}]);
}

@Component({
  template: `
    <div ngMenuBar>
      @for (item of items(); track item) {
        <div ngMenuItem [value]="item.value">{{item.value}}</div>
      }
    </div>
  `,
  imports: [MenuBar, MenuItem],
  changeDetection: ChangeDetectionStrategy.Eager,
})
class ShuffledMenuBarExample {
  items = signal([{value: 'File'}, {value: 'Edit'}, {value: 'View'}]);
}

@Component({
  template: `
    <div ngMenu>
      <ng-template ngMenuContent>
        <div ngMenuItem value="item0">Item 0</div>
        <div ngMenuItem value="item0">Item 0 Copy</div>
      </ng-template>
    </div>
  `,
  imports: [Menu, MenuItem, MenuContent],
  changeDetection: ChangeDetectionStrategy.Eager,
})
class MenuWithDuplicateValues {}

@Component({
  template: `
    <div ngMenuItem value="item0">Item 0</div>
  `,
  imports: [MenuItem],
  changeDetection: ChangeDetectionStrategy.Eager,
})
class MenuItemOutsideMenu {}

@Component({
  template: `
    <ng-container *ngTemplateOutlet="menuTemplate"></ng-container>

    <ng-template #menuTemplate>
      <button
        ngMenuTrigger
        #menuTrigger="ngMenuTrigger"
        [menu]="myMenu"
        cdkOverlayOrigin
        #origin="cdkOverlayOrigin"
      >
        Open Menu
      </button>

      <ng-template
        cdkConnectedOverlay
        [cdkConnectedOverlayOpen]="menuTrigger.expanded()"
        [cdkConnectedOverlayOrigin]="origin"
      >
        <div ngMenu #overlayMenu="ngMenu">
          <ng-template ngMenuContent>
            <div ngMenuItem value="Apple" searchTerm="Apple">Apple</div>
            <div ngMenuItem value="Banana" searchTerm="Banana">Banana</div>
          </ng-template>
        </div>
      </ng-template>
    </ng-template>
  `,
  imports: [CommonModule, OverlayModule, Menu, MenuTrigger, MenuItem, MenuContent],
  changeDetection: ChangeDetectionStrategy.Eager,
})
class CdkOverlayMenuExample {
  @ViewChild('overlayMenu') _myMenu!: Menu<any>;
  private _cachedMenu?: Menu<any>;
  private readonly _cdr = inject(ChangeDetectorRef);

  get myMenu() {
    if (this._myMenu) {
      this._cachedMenu = this._myMenu;
    }
    return this._cachedMenu;
  }

  clearMenu() {
    this._cachedMenu = undefined;
    this._cdr.markForCheck();
  }
}

@Component({
  template: `
    <div ngMenu>
      <div ngMenuItem value="item0" role="menuitemradio">Item 0</div>
      <div ngMenuItem value="item1" [role]="customRole()">Item 1</div>
    </div>
  `,
  imports: [Menu, MenuItem],
  changeDetection: ChangeDetectionStrategy.Eager,
})
class MenuItemRoleOverrideExample {
  customRole = signal<'menuitem' | 'menuitemradio' | 'menuitemcheckbox'>('menuitemcheckbox');
}

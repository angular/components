import {
  Component,
  ViewChildren,
  QueryList,
  ElementRef,
  ViewChild,
  Type,
  ɵZONELESS_ENABLED,
} from '@angular/core';
import {ComponentFixture, TestBed, fakeAsync, tick, waitForAsync} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {dispatchKeyboardEvent} from '../../cdk/testing/private';
import {TAB, SPACE, ENTER} from '@angular/cdk/keycodes';
import {CdkMenuModule} from './menu-module';
import {CdkMenuItem} from './menu-item';
import {CdkMenu} from './menu';
import {CdkMenuTrigger} from './menu-trigger';
import {Menu} from './menu-interface';

describe('MenuTrigger', () => {
  describe('on CdkMenuItem', () => {
    let fixture: ComponentFixture<TriggerForEmptyMenu>;
    let menuItem: CdkMenuItem;
    let menuItemElement: HTMLButtonElement;

    beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [CdkMenuModule],
        declarations: [TriggerForEmptyMenu],
        providers: [{provide: ɵZONELESS_ENABLED, useValue: false}],
      }).compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(TriggerForEmptyMenu);
      fixture.detectChanges();

      menuItem = fixture.debugElement.query(By.directive(CdkMenuItem)).injector.get(CdkMenuItem);
      menuItemElement = fixture.debugElement.query(By.directive(CdkMenuItem)).nativeElement;
    });

    it('should have the menuitem role', () => {
      expect(menuItemElement.getAttribute('role')).toBe('menuitem');
    });

    it('should set a type on the trigger', () => {
      expect(menuItemElement.getAttribute('type')).toBe('button');
    });

    it('should set the aria disabled attribute', () => {
      expect(menuItemElement.getAttribute('aria-disabled')).toBeNull();

      menuItem.disabled = true;
      fixture.detectChanges();

      expect(menuItemElement.getAttribute('aria-disabled')).toBe('true');
    });

    it('should set aria-haspopup based on whether a menu is assigned', () => {
      expect(menuItemElement.getAttribute('aria-haspopup')).toEqual('menu');

      fixture.componentInstance.trigger.menuTemplateRef = null;
      fixture.detectChanges();

      expect(menuItemElement.hasAttribute('aria-haspopup')).toBe(false);
    });

    it('should have a menu based on whether a menu is assigned', () => {
      expect(menuItem.hasMenu).toBeTrue();

      fixture.componentInstance.trigger.menuTemplateRef = null;
      fixture.detectChanges();

      expect(menuItem.hasMenu).toBeFalse();
    });

    it('should set aria-controls based on whether a menu is assigned', () => {
      expect(menuItemElement.hasAttribute('aria-controls')).toBeFalse();
    });

    it('should set aria-expanded based on whether a menu is assigned', () => {
      expect(menuItemElement.hasAttribute('aria-expanded')).toBeTrue();
      expect(menuItemElement.getAttribute('aria-expanded')).toBe('false');

      fixture.componentInstance.trigger.menuTemplateRef = null;
      fixture.detectChanges();

      expect(menuItemElement.hasAttribute('aria-expanded')).toBeFalse();
    });
  });

  describe('with nested sub-menus', () => {
    let fixture: ComponentFixture<MenuBarWithNestedSubMenus>;

    let menus: CdkMenu[];
    let nativeMenus: HTMLElement[];
    let menuItems: CdkMenuItem[];
    let triggers: CdkMenuTrigger[];
    let nativeTriggers: HTMLButtonElement[];

    const grabElementsForTesting = () => {
      menus = fixture.componentInstance.menus.toArray();
      nativeMenus = fixture.componentInstance.nativeMenus.map(m => m.nativeElement);

      menuItems = fixture.componentInstance.menuItems.toArray();
      triggers = fixture.componentInstance.triggers.toArray();
      nativeTriggers = fixture.componentInstance.nativeTriggers.map(t => t.nativeElement);
    };

    /** run change detection and, extract and set the rendered elements */
    const detectChanges = () => {
      fixture.detectChanges();
      grabElementsForTesting();
    };

    const setDocumentDirection = (dir: 'ltr' | 'rtl') => (document.dir = dir);

    beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [CdkMenuModule],
        declarations: [MenuBarWithNestedSubMenus],
      }).compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(MenuBarWithNestedSubMenus);
      detectChanges();
    });

    afterEach(() => {
      setDocumentDirection('ltr');
    });

    it('should toggle the aria-expanded attribute', () => {
      expect(nativeTriggers[0].getAttribute('aria-expanded')).toEqual('false');

      triggers[0].toggle();
      detectChanges();
      expect(nativeTriggers[0].getAttribute('aria-expanded')).toEqual('true');

      triggers[0].toggle();
      detectChanges();
      expect(nativeTriggers[0].getAttribute('aria-expanded')).toEqual('false');
    });

    it('should hide menus on initial load', () => {
      expect(menus.length).toEqual(0);
    });

    it('should only open the attached menu', () => {
      triggers[0].toggle();
      detectChanges();

      expect(menus.length).toEqual(1);
      expect(menus[0] as Menu).toEqual(triggers[0].getMenu()!);
    });

    it('should not open the menu when menu item disabled', () => {
      menuItems[0].disabled = true;

      menuItems[0].trigger();
      detectChanges();

      expect(menus.length).toBe(0);
    });

    it('should toggle the attached menu', () => {
      triggers[0].toggle();
      detectChanges();
      expect(menus.length).toEqual(1);

      triggers[0].toggle();
      detectChanges();
      expect(menus.length).toEqual(0);
    });

    it('should open a nested submenu when nested trigger is clicked', () => {
      triggers[0].toggle();
      detectChanges();

      triggers[1].toggle();
      detectChanges();

      expect(menus.length).toEqual(2);
    });

    it('should close all menus when root menu is closed', () => {
      triggers[0].toggle();
      detectChanges();
      triggers[1].toggle();
      detectChanges();

      expect(menus.length).toEqual(2);

      triggers[0].toggle();
      detectChanges();

      expect(menus.length).toEqual(0);
    });

    it('should close nested submenu and leave parent open', () => {
      triggers[0].toggle();
      detectChanges();
      triggers[1].toggle();
      detectChanges();

      expect(menus.length).toEqual(2);

      triggers[1].toggle();
      detectChanges();

      expect(menus.length).withContext('first level menu should stay open').toEqual(1);
      expect(triggers[0].getMenu()).toEqual(menus[0]);
    });

    it('should emit request to open event on menu open', () => {
      const triggerSpy = jasmine.createSpy('cdkMenuItem open request emitter');
      triggers[0].opened.subscribe(triggerSpy);

      triggers[0].toggle();

      expect(triggerSpy).toHaveBeenCalledTimes(1);
    });

    it('should emit request to close event on menu close', () => {
      const triggerSpy = jasmine.createSpy('cdkMeuItem close request emitter');
      const closedSpy = jasmine.createSpy('cdkMenu closed emitter');
      triggers[0].closed.subscribe(triggerSpy);

      triggers[0].toggle();
      detectChanges();
      menus[0].closed.subscribe(closedSpy);

      triggers[0].toggle();
      detectChanges();

      expect(triggerSpy).toHaveBeenCalledTimes(1);
      expect(closedSpy).toHaveBeenCalledTimes(1);
    });

    it('should position the overlay below the trigger by default for a horizontal Menu', () => {
      triggers[0].toggle();
      detectChanges();

      expect(Math.floor(nativeTriggers[0].getBoundingClientRect().bottom))
        .withContext('MenuBar is horizontal by default')
        .toEqual(Math.floor(nativeMenus[0].getBoundingClientRect().top));
    });

    it(
      'should fallback to positioning the overlay above the trigger for horizontal Menu ' +
        'styled to bottom of viewport',
      () => {
        nativeTriggers[0].style.position = 'fixed';
        nativeTriggers[0].style.bottom = '0';

        triggers[0].toggle();
        detectChanges();

        expect(Math.floor(nativeTriggers[0].getBoundingClientRect().top))
          .withContext('trigger button position set to the bottom of the viewport')
          .toEqual(Math.floor(nativeMenus[0].getBoundingClientRect().bottom));
      },
    );

    it('should position nested submenu overlay to right by default in ltr layout', () => {
      triggers[0].toggle();
      detectChanges();
      triggers[1].toggle();
      detectChanges();

      expect(Math.floor(nativeTriggers[1].getBoundingClientRect().right)).toEqual(
        Math.floor(nativeMenus[1].getBoundingClientRect().left),
      );
    });

    it('should fallback to positioning nested submenu overlay to the left in ltr layout', () => {
      nativeTriggers[0].style.position = 'fixed';
      nativeTriggers[0].style.right = '0';
      triggers[0].toggle();
      detectChanges();
      triggers[1].toggle();
      detectChanges();

      expect(Math.floor(nativeTriggers[1].getBoundingClientRect().left))
        .withContext('trigger positioned on the right')
        .toEqual(Math.floor(nativeMenus[1].getBoundingClientRect().right));
    });

    it('should position nested submenu overlay to the left by default in rtl layout', () => {
      setDocumentDirection('rtl');

      triggers[0].toggle();
      detectChanges();
      triggers[1].toggle();
      detectChanges();

      expect(Math.floor(nativeTriggers[1].getBoundingClientRect().left)).toEqual(
        Math.floor(nativeMenus[1].getBoundingClientRect().right),
      );
    });

    it('should fallback to positioning nested submenu overlay to the right in rtl layout', () => {
      setDocumentDirection('rtl');

      nativeTriggers[0].style.position = 'fixed';
      nativeTriggers[0].style.left = '0';
      triggers[0].toggle();
      detectChanges();

      triggers[1].toggle();
      detectChanges();

      expect(Math.floor(nativeTriggers[1].getBoundingClientRect().right))
        .withContext('trigger positioned on the left')
        .toEqual(Math.floor(nativeMenus[1].getBoundingClientRect().left));
    });

    it('should position nested submenu at trigger level by default', () => {
      triggers[0].toggle();
      detectChanges();

      triggers[1].toggle();
      detectChanges();

      expect(Math.floor(nativeTriggers[1].getBoundingClientRect().top))
        .withContext('submenu should be at height of its trigger by default')
        .toEqual(Math.floor(nativeMenus[1].getBoundingClientRect().top));
    });
  });

  describe('with shared triggered menu', () => {
    /**
     * Return a function which builds the given component and renders it.
     * @param componentClass the component to create
     */
    function createComponent<T>(componentClass: Type<T>) {
      TestBed.configureTestingModule({
        imports: [CdkMenuModule],
        declarations: [componentClass],
      }).compileComponents();

      const fixture = TestBed.createComponent(componentClass);
      fixture.detectChanges();
      return fixture;
    }

    it('should allow two triggers in different menubars to open the same menu', () => {
      const fixture = createComponent(TriggersWithSameMenuDifferentMenuBars);
      expect(fixture.componentInstance.menus.length).toBe(0);
      fixture.componentInstance.triggers.get(0)!.toggle();
      fixture.detectChanges();
      expect(fixture.componentInstance.menus.length).toBe(1);
      fixture.componentInstance.triggers.get(0)!.toggle();
      fixture.detectChanges();
      expect(fixture.componentInstance.menus.length).toBe(0);
      fixture.componentInstance.triggers.get(1)!.toggle();
      fixture.detectChanges();
      expect(fixture.componentInstance.menus.length).toBe(1);
    });

    it('should allow two triggers in the same menubar open the same menu', () => {
      const fixture = createComponent(TriggersWithSameMenuSameMenuBar);
      expect(fixture.componentInstance.menus.length).toBe(0);
      fixture.componentInstance.triggers.get(0)!.toggle();
      fixture.detectChanges();
      expect(fixture.componentInstance.menus.length).toBe(1);
      fixture.componentInstance.triggers.get(0)!.toggle();
      fixture.detectChanges();
      expect(fixture.componentInstance.menus.length).toBe(0);
      fixture.componentInstance.triggers.get(1)!.toggle();
      fixture.detectChanges();
      expect(fixture.componentInstance.menus.length).toBe(1);
    });

    it('should allow a trigger in a submenu references its parent menu', () => {
      const fixture = createComponent(TriggerOpensItsMenu);
      expect(fixture.componentInstance.menus.length).toBe(0);
      expect(fixture.componentInstance.triggers.length).toBe(1);
      fixture.componentInstance.triggers.get(0)!.toggle();
      fixture.detectChanges();
      expect(fixture.componentInstance.menus.length).toBe(1);
      expect(fixture.componentInstance.triggers.length).toBe(2);
      fixture.componentInstance.triggers.get(1)!.toggle();
      fixture.detectChanges();
      expect(fixture.componentInstance.menus.length).toBe(2);
      expect(fixture.componentInstance.triggers.length).toBe(3);
    });
  });

  describe('standalone', () => {
    let fixture: ComponentFixture<StandaloneTriggerWithInlineMenu>;

    let nativeMenus: HTMLElement[];
    let nativeTrigger: HTMLElement;
    let submenuNativeItem: HTMLElement | undefined;

    const grabElementsForTesting = () => {
      nativeTrigger = fixture.componentInstance.nativeTrigger.nativeElement;
      nativeMenus = fixture.componentInstance.nativeMenus.map(m => m.nativeElement);
      submenuNativeItem = fixture.componentInstance.submenuItem?.nativeElement;
    };

    /** run change detection and, extract and set the rendered elements */
    const detectChanges = () => {
      fixture.detectChanges();
      grabElementsForTesting();
    };

    beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [CdkMenuModule],
        declarations: [StandaloneTriggerWithInlineMenu],
      }).compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(StandaloneTriggerWithInlineMenu);
      detectChanges();
    });

    it('should have its tabindex set to 0', () => {
      expect(nativeTrigger.tabIndex).toBe(0);
    });

    it('should reset the tabindex to 0 when shift-tabbing out of standalone trigger', () => {
      nativeTrigger.focus();

      dispatchKeyboardEvent(nativeTrigger, 'keydown', TAB, undefined, {shift: true});
      detectChanges();
    });

    it('should reset the tabindex to 0 when tabbing out of submenu', () => {
      nativeTrigger.click();
      detectChanges();

      dispatchKeyboardEvent(submenuNativeItem!, 'keydown', TAB, undefined, {shift: true});
      detectChanges();

      expect(nativeTrigger.tabIndex).toBe(0);
    });

    it('should open the menu on trigger', () => {
      nativeTrigger.click();
      detectChanges();

      expect(nativeMenus.length).toBe(2);
    });

    it('should toggle the menu on clicks', () => {
      nativeTrigger.click();
      detectChanges();
      expect(nativeMenus.length).toBe(2);

      nativeTrigger.click();
      detectChanges();
      expect(nativeMenus.length).toBe(1);
    });

    it('should toggle the menu on keyboard events', () => {
      const firstEvent = dispatchKeyboardEvent(nativeTrigger, 'keydown', ENTER);
      detectChanges();
      expect(firstEvent.defaultPrevented).toBe(false);
      expect(nativeMenus.length).toBe(2);

      const secondEvent = dispatchKeyboardEvent(nativeTrigger, 'keydown', ENTER);
      detectChanges();
      expect(nativeMenus.length).toBe(1);
      expect(secondEvent.defaultPrevented).toBe(false);
    });

    it('should close the open menu on background click', () => {
      nativeTrigger.click();
      detectChanges();

      document.body.click();
      detectChanges();

      expect(nativeMenus.length).toBe(1);
    });

    it('should close the open menu when clicking on an inline menu item', () => {
      nativeTrigger.click();
      detectChanges();

      fixture.componentInstance.nativeInlineItem.nativeElement.click();
      detectChanges();

      expect(nativeMenus.length).toBe(1);
    });
  });

  it('should be able to pass data to the menu via the template context', () => {
    TestBed.configureTestingModule({
      imports: [CdkMenuModule],
      declarations: [TriggerWithData],
    }).compileComponents();

    const fixture = TestBed.createComponent(TriggerWithData);
    fixture.componentInstance.menuData = {message: 'Hello!'};
    fixture.detectChanges();
    fixture.nativeElement.querySelector('button').click();
    fixture.detectChanges();

    expect(document.querySelector('.test-menu')?.textContent).toBe('Hello!');
  });

  describe('null triggerFor', () => {
    let fixture: ComponentFixture<TriggerWithNullValue>;

    let nativeTrigger: HTMLElement;

    beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [CdkMenuModule],
        declarations: [TriggerWithNullValue],
      }).compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(TriggerWithNullValue);
      nativeTrigger = fixture.componentInstance.nativeTrigger.nativeElement;
    });

    it('should not set aria-haspopup', () => {
      expect(nativeTrigger.hasAttribute('aria-haspopup')).toBeFalse();
    });

    it('should not set aria-controls', () => {
      expect(nativeTrigger.hasAttribute('aria-controls')).toBeFalse();
    });

    it('should not toggle the menu on trigger', () => {
      expect(fixture.componentInstance.trigger.isOpen()).toBeFalse();

      nativeTrigger.click();
      fixture.detectChanges();

      expect(fixture.componentInstance.trigger.isOpen()).toBeFalse();
    });

    it('should not toggle the menu on keyboard events', () => {
      expect(fixture.componentInstance.trigger.isOpen()).toBeFalse();

      dispatchKeyboardEvent(nativeTrigger, 'keydown', SPACE);
      fixture.detectChanges();

      expect(fixture.componentInstance.trigger.isOpen()).toBeFalse();
    });
  });

  it('should focus the first item when opening on click', fakeAsync(() => {
    TestBed.configureTestingModule({
      imports: [CdkMenuModule],
      declarations: [TriggersWithSameMenuDifferentMenuBars],
    }).compileComponents();

    const fixture = TestBed.createComponent(TriggersWithSameMenuDifferentMenuBars);
    fixture.detectChanges();

    fixture.componentInstance.nativeTriggers.first.nativeElement.click();
    fixture.detectChanges();
    tick();

    const firstItem =
      fixture.componentInstance.nativeMenus.first.nativeElement.querySelector('.cdk-menu-item');

    expect(firstItem).toBeTruthy();
    expect(document.activeElement).toBe(firstItem);
  }));
});

@Component({
  template: `
    <div cdkMenuBar><button cdkMenuItem [cdkMenuTriggerFor]="noop">Click me!</button></div>
    <ng-template #noop><div cdkMenu></div></ng-template>
  `,
})
class TriggerForEmptyMenu {
  @ViewChild(CdkMenuTrigger) trigger: CdkMenuTrigger;
  @ViewChild(CdkMenuTrigger, {read: ElementRef}) nativeTrigger: ElementRef;
}

@Component({
  template: `
    <div cdkMenuBar>
      <button cdkMenuItem [cdkMenuTriggerFor]="sub1">First</button>
    </div>

    <ng-template #sub1>
      <div cdkMenu>
        <button cdkMenuItem [cdkMenuTriggerFor]="sub2">Second</button>
      </div>
    </ng-template>

    <ng-template #sub2>
      <div cdkMenu>
        <button cdkMenuItem>Third</button>
      </div>
    </ng-template>
  `,
})
class MenuBarWithNestedSubMenus {
  @ViewChildren(CdkMenu) menus: QueryList<CdkMenu>;
  @ViewChildren(CdkMenu, {read: ElementRef}) nativeMenus: QueryList<ElementRef>;

  @ViewChildren(CdkMenuTrigger) triggers: QueryList<CdkMenuTrigger>;
  @ViewChildren(CdkMenuTrigger, {read: ElementRef}) nativeTriggers: QueryList<ElementRef>;

  @ViewChildren(CdkMenuItem) menuItems: QueryList<CdkMenuItem>;
}

@Component({
  template: `
    <div cdkMenuBar>
      <button cdkMenuItem [cdkMenuTriggerFor]="menu">First</button>
    </div>
    <div cdkMenuBar>
      <button cdkMenuItem [cdkMenuTriggerFor]="menu">Second</button>
    </div>

    <ng-template #menu>
      <div cdkMenu>
        <button cdkMenuItem></button>
      </div>
    </ng-template>
  `,
})
class TriggersWithSameMenuDifferentMenuBars {
  @ViewChildren(CdkMenuTrigger) triggers: QueryList<CdkMenuTrigger>;
  @ViewChildren(CdkMenuTrigger, {read: ElementRef}) nativeTriggers: QueryList<ElementRef>;

  @ViewChildren(CdkMenu) menus: QueryList<CdkMenu>;
  @ViewChildren(CdkMenu, {read: ElementRef}) nativeMenus: QueryList<ElementRef>;
}

@Component({
  template: `
    <div cdkMenuBar>
      <button cdkMenuItem [cdkMenuTriggerFor]="menu">First</button>
      <button cdkMenuItem [cdkMenuTriggerFor]="menu">Second</button>
    </div>

    <ng-template #menu>
      <div cdkMenu>
        <button cdkMenuItem></button>
      </div>
    </ng-template>
  `,
})
class TriggersWithSameMenuSameMenuBar {
  @ViewChildren(CdkMenuTrigger) triggers: QueryList<CdkMenuTrigger>;
  @ViewChildren(CdkMenu) menus: QueryList<CdkMenu>;
}

@Component({
  template: `
    <div cdkMenuBar>
      <button cdkMenuItem [cdkMenuTriggerFor]="menu"></button>
    </div>

    <ng-template #menu>
      <div cdkMenu>
        <button cdkMenuItem [cdkMenuTriggerFor]="menu"></button>
      </div>
    </ng-template>
  `,
})
class TriggerOpensItsMenu {
  @ViewChildren(CdkMenuTrigger) triggers: QueryList<CdkMenuTrigger>;
  @ViewChildren(CdkMenu) menus: QueryList<CdkMenu>;
}

@Component({
  template: `
    <button cdkMenuItem [cdkMenuTriggerFor]="sub1">First</button>

    <ng-template #sub1>
      <div cdkMenu>
        <button #submenu_item cdkMenuItem [cdkMenuTriggerFor]="sub2">Second</button>
      </div>
    </ng-template>

    <div cdkMenu>
      <button #inline_item cdkMenuItem></button>
    </div>
  `,
})
class StandaloneTriggerWithInlineMenu {
  @ViewChild(CdkMenuItem, {read: ElementRef}) nativeTrigger: ElementRef<HTMLElement>;
  @ViewChild('submenu_item', {read: ElementRef}) submenuItem?: ElementRef<HTMLElement>;
  @ViewChild('inline_item', {read: ElementRef}) nativeInlineItem: ElementRef<HTMLElement>;
  @ViewChildren(CdkMenu, {read: ElementRef}) nativeMenus: QueryList<ElementRef>;
}

@Component({
  template: `
    <button
      [cdkMenuTriggerFor]="menu"
      [cdkMenuTriggerData]="menuData">Click me!</button>

    <ng-template #menu let-message="message">
      <div cdkMenu class="test-menu">{{message}}</div>
    </ng-template>
  `,
})
class TriggerWithData {
  menuData: unknown;
}

@Component({
  template: `
    <button [cdkMenuTriggerFor]="null">First</button>
  `,
})
class TriggerWithNullValue {
  @ViewChild(CdkMenuTrigger, {static: true})
  trigger: CdkMenuTrigger;

  @ViewChild(CdkMenuTrigger, {static: true, read: ElementRef})
  nativeTrigger: ElementRef<HTMLElement>;
}

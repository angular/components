import {ComponentFixture, TestBed, async} from '@angular/core/testing';
import {Component, ViewChildren, QueryList} from '@angular/core';
import {By} from '@angular/platform-browser';
import {CdkMenuBar} from './menu-bar';
import {CdkMenuModule} from './menu-module';
import {CdkMenuItemRadio} from './menu-item-radio';
import {CdkMenu} from './menu';
import {CdkMenuItemTrigger} from './menu-item-trigger';
import {CdkMenuGroup} from './menu-group';

describe('MenuBar', () => {
  describe('as radio group', () => {
    let fixture: ComponentFixture<MenuBarRadioGroup>;
    let menuItems: CdkMenuItemRadio[];

    beforeEach(async(() => {
      TestBed.configureTestingModule({
        imports: [CdkMenuModule],
        declarations: [MenuBarRadioGroup],
      }).compileComponents();

      fixture = TestBed.createComponent(MenuBarRadioGroup);
      fixture.detectChanges();

      menuItems = fixture.debugElement
        .queryAll(By.directive(CdkMenuItemRadio))
        .map(element => element.injector.get(CdkMenuItemRadio));
    }));

    it('should toggle menuitemradio items', () => {
      expect(menuItems[0].checked).toBeTrue();
      expect(menuItems[1].checked).toBeFalse();

      menuItems[1].trigger();

      expect(menuItems[0].checked).toBeFalse();
      expect(menuItems[1].checked).toBeTrue();
    });
  });

  describe('radiogroup change events', () => {
    let fixture: ComponentFixture<MenuBarRadioGroup>;
    let menuItems: CdkMenuItemRadio[];

    beforeEach(async(() => {
      TestBed.configureTestingModule({
        imports: [CdkMenuModule],
        declarations: [MenuBarRadioGroup],
      }).compileComponents();

      fixture = TestBed.createComponent(MenuBarRadioGroup);

      fixture.detectChanges();

      menuItems = fixture.debugElement
        .queryAll(By.directive(CdkMenuItemRadio))
        .map(element => element.injector.get(CdkMenuItemRadio));
    }));

    it('should emit on click', () => {
      const spy = jasmine.createSpy('cdkMenu change spy');
      fixture.debugElement
        .query(By.directive(CdkMenuBar))
        .injector.get(CdkMenuBar)
        .change.subscribe(spy);

      menuItems[0].trigger();

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(menuItems[0]);
    });
  });

  describe('with submenu', () => {
    let fixture: ComponentFixture<MenuBarWithMenus>;

    let menus: CdkMenu[];
    let triggers: CdkMenuItemTrigger[];

    /** open the attached menu. */
    const openMenu = () => {
      triggers[0].toggle();
      detectChanges();
    };

    /** set the menus and triggers arrays. */
    const grabElementsForTesting = () => {
      menus = fixture.componentInstance.menus.toArray();
      triggers = fixture.componentInstance.triggers.toArray();
    };

    /** run change detection and, extract and set the rendered elements. */
    const detectChanges = () => {
      fixture.detectChanges();
      grabElementsForTesting();
    };

    beforeEach(async(() => {
      TestBed.configureTestingModule({
        imports: [CdkMenuModule],
        declarations: [MenuBarWithMenus],
      }).compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(MenuBarWithMenus);
      detectChanges();
    });

    it('should close out all open menus when clicked outside the menu tree', () => {
      openMenu();
      expect(menus.length).toEqual(1);

      fixture.debugElement.query(By.css('#container')).nativeElement.click();
      detectChanges();

      expect(menus.length).toEqual(0);
    });

    it('should not close open menus when clicking on menu or menu bar elements', () => {
      openMenu();
      expect(menus.length).toEqual(1);

      fixture.debugElement
        .queryAll(By.directive(CdkMenuGroup)) // Menu and MenuBar inherit from MenuGroup
        .forEach(element => element.nativeElement.click());
      detectChanges();

      expect(menus.length)
        .withContext('menu should stay open if clicking on any menu element')
        .toEqual(1);
    });

    it('should not close when clicking on a non-menu element inside menu', () => {
      openMenu();
      expect(menus.length).toEqual(1);

      fixture.debugElement.query(By.css('#inner-element')).nativeElement.click();
      detectChanges();

      expect(menus.length)
        .withContext('menu should stay open if clicking on an inner span element')
        .toEqual(1);
    });
  });
});

@Component({
  template: `
    <ul cdkMenuBar>
      <li role="none">
        <button checked="true" cdkMenuItemRadio>
          first
        </button>
      </li>
      <li role="none">
        <button cdkMenuItemRadio>
          second
        </button>
      </li>
    </ul>
  `,
})
class MenuBarRadioGroup {}

@Component({
  template: `
    <div id="container">
      <div cdkMenuBar>
        <button cdkMenuItem [cdkMenuTriggerFor]="sub1">Trigger</button>
      </div>

      <ng-template cdkMenuPanel #sub1="cdkMenuPanel">
        <div cdkMenu [cdkMenuPanel]="sub1">
          <span id="inner-element">A nested non-menuitem element</span>
        </div>
      </ng-template>
    </div>
  `,
})
class MenuBarWithMenus {
  @ViewChildren(CdkMenu) menus: QueryList<CdkMenu>;
  @ViewChildren(CdkMenuItemTrigger) triggers: QueryList<CdkMenuItemTrigger>;
}

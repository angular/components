import {
  Component,
  EventEmitter,
  ViewChildren,
  QueryList,
  ElementRef,
  ViewChild,
} from '@angular/core';
import {async, TestBed, ComponentFixture, tick, fakeAsync} from '@angular/core/testing';
import {
  dispatchKeyboardEvent,
  createKeyboardEvent,
  dispatchEvent,
} from '@angular/cdk/testing/private';
import {
  TAB,
  RIGHT_ARROW,
  LEFT_ARROW,
  DOWN_ARROW,
  UP_ARROW,
  SPACE,
  HOME,
  END,
  E,
  D,
  ESCAPE,
  S,
  H,
} from '@angular/cdk/keycodes';
import {CdkMenuModule} from './menu-module';
import {CdkMenuItem} from './menu-item';
import {CdkMenuBar} from './menu-bar';
import {CdkMenu} from './menu';
import {defaultTypeAheadDebounce} from './menu-key-manager';
import {CdkMenuItemCheckbox} from './menu-item-checkbox';
import {CdkMenuItemRadio} from './menu-item-radio';

describe('Keyboard Manager', () => {
  describe('(with ltr layout)', () => {
    let fixture: ComponentFixture<MultiMenuWithSubmenu>;
    let nativeMenuBar: HTMLElement;
    let nativeMenus: HTMLElement[];
    let menuBarNativeItems: HTMLButtonElement[];
    let fileMenuNativeItems: HTMLButtonElement[];

    function grabElementsForTesting() {
      nativeMenuBar = fixture.componentInstance.nativeMenuBar.nativeElement;

      nativeMenus = fixture.componentInstance.nativeMenus.map(e => e.nativeElement);

      menuBarNativeItems = fixture.componentInstance.nativeItems
        .map(e => e.nativeElement)
        .slice(0, 2); // menu bar has the first 2 menu items

      if (nativeMenus.length > 0) {
        fileMenuNativeItems = fixture.componentInstance.nativeItems
          .map(e => e.nativeElement)
          .slice(2, 5); // file menu has the next 3 menu items
      }
    }

    /** Run change detection and extract then set the rendered elements. */
    function detectChanges() {
      fixture.detectChanges();
      grabElementsForTesting();
    }

    /** Set focus to the MenuBar and run change detection. */
    function focusMenuBar() {
      dispatchKeyboardEvent(document, 'keydown', TAB);
      nativeMenuBar.focus();

      detectChanges();
    }

    beforeEach(async(() => {
      TestBed.configureTestingModule({
        imports: [CdkMenuModule],
        declarations: [MultiMenuWithSubmenu],
      }).compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(MultiMenuWithSubmenu);
      detectChanges();
    });

    describe('for MenuBar', () => {
      it('should focus the first menu item when the menubar gets tabbed in', () => {
        focusMenuBar();

        expect(document.activeElement).toEqual(menuBarNativeItems[0]);
      });

      it('should toggle the last/first menu item on end/home key press', () => {
        focusMenuBar();
        dispatchKeyboardEvent(nativeMenuBar, 'keydown', END);
        detectChanges();

        expect(document.activeElement).toEqual(menuBarNativeItems[menuBarNativeItems.length - 1]);

        focusMenuBar();
        dispatchKeyboardEvent(nativeMenuBar, 'keydown', HOME);
        detectChanges();

        expect(document.activeElement).toEqual(menuBarNativeItems[0]);
      });

      it('should not focus the last item when pressing end with modifier', () => {
        focusMenuBar();

        const event = createKeyboardEvent('keydown', END, '', undefined, {control: true});
        dispatchEvent(nativeMenuBar, event);
        detectChanges();

        expect(document.activeElement).toEqual(menuBarNativeItems[0]);
      });

      it('should not focus the first item when pressing home with modifier', () => {
        focusMenuBar();
        dispatchKeyboardEvent(nativeMenuBar, 'keydown', END);
        detectChanges();

        let event = createKeyboardEvent('keydown', HOME, '', undefined, {control: true});
        dispatchEvent(nativeMenuBar, event);
        detectChanges();

        expect(document.activeElement).toEqual(menuBarNativeItems[menuBarNativeItems.length - 1]);
      });

      it('should focus the edit MenuItem on E, D character keys', fakeAsync(() => {
        focusMenuBar();
        dispatchKeyboardEvent(nativeMenuBar, 'keydown', E);
        dispatchKeyboardEvent(nativeMenuBar, 'keydown', D);
        tick(defaultTypeAheadDebounce + 100);
        detectChanges();

        expect(document.activeElement).toEqual(menuBarNativeItems[1]);
      }));

      it(
        'should toggle and wrap when cycling the right/left arrow keys on menu bar ' +
          'without toggling menus',
        () => {
          focusMenuBar();

          dispatchKeyboardEvent(nativeMenuBar, 'keydown', RIGHT_ARROW);
          detectChanges();
          expect(document.activeElement).toEqual(menuBarNativeItems[1]);

          dispatchKeyboardEvent(nativeMenuBar, 'keydown', RIGHT_ARROW);
          detectChanges();
          expect(document.activeElement).toEqual(menuBarNativeItems[0]);

          dispatchKeyboardEvent(nativeMenuBar, 'keydown', LEFT_ARROW);
          detectChanges();
          expect(document.activeElement).toEqual(menuBarNativeItems[1]);

          dispatchKeyboardEvent(nativeMenuBar, 'keydown', LEFT_ARROW);
          detectChanges();
          expect(document.activeElement).toEqual(menuBarNativeItems[0]);

          expect(nativeMenus.length).toBe(0);
        }
      );

      it(
        "should open the focused menu item's menu and focus the first submenu" +
          ' item on the down key',
        () => {
          focusMenuBar();

          dispatchKeyboardEvent(menuBarNativeItems[0], 'keydown', DOWN_ARROW);
          detectChanges();

          expect(document.activeElement).toEqual(fileMenuNativeItems[0]);
        }
      );

      it(
        "should open the focused menu item's menu and focus the last submenu" +
          ' item on the up key',
        () => {
          focusMenuBar();

          dispatchKeyboardEvent(nativeMenuBar, 'keydown', UP_ARROW);
          detectChanges();

          expect(document.activeElement).toEqual(
            fileMenuNativeItems[fileMenuNativeItems.length - 1]
          );
        }
      );

      it('should open the focused menu items menu and focus first submenu item on space', () => {
        focusMenuBar();

        dispatchKeyboardEvent(nativeMenuBar, 'keydown', SPACE);
        detectChanges();

        expect(document.activeElement).toEqual(fileMenuNativeItems[0]);
      });
    });

    describe('for Menu', () => {
      function openFileMenu() {
        if (nativeMenus.length === 0) {
          focusMenuBar();
          dispatchKeyboardEvent(menuBarNativeItems[0], 'keydown', SPACE);
          detectChanges();
        }
      }

      function openShareMenu() {
        openFileMenu();
        if (nativeMenus.length === 1) {
          dispatchKeyboardEvent(nativeMenus[0], 'keydown', DOWN_ARROW);
          dispatchKeyboardEvent(nativeMenus[0], 'keydown', RIGHT_ARROW);
          detectChanges();
        }
      }

      it('should open the submenu with focus on item with menu on right arrow press', () => {
        openFileMenu();
        dispatchKeyboardEvent(nativeMenus[0], 'keydown', DOWN_ARROW);
        dispatchKeyboardEvent(nativeMenus[0], 'keydown', RIGHT_ARROW);
        detectChanges();

        expect(nativeMenus.length).withContext('menu bar, menu and submenu').toBe(2);
        expect(nativeMenus[0].id).toBe('file_menu');
        expect(nativeMenus[1].id).toBe('share_menu');
      });

      it('should cycle focus on down/up arrow without toggling menus', () => {
        openFileMenu();
        expect(document.activeElement).toEqual(fileMenuNativeItems[0]);

        dispatchKeyboardEvent(nativeMenus[0], 'keydown', DOWN_ARROW);
        expect(document.activeElement).toEqual(fileMenuNativeItems[1]);

        dispatchKeyboardEvent(nativeMenus[0], 'keydown', DOWN_ARROW);
        expect(document.activeElement).toEqual(fileMenuNativeItems[2]);

        dispatchKeyboardEvent(nativeMenus[0], 'keydown', UP_ARROW);
        expect(document.activeElement).toEqual(fileMenuNativeItems[1]);

        dispatchKeyboardEvent(nativeMenus[0], 'keydown', UP_ARROW);
        expect(document.activeElement).toEqual(fileMenuNativeItems[0]);

        dispatchKeyboardEvent(nativeMenus[0], 'keydown', UP_ARROW);
        expect(document.activeElement).toEqual(fileMenuNativeItems[2]);

        dispatchKeyboardEvent(nativeMenus[0], 'keydown', DOWN_ARROW);
        expect(document.activeElement).toEqual(fileMenuNativeItems[0]);

        expect(nativeMenus.length).toBe(1);
      });

      it('should focus the first/last item on home/end keys', () => {
        openFileMenu();
        expect(document.activeElement).toEqual(fileMenuNativeItems[0]);

        dispatchKeyboardEvent(nativeMenus[0], 'keydown', END);
        expect(document.activeElement).toEqual(fileMenuNativeItems[fileMenuNativeItems.length - 1]);

        dispatchKeyboardEvent(nativeMenus[0], 'keydown', HOME);
        expect(document.activeElement).toEqual(fileMenuNativeItems[0]);
      });

      it('should not focus the last item when pressing end with modifier', () => {
        openFileMenu();

        const event = createKeyboardEvent('keydown', END, '', undefined, {control: true});
        dispatchEvent(nativeMenus[0], event);
        detectChanges();

        expect(document.activeElement).toEqual(fileMenuNativeItems[0]);
      });

      it('should not focus the first item when pressing home with modifier', () => {
        openFileMenu();
        dispatchKeyboardEvent(nativeMenus[0], 'keydown', END);
        detectChanges();

        const event = createKeyboardEvent('keydown', HOME, '', undefined, {control: true});
        dispatchEvent(nativeMenus[0], event);
        detectChanges();

        expect(document.activeElement).toEqual(fileMenuNativeItems[fileMenuNativeItems.length - 1]);
      });

      it(
        'should call user defined function and close out menus on space key on a non-trigger ' +
          'menu item',
        () => {
          openShareMenu();
          const spy = jasmine.createSpy('user defined callback spy');
          fixture.componentInstance.clickEmitter.subscribe(spy);

          dispatchKeyboardEvent(nativeMenus[1], 'keydown', SPACE);
          detectChanges();

          expect(nativeMenus.length).toBe(0);
          expect(spy).toHaveBeenCalledTimes(1);
        }
      );

      it('should close the submenu on left arrow and place focus back on its trigger', () => {
        openShareMenu();

        dispatchKeyboardEvent(nativeMenus[1], 'keydown', LEFT_ARROW);
        detectChanges();

        expect(nativeMenus.length).toBe(1);
        expect(nativeMenus[0].id).toBe('file_menu');
        expect(document.activeElement).toEqual(fileMenuNativeItems[1]);
      });

      it(
        'should close menu tree, focus next menu bar item and open its menu on right arrow when ' +
          "currently focused item doesn't trigger a menu",
        () => {
          openShareMenu();

          dispatchKeyboardEvent(nativeMenus[1], 'keydown', RIGHT_ARROW);
          detectChanges();

          expect(nativeMenus.length).toBe(1);
          expect(nativeMenus[0].id).toBe('edit_menu');
          expect(document.activeElement).toEqual(menuBarNativeItems[1]);
        }
      );

      it('should close first level menu and focus previous menubar item on left arrow', () => {
        openFileMenu();

        dispatchKeyboardEvent(nativeMenus[0], 'keydown', LEFT_ARROW);
        detectChanges();

        expect(nativeMenus.length).toBe(1);
        expect(nativeMenus[0].id).toBe('edit_menu');
        expect(document.activeElement).toEqual(menuBarNativeItems[1]);
      });

      it('should close the open submenu and focus its trigger on escape press', () => {
        openShareMenu();

        dispatchKeyboardEvent(nativeMenus[1], 'keydown', ESCAPE);
        detectChanges();

        expect(nativeMenus.length).toBe(1);
        expect(nativeMenus[0].id).toBe('file_menu');
        expect(document.activeElement)
          .withContext('re-focus trigger')
          .toEqual(fileMenuNativeItems[1]);
      });

      it('should not close submenu and focus parent on escape with modifier', () => {
        openShareMenu();
        const event = createKeyboardEvent('keydown', ESCAPE, '', undefined, {control: true});

        dispatchEvent(nativeMenus[1], event);
        detectChanges();

        expect(nativeMenus.length).withContext('menu bar, file menu, share menu').toBe(2);
        expect(nativeMenus[0].id).toBe('file_menu');
        expect(nativeMenus[1].id).toBe('share_menu');
      });

      it('should close out all menus on tab', () => {
        openShareMenu();

        dispatchKeyboardEvent(nativeMenus[1], 'keydown', TAB);
        detectChanges();

        expect(nativeMenus.length).toBe(0);
      });

      it('should focus share MenuItem on S, H character key press', fakeAsync(() => {
        openFileMenu();

        dispatchKeyboardEvent(nativeMenus[0], 'keydown', S);
        dispatchKeyboardEvent(nativeMenus[0], 'keydown', H);
        tick(defaultTypeAheadDebounce + 100);
        detectChanges();

        expect(document.activeElement).toEqual(fileMenuNativeItems[1]);
      }));
    });
  });

  describe('(with rtl layout)', () => {
    let fixture: ComponentFixture<MultiMenuWithSubmenu>;
    let nativeMenuBar: HTMLElement;
    let nativeMenus: HTMLElement[];
    let menuBarNativeItems: HTMLButtonElement[];
    let fileMenuNativeItems: HTMLButtonElement[];

    function grabElementsForTesting() {
      nativeMenuBar = fixture.componentInstance.nativeMenuBar.nativeElement;

      nativeMenus = fixture.componentInstance.nativeMenus.map(e => e.nativeElement);

      menuBarNativeItems = fixture.componentInstance.nativeItems
        .map(e => e.nativeElement)
        .slice(0, 2); // menu bar has the first 2 menu items

      if (nativeMenus.length > 0) {
        fileMenuNativeItems = fixture.componentInstance.nativeItems
          .map(e => e.nativeElement)
          .slice(2, 5); // file menu has the next 3 menu items
      }
    }

    /** Run change detection and extract then set the rendered elements. */
    function detectChanges() {
      fixture.detectChanges();
      grabElementsForTesting();
    }

    /** Place focus on the MenuBar and run change detection. */
    function focusMenuBar() {
      dispatchKeyboardEvent(document, 'keydown', TAB);
      nativeMenuBar.focus();

      detectChanges();
    }

    beforeEach(async(() => {
      TestBed.configureTestingModule({
        imports: [CdkMenuModule],
        declarations: [MultiMenuWithSubmenu],
      }).compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(MultiMenuWithSubmenu);
      detectChanges();
    });

    beforeAll(() => {
      document.dir = 'rtl';
    });

    afterAll(() => {
      document.dir = 'ltr';
    });

    describe('for Menu', () => {
      function openFileMenu() {
        if (nativeMenus.length === 0) {
          focusMenuBar();
          dispatchKeyboardEvent(menuBarNativeItems[0], 'keydown', SPACE);
          detectChanges();
        }
      }

      function openShareMenu() {
        openFileMenu();
        if (nativeMenus.length === 1) {
          dispatchKeyboardEvent(nativeMenus[0], 'keydown', DOWN_ARROW);
          dispatchKeyboardEvent(nativeMenus[0], 'keydown', LEFT_ARROW);
          detectChanges();
        }
      }

      it('should open the submenu for menu item with menu on left arrow', () => {
        openFileMenu();
        dispatchKeyboardEvent(nativeMenus[0], 'keydown', DOWN_ARROW);
        dispatchKeyboardEvent(nativeMenus[0], 'keydown', LEFT_ARROW);
        detectChanges();

        expect(nativeMenus.length).withContext('menu and submenu').toBe(2);
        expect(nativeMenus[0].id).toBe('file_menu');
        expect(nativeMenus[1].id).toBe('share_menu');
      });

      it('should close the submenu and focus its trigger on right arrow', () => {
        openShareMenu();

        dispatchKeyboardEvent(nativeMenus[1], 'keydown', RIGHT_ARROW);
        detectChanges();

        expect(nativeMenus.length).toBe(1);
        expect(nativeMenus[0].id).toBe('file_menu');
        expect(document.activeElement).toEqual(fileMenuNativeItems[1]);
      });

      it(
        'should close menu tree, focus next menu bar item and open its menu on left arrow when ' +
          "focused item doesn't have a menu",
        () => {
          openShareMenu();

          dispatchKeyboardEvent(nativeMenus[1], 'keydown', LEFT_ARROW);
          detectChanges();

          expect(nativeMenus.length).toBe(1);
          expect(nativeMenus[0].id).toBe('edit_menu');
          expect(document.activeElement).toEqual(menuBarNativeItems[1]);
        }
      );

      it('should close first level menu and focus the previous menubar item on right arrow', () => {
        openFileMenu();

        dispatchKeyboardEvent(nativeMenus[0], 'keydown', RIGHT_ARROW);
        detectChanges();

        expect(nativeMenus.length).toBe(1);
        expect(nativeMenus[0].id).toBe('edit_menu');
        expect(document.activeElement).toEqual(menuBarNativeItems[1]);
      });
    });
  });

  describe('with menuitemcheckbox components', () => {
    let fixture: ComponentFixture<MenuWithCheckboxes>;
    let nativeMenuBar: HTMLElement;
    let nativeMenus: HTMLElement[];
    let menuBarNativeItems: HTMLButtonElement[];
    let fontMenuItems: CdkMenuItemCheckbox[];

    function grabElementsForTesting() {
      nativeMenuBar = fixture.componentInstance.nativeMenuBar.nativeElement;

      nativeMenus = fixture.componentInstance.nativeMenus.map(e => e.nativeElement);

      menuBarNativeItems = fixture.componentInstance.nativeItems
        .map(e => e.nativeElement)
        .slice(0, 2); // menu bar has the first 2 menu items

      if (nativeMenus.length > 0) {
        fontMenuItems = fixture.componentInstance.checkboxItems.toArray();
      }
    }

    /** Run change detection and extract then set the rendered elements. */
    function detectChanges() {
      fixture.detectChanges();
      grabElementsForTesting();
    }

    /** Place focus on the menu bar and run change detection. */
    function focusMenuBar() {
      dispatchKeyboardEvent(document, 'keydown', TAB);
      nativeMenuBar.focus();

      detectChanges();
    }

    function openFontMenu() {
      if (nativeMenus.length === 0) {
        focusMenuBar();
        dispatchKeyboardEvent(menuBarNativeItems[0], 'keydown', SPACE);
        detectChanges();
      }
    }

    beforeEach(async(() => {
      TestBed.configureTestingModule({
        imports: [CdkMenuModule],
        declarations: [MenuWithCheckboxes],
      }).compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(MenuWithCheckboxes);
      detectChanges();
    });

    it(
      'should set the checked state on the focused checkbox on space key and keep the' +
        ' menu open',
      () => {
        openFontMenu();

        dispatchKeyboardEvent(nativeMenus[0], 'keydown', SPACE);
        detectChanges();

        expect(fontMenuItems[0].checked).toBeTrue();
        expect(nativeMenus.length).toBe(1);
        expect(nativeMenus[0].id).toBe('font_menu');
      }
    );
  });

  describe('with menuitemradio components', () => {
    let fixture: ComponentFixture<MenuWithRadioButtons>;
    let nativeMenuBar: HTMLElement;
    let nativeMenus: HTMLElement[];
    let menuBarNativeItems: HTMLButtonElement[];
    let fontMenuItems: CdkMenuItemRadio[];

    function grabElementsForTesting() {
      nativeMenuBar = fixture.componentInstance.nativeMenuBar.nativeElement;

      nativeMenus = fixture.componentInstance.nativeMenus.map(e => e.nativeElement);

      menuBarNativeItems = fixture.componentInstance.nativeItems
        .map(e => e.nativeElement)
        .slice(0, 1); // menu bar only has a single item

      if (nativeMenus.length > 0) {
        fontMenuItems = fixture.componentInstance.radioItems.toArray();
      }
    }

    /** run change detection and, extract and set the rendered elements. */
    function detectChanges() {
      fixture.detectChanges();
      grabElementsForTesting();
    }

    /** set focus the the MenuBar and run change detection. */
    function focusMenuBar() {
      dispatchKeyboardEvent(document, 'keydown', TAB);
      nativeMenuBar.focus();

      detectChanges();
    }

    function openFontMenu() {
      if (nativeMenus.length === 0) {
        focusMenuBar();
        dispatchKeyboardEvent(menuBarNativeItems[0], 'keydown', SPACE);
        detectChanges();
      }
    }

    beforeEach(async(() => {
      TestBed.configureTestingModule({
        imports: [CdkMenuModule],
        declarations: [MenuWithRadioButtons],
      }).compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(MenuWithRadioButtons);
      detectChanges();
    });

    it(
      'should set the checked state on the active radio button on space key and keep the' +
        ' menu open',
      () => {
        openFontMenu();

        dispatchKeyboardEvent(nativeMenus[0], 'keydown', DOWN_ARROW);
        dispatchKeyboardEvent(nativeMenus[0], 'keydown', SPACE);
        detectChanges();

        expect(fontMenuItems[1].checked).toBeTrue();
        expect(nativeMenus.length).toBe(1);
        expect(nativeMenus[0].id).toBe('text_menu');
      }
    );
  });
});

@Component({
  template: `
    <div>
      <div cdkMenuBar id="menu_bar">
        <button cdkMenuItem [cdkMenuTriggerFor]="file">File</button>
        <button cdkMenuItem [cdkMenuTriggerFor]="edit">Edit</button>
      </div>

      <ng-template cdkMenuPanel #file="cdkMenuPanel">
        <div cdkMenu id="file_menu" [cdkMenuPanel]="file">
          <button cdkMenuItem>Save</button>
          <button cdkMenuItem [cdkMenuTriggerFor]="share">Share</button>
          <button cdkMenuItem>Open</button>
        </div>
      </ng-template>

      <ng-template cdkMenuPanel #share="cdkMenuPanel">
        <div cdkMenu id="share_menu" [cdkMenuPanel]="share">
          <button (cdkMenuItemTriggered)="clickEmitter.next()" cdkMenuItem>Email</button>
          <button cdkMenuItem>Chat</button>
        </div>
      </ng-template>

      <ng-template cdkMenuPanel #edit="cdkMenuPanel">
        <div cdkMenu id="edit_menu" [cdkMenuPanel]="edit">
          <button cdkMenuItem>Undo</button>
          <button cdkMenuItem>Redo</button>
        </div>
      </ng-template>
    </div>
  `,
})
class MultiMenuWithSubmenu {
  clickEmitter = new EventEmitter<void>();
  @ViewChild(CdkMenuBar, {read: ElementRef}) nativeMenuBar: ElementRef;

  @ViewChildren(CdkMenu, {read: ElementRef}) nativeMenus: QueryList<ElementRef>;

  @ViewChildren(CdkMenuItem, {read: ElementRef}) nativeItems: QueryList<ElementRef>;
}

@Component({
  template: `
    <div>
      <div cdkMenuBar id="menu_bar">
        <button cdkMenuItem [cdkMenuTriggerFor]="font">Font size</button>
      </div>

      <ng-template cdkMenuPanel #font="cdkMenuPanel">
        <div cdkMenu id="font_menu" [cdkMenuPanel]="font">
          <button cdkMenuItemCheckbox>Small</button>
          <button cdkMenuItemCheckbox>Large</button>
        </div>
      </ng-template>
    </div>
  `,
})
class MenuWithCheckboxes {
  @ViewChild(CdkMenuBar, {read: ElementRef}) nativeMenuBar: ElementRef;

  @ViewChildren(CdkMenu, {read: ElementRef}) nativeMenus: QueryList<ElementRef>;

  @ViewChildren(CdkMenuItem, {read: ElementRef}) nativeItems: QueryList<ElementRef>;

  @ViewChildren(CdkMenuItemCheckbox) checkboxItems: QueryList<CdkMenuItemCheckbox>;
}

@Component({
  template: `
    <div>
      <div cdkMenuBar id="menu_bar">
        <button cdkMenuItem [cdkMenuTriggerFor]="text">Text</button>
      </div>

      <ng-template cdkMenuPanel #text="cdkMenuPanel">
        <div cdkMenu id="text_menu" [cdkMenuPanel]="text">
          <button cdkMenuItemRadio>Bold</button>
          <button cdkMenuItemRadio>Italic</button>
        </div>
      </ng-template>
    </div>
  `,
})
class MenuWithRadioButtons {
  @ViewChild(CdkMenuBar, {read: ElementRef}) nativeMenuBar: ElementRef;

  @ViewChildren(CdkMenu, {read: ElementRef}) nativeMenus: QueryList<ElementRef>;

  @ViewChildren(CdkMenuItem, {read: ElementRef}) nativeItems: QueryList<ElementRef>;

  @ViewChildren(CdkMenuItemRadio) radioItems: QueryList<CdkMenuItemRadio>;
}

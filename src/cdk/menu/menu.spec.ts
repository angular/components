import {TAB} from '@angular/cdk/keycodes';
import {Component, ElementRef, QueryList, ViewChild, ViewChildren} from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  flush,
  tick,
  waitForAsync,
} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {
  createMouseEvent,
  dispatchEvent,
  dispatchKeyboardEvent,
  dispatchMouseEvent,
} from '../../cdk/testing/private';
import {CdkMenu} from './menu';
import {CdkMenuItem} from './menu-item';
import {CdkMenuItemCheckbox} from './menu-item-checkbox';
import {CdkMenuModule} from './menu-module';

describe('Menu', () => {
  describe('as checkbox group', () => {
    let fixture: ComponentFixture<MenuCheckboxGroup>;
    let menuItems: CdkMenuItemCheckbox[];

    beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [CdkMenuModule, MenuCheckboxGroup],
      });

      fixture = TestBed.createComponent(MenuCheckboxGroup);
      fixture.detectChanges();

      fixture.componentInstance.trigger.getMenuTrigger()?.toggle();
      fixture.detectChanges();

      menuItems = fixture.debugElement
        .queryAll(By.directive(CdkMenuItemCheckbox))
        .map(element => element.injector.get(CdkMenuItemCheckbox));
    }));

    it('should toggle menuitemcheckbox', () => {
      expect(menuItems[0].checked).toBeTrue();
      expect(menuItems[1].checked).toBeFalse();

      menuItems[1].trigger();
      expect(menuItems[0].checked).toBeTrue(); // checkbox should not change

      menuItems[0].trigger();

      expect(menuItems[0].checked).toBeFalse();
      expect(menuItems[1].checked).toBeTrue();
    });
  });

  describe('when configured inline', () => {
    let fixture: ComponentFixture<InlineMenu>;
    let nativeMenu: HTMLElement;
    let nativeMenuItems: HTMLElement[];

    beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [CdkMenuModule, InlineMenu],
      });
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(InlineMenu);
      fixture.detectChanges();

      nativeMenu = fixture.debugElement.query(By.directive(CdkMenu)).nativeElement;
      nativeMenuItems = fixture.debugElement
        .queryAll(By.directive(CdkMenuItem))
        .map(e => e.nativeElement);
    });

    it('should have its tabindex set to 0', () => {
      const item = fixture.debugElement.query(By.directive(CdkMenu)).nativeElement;
      expect(item.getAttribute('tabindex')).toBe('0');
    });

    it('should focus the first menu item when it gets tabbed in', () => {
      dispatchKeyboardEvent(document, 'keydown', TAB);
      nativeMenu.focus();

      expect(document.activeElement).toEqual(nativeMenuItems[0]);
    });
  });

  describe('menu aim', () => {
    /** A coordinate in the browser window */
    type Point = {x: number; y: number};

    /** Calculate the slope between two points. */
    function getSlope(from: Point, to: Point) {
      return (to.y - from.y) / (to.x - from.x);
    }

    /** Calculate the y intercept based on some slope and point. */
    function getYIntercept(slope: number, point: Point) {
      return point.y - slope * point.x;
    }

    /** Dispatch a mouseout event. */
    function mouseout(mouseOutOf: HTMLElement) {
      dispatchMouseEvent(mouseOutOf, 'mouseout');
    }

    /** Dispatch a mouseenter event. */
    function mouseenter(element: HTMLElement, point: Point) {
      dispatchEvent(element, createMouseEvent('mouseenter', point.x, point.y));
    }

    /** Dispatch a mousemove event. */
    function mousemove(inElement: HTMLElement, point: Point) {
      dispatchEvent(inElement, createMouseEvent('mousemove', point.x, point.y));
    }

    /** Return the element at the specified point. */
    function getElementAt(point: Point) {
      return document.elementFromPoint(point.x, point.y) as HTMLElement;
    }

    describe('with ltr layout and menu at top of page moving down and right', () => {
      let fixture: ComponentFixture<WithComplexNestedMenus>;
      let nativeFileTrigger: HTMLElement;
      let nativeFileButtons: HTMLElement[] | undefined;

      let nativeEditTrigger: HTMLElement | undefined;
      let nativeEditButtons: HTMLElement[] | undefined;

      let nativeShareTrigger: HTMLElement | undefined;

      let nativeMenus: HTMLElement[];

      beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
          imports: [CdkMenuModule, WithComplexNestedMenus],
        });
      }));

      beforeEach(() => {
        fixture = TestBed.createComponent(WithComplexNestedMenus);
        detectChanges();
      });

      /** Get the test elements from the component. */
      function grabElementsForTesting() {
        nativeFileTrigger = fixture.componentInstance.nativeFileTrigger?.nativeElement;
        nativeFileButtons = fixture.debugElement
          .query(By.css('#file_menu'))
          ?.nativeElement.querySelectorAll('button');

        nativeEditTrigger = fixture.componentInstance.nativeEditTrigger?.nativeElement;
        nativeEditButtons = fixture.debugElement
          .query(By.css('#edit_menu'))
          ?.nativeElement.querySelectorAll('button');

        nativeShareTrigger = fixture.componentInstance.nativeShareTrigger?.nativeElement;

        nativeMenus = fixture.componentInstance.menus.map(m => m.nativeElement);
      }

      /** Run change detection and extract the set of rendered elements. */
      function detectChanges() {
        fixture.detectChanges();
        grabElementsForTesting();
      }

      /** Open the file menu. */
      function openFileMenu() {
        dispatchMouseEvent(nativeFileTrigger, 'mouseenter');
        dispatchMouseEvent(nativeFileTrigger, 'click');
        dispatchMouseEvent(nativeFileTrigger, 'mouseenter');
        detectChanges();
      }
      /** Using a fake hover event, open the specified menu given a reference to its trigger. */
      function openMenuOnHover(menuElement?: HTMLElement) {
        if (menuElement) {
          dispatchMouseEvent(menuElement, 'mouseenter');
          detectChanges();
        } else {
          throw Error('No element trigger provided. Is it visible in the DOM?');
        }
      }

      /**
       * Fakes mouse hover events from some source point to some target point. Along the way, emits
       * mouse move events and mouse enter events when the element under the mouse changes.
       *
       * It assumes that moves will occur left to right and down.
       * @param from the starting point
       * @param to where to end
       * @param inMenu the menu which uses the menu-aim under test
       * @param duration time in ms the full hover event should take
       *
       * @return the number of elements the mouse entered into.
       */
      function hover(from: Point, to: Point, inMenu: HTMLElement, duration: number) {
        const getNextPoint = getNextPointIterator(from, to);

        let currentPoint: Point | null = from;
        let currElement = getElementAt(currentPoint);

        const timeout = duration / (to.x - from.x);

        let numEnters = 0;
        while (currentPoint) {
          mousemove(inMenu, currentPoint);
          const nextElement = getElementAt(currentPoint);
          if (nextElement !== currElement && nextElement instanceof HTMLButtonElement) {
            numEnters++;
            mouseout(currElement);
            mouseenter(nextElement, currentPoint);
            currElement = nextElement;
            fixture.detectChanges();
          }
          currentPoint = getNextPoint();
          tick(timeout);
        }
        return numEnters;
      }

      /**
       * Get a function which determines the next point to generate when moving from one point to
       * another.
       */
      function getNextPointIterator(from: Point, to: Point) {
        let x = from.x;
        const m = getSlope(from, to);
        const b = getYIntercept(m, to);
        return () => {
          if (x > to.x) {
            return null;
          }
          const y = m * x + b;
          return {x: Math.floor(x++), y: Math.floor(y)};
        };
      }

      it('should close the edit menu when hovering directly down from the edit menu trigger to the print item without waiting', fakeAsync(() => {
        openFileMenu();
        openMenuOnHover(nativeEditTrigger!);
        const editPosition = nativeEditTrigger!.getBoundingClientRect();
        const printPosition = nativeFileButtons![4].getBoundingClientRect();

        const numEnterEvents = hover(
          {x: editPosition.x, y: editPosition.y + 1},
          {x: printPosition.x + 5, y: printPosition.y + 1},
          nativeMenus[0],
          100,
        );
        detectChanges();

        expect(numEnterEvents).toBe(4);
        expect(nativeMenus.length).toBe(1);
      }));

      it('should close the edit menu after moving towards submenu and stopping', fakeAsync(() => {
        openFileMenu();
        openMenuOnHover(nativeEditTrigger!);
        const editPosition = nativeEditTrigger!.getBoundingClientRect();
        const sharePosition = nativeShareTrigger!.getBoundingClientRect();

        const numEnters = hover(
          {
            x: editPosition.x + editPosition.width / 2,
            y: editPosition.y + editPosition.height - 10,
          },
          {
            x: sharePosition.x + sharePosition.width - 10,
            y: sharePosition.y + sharePosition.height - 10,
          },
          nativeMenus[0],
          100,
        );
        tick(2000);
        detectChanges();

        expect(numEnters).toBe(1);
        expect(nativeMenus.length).toBe(2);
        expect(nativeMenus[1].id).toBe('share_menu');
      }));

      it('should not close the edit submenu when hovering into its items in time', fakeAsync(() => {
        openFileMenu();
        openMenuOnHover(nativeEditTrigger!);
        const editPosition = nativeEditTrigger!.getBoundingClientRect();
        const pastePosition = nativeEditButtons![4].getBoundingClientRect();

        const numEnters = hover(editPosition, pastePosition, nativeMenus[0], 100);
        detectChanges();
        flush();

        expect(numEnters).toBeGreaterThan(2);
        expect(nativeMenus.length).toBe(2);
        expect(nativeMenus[1].id).toBe('edit_menu');
      }));

      it('should close the edit menu when hovering into its items slowly', fakeAsync(() => {
        openFileMenu();
        openMenuOnHover(nativeEditTrigger!);
        const editPosition = nativeEditTrigger!.getBoundingClientRect();
        const pastePosition = nativeEditButtons![4].getBoundingClientRect();

        const numEnters = hover(editPosition, pastePosition, nativeMenus[0], 4000);
        detectChanges();
        flush();

        expect(numEnters).toBeGreaterThan(2);
        expect(nativeMenus.length).toBe(1);
      }));
    });

    describe('with rtl layout and menu at bottom of page moving up and left', () => {
      let fixture: ComponentFixture<WithComplexNestedMenusOnBottom>;
      let nativeFileTrigger: HTMLElement;
      let nativeFileButtons: HTMLElement[] | undefined;

      let nativeEditTrigger: HTMLElement | undefined;
      let nativeEditButtons: HTMLElement[] | undefined;

      let nativeShareTrigger: HTMLElement | undefined;

      let nativeMenus: HTMLElement[];

      beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
          imports: [CdkMenuModule, WithComplexNestedMenusOnBottom],
        });
      }));

      beforeEach(() => {
        fixture = TestBed.createComponent(WithComplexNestedMenusOnBottom);
        detectChanges();
      });

      beforeAll(() => {
        document.dir = 'rtl';
      });

      afterAll(() => {
        document.dir = 'ltr';
      });

      /** Get the test elements from the component. */
      function grabElementsForTesting() {
        nativeFileTrigger = fixture.componentInstance.nativeFileTrigger?.nativeElement;
        nativeFileButtons = fixture.debugElement
          .query(By.css('#file_menu'))
          ?.nativeElement.querySelectorAll('button');

        nativeEditTrigger = fixture.componentInstance.nativeEditTrigger?.nativeElement;
        nativeEditButtons = fixture.debugElement
          .query(By.css('#edit_menu'))
          ?.nativeElement.querySelectorAll('button');

        nativeShareTrigger = fixture.componentInstance.nativeShareTrigger?.nativeElement;

        nativeMenus = fixture.componentInstance.menus.map(m => m.nativeElement);
      }

      /** Run change detection and extract the set the rendered elements. */
      function detectChanges() {
        fixture.detectChanges();
        grabElementsForTesting();
      }

      /** Open the file menu. */
      function openFileMenu() {
        dispatchMouseEvent(nativeFileTrigger, 'mouseenter');
        dispatchMouseEvent(nativeFileTrigger, 'click');
        dispatchMouseEvent(nativeFileTrigger, 'mouseenter');
        detectChanges();
      }

      /** Using a fake hover event, open the specified menu given a reference to its trigger. */
      function openMenuOnHover(menuElement?: HTMLElement) {
        if (menuElement) {
          dispatchMouseEvent(menuElement, 'mouseenter');
          detectChanges();
        } else {
          throw Error('No element trigger provided. Is it visible in the DOM?');
        }
      }

      /**
       * Fakes mouse hover events from some source point to some target point. Along the way, emits
       * mouse move events and mouse enter events when the element under the mouse changes.
       *
       * It assumes that moves will occur right to left and up.
       * @param from the starting point
       * @param to where to end
       * @param inMenu the menu which uses the menu-aim under test
       * @param duration time in ms the full hover event should take
       *
       * @return the number of elements the mouse entered into.
       */
      function hover(from: Point, to: Point, inMenu: HTMLElement, duration: number) {
        const getNextPoint = getNextPointIterator(from, to);

        let currPoint: Point | null = from;
        let currElement = getElementAt(currPoint);

        const timeout = duration / (to.x - from.x);

        let numEnters = 0;
        while (currPoint) {
          mousemove(inMenu, currPoint);
          const nextElement = getElementAt(currPoint);
          if (nextElement !== currElement && nextElement instanceof HTMLButtonElement) {
            numEnters++;
            mouseout(currElement);
            mouseenter(nextElement, currPoint);
            currElement = nextElement;
            fixture.detectChanges();
          }
          currPoint = getNextPoint();
          tick(timeout);
        }
        return numEnters;
      }

      /**
       * Get a function which determines the next point to generate when moving from one point to
       * another.
       */
      function getNextPointIterator(from: Point, to: Point) {
        let x = from.x;
        const m = getSlope(from, to);
        const b = getYIntercept(m, to);
        return () => {
          if (x < to.x) {
            return null;
          }
          const y = m * x + b;
          return {x: Math.floor(x--), y: Math.floor(y)};
        };
      }

      it('should close the edit menu when hovering directly up from the edit menu trigger to the print item without waiting', fakeAsync(() => {
        openFileMenu();
        openMenuOnHover(nativeEditTrigger!);
        tick();

        const editPosition = nativeEditTrigger!.getBoundingClientRect();
        const printPosition = nativeFileButtons![0].getBoundingClientRect();

        const numEnterEvents = hover(
          {x: editPosition.x + editPosition.width / 2, y: editPosition.y + 5},
          {x: printPosition.x + 10, y: printPosition.y - 10},
          nativeMenus[0],
          100,
        );
        detectChanges();
        flush();

        expect(numEnterEvents).toBe(4);
        expect(nativeMenus.length).toBe(1);
      }));

      it('should close the edit menu after moving towards submenu and stopping', fakeAsync(() => {
        openFileMenu();
        openMenuOnHover(nativeEditTrigger!);
        const editPosition = nativeEditTrigger!.getBoundingClientRect();
        const sharePosition = nativeShareTrigger!.getBoundingClientRect();

        const numEnters = hover(
          {x: editPosition.x + editPosition.width / 2, y: editPosition.y + 5},
          {
            x: sharePosition.x + 10,
            y: sharePosition.y + 10,
          },
          nativeMenus[0],
          100,
        );
        tick(2000);
        detectChanges();

        expect(numEnters).toBe(1);
        expect(nativeMenus.length).toBe(2);
        expect(nativeMenus[1].id).toBe('share_menu');
      }));

      it('should not close the edit submenu when hovering into its items in time', fakeAsync(() => {
        openFileMenu();
        openMenuOnHover(nativeEditTrigger!);
        tick();

        const editPosition = nativeEditTrigger!.getBoundingClientRect();
        const undoPosition = nativeEditButtons![0].getBoundingClientRect();

        const numEnters = hover(editPosition, undoPosition, nativeMenus[0], 100);
        detectChanges();
        flush();

        expect(numEnters).toBeGreaterThan(2);
        expect(nativeMenus.length).toBe(2);
        expect(nativeMenus[1].id).toBe('edit_menu');
      }));
    });
  });
});

@Component({
  template: `
    <div cdkMenuBar>
      <button cdkMenuItem [cdkMenuTriggerFor]="panel"></button>
    </div>
    <ng-template #panel>
      <ul cdkMenu>
        <li role="none">
          <button cdkMenuItemChecked="true" cdkMenuItemCheckbox>first</button>
        </li>
        <li role="none">
          <button cdkMenuItemCheckbox>second</button>
        </li>
      </ul>
    </ng-template>
  `,
  imports: [CdkMenuModule],
})
class MenuCheckboxGroup {
  @ViewChild(CdkMenuItem) readonly trigger: CdkMenuItem;
}

@Component({
  template: `
    <div cdkMenu>
      <button cdkMenuItem>Inbox</button>
      <button cdkMenuItem>Starred</button>
    </div>
  `,
  imports: [CdkMenuModule],
})
class InlineMenu {}

@Component({
  template: `
    <div cdkTargetMenuAim cdkMenuBar>
      <button #file_trigger cdkMenuItem [cdkMenuTriggerFor]="file">File</button>
    </div>

    <ng-template #file>
      <div
        id="file_menu"
        style="display: flex; flex-direction: column;"
        cdkMenu
        cdkTargetMenuAim
      >
        <button #edit_trigger cdkMenuItem [cdkMenuTriggerFor]="edit">Edit</button>
        <button #share_trigger cdkMenuItem [cdkMenuTriggerFor]="share">Share</button>
        <button cdkMenuItem>Open</button>
        <button cdkMenuItem>Rename</button>
        <button cdkMenuItem>Print</button>
      </div>
    </ng-template>

    <ng-template #edit>
      <div
        id="edit_menu"
        style="display: flex; flex-direction: column;"
        cdkMenu
        cdkTargetMenuAim
      >
        <button cdkMenuItem>Undo</button>
        <button cdkMenuItem>Redo</button>
        <button cdkMenuItem>Cut</button>
        <button cdkMenuItem>Copy</button>
        <button cdkMenuItem>Paste</button>
      </div>
    </ng-template>

    <ng-template #share>
      <div
        id="share_menu"
        style="display: flex; flex-direction: column;"
        cdkMenu
        cdkTargetMenuAim
      >
        <button cdkMenuItem>GVC</button>
        <button cdkMenuItem>Gmail</button>
        <button cdkMenuItem>Twitter</button>
      </div>
    </ng-template>
  `,
  imports: [CdkMenuModule],
})
class WithComplexNestedMenus {
  @ViewChild('file_trigger', {read: ElementRef}) nativeFileTrigger: ElementRef<HTMLElement>;
  @ViewChild('edit_trigger', {read: ElementRef}) nativeEditTrigger?: ElementRef<HTMLElement>;
  @ViewChild('share_trigger', {read: ElementRef}) nativeShareTrigger?: ElementRef<HTMLElement>;

  @ViewChildren(CdkMenu) menus: QueryList<CdkMenu>;
}

@Component({
  template: `
    <div cdkMenuBar cdkTargetMenuAim style="position: fixed; bottom: 0">
      <button #file_trigger cdkMenuItem [cdkMenuTriggerFor]="file">File</button>
    </div>

    <ng-template #file>
      <div
        id="file_menu"
        style="display: flex; flex-direction: column"
        cdkMenu
        cdkTargetMenuAim
      >
        <button cdkMenuItem>Print</button>
        <button cdkMenuItem>Rename</button>
        <button cdkMenuItem>Open</button>
        <button #share_trigger cdkMenuItem [cdkMenuTriggerFor]="share">Share</button>
        <button #edit_trigger cdkMenuItem [cdkMenuTriggerFor]="edit">Edit</button>
      </div>
    </ng-template>

    <ng-template #edit>
      <div
        id="edit_menu"
        style="display: flex; flex-direction: column"
        cdkMenu
        cdkTargetMenuAim
      >
        <button cdkMenuItem>Undo</button>
        <button cdkMenuItem>Redo</button>
        <button cdkMenuItem>Cut</button>
        <button cdkMenuItem>Copy</button>
        <button cdkMenuItem>Paste</button>
      </div>
    </ng-template>

    <ng-template #share>
      <div
        id="share_menu"
        style="display: flex; flex-direction: column"
        cdkMenu
        cdkTargetMenuAim
      >
        <button cdkMenuItem>GVC</button>
        <button cdkMenuItem>Gmail</button>
        <button cdkMenuItem>Twitter</button>
        <button cdkMenuItem>Facebook</button>
      </div>
    </ng-template>
  `,
  imports: [CdkMenuModule],
})
class WithComplexNestedMenusOnBottom {
  @ViewChild('file_trigger', {read: ElementRef}) nativeFileTrigger: ElementRef<HTMLElement>;
  @ViewChild('edit_trigger', {read: ElementRef}) nativeEditTrigger?: ElementRef<HTMLElement>;
  @ViewChild('share_trigger', {read: ElementRef}) nativeShareTrigger?: ElementRef<HTMLElement>;

  @ViewChildren(CdkMenu) menus: QueryList<CdkMenu>;
}

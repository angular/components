import {Component, signal} from '@angular/core';
import {ComponentFixture, fakeAsync, flush, TestBed} from '@angular/core/testing';
import {MatContextMenuTrigger} from './context-menu-trigger';
import {MatMenu} from './menu';
import {MatMenuItem} from './menu-item';
import {dispatchFakeEvent, dispatchMouseEvent} from '@angular/cdk/testing/private';

describe('context menu trigger', () => {
  let fixture: ComponentFixture<ContextMenuTest>;

  function getTrigger(): HTMLElement {
    return fixture.nativeElement.querySelector('.area');
  }

  function getMenu(): HTMLElement | null {
    return document.querySelector('.mat-mdc-menu-panel');
  }

  beforeEach(() => {
    fixture = TestBed.createComponent(ContextMenuTest);
    fixture.detectChanges();
  });

  it('should open the menu on the `contextmenu` event', () => {
    expect(getMenu()).toBe(null);
    dispatchMouseEvent(getTrigger(), 'contextmenu', 10, 10);
    fixture.detectChanges();
    expect(getMenu()).toBeTruthy();
  });

  it('should close the menu when clicking outside the trigger', fakeAsync(() => {
    dispatchMouseEvent(getTrigger(), 'contextmenu', 10, 10);
    fixture.detectChanges();
    expect(getMenu()).toBeTruthy();

    document.body.click();
    fixture.detectChanges();
    flush();
    expect(getMenu()).toBe(null);
  }));

  it('should reposition the menu when right-clicking within the area', () => {
    dispatchMouseEvent(getTrigger(), 'contextmenu', 10, 10);
    fixture.detectChanges();
    let menuRect = getMenu()!.getBoundingClientRect();
    expect(menuRect.top).toBe(10);
    expect(menuRect.left).toBe(10);

    dispatchMouseEvent(getTrigger(), 'contextmenu', 50, 75);
    fixture.detectChanges();
    menuRect = getMenu()!.getBoundingClientRect();
    expect(menuRect.top).toBe(75);
    expect(menuRect.left).toBe(50);
  });

  it('should ignore the first auxclick after opening', fakeAsync(() => {
    dispatchMouseEvent(getTrigger(), 'contextmenu', 10, 10);
    fixture.detectChanges();
    expect(getMenu()).toBeTruthy();

    dispatchMouseEvent(document.body, 'auxclick');
    fixture.detectChanges();
    flush();
    expect(getMenu()).toBeTruthy();

    dispatchMouseEvent(document.body, 'auxclick');
    fixture.detectChanges();
    flush();
    expect(getMenu()).toBe(null);
  }));

  it('should close on `contextmenu` events outside the trigger', fakeAsync(() => {
    dispatchMouseEvent(getTrigger(), 'contextmenu', 10, 10);
    fixture.detectChanges();
    expect(getMenu()).toBeTruthy();

    dispatchMouseEvent(document.body, 'contextmenu');
    fixture.detectChanges();
    flush();
    expect(getMenu()).toBe(null);
  }));

  it('should not close on `contextmenu` events from inside the menu', fakeAsync(() => {
    dispatchMouseEvent(getTrigger(), 'contextmenu', 10, 10);
    fixture.detectChanges();
    expect(getMenu()).toBeTruthy();

    dispatchMouseEvent(getMenu()!, 'contextmenu');
    fixture.detectChanges();
    flush();
    expect(getMenu()).toBeTruthy();
  }));

  it('should set aria-controls on the trigger while the menu is open', () => {
    expect(getTrigger().getAttribute('aria-controls')).toBe(null);
    dispatchMouseEvent(getTrigger(), 'contextmenu', 10, 10);
    fixture.detectChanges();
    expect(getTrigger().getAttribute('aria-controls')).toBeTruthy();
  });

  it('should reposition the menu as the user is scrolling', () => {
    const scroller = document.createElement('div');
    scroller.style.height = '1000px';
    fixture.nativeElement.appendChild(scroller);

    dispatchMouseEvent(getTrigger(), 'contextmenu', 10, 10);
    fixture.detectChanges();
    let menuRect = getMenu()!.getBoundingClientRect();
    expect(menuRect.top).toBe(10);
    expect(menuRect.left).toBe(10);

    scrollTo(0, 100);
    dispatchFakeEvent(document, 'scroll');
    fixture.detectChanges();
    menuRect = getMenu()!.getBoundingClientRect();
    expect(menuRect.top).toBe(-90);
    expect(menuRect.left).toBe(10);

    window.scroll(0, 0);
    scroller.remove();
  });

  it('should emit events when the menu is opened and closed', fakeAsync(() => {
    const {opened, closed} = fixture.componentInstance;
    expect(opened).toHaveBeenCalledTimes(0);
    expect(closed).toHaveBeenCalledTimes(0);

    dispatchMouseEvent(getTrigger(), 'contextmenu', 10, 10);
    fixture.detectChanges();
    expect(opened).toHaveBeenCalledTimes(1);
    expect(closed).toHaveBeenCalledTimes(0);

    document.body.click();
    fixture.detectChanges();
    flush();
    expect(opened).toHaveBeenCalledTimes(1);
    expect(closed).toHaveBeenCalledTimes(1);
  }));

  it('should close the menu if the trigger is destroyed', fakeAsync(() => {
    dispatchMouseEvent(getTrigger(), 'contextmenu', 10, 10);
    fixture.detectChanges();
    expect(getMenu()).toBeTruthy();

    fixture.componentInstance.showTrigger.set(false);
    fixture.detectChanges();
    flush();
    expect(getMenu()).toBe(null);
  }));

  it('should not open when clicking on a disabled context menu trigger', () => {
    fixture.componentInstance.disabled.set(true);
    fixture.detectChanges();
    expect(getTrigger().classList).toContain('mat-context-menu-trigger-disabled');
    expect(getMenu()).toBe(null);
    dispatchMouseEvent(getTrigger(), 'contextmenu', 10, 10);
    fixture.detectChanges();
    expect(getMenu()).toBe(null);
  });
});

@Component({
  template: `
    @if (showTrigger()) {
      <div
        class="area"
        [matContextMenuTriggerFor]="menu"
        [matContextMenuTriggerDisabled]="disabled()"
        (menuOpened)="opened()"
        (menuClosed)="closed()"></div>
    }
    <mat-menu #menu>
      <button mat-menu-item>One</button>
      <button mat-menu-item>Two</button>
      <button mat-menu-item>Three</button>
    </mat-menu>
  `,
  imports: [MatContextMenuTrigger, MatMenu, MatMenuItem],
  styles: `
    .area {
      width: 200px;
      height: 200px;
      outline: solid 1px;
    }
  `,
})
class ContextMenuTest {
  showTrigger = signal(true);
  disabled = signal(false);
  opened = jasmine.createSpy('opened');
  closed = jasmine.createSpy('closed');
}

import {TAB} from '../../keycodes';
import {Platform} from '../../platform';
import {Component, ViewChild, DOCUMENT} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {
  createMouseEvent,
  dispatchEvent,
  dispatchFakeEvent,
  dispatchKeyboardEvent,
  dispatchMouseEvent,
  patchElementFocus,
} from '../../testing/private';
import {A11yModule, CdkMonitorFocus} from '../index';
import {TOUCH_BUFFER_MS} from '../input-modality/input-modality-detector';
import {
  FOCUS_MONITOR_DEFAULT_OPTIONS,
  FocusMonitor,
  FocusMonitorDetectionMode,
  FocusOrigin,
} from './focus-monitor';

function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

describe('FocusMonitor', () => {
  let fixture: ComponentFixture<PlainButton>;
  let buttonElement: HTMLElement;
  let focusMonitor: FocusMonitor;
  let changeHandler: (origin: FocusOrigin) => void;
  let fakeActiveElement: HTMLElement | null;

  beforeEach(() => {
    fakeActiveElement = null;

    TestBed.configureTestingModule({
      providers: [
        {
          provide: DOCUMENT,
          useFactory: () => {
            // We have to stub out the `document` in order to be able to fake `activeElement`.
            const fakeDocument = {body: document.body};
            [
              'createElement',
              'dispatchEvent',
              'querySelectorAll',
              'addEventListener',
              'removeEventListener',
              'querySelector',
              'createTextNode',
            ].forEach(method => {
              (fakeDocument as any)[method] = function () {
                return (document as any)[method].apply(document, arguments);
              };
            });
            Object.defineProperty(fakeDocument, 'activeElement', {
              get: () => fakeActiveElement || document.activeElement,
            });
            return fakeDocument;
          },
        },
      ],
    });

    fixture = TestBed.createComponent(PlainButton);
    fixture.detectChanges();

    buttonElement = fixture.debugElement.query(By.css('button'))!.nativeElement;
    focusMonitor = TestBed.inject(FocusMonitor);

    changeHandler = jasmine.createSpy('focus origin change handler');
    focusMonitor.monitor(buttonElement).subscribe(changeHandler);
    patchElementFocus(buttonElement);
  });

  it('manually registered element should receive focus classes', async () => {
    buttonElement.focus();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(buttonElement.classList.contains('cdk-focused'))
      .withContext('button should have cdk-focused class')
      .toBe(true);
    expect(changeHandler).toHaveBeenCalledTimes(1);
  });

  it('should detect focus via keyboard', async () => {
    // Simulate focus via keyboard.
    dispatchKeyboardEvent(document, 'keydown', TAB);
    buttonElement.focus();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(buttonElement.classList.length)
      .withContext('button should have exactly 2 focus classes')
      .toBe(2);
    expect(buttonElement.classList.contains('cdk-focused'))
      .withContext('button should have cdk-focused class')
      .toBe(true);
    expect(buttonElement.classList.contains('cdk-keyboard-focused'))
      .withContext('button should have cdk-keyboard-focused class')
      .toBe(true);
    expect(changeHandler).toHaveBeenCalledWith('keyboard');
  });

  it('should detect focus via mouse', async () => {
    // Simulate focus via mouse.
    dispatchMouseEvent(buttonElement, 'mousedown');
    buttonElement.focus();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(buttonElement.classList.length)
      .withContext('button should have exactly 2 focus classes')
      .toBe(2);
    expect(buttonElement.classList.contains('cdk-focused'))
      .withContext('button should have cdk-focused class')
      .toBe(true);
    expect(buttonElement.classList.contains('cdk-mouse-focused'))
      .withContext('button should have cdk-mouse-focused class')
      .toBe(true);
    expect(changeHandler).toHaveBeenCalledWith('mouse');
  });

  it('should detect focus via touch', async () => {
    // Simulate focus via touch.
    dispatchFakeEvent(buttonElement, 'touchstart');
    buttonElement.focus();
    fixture.detectChanges();
    await wait(TOUCH_BUFFER_MS);

    expect(buttonElement.classList.length)
      .withContext('button should have exactly 2 focus classes')
      .toBe(2);
    expect(buttonElement.classList.contains('cdk-focused'))
      .withContext('button should have cdk-focused class')
      .toBe(true);
    expect(buttonElement.classList.contains('cdk-touch-focused'))
      .withContext('button should have cdk-touch-focused class')
      .toBe(true);
    expect(changeHandler).toHaveBeenCalledWith('touch');
  });

  it('should detect programmatic focus', async () => {
    // Programmatically focus.
    buttonElement.focus();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(buttonElement.classList.length)
      .withContext('button should have exactly 2 focus classes')
      .toBe(2);
    expect(buttonElement.classList.contains('cdk-focused'))
      .withContext('button should have cdk-focused class')
      .toBe(true);
    expect(buttonElement.classList.contains('cdk-program-focused'))
      .withContext('button should have cdk-program-focused class')
      .toBe(true);
    expect(changeHandler).toHaveBeenCalledWith('program');
  });

  it('should detect fake mousedown from a screen reader on Chrome', async () => {
    // Simulate focus via a fake mousedown from a screen reader.
    dispatchMouseEvent(buttonElement, 'mousedown');
    const event = createMouseEvent('mousedown');
    Object.defineProperties(event, {detail: {get: () => 0}});
    dispatchEvent(buttonElement, event);

    buttonElement.focus();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(buttonElement.classList.length)
      .withContext('button should have exactly 2 focus classes')
      .toBe(2);
    expect(buttonElement.classList.contains('cdk-focused'))
      .withContext('button should have cdk-focused class')
      .toBe(true);
    expect(buttonElement.classList.contains('cdk-keyboard-focused'))
      .withContext('button should have cdk-keyboard-focused class')
      .toBe(true);
    expect(changeHandler).toHaveBeenCalledWith('keyboard');
  });

  it('should detect fake mousedown from a screen reader on Firefox', async () => {
    // Simulate focus via a fake mousedown from a screen reader.
    dispatchMouseEvent(buttonElement, 'mousedown');
    const event = createMouseEvent('mousedown');
    Object.defineProperties(event, {buttons: {get: () => 0}});
    dispatchEvent(buttonElement, event);

    buttonElement.focus();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(buttonElement.classList.length)
      .withContext('button should have exactly 2 focus classes')
      .toBe(2);
    expect(buttonElement.classList.contains('cdk-focused'))
      .withContext('button should have cdk-focused class')
      .toBe(true);
    expect(buttonElement.classList.contains('cdk-keyboard-focused'))
      .withContext('button should have cdk-keyboard-focused class')
      .toBe(true);
    expect(changeHandler).toHaveBeenCalledWith('keyboard');
  });

  it('focusVia keyboard should simulate keyboard focus', async () => {
    focusMonitor.focusVia(buttonElement, 'keyboard');
    await fixture.whenStable();

    expect(buttonElement.classList.length)
      .withContext('button should have exactly 2 focus classes')
      .toBe(2);
    expect(buttonElement.classList.contains('cdk-focused'))
      .withContext('button should have cdk-focused class')
      .toBe(true);
    expect(buttonElement.classList.contains('cdk-keyboard-focused'))
      .withContext('button should have cdk-keyboard-focused class')
      .toBe(true);
    expect(changeHandler).toHaveBeenCalledWith('keyboard');
  });

  it('focusVia mouse should simulate mouse focus', async () => {
    focusMonitor.focusVia(buttonElement, 'mouse');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(buttonElement.classList.length)
      .withContext('button should have exactly 2 focus classes')
      .toBe(2);
    expect(buttonElement.classList.contains('cdk-focused'))
      .withContext('button should have cdk-focused class')
      .toBe(true);
    expect(buttonElement.classList.contains('cdk-mouse-focused'))
      .withContext('button should have cdk-mouse-focused class')
      .toBe(true);
    expect(changeHandler).toHaveBeenCalledWith('mouse');
  });

  it('focusVia touch should simulate touch focus', async () => {
    focusMonitor.focusVia(buttonElement, 'touch');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(buttonElement.classList.length)
      .withContext('button should have exactly 2 focus classes')
      .toBe(2);
    expect(buttonElement.classList.contains('cdk-focused'))
      .withContext('button should have cdk-focused class')
      .toBe(true);
    expect(buttonElement.classList.contains('cdk-touch-focused'))
      .withContext('button should have cdk-touch-focused class')
      .toBe(true);
    expect(changeHandler).toHaveBeenCalledWith('touch');
  });

  it('focusVia program should simulate programmatic focus', async () => {
    focusMonitor.focusVia(buttonElement, 'program');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(buttonElement.classList.length)
      .withContext('button should have exactly 2 focus classes')
      .toBe(2);
    expect(buttonElement.classList.contains('cdk-focused'))
      .withContext('button should have cdk-focused class')
      .toBe(true);
    expect(buttonElement.classList.contains('cdk-program-focused'))
      .withContext('button should have cdk-program-focused class')
      .toBe(true);
    expect(changeHandler).toHaveBeenCalledWith('program');
  });

  it('should remove focus classes on blur', async () => {
    buttonElement.focus();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(buttonElement.classList.length)
      .withContext('button should have exactly 2 focus classes')
      .toBe(2);
    expect(changeHandler).toHaveBeenCalledWith('program');

    // Call `blur` directly because invoking `buttonElement.blur()` does not always trigger the
    // handler on IE11 on SauceLabs.
    focusMonitor._onBlur({} as any, buttonElement);
    fixture.detectChanges();

    expect(buttonElement.classList.length)
      .withContext('button should not have any focus classes')
      .toBe(0);
    expect(changeHandler).toHaveBeenCalledWith(null);
  });

  it('should remove classes on stopMonitoring', async () => {
    buttonElement.focus();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(buttonElement.classList.length)
      .withContext('button should have exactly 2 focus classes')
      .toBe(2);

    focusMonitor.stopMonitoring(buttonElement);
    fixture.detectChanges();

    expect(buttonElement.classList.length)
      .withContext('button should not have any focus classes')
      .toBe(0);
  });

  it('should remove classes when destroyed', async () => {
    buttonElement.focus();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(buttonElement.classList.length)
      .withContext('button should have exactly 2 focus classes')
      .toBe(2);

    // Destroy manually since destroying the fixture won't do it.
    focusMonitor.ngOnDestroy();
    fixture.detectChanges();

    expect(buttonElement.classList.length)
      .withContext('button should not have any focus classes')
      .toBe(0);
  });

  it('should pass focus options to the native focus method', async () => {
    spyOn(buttonElement, 'focus');

    focusMonitor.focusVia(buttonElement, 'program', {preventScroll: true});
    fixture.detectChanges();
    await fixture.whenStable();

    expect(buttonElement.focus).toHaveBeenCalledWith(
      jasmine.objectContaining({
        preventScroll: true,
      }),
    );
  });

  it('should not clear the focus origin too early in the current event loop', async () => {
    dispatchKeyboardEvent(document, 'keydown', TAB);

    // Simulate the behavior of Firefox 57 where the focus event sometimes happens *one* tick later.
    await fixture.whenStable();

    buttonElement.focus();

    // Since the timeout doesn't clear the focus origin too early as with the `0ms` timeout, the
    // focus origin should be reported properly.
    expect(changeHandler).toHaveBeenCalledWith('keyboard');

    await fixture.whenStable();
  });

  it('should clear the focus origin after one tick with "immediate" detection', async () => {
    dispatchKeyboardEvent(document, 'keydown', TAB);
    await wait(2);
    buttonElement.focus();

    // After 2 ticks, the timeout has cleared the origin. Default is 'program'.
    expect(changeHandler).toHaveBeenCalledWith('program');
  });

  it('should check children if monitor was called with different checkChildren', async () => {
    const parent = fixture.nativeElement.querySelector('.parent');

    focusMonitor.monitor(parent, true);
    focusMonitor.monitor(parent, false);

    // Simulate focus via mouse.
    dispatchMouseEvent(buttonElement, 'mousedown');
    buttonElement.focus();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(parent.classList).toContain('cdk-focused');
    expect(parent.classList).toContain('cdk-mouse-focused');
  });

  it('focusVia should change the focus origin when called on the focused node', async () => {
    spyOn(buttonElement, 'focus').and.callThrough();
    focusMonitor.focusVia(buttonElement, 'keyboard');
    await fixture.whenStable();
    fakeActiveElement = buttonElement;

    expect(buttonElement.classList.length)
      .withContext('button should have exactly 2 focus classes')
      .toBe(2);
    expect(buttonElement.classList.contains('cdk-focused'))
      .withContext('button should have cdk-focused class')
      .toBe(true);
    expect(buttonElement.classList.contains('cdk-keyboard-focused'))
      .withContext('button should have cdk-keyboard-focused class')
      .toBe(true);
    expect(changeHandler).toHaveBeenCalledTimes(1);
    expect(changeHandler).toHaveBeenCalledWith('keyboard');
    expect(buttonElement.focus).toHaveBeenCalledTimes(1);

    focusMonitor.focusVia(buttonElement, 'mouse');
    await fixture.whenStable();
    fakeActiveElement = buttonElement;

    expect(buttonElement.classList.length)
      .withContext('button should have exactly 2 focus classes')
      .toBe(2);
    expect(buttonElement.classList.contains('cdk-focused'))
      .withContext('button should have cdk-focused class')
      .toBe(true);
    expect(buttonElement.classList.contains('cdk-mouse-focused'))
      .withContext('button should have cdk-mouse-focused class')
      .toBe(true);
    expect(changeHandler).toHaveBeenCalledTimes(2);
    expect(changeHandler).toHaveBeenCalledWith('mouse');
    expect(buttonElement.focus).toHaveBeenCalledTimes(1);
  });

  it('focusVia should change the focus origin when called a focused child node', async () => {
    const parent = fixture.nativeElement.querySelector('.parent');
    focusMonitor.stopMonitoring(buttonElement); // The button gets monitored by default.
    focusMonitor.monitor(parent, true).subscribe(changeHandler);
    spyOn(buttonElement, 'focus').and.callThrough();
    focusMonitor.focusVia(buttonElement, 'keyboard');
    await fixture.whenStable();
    fakeActiveElement = buttonElement;

    expect(parent.classList.length)
      .withContext('Parent should have exactly 2 focus classes and the `parent` class')
      .toBe(3);
    expect(parent.classList.contains('cdk-focused'))
      .withContext('Parent should have cdk-focused class')
      .toBe(true);
    expect(parent.classList.contains('cdk-keyboard-focused'))
      .withContext('Parent should have cdk-keyboard-focused class')
      .toBe(true);
    expect(changeHandler).toHaveBeenCalledTimes(1);
    expect(changeHandler).toHaveBeenCalledWith('keyboard');
    expect(buttonElement.focus).toHaveBeenCalledTimes(1);

    focusMonitor.focusVia(buttonElement, 'mouse');
    await fixture.whenStable();
    fakeActiveElement = buttonElement;

    expect(parent.classList.length)
      .withContext('Parent should have exactly 2 focus classes and the `parent` class')
      .toBe(3);
    expect(parent.classList.contains('cdk-focused'))
      .withContext('Parent should have cdk-focused class')
      .toBe(true);
    expect(parent.classList.contains('cdk-mouse-focused'))
      .withContext('Parent should have cdk-mouse-focused class')
      .toBe(true);
    expect(changeHandler).toHaveBeenCalledTimes(2);
    expect(changeHandler).toHaveBeenCalledWith('mouse');
    expect(buttonElement.focus).toHaveBeenCalledTimes(1);
  });
});

describe('FocusMonitor with "eventual" detection', () => {
  let fixture: ComponentFixture<PlainButton>;
  let buttonElement: HTMLElement;
  let focusMonitor: FocusMonitor;
  let changeHandler: (origin: FocusOrigin) => void;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: FOCUS_MONITOR_DEFAULT_OPTIONS,
          useValue: {
            detectionMode: FocusMonitorDetectionMode.EVENTUAL,
          },
        },
      ],
    });

    fixture = TestBed.createComponent(PlainButton);
    fixture.detectChanges();

    buttonElement = fixture.debugElement.query(By.css('button'))!.nativeElement;
    focusMonitor = TestBed.inject(FocusMonitor);

    changeHandler = jasmine.createSpy('focus origin change handler');
    focusMonitor.monitor(buttonElement).subscribe(changeHandler);
    patchElementFocus(buttonElement);
  });

  it('should not clear the focus origin, even after a few seconds', async () => {
    dispatchKeyboardEvent(document, 'keydown', TAB);
    await wait(2000);

    buttonElement.focus();

    expect(changeHandler).toHaveBeenCalledWith('keyboard');
  });
});

describe('cdkMonitorFocus', () => {
  describe('button with cdkMonitorElementFocus', () => {
    let fixture: ComponentFixture<ButtonWithFocusClasses>;
    let buttonElement: HTMLElement;

    beforeEach(() => {
      fixture = TestBed.createComponent(ButtonWithFocusClasses);
      fixture.detectChanges();

      spyOn(fixture.componentInstance, 'focusChanged');
      buttonElement = fixture.debugElement.query(By.css('button'))!.nativeElement;
      patchElementFocus(buttonElement);
    });

    it('should initially not be focused (directive)', () => {
      expect(buttonElement.classList.length)
        .withContext('button should not have focus classes')
        .toBe(0);
    });

    it('should detect focus via keyboard (directive)', async () => {
      // Simulate focus via keyboard.
      dispatchKeyboardEvent(document, 'keydown', TAB);
      buttonElement.focus();
      fixture.detectChanges();
      await fixture.whenStable();

      expect(buttonElement.classList.length)
        .withContext('button should have exactly 2 focus classes')
        .toBe(2);
      expect(buttonElement.classList.contains('cdk-focused'))
        .withContext('button should have cdk-focused class')
        .toBe(true);
      expect(buttonElement.classList.contains('cdk-keyboard-focused'))
        .withContext('button should have cdk-keyboard-focused class')
        .toBe(true);
      expect(fixture.componentInstance.focusChanged).toHaveBeenCalledWith('keyboard');
    });

    it('should detect focus via mouse (directive)', async () => {
      // Simulate focus via mouse.
      dispatchMouseEvent(buttonElement, 'mousedown');
      buttonElement.focus();
      fixture.detectChanges();
      await fixture.whenStable();

      expect(buttonElement.classList.length)
        .withContext('button should have exactly 2 focus classes')
        .toBe(2);
      expect(buttonElement.classList.contains('cdk-focused'))
        .withContext('button should have cdk-focused class')
        .toBe(true);
      expect(buttonElement.classList.contains('cdk-mouse-focused'))
        .withContext('button should have cdk-mouse-focused class')
        .toBe(true);
      expect(fixture.componentInstance.focusChanged).toHaveBeenCalledWith('mouse');
    });

    it('should detect focus via touch (directive)', async () => {
      // Simulate focus via touch.
      dispatchFakeEvent(buttonElement, 'touchstart');
      buttonElement.focus();
      fixture.detectChanges();
      await wait(TOUCH_BUFFER_MS);

      expect(buttonElement.classList.length)
        .withContext('button should have exactly 2 focus classes')
        .toBe(2);
      expect(buttonElement.classList.contains('cdk-focused'))
        .withContext('button should have cdk-focused class')
        .toBe(true);
      expect(buttonElement.classList.contains('cdk-touch-focused'))
        .withContext('button should have cdk-touch-focused class')
        .toBe(true);
      expect(fixture.componentInstance.focusChanged).toHaveBeenCalledWith('touch');
    });

    it('should detect programmatic focus (directive)', async () => {
      // Programmatically focus.
      buttonElement.focus();
      fixture.detectChanges();
      await fixture.whenStable();

      expect(buttonElement.classList.length)
        .withContext('button should have exactly 2 focus classes')
        .toBe(2);
      expect(buttonElement.classList.contains('cdk-focused'))
        .withContext('button should have cdk-focused class')
        .toBe(true);
      expect(buttonElement.classList.contains('cdk-program-focused'))
        .withContext('button should have cdk-program-focused class')
        .toBe(true);
      expect(fixture.componentInstance.focusChanged).toHaveBeenCalledWith('program');
    });

    it('should remove focus classes on blur (directive)', async () => {
      buttonElement.focus();
      fixture.detectChanges();
      await fixture.whenStable();

      expect(buttonElement.classList.length)
        .withContext('button should have exactly 2 focus classes')
        .toBe(2);
      expect(fixture.componentInstance.focusChanged).toHaveBeenCalledWith('program');

      buttonElement.blur();
      fixture.detectChanges();

      expect(buttonElement.classList.length)
        .withContext('button should not have any focus classes')
        .toBe(0);
      expect(fixture.componentInstance.focusChanged).toHaveBeenCalledWith(null);
    });
  });

  describe('complex component with cdkMonitorElementFocus', () => {
    let fixture: ComponentFixture<ComplexComponentWithMonitorElementFocus>;
    let parentElement: HTMLElement;
    let childElement: HTMLElement;

    beforeEach(() => {
      fixture = TestBed.createComponent(ComplexComponentWithMonitorElementFocus);
      fixture.detectChanges();

      parentElement = fixture.debugElement.query(By.css('div'))!.nativeElement;
      childElement = fixture.debugElement.query(By.css('button'))!.nativeElement;

      patchElementFocus(parentElement);
      patchElementFocus(childElement);
    });

    it('should add focus classes on parent focus', async () => {
      parentElement.focus();
      fixture.detectChanges();
      await fixture.whenStable();

      expect(parentElement.classList.length)
        .withContext('button should have exactly 2 focus classes')
        .toBe(2);
    });

    it('should not add focus classes on child focus', async () => {
      childElement.focus();
      fixture.detectChanges();
      await fixture.whenStable();

      expect(parentElement.classList.length)
        .withContext('button should not have any focus classes')
        .toBe(0);
    });
  });

  describe('complex component with cdkMonitorSubtreeFocus', () => {
    let fixture: ComponentFixture<ComplexComponentWithMonitorSubtreeFocus>;
    let parentElement: HTMLElement;
    let childElement: HTMLElement;

    beforeEach(() => {
      fixture = TestBed.createComponent(ComplexComponentWithMonitorSubtreeFocus);
      fixture.detectChanges();

      parentElement = fixture.debugElement.query(By.css('div'))!.nativeElement;
      childElement = fixture.debugElement.query(By.css('button'))!.nativeElement;

      patchElementFocus(parentElement);
      patchElementFocus(childElement);
    });

    it('should add focus classes on parent focus', async () => {
      parentElement.focus();
      fixture.detectChanges();
      await fixture.whenStable();

      expect(parentElement.classList.length)
        .withContext('button should have exactly 2 focus classes')
        .toBe(2);
    });

    it('should add focus classes on child focus', async () => {
      childElement.focus();
      fixture.detectChanges();
      await fixture.whenStable();

      expect(parentElement.classList.length)
        .withContext('button should have exactly 2 focus classes')
        .toBe(2);
    });
  });

  describe('complex component with cdkMonitorSubtreeFocus and cdkMonitorElementFocus', () => {
    let fixture: ComponentFixture<ComplexComponentWithMonitorSubtreeFocusAndMonitorElementFocus>;
    let parentElement: HTMLElement;
    let childElement: HTMLElement;
    let focusMonitor: FocusMonitor;

    beforeEach(() => {
      focusMonitor = TestBed.inject(FocusMonitor);
      fixture = TestBed.createComponent(
        ComplexComponentWithMonitorSubtreeFocusAndMonitorElementFocus,
      );
      fixture.detectChanges();

      parentElement = fixture.debugElement.query(By.css('div'))!.nativeElement;
      childElement = fixture.debugElement.query(By.css('button'))!.nativeElement;

      patchElementFocus(parentElement);
      patchElementFocus(childElement);
    });

    it('should add keyboard focus classes on both elements when child is focused via keyboard', async () => {
      focusMonitor.focusVia(childElement, 'keyboard');
      fixture.detectChanges();
      await fixture.whenStable();

      expect(parentElement.classList).toContain('cdk-keyboard-focused');
      expect(childElement.classList).toContain('cdk-keyboard-focused');
    });
  });

  describe('button with exported cdkMonitorElementFocus', () => {
    let fixture: ComponentFixture<ExportedFocusMonitor>;
    let buttonElement: HTMLElement;

    beforeEach(() => {
      fixture = TestBed.createComponent(ExportedFocusMonitor);
      fixture.detectChanges();

      buttonElement = fixture.debugElement.query(By.css('button'))!.nativeElement;
      patchElementFocus(buttonElement);
    });

    it('should initially not be focused (exported directive)', () => {
      expect(fixture.componentInstance.exportedDirRef.focusOrigin)
        .withContext('initial focus origin should be null')
        .toBeNull();
    });

    it('should detect focus via keyboard (exported directive)', async () => {
      // Simulate focus via keyboard.
      dispatchKeyboardEvent(document, 'keydown', TAB);
      buttonElement.focus();
      fixture.detectChanges();
      await fixture.whenStable();

      expect(fixture.componentInstance.exportedDirRef.focusOrigin).toEqual('keyboard');
    });

    it('should detect focus via mouse (exported directive)', async () => {
      // Simulate focus via mouse.
      dispatchMouseEvent(buttonElement, 'mousedown');
      buttonElement.focus();
      fixture.detectChanges();
      await fixture.whenStable();

      expect(fixture.componentInstance.exportedDirRef.focusOrigin).toEqual('mouse');
    });

    it('should detect focus via touch (exported directive)', async () => {
      // Simulate focus via touch.
      dispatchFakeEvent(buttonElement, 'touchstart');
      buttonElement.focus();
      fixture.detectChanges();
      await wait(TOUCH_BUFFER_MS);

      expect(fixture.componentInstance.exportedDirRef.focusOrigin).toEqual('touch');
    });

    it('should detect programmatic focus (exported directive)', async () => {
      // Programmatically focus.
      buttonElement.focus();
      fixture.detectChanges();
      await fixture.whenStable();

      expect(fixture.componentInstance.exportedDirRef.focusOrigin).toEqual('program');
    });

    it('should remove focus classes on blur (exported directive)', async () => {
      buttonElement.focus();
      fixture.detectChanges();
      await fixture.whenStable();

      expect(fixture.componentInstance.exportedDirRef.focusOrigin).toEqual('program');

      buttonElement.blur();
      fixture.detectChanges();

      expect(fixture.componentInstance.exportedDirRef.focusOrigin).toEqual(null);
    });
  });

  it('should not throw when trying to monitor focus on a non-element node', () => {
    expect(() => {
      const fixture = TestBed.createComponent(FocusMonitorOnCommentNode);
      fixture.detectChanges();
      fixture.destroy();
    }).not.toThrow();
  });
});

describe('FocusMonitor observable stream', () => {
  let fixture: ComponentFixture<PlainButton>;
  let buttonElement: HTMLElement;
  let focusMonitor: FocusMonitor;
  let fakePlatform: Platform;

  beforeEach(() => {
    fakePlatform = {isBrowser: true} as Platform;
    TestBed.configureTestingModule({
      providers: [{provide: Platform, useValue: fakePlatform}],
    });
    fixture = TestBed.createComponent(PlainButton);
    focusMonitor = TestBed.inject(FocusMonitor);
    fixture.detectChanges();
    buttonElement = fixture.debugElement.nativeElement.querySelector('button');
    patchElementFocus(buttonElement);
  });

  it('should not emit on the server', async () => {
    fakePlatform.isBrowser = false;
    const emitSpy = jasmine.createSpy('emit spy');
    const completeSpy = jasmine.createSpy('complete spy');

    focusMonitor.monitor(buttonElement).subscribe({next: emitSpy, complete: completeSpy});
    expect(emitSpy).not.toHaveBeenCalled();
    expect(completeSpy).toHaveBeenCalled();

    buttonElement.focus();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(emitSpy).not.toHaveBeenCalled();
    expect(completeSpy).toHaveBeenCalled();
  });
});

describe('FocusMonitor input label detection', () => {
  let fixture: ComponentFixture<CheckboxWithLabel>;
  let inputElement: HTMLElement;
  let labelElement: HTMLElement;
  let focusMonitor: FocusMonitor;

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckboxWithLabel);
    focusMonitor = TestBed.inject(FocusMonitor);
    fixture.detectChanges();
    inputElement = fixture.nativeElement.querySelector('input');
    labelElement = fixture.nativeElement.querySelector('label');
    patchElementFocus(inputElement);
  });

  it('should detect label click focus as `mouse`', async () => {
    const spy = jasmine.createSpy('monitor spy');
    focusMonitor.monitor(inputElement).subscribe(spy);
    expect(spy).not.toHaveBeenCalled();

    // Unlike most focus, focus from labels moves to the connected input on click rather than
    // `mousedown`. To simulate it we have to dispatch both `mousedown` and `click` so the
    // modality detector will pick it up.
    dispatchMouseEvent(labelElement, 'mousedown');
    labelElement.click();
    fixture.detectChanges();
    await fixture.whenStable();

    // The programmatic click from above won't move focus so we have to focus the input ourselves.
    inputElement.focus();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(inputElement.classList).toContain('cdk-mouse-focused');
    expect(spy.calls.mostRecent()?.args[0]).toBe('mouse');
  });
});

@Component({
  template: `<div class="parent"><button>focus me!</button></div>`,
  imports: [A11yModule],
})
class PlainButton {}

@Component({
  template: `<button cdkMonitorElementFocus (cdkFocusChange)="focusChanged($event)"></button>`,
  imports: [A11yModule],
})
class ButtonWithFocusClasses {
  focusChanged(_origin: FocusOrigin) {}
}

@Component({
  template: `<div tabindex="0" cdkMonitorElementFocus><button></button></div>`,
  imports: [A11yModule],
})
class ComplexComponentWithMonitorElementFocus {}

@Component({
  template: `<div tabindex="0" cdkMonitorSubtreeFocus><button></button></div>`,
  imports: [A11yModule],
})
class ComplexComponentWithMonitorSubtreeFocus {}

@Component({
  template: `<div cdkMonitorSubtreeFocus><button cdkMonitorElementFocus></button></div>`,
  imports: [A11yModule],
})
class ComplexComponentWithMonitorSubtreeFocusAndMonitorElementFocus {}

@Component({
  template: `<ng-container cdkMonitorElementFocus></ng-container>`,
  imports: [A11yModule],
})
class FocusMonitorOnCommentNode {}

@Component({
  template: `
    <label for="test-checkbox">Check me</label>
    <input id="test-checkbox" type="checkbox">
  `,
  imports: [A11yModule],
})
class CheckboxWithLabel {}

@Component({
  template: `<button cdkMonitorElementFocus #exportedDir="cdkMonitorFocus"></button>`,
  imports: [A11yModule],
})
class ExportedFocusMonitor {
  @ViewChild('exportedDir') exportedDirRef!: CdkMonitorFocus;
}

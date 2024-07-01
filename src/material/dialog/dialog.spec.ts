import {FocusMonitor, FocusOrigin} from '@angular/cdk/a11y';
import {Directionality} from '@angular/cdk/bidi';
import {A, ESCAPE} from '@angular/cdk/keycodes';
import {Overlay, OverlayContainer, ScrollStrategy} from '@angular/cdk/overlay';
import {_supportsShadowDom} from '@angular/cdk/platform';
import {ScrollDispatcher} from '@angular/cdk/scrolling';
import {
  createKeyboardEvent,
  dispatchEvent,
  dispatchKeyboardEvent,
  dispatchMouseEvent,
  patchElementFocus,
} from '@angular/cdk/testing/private';
import {Location} from '@angular/common';
import {SpyLocation} from '@angular/common/testing';
import {
  ChangeDetectionStrategy,
  Component,
  ComponentFactoryResolver,
  ComponentRef,
  Directive,
  Inject,
  Injectable,
  Injector,
  NgModule,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
  ViewEncapsulation,
  createNgModuleRef,
  forwardRef,
  signal,
} from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  flush,
  flushMicrotasks,
  inject,
  tick,
} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {BrowserAnimationsModule, NoopAnimationsModule} from '@angular/platform-browser/animations';
import {Subject} from 'rxjs';
import {CLOSE_ANIMATION_DURATION, OPEN_ANIMATION_DURATION} from './dialog-container';
import {
  MAT_DIALOG_DATA,
  MAT_DIALOG_DEFAULT_OPTIONS,
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogModule,
  MatDialogRef,
  MatDialogState,
  MatDialogTitle,
} from './index';

describe('MDC-based MatDialog', () => {
  let dialog: MatDialog;
  let overlayContainerElement: HTMLElement;
  let scrolledSubject = new Subject();
  let focusMonitor: FocusMonitor;

  let testViewContainerRef: ViewContainerRef;
  let viewContainerFixture: ComponentFixture<ComponentWithChildViewContainer>;
  let mockLocation: SpyLocation;

  beforeEach(fakeAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        MatDialogModule,
        NoopAnimationsModule,
        ComponentWithChildViewContainer,
        ComponentWithTemplateRef,
        PizzaMsg,
        ContentElementDialog,
        DialogWithInjectedData,
        DialogWithoutFocusableElements,
        DirectiveWithViewContainer,
        ComponentWithContentElementTemplateRef,
      ],
      providers: [
        {provide: Location, useClass: SpyLocation},
        {
          provide: ScrollDispatcher,
          useFactory: () => ({
            scrolled: () => scrolledSubject,
            register: () => {},
            deregister: () => {},
          }),
        },
      ],
    });

    TestBed.compileComponents();
  }));

  beforeEach(inject(
    [MatDialog, Location, OverlayContainer, FocusMonitor],
    (d: MatDialog, l: Location, oc: OverlayContainer, fm: FocusMonitor) => {
      dialog = d;
      mockLocation = l as SpyLocation;
      overlayContainerElement = oc.getContainerElement();
      focusMonitor = fm;
    },
  ));

  beforeEach(() => {
    viewContainerFixture = TestBed.createComponent(ComponentWithChildViewContainer);

    viewContainerFixture.detectChanges();
    testViewContainerRef = viewContainerFixture.componentInstance.childViewContainer;
  });

  it('should open a dialog with a component', () => {
    let dialogRef = dialog.open(PizzaMsg, {viewContainerRef: testViewContainerRef});

    viewContainerFixture.detectChanges();

    expect(overlayContainerElement.textContent).toContain('Pizza');
    expect(dialogRef.componentInstance instanceof PizzaMsg).toBe(true);
    expect(dialogRef.componentRef instanceof ComponentRef).toBe(true);
    expect(dialogRef.componentInstance.dialogRef).toBe(dialogRef);

    viewContainerFixture.detectChanges();
    let dialogContainerElement = overlayContainerElement.querySelector('mat-dialog-container')!;
    expect(dialogContainerElement.getAttribute('role')).toBe('dialog');
    expect(dialogContainerElement.getAttribute('aria-modal')).toBe('true');
  });

  it('should open a dialog with a template', () => {
    const templateRefFixture = TestBed.createComponent(ComponentWithTemplateRef);
    templateRefFixture.componentInstance.localValue = 'Bees';
    templateRefFixture.changeDetectorRef.markForCheck();
    templateRefFixture.detectChanges();

    const data = {value: 'Knees'};

    let dialogRef = dialog.open(templateRefFixture.componentInstance.templateRef, {data});

    viewContainerFixture.detectChanges();

    expect(overlayContainerElement.textContent).toContain('Cheese Bees Knees');
    expect(templateRefFixture.componentInstance.dialogRef).toBe(dialogRef);

    viewContainerFixture.detectChanges();

    let dialogContainerElement = overlayContainerElement.querySelector('mat-dialog-container')!;
    expect(dialogContainerElement.getAttribute('role')).toBe('dialog');
    expect(dialogContainerElement.getAttribute('aria-modal')).toBe('true');

    dialogRef.close();
  });

  it('should emit when dialog opening animation is complete', fakeAsync(() => {
    const dialogRef = dialog.open(PizzaMsg, {viewContainerRef: testViewContainerRef});
    const spy = jasmine.createSpy('afterOpen spy');

    dialogRef.afterOpened().subscribe(spy);

    viewContainerFixture.detectChanges();

    // callback should not be called before animation is complete
    expect(spy).not.toHaveBeenCalled();

    flush();
    expect(spy).toHaveBeenCalled();
  }));

  it('should use injector from viewContainerRef for DialogInjector', () => {
    let dialogRef = dialog.open(PizzaMsg, {viewContainerRef: testViewContainerRef});

    viewContainerFixture.detectChanges();

    let dialogInjector = dialogRef.componentInstance.dialogInjector;

    expect(dialogRef.componentInstance.dialogRef).toBe(dialogRef);
    expect(dialogInjector.get<DirectiveWithViewContainer>(DirectiveWithViewContainer))
      .withContext(
        'Expected the dialog component to be created with the injector from ' +
          'the viewContainerRef.',
      )
      .toBeTruthy();
  });

  it('should open a dialog with a component and no ViewContainerRef', () => {
    let dialogRef = dialog.open(PizzaMsg);

    viewContainerFixture.detectChanges();

    expect(overlayContainerElement.textContent).toContain('Pizza');
    expect(dialogRef.componentInstance instanceof PizzaMsg).toBe(true);
    expect(dialogRef.componentInstance.dialogRef).toBe(dialogRef);

    viewContainerFixture.detectChanges();
    let dialogContainerElement = overlayContainerElement.querySelector('mat-dialog-container')!;
    expect(dialogContainerElement.getAttribute('role')).toBe('dialog');
  });

  it('should apply the configured role to the dialog element', () => {
    dialog.open(PizzaMsg, {role: 'alertdialog'});

    viewContainerFixture.detectChanges();

    let dialogContainerElement = overlayContainerElement.querySelector('mat-dialog-container')!;
    expect(dialogContainerElement.getAttribute('role')).toBe('alertdialog');
  });

  it('should apply the specified `aria-describedby`', () => {
    dialog.open(PizzaMsg, {ariaDescribedBy: 'description-element'});

    viewContainerFixture.detectChanges();

    let dialogContainerElement = overlayContainerElement.querySelector('mat-dialog-container')!;
    expect(dialogContainerElement.getAttribute('aria-describedby')).toBe('description-element');
  });

  it('should close a dialog and get back a result', fakeAsync(() => {
    let dialogRef = dialog.open(PizzaMsg, {viewContainerRef: testViewContainerRef});
    let afterCloseCallback = jasmine.createSpy('afterClose callback');

    dialogRef.afterClosed().subscribe(afterCloseCallback);
    dialogRef.close('Charmander');
    viewContainerFixture.detectChanges();
    flush();

    expect(afterCloseCallback).toHaveBeenCalledWith('Charmander');
    expect(overlayContainerElement.querySelector('mat-dialog-container')).toBeNull();
  }));

  it('should dispose of dialog if view container is destroyed while animating', fakeAsync(() => {
    const dialogRef = dialog.open(PizzaMsg, {viewContainerRef: testViewContainerRef});

    dialogRef.close();
    viewContainerFixture.detectChanges();
    viewContainerFixture.destroy();
    flush();

    expect(overlayContainerElement.querySelector('mat-dialog-container')).toBeNull();
  }));

  it(
    'should dispatch the beforeClosed and afterClosed events when the ' +
      'overlay is detached externally',
    fakeAsync(
      inject([Overlay], (overlay: Overlay) => {
        const dialogRef = dialog.open(PizzaMsg, {
          viewContainerRef: testViewContainerRef,
          scrollStrategy: overlay.scrollStrategies.close(),
        });
        const beforeClosedCallback = jasmine.createSpy('beforeClosed callback');
        const afterCloseCallback = jasmine.createSpy('afterClosed callback');

        dialogRef.beforeClosed().subscribe(beforeClosedCallback);
        dialogRef.afterClosed().subscribe(afterCloseCallback);

        scrolledSubject.next();
        viewContainerFixture.detectChanges();
        flush();

        expect(beforeClosedCallback).toHaveBeenCalledTimes(1);
        expect(afterCloseCallback).toHaveBeenCalledTimes(1);
      }),
    ),
  );

  it('should close a dialog and get back a result before it is closed', fakeAsync(() => {
    const dialogRef = dialog.open(PizzaMsg, {viewContainerRef: testViewContainerRef});

    flush();
    viewContainerFixture.detectChanges();

    // beforeClose should emit before dialog container is destroyed
    const beforeCloseHandler = jasmine.createSpy('beforeClose callback').and.callFake(() => {
      expect(overlayContainerElement.querySelector('mat-dialog-container'))
        .not.withContext('dialog container exists when beforeClose is called')
        .toBeNull();
    });

    dialogRef.beforeClosed().subscribe(beforeCloseHandler);
    dialogRef.close('Bulbasaur');
    viewContainerFixture.detectChanges();
    flush();

    expect(beforeCloseHandler).toHaveBeenCalledWith('Bulbasaur');
    expect(overlayContainerElement.querySelector('mat-dialog-container')).toBeNull();
  }));

  it('should close a dialog via the escape key', fakeAsync(() => {
    dialog.open(PizzaMsg, {viewContainerRef: testViewContainerRef});

    const event = dispatchKeyboardEvent(document.body, 'keydown', ESCAPE);
    viewContainerFixture.detectChanges();
    flush();

    expect(overlayContainerElement.querySelector('mat-dialog-container')).toBeNull();
    expect(event.defaultPrevented).toBe(true);
  }));

  it('should not close a dialog via the escape key with a modifier', fakeAsync(() => {
    dialog.open(PizzaMsg, {viewContainerRef: testViewContainerRef});

    const event = createKeyboardEvent('keydown', ESCAPE, undefined, {alt: true});
    dispatchEvent(document.body, event);
    viewContainerFixture.detectChanges();
    flush();

    expect(overlayContainerElement.querySelector('mat-dialog-container')).toBeTruthy();
    expect(event.defaultPrevented).toBe(false);
  }));

  it('should close from a ViewContainerRef with OnPush change detection', fakeAsync(() => {
    const onPushFixture = TestBed.createComponent(ComponentWithOnPushViewContainer);

    onPushFixture.detectChanges();

    const dialogRef = dialog.open(PizzaMsg, {
      viewContainerRef: onPushFixture.componentInstance.viewContainerRef,
    });

    flushMicrotasks();
    onPushFixture.detectChanges();
    flushMicrotasks();

    expect(overlayContainerElement.querySelectorAll('mat-dialog-container').length)
      .withContext('Expected one open dialog.')
      .toBe(1);

    dialogRef.close();
    flushMicrotasks();
    onPushFixture.detectChanges();
    tick(500);

    expect(overlayContainerElement.querySelectorAll('mat-dialog-container').length)
      .withContext('Expected no open dialogs.')
      .toBe(0);
  }));

  it('should close when clicking on the overlay backdrop', fakeAsync(() => {
    dialog.open(PizzaMsg, {viewContainerRef: testViewContainerRef});

    viewContainerFixture.detectChanges();

    let backdrop = overlayContainerElement.querySelector('.cdk-overlay-backdrop') as HTMLElement;

    backdrop.click();
    viewContainerFixture.detectChanges();
    flush();

    expect(overlayContainerElement.querySelector('mat-dialog-container')).toBeFalsy();
  }));

  it('should emit the backdropClick stream when clicking on the overlay backdrop', fakeAsync(() => {
    const dialogRef = dialog.open(PizzaMsg, {viewContainerRef: testViewContainerRef});

    const spy = jasmine.createSpy('backdropClick spy');
    dialogRef.backdropClick().subscribe(spy);

    viewContainerFixture.detectChanges();

    let backdrop = overlayContainerElement.querySelector('.cdk-overlay-backdrop') as HTMLElement;

    backdrop.click();
    expect(spy).toHaveBeenCalledTimes(1);

    viewContainerFixture.detectChanges();
    flush();

    // Additional clicks after the dialog has closed should not be emitted
    backdrop.click();
    expect(spy).toHaveBeenCalledTimes(1);
  }));

  it('should emit the keyboardEvent stream when key events target the overlay', fakeAsync(() => {
    const dialogRef = dialog.open(PizzaMsg, {viewContainerRef: testViewContainerRef});

    const spy = jasmine.createSpy('keyboardEvent spy');
    dialogRef.keydownEvents().subscribe(spy);

    viewContainerFixture.detectChanges();
    flush();

    let backdrop = overlayContainerElement.querySelector('.cdk-overlay-backdrop') as HTMLElement;
    let container = overlayContainerElement.querySelector('mat-dialog-container') as HTMLElement;
    dispatchKeyboardEvent(document.body, 'keydown', A);
    dispatchKeyboardEvent(backdrop, 'keydown', A);
    dispatchKeyboardEvent(container, 'keydown', A);

    expect(spy).toHaveBeenCalledTimes(3);
  }));

  it('should notify the observers if a dialog has been opened', () => {
    dialog.afterOpened.subscribe(ref => {
      expect(dialog.open(PizzaMsg, {viewContainerRef: testViewContainerRef})).toBe(ref);
    });
  });

  it('should notify the observers if all open dialogs have finished closing', fakeAsync(() => {
    const ref1 = dialog.open(PizzaMsg, {viewContainerRef: testViewContainerRef});
    const ref2 = dialog.open(ContentElementDialog, {viewContainerRef: testViewContainerRef});
    const spy = jasmine.createSpy('afterAllClosed spy');

    dialog.afterAllClosed.subscribe(spy);

    ref1.close();
    viewContainerFixture.detectChanges();
    flush();

    expect(spy).not.toHaveBeenCalled();

    ref2.close();
    viewContainerFixture.detectChanges();
    flush();
    expect(spy).toHaveBeenCalled();
  }));

  it('should emit the afterAllClosed stream on subscribe if there are no open dialogs', () => {
    const spy = jasmine.createSpy('afterAllClosed spy');

    dialog.afterAllClosed.subscribe(spy);

    expect(spy).toHaveBeenCalled();
  });

  it('should override the width of the overlay pane', () => {
    dialog.open(PizzaMsg, {width: '500px'});

    viewContainerFixture.detectChanges();

    let overlayPane = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;

    expect(overlayPane.style.width).toBe('500px');
  });

  it('should override the height of the overlay pane', () => {
    dialog.open(PizzaMsg, {height: '100px'});

    viewContainerFixture.detectChanges();

    let overlayPane = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;

    expect(overlayPane.style.height).toBe('100px');
  });

  it('should override the min-width of the overlay pane', () => {
    dialog.open(PizzaMsg, {minWidth: '500px'});

    viewContainerFixture.detectChanges();

    let overlayPane = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;

    expect(overlayPane.style.minWidth).toBe('500px');
  });

  it('should override the max-width of the overlay pane', fakeAsync(() => {
    let dialogRef = dialog.open(PizzaMsg);

    viewContainerFixture.detectChanges();

    let overlayPane = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;

    expect(overlayPane.style.maxWidth).toBe('');
    dialogRef.close();

    tick(500);
    viewContainerFixture.detectChanges();

    dialogRef = dialog.open(PizzaMsg, {maxWidth: '100px'});

    viewContainerFixture.detectChanges();
    flush();

    overlayPane = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;

    expect(overlayPane.style.maxWidth).toBe('100px');
  }));

  it('should override the min-height of the overlay pane', () => {
    dialog.open(PizzaMsg, {minHeight: '300px'});

    viewContainerFixture.detectChanges();

    let overlayPane = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;

    expect(overlayPane.style.minHeight).toBe('300px');
  });

  it('should override the max-height of the overlay pane', () => {
    dialog.open(PizzaMsg, {maxHeight: '100px'});

    viewContainerFixture.detectChanges();

    let overlayPane = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;

    expect(overlayPane.style.maxHeight).toBe('100px');
  });

  it('should override the top offset of the overlay pane', () => {
    dialog.open(PizzaMsg, {position: {top: '100px'}});

    viewContainerFixture.detectChanges();

    let overlayPane = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;

    expect(overlayPane.style.marginTop).toBe('100px');
  });

  it('should override the bottom offset of the overlay pane', () => {
    dialog.open(PizzaMsg, {position: {bottom: '200px'}});

    viewContainerFixture.detectChanges();

    let overlayPane = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;

    expect(overlayPane.style.marginBottom).toBe('200px');
  });

  it('should override the left offset of the overlay pane', () => {
    dialog.open(PizzaMsg, {position: {left: '250px'}});

    viewContainerFixture.detectChanges();

    let overlayPane = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;

    expect(overlayPane.style.marginLeft).toBe('250px');
  });

  it('should override the right offset of the overlay pane', () => {
    dialog.open(PizzaMsg, {position: {right: '125px'}});

    viewContainerFixture.detectChanges();

    let overlayPane = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;

    expect(overlayPane.style.marginRight).toBe('125px');
  });

  it('should allow for the position to be updated', () => {
    let dialogRef = dialog.open(PizzaMsg, {position: {left: '250px'}});

    viewContainerFixture.detectChanges();

    let overlayPane = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;

    expect(overlayPane.style.marginLeft).toBe('250px');

    dialogRef.updatePosition({left: '500px'});

    expect(overlayPane.style.marginLeft).toBe('500px');
  });

  it('should allow for the dimensions to be updated', () => {
    let dialogRef = dialog.open(PizzaMsg, {width: '100px'});

    viewContainerFixture.detectChanges();

    let overlayPane = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;

    expect(overlayPane.style.width).toBe('100px');

    dialogRef.updateSize('200px');

    expect(overlayPane.style.width).toBe('200px');
  });

  it('should reset the overlay dimensions to their initial size', () => {
    let dialogRef = dialog.open(PizzaMsg);

    viewContainerFixture.detectChanges();

    let overlayPane = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;

    expect(overlayPane.style.width).toBeFalsy();
    expect(overlayPane.style.height).toBeFalsy();

    dialogRef.updateSize('200px', '200px');

    expect(overlayPane.style.width).toBe('200px');
    expect(overlayPane.style.height).toBe('200px');

    dialogRef.updateSize();

    expect(overlayPane.style.width).toBeFalsy();
    expect(overlayPane.style.height).toBeFalsy();
  });

  it('should allow setting the layout direction', () => {
    dialog.open(PizzaMsg, {direction: 'rtl'});

    viewContainerFixture.detectChanges();

    let overlayPane = overlayContainerElement.querySelector('.cdk-global-overlay-wrapper')!;

    expect(overlayPane.getAttribute('dir')).toBe('rtl');
  });

  it('should inject the correct layout direction in the component instance', () => {
    const dialogRef = dialog.open(PizzaMsg, {direction: 'rtl'});

    viewContainerFixture.detectChanges();

    expect(dialogRef.componentInstance.directionality.value).toBe('rtl');
  });

  it('should fall back to injecting the global direction if none is passed by the config', () => {
    const dialogRef = dialog.open(PizzaMsg, {});

    viewContainerFixture.detectChanges();

    expect(dialogRef.componentInstance.directionality.value).toBe('ltr');
  });

  it('should use the passed in ViewContainerRef from the config', fakeAsync(() => {
    const dialogRef = dialog.open(PizzaMsg, {viewContainerRef: testViewContainerRef});
    viewContainerFixture.detectChanges();
    flush();

    // One view ref is for the container and one more for the component with the content.
    expect(testViewContainerRef.length).toBe(2);

    dialogRef.close();
    viewContainerFixture.detectChanges();
    flush();

    expect(testViewContainerRef.length).toBe(0);
  }));

  it('should close all of the dialogs', fakeAsync(() => {
    dialog.open(PizzaMsg);
    dialog.open(PizzaMsg);
    dialog.open(PizzaMsg);

    expect(overlayContainerElement.querySelectorAll('mat-dialog-container').length).toBe(3);

    dialog.closeAll();
    viewContainerFixture.detectChanges();
    flush();

    expect(overlayContainerElement.querySelectorAll('mat-dialog-container').length).toBe(0);
  }));

  it('should close all dialogs when the user goes forwards/backwards in history', fakeAsync(() => {
    dialog.open(PizzaMsg);
    dialog.open(PizzaMsg);

    expect(overlayContainerElement.querySelectorAll('mat-dialog-container').length).toBe(2);

    mockLocation.simulateUrlPop('');
    viewContainerFixture.detectChanges();
    flush();

    expect(overlayContainerElement.querySelectorAll('mat-dialog-container').length).toBe(0);
  }));

  it('should close all open dialogs when the location hash changes', fakeAsync(() => {
    dialog.open(PizzaMsg);
    dialog.open(PizzaMsg);

    expect(overlayContainerElement.querySelectorAll('mat-dialog-container').length).toBe(2);

    mockLocation.simulateHashChange('');
    viewContainerFixture.detectChanges();
    flush();

    expect(overlayContainerElement.querySelectorAll('mat-dialog-container').length).toBe(0);
  }));

  it('should close all of the dialogs when the injectable is destroyed', fakeAsync(() => {
    dialog.open(PizzaMsg);
    dialog.open(PizzaMsg);
    dialog.open(PizzaMsg);

    expect(overlayContainerElement.querySelectorAll('mat-dialog-container').length).toBe(3);

    dialog.ngOnDestroy();
    viewContainerFixture.detectChanges();
    flush();

    expect(overlayContainerElement.querySelectorAll('mat-dialog-container').length).toBe(0);
  }));

  it('should complete open and close streams when the injectable is destroyed', fakeAsync(() => {
    const afterOpenedSpy = jasmine.createSpy('after opened spy');
    const afterAllClosedSpy = jasmine.createSpy('after all closed spy');
    const afterOpenedSubscription = dialog.afterOpened.subscribe({complete: afterOpenedSpy});
    const afterAllClosedSubscription = dialog.afterAllClosed.subscribe({
      complete: afterAllClosedSpy,
    });

    dialog.ngOnDestroy();

    expect(afterOpenedSpy).toHaveBeenCalled();
    expect(afterAllClosedSpy).toHaveBeenCalled();

    afterOpenedSubscription.unsubscribe();
    afterAllClosedSubscription.unsubscribe();
  }));

  it('should allow the consumer to disable closing a dialog on navigation', fakeAsync(() => {
    dialog.open(PizzaMsg);
    dialog.open(PizzaMsg, {closeOnNavigation: false});

    expect(overlayContainerElement.querySelectorAll('mat-dialog-container').length).toBe(2);

    mockLocation.simulateUrlPop('');
    viewContainerFixture.detectChanges();
    flush();

    expect(overlayContainerElement.querySelectorAll('mat-dialog-container').length).toBe(1);
  }));

  it('should have the componentInstance available in the afterClosed callback', fakeAsync(() => {
    let dialogRef = dialog.open(PizzaMsg);
    let spy = jasmine.createSpy('afterClosed spy');

    flushMicrotasks();
    viewContainerFixture.detectChanges();
    flushMicrotasks();

    dialogRef.afterClosed().subscribe(() => {
      spy();
      expect(dialogRef.componentInstance)
        .withContext('Expected component instance to be defined.')
        .toBeTruthy();
    });

    dialogRef.close();

    flushMicrotasks();
    viewContainerFixture.detectChanges();
    tick(500);

    // Ensure that the callback actually fires.
    expect(spy).toHaveBeenCalled();
  }));

  it('should be able to attach a custom scroll strategy', fakeAsync(() => {
    const scrollStrategy: ScrollStrategy = {
      attach: () => {},
      enable: jasmine.createSpy('scroll strategy enable spy'),
      disable: () => {},
    };

    dialog.open(PizzaMsg, {scrollStrategy});
    flush();
    expect(scrollStrategy.enable).toHaveBeenCalled();
  }));

  it('should be able to pass in an alternate ComponentFactoryResolver', inject(
    [ComponentFactoryResolver],
    (resolver: ComponentFactoryResolver) => {
      spyOn(resolver, 'resolveComponentFactory').and.callThrough();

      dialog.open(PizzaMsg, {
        viewContainerRef: testViewContainerRef,
        componentFactoryResolver: resolver,
      });
      viewContainerFixture.detectChanges();

      expect(resolver.resolveComponentFactory).toHaveBeenCalled();
    },
  ));

  describe('passing in data', () => {
    it('should be able to pass in data', () => {
      let config = {data: {stringParam: 'hello', dateParam: new Date()}};

      let instance = dialog.open(DialogWithInjectedData, config).componentInstance;

      expect(instance.data.stringParam).toBe(config.data.stringParam);
      expect(instance.data.dateParam).toBe(config.data.dateParam);
    });

    it('should default to null if no data is passed', () => {
      expect(() => {
        let dialogRef = dialog.open(DialogWithInjectedData);
        expect(dialogRef.componentInstance.data).toBeNull();
      }).not.toThrow();
    });
  });

  it('should not keep a reference to the component after the dialog is closed', fakeAsync(() => {
    let dialogRef = dialog.open(PizzaMsg);

    expect(dialogRef.componentInstance).toBeTruthy();

    dialogRef.close();
    viewContainerFixture.detectChanges();
    flush();

    expect(dialogRef.componentInstance)
      .withContext('Expected reference to have been cleared.')
      .toBeFalsy();
  }));

  it('should assign a unique id to each dialog', fakeAsync(() => {
    const one = dialog.open(PizzaMsg);
    const two = dialog.open(PizzaMsg);
    flush();

    expect(one.id).toBeTruthy();
    expect(two.id).toBeTruthy();
    expect(one.id).not.toBe(two.id);
  }));

  it('should allow for the id to be overwritten', () => {
    const dialogRef = dialog.open(PizzaMsg, {id: 'pizza'});
    expect(dialogRef.id).toBe('pizza');
  });

  it('should throw when trying to open a dialog with the same id as another dialog', () => {
    dialog.open(PizzaMsg, {id: 'pizza'});
    expect(() => dialog.open(PizzaMsg, {id: 'pizza'})).toThrowError(/must be unique/g);
  });

  it('should be able to find a dialog by id', () => {
    const dialogRef = dialog.open(PizzaMsg, {id: 'pizza'});
    expect(dialog.getDialogById('pizza')).toBe(dialogRef);
  });

  it('should toggle `aria-hidden` on the overlay container siblings', fakeAsync(() => {
    const sibling = document.createElement('div');
    overlayContainerElement.parentNode!.appendChild(sibling);

    const dialogRef = dialog.open(PizzaMsg, {viewContainerRef: testViewContainerRef});
    viewContainerFixture.detectChanges();
    flush();

    expect(sibling.getAttribute('aria-hidden'))
      .withContext('Expected sibling to be hidden')
      .toBe('true');
    expect(overlayContainerElement.hasAttribute('aria-hidden'))
      .withContext('Expected overlay container not to be hidden.')
      .toBe(false);

    dialogRef.close();
    viewContainerFixture.detectChanges();
    flush();

    expect(sibling.hasAttribute('aria-hidden'))
      .withContext('Expected sibling to no longer be hidden.')
      .toBe(false);
    sibling.remove();
  }));

  it('should restore `aria-hidden` to the overlay container siblings on close', fakeAsync(() => {
    const sibling = document.createElement('div');

    sibling.setAttribute('aria-hidden', 'true');
    overlayContainerElement.parentNode!.appendChild(sibling);

    const dialogRef = dialog.open(PizzaMsg, {viewContainerRef: testViewContainerRef});
    viewContainerFixture.detectChanges();
    flush();

    expect(sibling.getAttribute('aria-hidden'))
      .withContext('Expected sibling to be hidden.')
      .toBe('true');

    dialogRef.close();
    viewContainerFixture.detectChanges();
    flush();

    expect(sibling.getAttribute('aria-hidden'))
      .withContext('Expected sibling to remain hidden.')
      .toBe('true');
    sibling.remove();
  }));

  it('should not set `aria-hidden` on `aria-live` elements', fakeAsync(() => {
    const sibling = document.createElement('div');

    sibling.setAttribute('aria-live', 'polite');
    overlayContainerElement.parentNode!.appendChild(sibling);

    dialog.open(PizzaMsg, {viewContainerRef: testViewContainerRef});
    viewContainerFixture.detectChanges();
    flush();

    expect(sibling.hasAttribute('aria-hidden'))
      .withContext('Expected live element not to be hidden.')
      .toBe(false);
    sibling.remove();
  }));

  it('should add and remove classes while open', () => {
    let dialogRef = dialog.open(PizzaMsg, {
      disableClose: true,
      viewContainerRef: testViewContainerRef,
    });

    const pane = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;
    expect(pane.classList).not.toContain(
      'custom-class-one',
      'Expected class to be initially missing',
    );

    dialogRef.addPanelClass('custom-class-one');
    expect(pane.classList).withContext('Expected class to be added').toContain('custom-class-one');

    dialogRef.removePanelClass('custom-class-one');
    expect(pane.classList).not.toContain('custom-class-one', 'Expected class to be removed');
  });

  describe('disableClose option', () => {
    it('should prevent closing via clicks on the backdrop', fakeAsync(() => {
      dialog.open(PizzaMsg, {disableClose: true, viewContainerRef: testViewContainerRef});

      viewContainerFixture.detectChanges();

      let backdrop = overlayContainerElement.querySelector('.cdk-overlay-backdrop') as HTMLElement;
      backdrop.click();
      viewContainerFixture.detectChanges();
      flush();

      expect(overlayContainerElement.querySelector('mat-dialog-container')).toBeTruthy();
    }));

    it('should prevent closing via the escape key', fakeAsync(() => {
      dialog.open(PizzaMsg, {disableClose: true, viewContainerRef: testViewContainerRef});

      viewContainerFixture.detectChanges();
      dispatchKeyboardEvent(document.body, 'keydown', ESCAPE);
      viewContainerFixture.detectChanges();
      flush();

      expect(overlayContainerElement.querySelector('mat-dialog-container')).toBeTruthy();
    }));

    it('should allow for the disableClose option to be updated while open', fakeAsync(() => {
      let dialogRef = dialog.open(PizzaMsg, {
        disableClose: true,
        viewContainerRef: testViewContainerRef,
      });

      viewContainerFixture.detectChanges();

      let backdrop = overlayContainerElement.querySelector('.cdk-overlay-backdrop') as HTMLElement;
      backdrop.click();

      expect(overlayContainerElement.querySelector('mat-dialog-container')).toBeTruthy();

      dialogRef.disableClose = false;
      backdrop.click();
      viewContainerFixture.detectChanges();
      flush();

      expect(overlayContainerElement.querySelector('mat-dialog-container')).toBeFalsy();
    }));

    it('should recapture focus when clicking on the backdrop', fakeAsync(() => {
      dialog.open(PizzaMsg, {disableClose: true, viewContainerRef: testViewContainerRef});

      viewContainerFixture.detectChanges();
      flush();
      viewContainerFixture.detectChanges();
      flush();

      let backdrop = overlayContainerElement.querySelector('.cdk-overlay-backdrop') as HTMLElement;
      let input = overlayContainerElement.querySelector('input') as HTMLInputElement;

      expect(document.activeElement)
        .withContext('Expected input to be focused on open')
        .toBe(input);

      input.blur(); // Programmatic clicks might not move focus so we simulate it.
      backdrop.click();
      viewContainerFixture.detectChanges();
      flush();

      expect(document.activeElement)
        .withContext('Expected input to stay focused after click')
        .toBe(input);
    }));

    it(
      'should recapture focus to the first tabbable element when clicking on the backdrop with ' +
        'autoFocus set to "first-tabbable" (the default)',
      fakeAsync(() => {
        dialog.open(PizzaMsg, {
          disableClose: true,
          viewContainerRef: testViewContainerRef,
        });

        viewContainerFixture.detectChanges();
        flush();
        viewContainerFixture.detectChanges();
        flush();

        let backdrop = overlayContainerElement.querySelector(
          '.cdk-overlay-backdrop',
        ) as HTMLElement;
        let input = overlayContainerElement.querySelector('input') as HTMLInputElement;

        expect(document.activeElement)
          .withContext('Expected input to be focused on open')
          .toBe(input);

        input.blur(); // Programmatic clicks might not move focus so we simulate it.
        backdrop.click();
        viewContainerFixture.detectChanges();
        flush();

        expect(document.activeElement)
          .withContext('Expected input to stay focused after click')
          .toBe(input);
      }),
    );

    it(
      'should recapture focus to the container when clicking on the backdrop with ' +
        'autoFocus set to "dialog"',
      fakeAsync(() => {
        dialog.open(PizzaMsg, {
          disableClose: true,
          viewContainerRef: testViewContainerRef,
          autoFocus: 'dialog',
        });

        viewContainerFixture.detectChanges();
        flush();
        viewContainerFixture.detectChanges();

        let backdrop = overlayContainerElement.querySelector(
          '.cdk-overlay-backdrop',
        ) as HTMLElement;
        let container = overlayContainerElement.querySelector(
          '.mat-mdc-dialog-container',
        ) as HTMLInputElement;

        expect(document.activeElement)
          .withContext('Expected container to be focused on open')
          .toBe(container);

        container.blur(); // Programmatic clicks might not move focus so we simulate it.
        backdrop.click();
        viewContainerFixture.detectChanges();
        flush();

        expect(document.activeElement)
          .withContext('Expected container to stay focused after click')
          .toBe(container);
      }),
    );
  });

  it(
    'should recapture focus to the first header when clicking on the backdrop with ' +
      'autoFocus set to "first-heading"',
    fakeAsync(() => {
      dialog.open(ContentElementDialog, {
        disableClose: true,
        viewContainerRef: testViewContainerRef,
        autoFocus: 'first-heading',
      });

      flush();
      viewContainerFixture.detectChanges();

      let backdrop = overlayContainerElement.querySelector('.cdk-overlay-backdrop') as HTMLElement;
      let firstHeader = overlayContainerElement.querySelector(
        '.mat-mdc-dialog-title[tabindex="-1"]',
      ) as HTMLInputElement;

      expect(document.activeElement)
        .withContext('Expected first header to be focused on open')
        .toBe(firstHeader);

      firstHeader.blur(); // Programmatic clicks might not move focus so we simulate it.
      backdrop.click();
      viewContainerFixture.detectChanges();
      flush();

      expect(document.activeElement)
        .withContext('Expected first header to stay focused after click')
        .toBe(firstHeader);
    }),
  );

  it(
    'should recapture focus to the first element that matches the css selector when ' +
      'clicking on the backdrop with autoFocus set to a css selector',
    fakeAsync(() => {
      dialog.open(ContentElementDialog, {
        disableClose: true,
        viewContainerRef: testViewContainerRef,
        autoFocus: 'button',
      });

      flush();
      viewContainerFixture.detectChanges();

      let backdrop = overlayContainerElement.querySelector('.cdk-overlay-backdrop') as HTMLElement;
      let firstButton = overlayContainerElement.querySelector(
        '[mat-dialog-close]',
      ) as HTMLInputElement;

      expect(document.activeElement)
        .withContext('Expected first button to be focused on open')
        .toBe(firstButton);

      firstButton.blur(); // Programmatic clicks might not move focus so we simulate it.
      backdrop.click();
      viewContainerFixture.detectChanges();
      flush();

      expect(document.activeElement)
        .withContext('Expected first button to stay focused after click')
        .toBe(firstButton);
    }),
  );

  describe('hasBackdrop option', () => {
    it('should have a backdrop', () => {
      dialog.open(PizzaMsg, {hasBackdrop: true, viewContainerRef: testViewContainerRef});

      viewContainerFixture.detectChanges();

      expect(overlayContainerElement.querySelector('.cdk-overlay-backdrop')).toBeTruthy();
    });

    it('should not have a backdrop', () => {
      dialog.open(PizzaMsg, {hasBackdrop: false, viewContainerRef: testViewContainerRef});

      viewContainerFixture.detectChanges();

      expect(overlayContainerElement.querySelector('.cdk-overlay-backdrop')).toBeFalsy();
    });
  });

  describe('panelClass option', () => {
    it('should have custom panel class', () => {
      dialog.open(PizzaMsg, {
        panelClass: 'custom-panel-class',
        viewContainerRef: testViewContainerRef,
      });

      viewContainerFixture.detectChanges();

      expect(overlayContainerElement.querySelector('.custom-panel-class')).toBeTruthy();
    });
  });

  describe('backdropClass option', () => {
    it('should have default backdrop class', () => {
      dialog.open(PizzaMsg, {backdropClass: '', viewContainerRef: testViewContainerRef});

      viewContainerFixture.detectChanges();

      expect(overlayContainerElement.querySelector('.cdk-overlay-dark-backdrop')).toBeTruthy();
    });

    it('should have custom backdrop class', () => {
      dialog.open(PizzaMsg, {
        backdropClass: 'custom-backdrop-class',
        viewContainerRef: testViewContainerRef,
      });

      viewContainerFixture.detectChanges();

      expect(overlayContainerElement.querySelector('.custom-backdrop-class')).toBeTruthy();
    });
  });

  describe('focus management', () => {
    // When testing focus, all of the elements must be in the DOM.
    beforeEach(() => document.body.appendChild(overlayContainerElement));
    afterEach(() => overlayContainerElement.remove());

    it('should focus the first tabbable element of the dialog on open (the default)', fakeAsync(() => {
      dialog.open(PizzaMsg, {viewContainerRef: testViewContainerRef});

      viewContainerFixture.detectChanges();
      flush();
      viewContainerFixture.detectChanges();
      flush();

      expect(document.activeElement!.tagName)
        .withContext('Expected first tabbable element (input) in the dialog to be focused.')
        .toBe('INPUT');
    }));

    it('should focus the dialog element on open', fakeAsync(() => {
      dialog.open(PizzaMsg, {
        viewContainerRef: testViewContainerRef,
        autoFocus: 'dialog',
      });

      viewContainerFixture.detectChanges();
      flush();
      viewContainerFixture.detectChanges();

      let container = overlayContainerElement.querySelector(
        '.mat-mdc-dialog-container',
      ) as HTMLInputElement;

      expect(document.activeElement)
        .withContext('Expected container to be focused on open')
        .toBe(container);
    }));

    it('should focus the first header element on open', fakeAsync(() => {
      dialog.open(ContentElementDialog, {
        viewContainerRef: testViewContainerRef,
        autoFocus: 'first-heading',
      });

      flush();
      viewContainerFixture.detectChanges();

      let firstHeader = overlayContainerElement.querySelector(
        'h2[tabindex="-1"]',
      ) as HTMLInputElement;

      expect(document.activeElement)
        .withContext('Expected first header to be focused on open')
        .toBe(firstHeader);
    }));

    it('should focus the first element that matches the css selector from autoFocus on open', fakeAsync(() => {
      dialog.open(PizzaMsg, {
        viewContainerRef: testViewContainerRef,
        autoFocus: 'p',
      });

      viewContainerFixture.detectChanges();
      flush();
      viewContainerFixture.detectChanges();

      let firstParagraph = overlayContainerElement.querySelector(
        'p[tabindex="-1"]',
      ) as HTMLInputElement;

      expect(document.activeElement)
        .withContext('Expected first paragraph to be focused on open')
        .toBe(firstParagraph);
    }));

    it('should attach the focus trap even if automatic focus is disabled', fakeAsync(() => {
      dialog.open(PizzaMsg, {
        viewContainerRef: testViewContainerRef,
        autoFocus: 'false',
      });

      viewContainerFixture.detectChanges();
      flushMicrotasks();

      expect(
        overlayContainerElement.querySelectorAll('.cdk-focus-trap-anchor').length,
      ).toBeGreaterThan(0);
    }));

    it('should re-focus trigger element when dialog closes', fakeAsync(() => {
      // Create a element that has focus before the dialog is opened.
      let button = document.createElement('button');
      button.id = 'dialog-trigger';
      document.body.appendChild(button);
      button.focus();

      const dialogRef = dialog.open(PizzaMsg, {viewContainerRef: testViewContainerRef});

      flush();
      viewContainerFixture.detectChanges();

      expect(document.activeElement!.id).not.toBe(
        'dialog-trigger',
        'Expected the focus to change when dialog was opened.',
      );

      dialogRef.close();
      expect(document.activeElement!.id).not.toBe(
        'dialog-trigger',
        'Expected the focus not to have changed before the animation finishes.',
      );

      viewContainerFixture.detectChanges();
      tick(500);

      expect(document.activeElement!.id)
        .withContext('Expected that the trigger was refocused after the dialog is closed.')
        .toBe('dialog-trigger');

      button.remove();
    }));

    it('should re-focus trigger element inside the shadow DOM when dialog closes', fakeAsync(() => {
      if (!_supportsShadowDom()) {
        return;
      }

      viewContainerFixture.destroy();
      const fixture = TestBed.createComponent(ShadowDomComponent);
      fixture.detectChanges();
      flush();
      const button = fixture.debugElement.query(By.css('button'))!.nativeElement;

      button.focus();

      const dialogRef = dialog.open(PizzaMsg);
      fixture.detectChanges();
      flush();

      const spy = spyOn(button, 'focus').and.callThrough();
      dialogRef.close();
      fixture.detectChanges();
      tick(500);

      expect(spy).toHaveBeenCalled();
    }));

    it('should re-focus the trigger via keyboard when closed via escape key', fakeAsync(() => {
      const button = document.createElement('button');
      let lastFocusOrigin: FocusOrigin = null;

      focusMonitor.monitor(button, false).subscribe(focusOrigin => (lastFocusOrigin = focusOrigin));

      document.body.appendChild(button);
      button.focus();

      // Patch the element focus after the initial and real focus, because otherwise the
      // `activeElement` won't be set, and the dialog won't be able to restore focus to an
      // element.
      patchElementFocus(button);

      dialog.open(PizzaMsg, {viewContainerRef: testViewContainerRef});

      tick(500);
      viewContainerFixture.detectChanges();
      flushMicrotasks();
      expect(lastFocusOrigin!).withContext('Expected the trigger button to be blurred').toBeNull();

      dispatchKeyboardEvent(document.body, 'keydown', ESCAPE);

      flushMicrotasks();
      viewContainerFixture.detectChanges();
      tick(500);

      expect(lastFocusOrigin!)
        .withContext('Expected the trigger button to be focused via keyboard')
        .toBe('keyboard');

      focusMonitor.stopMonitoring(button);
      button.remove();
    }));

    it('should re-focus the trigger via mouse when backdrop has been clicked', fakeAsync(() => {
      const button = document.createElement('button');
      let lastFocusOrigin: FocusOrigin = null;

      focusMonitor.monitor(button, false).subscribe(focusOrigin => (lastFocusOrigin = focusOrigin));

      document.body.appendChild(button);
      button.focus();

      // Patch the element focus after the initial and real focus, because otherwise the
      // `activeElement` won't be set, and the dialog won't be able to restore focus to an
      // element.
      patchElementFocus(button);

      dialog.open(PizzaMsg, {viewContainerRef: testViewContainerRef});

      tick(500);
      viewContainerFixture.detectChanges();
      flushMicrotasks();
      expect(lastFocusOrigin!).withContext('Expected the trigger button to be blurred').toBeNull();

      const backdrop = overlayContainerElement.querySelector(
        '.cdk-overlay-backdrop',
      ) as HTMLElement;

      backdrop.click();
      viewContainerFixture.detectChanges();
      tick(500);

      expect(lastFocusOrigin!)
        .withContext('Expected the trigger button to be focused via mouse')
        .toBe('mouse');

      focusMonitor.stopMonitoring(button);
      button.remove();
    }));

    it('should re-focus via keyboard if the close button has been triggered through keyboard', fakeAsync(() => {
      const button = document.createElement('button');
      let lastFocusOrigin: FocusOrigin = null;

      focusMonitor.monitor(button, false).subscribe(focusOrigin => (lastFocusOrigin = focusOrigin));

      document.body.appendChild(button);
      button.focus();

      // Patch the element focus after the initial and real focus, because otherwise the
      // `activeElement` won't be set, and the dialog won't be able to restore focus to an
      // element.
      patchElementFocus(button);

      dialog.open(ContentElementDialog, {viewContainerRef: testViewContainerRef});

      tick(500);
      viewContainerFixture.detectChanges();
      flushMicrotasks();
      expect(lastFocusOrigin!).withContext('Expected the trigger button to be blurred').toBeNull();

      const closeButton = overlayContainerElement.querySelector(
        'button[mat-dialog-close]',
      ) as HTMLElement;

      // Fake the behavior of pressing the SPACE key on a button element. Browsers fire a `click`
      // event with a MouseEvent, which has coordinates that are out of the element boundaries.
      dispatchMouseEvent(closeButton, 'click', 0, 0);

      viewContainerFixture.detectChanges();
      tick(500);

      expect(lastFocusOrigin!)
        .withContext('Expected the trigger button to be focused via keyboard')
        .toBe('keyboard');

      focusMonitor.stopMonitoring(button);
      button.remove();
    }));

    it('should re-focus via mouse if the close button has been clicked', fakeAsync(() => {
      const button = document.createElement('button');
      let lastFocusOrigin: FocusOrigin = null;

      focusMonitor.monitor(button, false).subscribe(focusOrigin => (lastFocusOrigin = focusOrigin));

      document.body.appendChild(button);
      button.focus();

      // Patch the element focus after the initial and real focus, because otherwise the
      // `activeElement` won't be set, and the dialog won't be able to restore focus to an
      // element.
      patchElementFocus(button);

      dialog.open(ContentElementDialog, {viewContainerRef: testViewContainerRef});

      tick(500);
      viewContainerFixture.detectChanges();
      flushMicrotasks();
      expect(lastFocusOrigin!).withContext('Expected the trigger button to be blurred').toBeNull();

      const closeButton = overlayContainerElement.querySelector(
        'button[mat-dialog-close]',
      ) as HTMLElement;

      // The dialog close button detects the focus origin by inspecting the click event. If
      // coordinates of the click are not present, it assumes that the click has been triggered
      // by keyboard.
      dispatchMouseEvent(closeButton, 'click', 10, 10);

      viewContainerFixture.detectChanges();
      tick(500);

      expect(lastFocusOrigin!)
        .withContext('Expected the trigger button to be focused via mouse')
        .toBe('mouse');

      focusMonitor.stopMonitoring(button);
      button.remove();
    }));

    it('should allow the consumer to shift focus in afterClosed', fakeAsync(() => {
      // Create a element that has focus before the dialog is opened.
      let button = document.createElement('button');
      let input = document.createElement('input');

      button.id = 'dialog-trigger';
      input.id = 'input-to-be-focused';

      document.body.appendChild(button);
      document.body.appendChild(input);
      button.focus();

      let dialogRef = dialog.open(PizzaMsg, {viewContainerRef: testViewContainerRef});

      tick(500);
      viewContainerFixture.detectChanges();

      dialogRef.afterClosed().subscribe(() => input.focus());
      dialogRef.close();

      tick(500);
      viewContainerFixture.detectChanges();
      flush();

      expect(document.activeElement!.id)
        .withContext('Expected that the trigger was refocused after the dialog is closed.')
        .toBe('input-to-be-focused');

      button.remove();
      input.remove();
      flush();
    }));

    it('should move focus to the container if there are no focusable elements in the dialog', fakeAsync(() => {
      dialog.open(DialogWithoutFocusableElements);

      viewContainerFixture.detectChanges();
      flush();
      viewContainerFixture.detectChanges();
      flush();

      expect(document.activeElement!.tagName)
        .withContext('Expected dialog container to be focused.')
        .toBe('MAT-DIALOG-CONTAINER');
    }));

    it('should be able to disable focus restoration', fakeAsync(() => {
      // Create a element that has focus before the dialog is opened.
      const button = document.createElement('button');
      button.id = 'dialog-trigger';
      document.body.appendChild(button);
      button.focus();

      const dialogRef = dialog.open(PizzaMsg, {
        viewContainerRef: testViewContainerRef,
        restoreFocus: false,
      });

      flush();
      viewContainerFixture.detectChanges();

      expect(document.activeElement!.id).not.toBe(
        'dialog-trigger',
        'Expected the focus to change when dialog was opened.',
      );

      dialogRef.close();
      viewContainerFixture.detectChanges();
      tick(500);

      expect(document.activeElement!.id).not.toBe(
        'dialog-trigger',
        'Expected focus not to have been restored.',
      );

      button.remove();
    }));

    it('should not move focus if it was moved outside the dialog while animating', fakeAsync(() => {
      // Create a element that has focus before the dialog is opened.
      const button = document.createElement('button');
      const otherButton = document.createElement('button');
      const body = document.body;
      button.id = 'dialog-trigger';
      otherButton.id = 'other-button';
      body.appendChild(button);
      body.appendChild(otherButton);
      button.focus();

      const dialogRef = dialog.open(PizzaMsg, {viewContainerRef: testViewContainerRef});

      flush();
      viewContainerFixture.detectChanges();

      expect(document.activeElement!.id).not.toBe(
        'dialog-trigger',
        'Expected the focus to change when dialog was opened.',
      );

      // Start the closing sequence and move focus out of dialog.
      dialogRef.close();
      otherButton.focus();

      expect(document.activeElement!.id)
        .withContext('Expected focus to be on the alternate button.')
        .toBe('other-button');

      viewContainerFixture.detectChanges();
      flush();

      expect(document.activeElement!.id)
        .withContext('Expected focus to stay on the alternate button.')
        .toBe('other-button');

      button.remove();
      otherButton.remove();
    }));
  });

  describe('dialog content elements', () => {
    let dialogRef: MatDialogRef<any>;
    let hostInstance: ContentElementDialog | ComponentWithContentElementTemplateRef;

    describe('inside component dialog', () => {
      beforeEach(fakeAsync(() => {
        dialogRef = dialog.open(ContentElementDialog, {viewContainerRef: testViewContainerRef});
        viewContainerFixture.detectChanges();
        flush();
        hostInstance = dialogRef.componentInstance;
      }));

      runContentElementTests();
    });

    describe('inside template portal', () => {
      beforeEach(fakeAsync(() => {
        const fixture = TestBed.createComponent(ComponentWithContentElementTemplateRef);
        fixture.detectChanges();

        dialogRef = dialog.open(fixture.componentInstance.templateRef, {
          viewContainerRef: testViewContainerRef,
        });

        viewContainerFixture.detectChanges();
        flush();
        hostInstance = fixture.componentInstance;
      }));

      runContentElementTests();
    });

    it('should set the aria-labelledby attribute to the id of the title under OnPush host', fakeAsync(() => {
      @Component({
        standalone: true,
        imports: [MatDialogTitle],
        template: `@if (showTitle()) { <h2 mat-dialog-title>This is the first title</h2> }`,
      })
      class DialogCmp {
        showTitle = signal(true);
      }

      @Component({
        template: '',
        selector: 'child',
        standalone: true,
      })
      class Child {
        dialogRef?: MatDialogRef<DialogCmp>;

        constructor(
          readonly viewContainerRef: ViewContainerRef,
          readonly dialog: MatDialog,
        ) {}

        open() {
          this.dialogRef = this.dialog.open(DialogCmp, {viewContainerRef: this.viewContainerRef});
        }
      }

      @Component({
        standalone: true,
        imports: [Child],
        template: `<child></child>`,
        changeDetection: ChangeDetectionStrategy.OnPush,
      })
      class OnPushHost {
        @ViewChild(Child, {static: true}) child: Child;
      }

      const hostFixture = TestBed.createComponent(OnPushHost);
      hostFixture.componentInstance.child.open();
      hostFixture.detectChanges();
      flush();
      hostFixture.detectChanges();

      const overlayContainer = TestBed.inject(OverlayContainer);
      const title = overlayContainer.getContainerElement().querySelector('[mat-dialog-title]')!;
      const container = overlayContainerElement.querySelector('mat-dialog-container')!;

      expect(title.id).withContext('Expected title element to have an id.').toBeTruthy();
      expect(container.getAttribute('aria-labelledby'))
        .withContext('Expected the aria-labelledby to match the title id.')
        .toBe(title.id);

      hostFixture.componentInstance.child.dialogRef?.componentInstance.showTitle.set(false);
      hostFixture.detectChanges();
      flush();
      hostFixture.detectChanges();
      expect(container.getAttribute('aria-labelledby')).toBe(null);
    }));

    function runContentElementTests() {
      it('should close the dialog when clicking on the close button', fakeAsync(() => {
        expect(overlayContainerElement.querySelectorAll('.mat-mdc-dialog-container').length).toBe(
          1,
        );

        (overlayContainerElement.querySelector('button[mat-dialog-close]') as HTMLElement).click();
        viewContainerFixture.detectChanges();
        flush();

        expect(overlayContainerElement.querySelectorAll('.mat-mdc-dialog-container').length).toBe(
          0,
        );
      }));

      it('should not close if [mat-dialog-close] is applied on a non-button node', () => {
        expect(overlayContainerElement.querySelectorAll('.mat-mdc-dialog-container').length).toBe(
          1,
        );

        (overlayContainerElement.querySelector('div[mat-dialog-close]') as HTMLElement).click();

        expect(overlayContainerElement.querySelectorAll('.mat-mdc-dialog-container').length).toBe(
          1,
        );
      });

      it('should allow for a user-specified aria-label on the close button', fakeAsync(() => {
        let button = overlayContainerElement.querySelector('.close-with-aria-label')!;
        expect(button.getAttribute('aria-label')).toBe('Best close button ever');
      }));

      it('should set the "type" attribute of the close button if not set manually', () => {
        let button = overlayContainerElement.querySelector('button[mat-dialog-close]')!;

        expect(button.getAttribute('type')).toBe('button');
      });

      it('should not override type attribute of the close button if set manually', () => {
        let button = overlayContainerElement.querySelector('button.with-submit')!;

        expect(button.getAttribute('type')).toBe('submit');
      });

      it('should return the [mat-dialog-close] result when clicking the close button', fakeAsync(() => {
        let afterCloseCallback = jasmine.createSpy('afterClose callback');
        dialogRef.afterClosed().subscribe(afterCloseCallback);

        (overlayContainerElement.querySelector('button.close-with-true') as HTMLElement).click();
        viewContainerFixture.detectChanges();
        flush();

        expect(afterCloseCallback).toHaveBeenCalledWith(true);
      }));

      it('should set the aria-labelledby attribute to the id of the title', fakeAsync(() => {
        let title = overlayContainerElement.querySelector('[mat-dialog-title]')!;
        let container = overlayContainerElement.querySelector('mat-dialog-container')!;

        flush();
        viewContainerFixture.detectChanges();

        expect(title.id).withContext('Expected title element to have an id.').toBeTruthy();
        expect(container.getAttribute('aria-labelledby'))
          .withContext('Expected the aria-labelledby to match the title id.')
          .toBe(title.id);
      }));

      it('should update the aria-labelledby attribute if two titles are swapped', fakeAsync(() => {
        const container = overlayContainerElement.querySelector('mat-dialog-container')!;
        let title = overlayContainerElement.querySelector('[mat-dialog-title]')!;

        flush();
        viewContainerFixture.detectChanges();

        const previousId = title.id;
        expect(title.id).toBeTruthy();
        expect(container.getAttribute('aria-labelledby')).toBe(title.id);

        hostInstance.shownTitle = 'second';
        viewContainerFixture.changeDetectorRef.markForCheck();
        viewContainerFixture.detectChanges();
        flush();
        viewContainerFixture.detectChanges();
        title = overlayContainerElement.querySelector('[mat-dialog-title]')!;

        expect(title.id).toBeTruthy();
        expect(title.id).not.toBe(previousId);
        expect(container.getAttribute('aria-labelledby')).toBe(title.id);
      }));

      it('should update the aria-labelledby attribute if multiple titles are present and one is removed', fakeAsync(() => {
        const container = overlayContainerElement.querySelector('mat-dialog-container')!;

        hostInstance.shownTitle = 'all';
        viewContainerFixture.changeDetectorRef.markForCheck();
        viewContainerFixture.detectChanges();
        flush();
        viewContainerFixture.detectChanges();

        const titles = overlayContainerElement.querySelectorAll('[mat-dialog-title]');

        expect(titles.length).toBe(3);
        expect(container.getAttribute('aria-labelledby')).toBe(titles[0].id);

        hostInstance.shownTitle = 'second';
        viewContainerFixture.changeDetectorRef.markForCheck();
        viewContainerFixture.detectChanges();
        flush();
        viewContainerFixture.detectChanges();

        expect(container.getAttribute('aria-labelledby')).toBe(titles[1].id);
      }));

      it('should add correct css class according to given [align] input in [mat-dialog-actions]', () => {
        let actions = overlayContainerElement.querySelector('mat-dialog-actions')!;

        expect(actions)
          .withContext('Expected action buttons to not have class align-center')
          .not.toHaveClass('mat-mdc-dialog-actions-align-center');
        expect(actions)
          .withContext('Expected action buttons to have class align-end')
          .toHaveClass('mat-mdc-dialog-actions-align-end');
      });
    }
  });

  describe('aria-labelledby', () => {
    it('should be able to set a custom aria-labelledby', () => {
      dialog.open(PizzaMsg, {
        ariaLabelledBy: 'Labelled By',
        viewContainerRef: testViewContainerRef,
      });
      viewContainerFixture.detectChanges();

      const container = overlayContainerElement.querySelector('mat-dialog-container')!;
      expect(container.getAttribute('aria-labelledby')).toBe('Labelled By');
    });

    it(
      'should not set the aria-labelledby automatically if it has an aria-label ' +
        'and an aria-labelledby',
      fakeAsync(() => {
        dialog.open(ContentElementDialog, {
          ariaLabel: 'Hello there',
          ariaLabelledBy: 'Labelled By',
          viewContainerRef: testViewContainerRef,
        });
        viewContainerFixture.detectChanges();
        tick();
        viewContainerFixture.detectChanges();

        const container = overlayContainerElement.querySelector('mat-dialog-container')!;
        expect(container.hasAttribute('aria-labelledby')).toBe(false);
      }),
    );

    it(
      'should set the aria-labelledby attribute to the config provided aria-labelledby ' +
        'instead of the mat-dialog-title id',
      fakeAsync(() => {
        dialog.open(ContentElementDialog, {
          ariaLabelledBy: 'Labelled By',
          viewContainerRef: testViewContainerRef,
        });
        viewContainerFixture.detectChanges();
        flush();
        let title = overlayContainerElement.querySelector('[mat-dialog-title]')!;
        let container = overlayContainerElement.querySelector('mat-dialog-container')!;
        flush();
        viewContainerFixture.detectChanges();

        expect(title.id).withContext('Expected title element to have an id.').toBeTruthy();
        expect(container.getAttribute('aria-labelledby')).toBe('Labelled By');
      }),
    );
  });

  describe('aria-label', () => {
    it('should be able to set a custom aria-label', () => {
      dialog.open(PizzaMsg, {ariaLabel: 'Hello there', viewContainerRef: testViewContainerRef});
      viewContainerFixture.detectChanges();

      const container = overlayContainerElement.querySelector('mat-dialog-container')!;
      expect(container.getAttribute('aria-label')).toBe('Hello there');
    });

    it('should not set the aria-labelledby automatically if it has an aria-label', fakeAsync(() => {
      dialog.open(ContentElementDialog, {
        ariaLabel: 'Hello there',
        viewContainerRef: testViewContainerRef,
      });
      viewContainerFixture.detectChanges();
      tick();
      viewContainerFixture.detectChanges();

      const container = overlayContainerElement.querySelector('mat-dialog-container')!;
      expect(container.hasAttribute('aria-labelledby')).toBe(false);
    }));
  });

  it('should dispose backdrop if containing dialog view is destroyed', fakeAsync(() => {
    const dialogRef = dialog.open(PizzaMsg, {viewContainerRef: testViewContainerRef});
    viewContainerFixture.detectChanges();
    flush();

    expect(overlayContainerElement.querySelector('.cdk-overlay-backdrop')).toBeDefined();

    dialogRef.close();
    viewContainerFixture.componentInstance.showChildView = false;
    viewContainerFixture.changeDetectorRef.markForCheck();
    viewContainerFixture.detectChanges();
    flush();

    expect(overlayContainerElement.querySelector('.cdk-overlay-backdrop')).toBe(null);
  }));
});

describe('MDC-based MatDialog with a parent MatDialog', () => {
  let parentDialog: MatDialog;
  let childDialog: MatDialog;
  let overlayContainerElement: HTMLElement;
  let fixture: ComponentFixture<ComponentThatProvidesMatDialog>;

  beforeEach(fakeAsync(() => {
    TestBed.configureTestingModule({
      imports: [MatDialogModule, NoopAnimationsModule, ComponentThatProvidesMatDialog],
      providers: [
        {
          provide: OverlayContainer,
          useFactory: () => {
            overlayContainerElement = document.createElement('div');
            return {getContainerElement: () => overlayContainerElement};
          },
        },
        {provide: Location, useClass: SpyLocation},
      ],
    });

    TestBed.compileComponents();
  }));

  beforeEach(inject([MatDialog], (d: MatDialog) => {
    parentDialog = d;

    fixture = TestBed.createComponent(ComponentThatProvidesMatDialog);
    childDialog = fixture.componentInstance.dialog;
    fixture.detectChanges();
  }));

  afterEach(() => {
    overlayContainerElement.innerHTML = '';
  });

  it('should close dialogs opened by a parent when calling closeAll on a child MatDialog', fakeAsync(() => {
    parentDialog.open(PizzaMsg);
    fixture.detectChanges();
    flush();

    expect(overlayContainerElement.textContent)
      .withContext('Expected a dialog to be opened')
      .toContain('Pizza');

    childDialog.closeAll();
    fixture.detectChanges();
    flush();

    expect(overlayContainerElement.textContent!.trim())
      .withContext('Expected closeAll on child MatDialog to close dialog opened by parent')
      .toBe('');
  }));

  it('should close dialogs opened by a child when calling closeAll on a parent MatDialog', fakeAsync(() => {
    childDialog.open(PizzaMsg);
    fixture.detectChanges();

    expect(overlayContainerElement.textContent)
      .withContext('Expected a dialog to be opened')
      .toContain('Pizza');

    parentDialog.closeAll();
    fixture.detectChanges();
    flush();

    expect(overlayContainerElement.textContent!.trim())
      .withContext('Expected closeAll on parent MatDialog to close dialog opened by child')
      .toBe('');
  }));

  it('should close the top dialog via the escape key', fakeAsync(() => {
    childDialog.open(PizzaMsg);

    dispatchKeyboardEvent(document.body, 'keydown', ESCAPE);
    fixture.detectChanges();
    flush();

    expect(overlayContainerElement.querySelector('mat-dialog-container')).toBeNull();
  }));

  it('should not close the parent dialogs when a child is destroyed', fakeAsync(() => {
    parentDialog.open(PizzaMsg);
    fixture.detectChanges();
    flush();

    expect(overlayContainerElement.textContent)
      .withContext('Expected a dialog to be opened')
      .toContain('Pizza');

    childDialog.ngOnDestroy();
    fixture.detectChanges();
    flush();

    expect(overlayContainerElement.textContent)
      .withContext('Expected a dialog to be opened')
      .toContain('Pizza');
  }));
});

describe('MDC-based MatDialog with default options', () => {
  let dialog: MatDialog;
  let overlayContainerElement: HTMLElement;

  let testViewContainerRef: ViewContainerRef;
  let viewContainerFixture: ComponentFixture<ComponentWithChildViewContainer>;

  beforeEach(fakeAsync(() => {
    const defaultConfig = {
      hasBackdrop: false,
      disableClose: true,
      width: '100px',
      height: '100px',
      minWidth: '50px',
      minHeight: '50px',
      maxWidth: '150px',
      maxHeight: '150px',
      autoFocus: 'dialog',
    };

    TestBed.configureTestingModule({
      imports: [
        MatDialogModule,
        NoopAnimationsModule,
        ComponentWithChildViewContainer,
        DirectiveWithViewContainer,
      ],
      providers: [{provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: defaultConfig}],
    });

    TestBed.compileComponents();
  }));

  beforeEach(inject([MatDialog, OverlayContainer], (d: MatDialog, oc: OverlayContainer) => {
    dialog = d;
    overlayContainerElement = oc.getContainerElement();
  }));

  beforeEach(() => {
    viewContainerFixture = TestBed.createComponent(ComponentWithChildViewContainer);

    viewContainerFixture.detectChanges();
    testViewContainerRef = viewContainerFixture.componentInstance.childViewContainer;
  });

  it('should use the provided defaults', () => {
    dialog.open(PizzaMsg, {viewContainerRef: testViewContainerRef});

    viewContainerFixture.detectChanges();

    expect(overlayContainerElement.querySelector('.cdk-overlay-backdrop')).toBeFalsy();

    dispatchKeyboardEvent(document.body, 'keydown', ESCAPE);
    expect(overlayContainerElement.querySelector('mat-dialog-container')).toBeTruthy();

    expect(document.activeElement!.tagName).not.toBe('INPUT');

    let overlayPane = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;
    expect(overlayPane.style.width).toBe('100px');
    expect(overlayPane.style.height).toBe('100px');
    expect(overlayPane.style.minWidth).toBe('50px');
    expect(overlayPane.style.minHeight).toBe('50px');
    expect(overlayPane.style.maxWidth).toBe('150px');
    expect(overlayPane.style.maxHeight).toBe('150px');
  });

  it('should be overridable by open() options', fakeAsync(() => {
    dialog.open(PizzaMsg, {
      hasBackdrop: true,
      disableClose: false,
      viewContainerRef: testViewContainerRef,
    });

    viewContainerFixture.detectChanges();

    expect(overlayContainerElement.querySelector('.cdk-overlay-backdrop')).toBeTruthy();

    dispatchKeyboardEvent(document.body, 'keydown', ESCAPE);
    viewContainerFixture.detectChanges();
    flush();

    expect(overlayContainerElement.querySelector('mat-dialog-container')).toBeFalsy();
  }));
});

describe('MDC-based MatDialog with animations enabled', () => {
  let dialog: MatDialog;

  let testViewContainerRef: ViewContainerRef;
  let viewContainerFixture: ComponentFixture<ComponentWithChildViewContainer>;

  beforeEach(fakeAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        MatDialogModule,
        BrowserAnimationsModule,
        ComponentWithChildViewContainer,
        DirectiveWithViewContainer,
      ],
    });

    TestBed.compileComponents();
  }));

  beforeEach(inject([MatDialog], (d: MatDialog) => {
    dialog = d;

    viewContainerFixture = TestBed.createComponent(ComponentWithChildViewContainer);
    viewContainerFixture.detectChanges();
    testViewContainerRef = viewContainerFixture.componentInstance.childViewContainer;
  }));

  it('should emit when dialog opening animation is complete', fakeAsync(() => {
    const dialogRef = dialog.open(PizzaMsg, {viewContainerRef: testViewContainerRef});
    const spy = jasmine.createSpy('afterOpen spy');

    dialogRef.afterOpened().subscribe(spy);

    viewContainerFixture.detectChanges();

    // callback should not be called before animation is complete
    expect(spy).not.toHaveBeenCalled();

    tick(OPEN_ANIMATION_DURATION);
    flush();

    expect(spy).toHaveBeenCalled();
  }));

  it('should return the current state of the dialog', fakeAsync(() => {
    const dialogRef = dialog.open(PizzaMsg, {viewContainerRef: testViewContainerRef});

    expect(dialogRef.getState()).toBe(MatDialogState.OPEN);
    dialogRef.close();
    viewContainerFixture.detectChanges();

    expect(dialogRef.getState()).toBe(MatDialogState.CLOSING);

    // Ensure that the closing state is still set if half of the animation has
    // passed by. The dialog state should be only set to `closed` when the dialog
    // finished the close animation.
    tick(CLOSE_ANIMATION_DURATION / 2);
    expect(dialogRef.getState()).toBe(MatDialogState.CLOSING);

    // Flush the remaining duration of the closing animation. We flush all other remaining
    // tasks (e.g. the fallback close timeout) to avoid fakeAsync pending timer failures.
    flush();
    expect(dialogRef.getState()).toBe(MatDialogState.CLOSED);
  }));
});

describe('MatDialog with explicit injector provided', () => {
  let overlayContainerElement: HTMLElement;
  let fixture: ComponentFixture<ModuleBoundDialogParentComponent>;

  beforeEach(fakeAsync(() => {
    TestBed.configureTestingModule({
      imports: [MatDialogModule, BrowserAnimationsModule, ModuleBoundDialogParentComponent],
    });

    TestBed.compileComponents();
  }));

  beforeEach(inject([OverlayContainer], (oc: OverlayContainer) => {
    overlayContainerElement = oc.getContainerElement();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModuleBoundDialogParentComponent);
  });

  it('should use the standalone injector and render the dialog successfully', () => {
    fixture.componentInstance.openDialog();
    fixture.detectChanges();

    expect(
      overlayContainerElement.querySelector('module-bound-dialog-child-component')!.innerHTML,
    ).toEqual('<p>Pasta</p>');
  });
});

@Directive({
  selector: 'dir-with-view-container',
  standalone: true,
})
class DirectiveWithViewContainer {
  constructor(public viewContainerRef: ViewContainerRef) {}
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: 'hello',
})
class ComponentWithOnPushViewContainer {
  constructor(public viewContainerRef: ViewContainerRef) {}
}

@Component({
  selector: 'arbitrary-component',
  template: `@if (showChildView) {<dir-with-view-container></dir-with-view-container>}`,
  standalone: true,
  imports: [DirectiveWithViewContainer],
})
class ComponentWithChildViewContainer {
  showChildView = true;

  @ViewChild(DirectiveWithViewContainer) childWithViewContainer: DirectiveWithViewContainer;

  get childViewContainer() {
    return this.childWithViewContainer.viewContainerRef;
  }
}

@Component({
  selector: 'arbitrary-component-with-template-ref',
  template: `<ng-template let-data let-dialogRef="dialogRef">
    Cheese {{localValue}} {{data?.value}}{{setDialogRef(dialogRef)}}</ng-template>`,
  standalone: true,
})
class ComponentWithTemplateRef {
  localValue: string;
  dialogRef: MatDialogRef<any>;

  @ViewChild(TemplateRef) templateRef: TemplateRef<any>;

  setDialogRef(dialogRef: MatDialogRef<any>): string {
    this.dialogRef = dialogRef;
    return '';
  }
}

/** Simple component for testing ComponentPortal. */
@Component({
  template: '<p>Pizza</p> <input> <button>Close</button>',
  standalone: true,
})
class PizzaMsg {
  constructor(
    public dialogRef: MatDialogRef<PizzaMsg>,
    public dialogInjector: Injector,
    public directionality: Directionality,
  ) {}
}

@Component({
  template: `
    @if (shouldShowTitle('first')) {
      <h2 mat-dialog-title>This is the first title</h2>
    }
    @if (shouldShowTitle('second')) {
      <h2 mat-dialog-title>This is the second title</h2>
    }
    @if (shouldShowTitle('third')) {
      <h2 mat-dialog-title>This is the third title</h2>
    }
    <mat-dialog-content>Lorem ipsum dolor sit amet.</mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-dialog-close>Close</button>
      <button class="close-with-true" [mat-dialog-close]="true">Close and return true</button>
      <button
        class="close-with-aria-label"
        aria-label="Best close button ever"
        [mat-dialog-close]="true"></button>
      <div mat-dialog-close>Should not close</div>
      <button class="with-submit" type="submit" mat-dialog-close>Should have submit</button>
    </mat-dialog-actions>
  `,
  standalone: true,
  imports: [MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose],
})
class ContentElementDialog {
  shownTitle: 'first' | 'second' | 'third' | 'all' = 'first';

  shouldShowTitle(name: string) {
    return this.shownTitle === 'all' || this.shownTitle === name;
  }
}

@Component({
  template: `
    <ng-template>
      @if (shouldShowTitle('first')) {
        <h2 mat-dialog-title>This is the first title</h2>
      }
      @if (shouldShowTitle('second')) {
        <h2 mat-dialog-title>This is the second title</h2>
      }
      @if (shouldShowTitle('third')) {
        <h2 mat-dialog-title>This is the third title</h2>
      }
      <mat-dialog-content>Lorem ipsum dolor sit amet.</mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-dialog-close>Close</button>
        <button class="close-with-true" [mat-dialog-close]="true">Close and return true</button>
        <button
          class="close-with-aria-label"
          aria-label="Best close button ever"
          [mat-dialog-close]="true"></button>
        <div mat-dialog-close>Should not close</div>
        <button class="with-submit" type="submit" mat-dialog-close>Should have submit</button>
      </mat-dialog-actions>
    </ng-template>
  `,
  standalone: true,
  imports: [MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose],
})
class ComponentWithContentElementTemplateRef {
  @ViewChild(TemplateRef) templateRef: TemplateRef<any>;

  shownTitle: 'first' | 'second' | 'third' | 'all' = 'first';

  shouldShowTitle(name: string) {
    return this.shownTitle === 'all' || this.shownTitle === name;
  }
}

@Component({
  template: '',
  providers: [MatDialog],
  standalone: true,
})
class ComponentThatProvidesMatDialog {
  constructor(public dialog: MatDialog) {}
}

/** Simple component for testing ComponentPortal. */
@Component({
  template: '',
  standalone: true,
})
class DialogWithInjectedData {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}
}

@Component({
  template: '<p>Pasta</p>',
  standalone: true,
})
class DialogWithoutFocusableElements {}

@Component({
  template: `<button>I'm a button</button>`,
  encapsulation: ViewEncapsulation.ShadowDom,
})
class ShadowDomComponent {}

@Component({
  template: '',
  standalone: true,
})
class ModuleBoundDialogParentComponent {
  constructor(
    private _injector: Injector,
    private _dialog: MatDialog,
  ) {}

  openDialog(): void {
    const ngModuleRef = createNgModuleRef(
      ModuleBoundDialogModule,
      /* parentInjector */ this._injector,
    );

    this._dialog.open(ModuleBoundDialogComponent, {injector: ngModuleRef.injector});
  }
}

@Injectable()
class ModuleBoundDialogService {
  name = 'Pasta';
}

@Component({
  template: '<module-bound-dialog-child-component></module-bound-dialog-child-component>',
  standalone: true,
  imports: [forwardRef(() => ModuleBoundDialogChildComponent)],
})
class ModuleBoundDialogComponent {}

@Component({
  selector: 'module-bound-dialog-child-component',
  template: '<p>{{service.name}}</p>',
  standalone: true,
})
class ModuleBoundDialogChildComponent {
  constructor(public service: ModuleBoundDialogService) {}
}

@NgModule({
  imports: [ModuleBoundDialogComponent, ModuleBoundDialogChildComponent],
  providers: [ModuleBoundDialogService],
})
class ModuleBoundDialogModule {}

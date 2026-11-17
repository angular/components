import {Directionality} from '@angular/cdk/bidi';
import {A, ESCAPE} from '@angular/cdk/keycodes';
import {OverlayContainer, ScrollStrategy} from '@angular/cdk/overlay';
import {_supportsShadowDom} from '@angular/cdk/platform';
import {ViewportRuler} from '@angular/cdk/scrolling';
import {
  createKeyboardEvent,
  dispatchEvent,
  dispatchKeyboardEvent,
} from '@angular/cdk/testing/private';
import {Location} from '@angular/common';
import {SpyLocation} from '@angular/common/testing';
import {
  Component,
  ComponentRef,
  createNgModule,
  Directive,
  Service,
  Injector,
  Input,
  NgModule,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
  ViewEncapsulation,
  forwardRef,
  inject,
  inputBinding,
  ChangeDetectionStrategy,
} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';

import {MAT_BOTTOM_SHEET_DEFAULT_OPTIONS, MatBottomSheet} from './bottom-sheet';
import {MAT_BOTTOM_SHEET_DATA, MatBottomSheetConfig} from './bottom-sheet-config';
import {MatBottomSheetModule} from './bottom-sheet-module';
import {MatBottomSheetRef} from './bottom-sheet-ref';
import {MATERIAL_ANIMATIONS} from '../core';

describe('MatBottomSheet', () => {
  let bottomSheet: MatBottomSheet;
  let overlayContainerElement: HTMLElement;
  let viewportRuler: ViewportRuler;

  let testViewContainerRef: ViewContainerRef;
  let mockLocation: SpyLocation;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        {provide: Location, useClass: SpyLocation},
        {provide: MATERIAL_ANIMATIONS, useValue: {animationsDisabled: true}},
      ],
    });

    bottomSheet = TestBed.inject(MatBottomSheet);
    viewportRuler = TestBed.inject(ViewportRuler);
    overlayContainerElement = TestBed.inject(OverlayContainer).getContainerElement();
    mockLocation = TestBed.inject(Location) as SpyLocation;
  });

  it('should open a bottom sheet with a component', () => {
    const fixture = createViewContainerFixture();
    const bottomSheetRef = bottomSheet.open(PizzaMsg, {viewContainerRef: testViewContainerRef});

    fixture.detectChanges();

    expect(overlayContainerElement.textContent).toContain('Pizza');
    expect(bottomSheetRef.instance instanceof PizzaMsg).toBe(true);
    expect(bottomSheetRef.componentRef instanceof ComponentRef).toBe(true);
    expect(bottomSheetRef.instance.bottomSheetRef).toBe(bottomSheetRef);
  });

  it('should open a bottom sheet with a template', () => {
    const fixture = createViewContainerFixture();
    const templateRefFixture = TestBed.createComponent(ComponentWithTemplateRef);
    templateRefFixture.componentInstance.localValue = 'Bees';
    templateRefFixture.detectChanges();

    const bottomSheetRef = bottomSheet.open(templateRefFixture.componentInstance.templateRef, {
      data: {value: 'Knees'},
    });

    fixture.detectChanges();

    expect(overlayContainerElement.textContent).toContain('Cheese Bees Knees');
    expect(templateRefFixture.componentInstance.bottomSheetRef).toBe(bottomSheetRef);
  });

  it('should position the bottom sheet at the bottom center of the screen', () => {
    const fixture = createViewContainerFixture();
    bottomSheet.open(PizzaMsg, {viewContainerRef: testViewContainerRef});

    fixture.detectChanges();

    const containerElement = overlayContainerElement.querySelector('mat-bottom-sheet-container')!;
    const containerRect = containerElement.getBoundingClientRect();
    const viewportSize = viewportRuler.getViewportSize();

    expect(Math.floor(containerRect.bottom)).toBe(Math.floor(viewportSize.height));
    expect(Math.floor(containerRect.left + containerRect.width / 2)).toBe(
      Math.floor(viewportSize.width / 2),
    );
  });

  it('should emit when the bottom sheet opening animation is complete', async () => {
    const fixture = createViewContainerFixture();
    const bottomSheetRef = bottomSheet.open(PizzaMsg, {viewContainerRef: testViewContainerRef});
    const spy = jasmine.createSpy('afterOpened spy');

    bottomSheetRef.afterOpened().subscribe(spy);
    fixture.detectChanges();

    // callback should not be called before animation is complete
    expect(spy).not.toHaveBeenCalled();

    await wait(0);
    fixture.detectChanges();
    expect(spy).toHaveBeenCalled();
  });

  it('should use the correct injector', () => {
    const fixture = createViewContainerFixture();
    const bottomSheetRef = bottomSheet.open(PizzaMsg, {viewContainerRef: testViewContainerRef});
    fixture.detectChanges();
    const injector = bottomSheetRef.instance.injector;

    expect(bottomSheetRef.instance.bottomSheetRef).toBe(bottomSheetRef);
    expect(injector.get<DirectiveWithViewContainer>(DirectiveWithViewContainer)).toBeTruthy();
  });

  it('should open a bottom sheet with a component and no ViewContainerRef', () => {
    const fixture = createViewContainerFixture();
    const bottomSheetRef = bottomSheet.open(PizzaMsg);

    fixture.detectChanges();

    expect(overlayContainerElement.textContent).toContain('Pizza');
    expect(bottomSheetRef.instance instanceof PizzaMsg).toBe(true);
    expect(bottomSheetRef.instance.bottomSheetRef).toBe(bottomSheetRef);
  });

  it('should apply the correct role to the container element', () => {
    const fixture = createViewContainerFixture();
    bottomSheet.open(PizzaMsg);

    fixture.detectChanges();

    const containerElement = overlayContainerElement.querySelector('mat-bottom-sheet-container')!;
    expect(containerElement.getAttribute('role')).toBe('dialog');
    expect(containerElement.getAttribute('aria-modal')).toBe('false');
  });

  it('should be able to set aria-modal', () => {
    const fixture = createViewContainerFixture();
    bottomSheet.open(PizzaMsg, {
      ariaModal: true,
    });
    fixture.detectChanges();

    const container = overlayContainerElement.querySelector('mat-bottom-sheet-container')!;
    expect(container.getAttribute('aria-modal')).toBe('true');
  });

  it('should close a bottom sheet via the escape key', async () => {
    const fixture = createViewContainerFixture();
    bottomSheet.open(PizzaMsg, {viewContainerRef: testViewContainerRef});

    const event = dispatchKeyboardEvent(document.body, 'keydown', ESCAPE);
    fixture.detectChanges();
    await wait(0);
    fixture.detectChanges();

    expect(overlayContainerElement.querySelector('mat-bottom-sheet-container')).toBeNull();
    expect(event.defaultPrevented).toBe(true);
  });

  it('should not close a bottom sheet via the escape key with a modifier', async () => {
    const fixture = createViewContainerFixture();
    bottomSheet.open(PizzaMsg, {viewContainerRef: testViewContainerRef});

    const event = createKeyboardEvent('keydown', ESCAPE, undefined, {alt: true});
    dispatchEvent(document.body, event);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(overlayContainerElement.querySelector('mat-bottom-sheet-container')).toBeTruthy();
    expect(event.defaultPrevented).toBe(false);
  });

  it('should close when clicking on the overlay backdrop', async () => {
    const fixture = createViewContainerFixture();
    bottomSheet.open(PizzaMsg, {
      viewContainerRef: testViewContainerRef,
    });

    fixture.detectChanges();

    const backdrop = overlayContainerElement.querySelector('.cdk-overlay-backdrop') as HTMLElement;

    backdrop.click();
    fixture.detectChanges();
    await wait(0);
    fixture.detectChanges();

    expect(overlayContainerElement.querySelector('mat-bottom-sheet-container')).toBeFalsy();
  });

  it('should dispose of bottom sheet if view container is destroyed while animating', async () => {
    const fixture = createViewContainerFixture();
    const bottomSheetRef = bottomSheet.open(PizzaMsg, {viewContainerRef: testViewContainerRef});

    bottomSheetRef.dismiss();
    fixture.detectChanges();
    fixture.destroy();
    await fixture.whenStable();

    expect(overlayContainerElement.querySelector('mat-dialog-container')).toBeNull();
  });

  it('should emit the backdropClick stream when clicking on the overlay backdrop', async () => {
    const fixture = createViewContainerFixture();
    const bottomSheetRef = bottomSheet.open(PizzaMsg, {viewContainerRef: testViewContainerRef});
    const spy = jasmine.createSpy('backdropClick spy');

    bottomSheetRef.backdropClick().subscribe(spy);
    fixture.detectChanges();

    const backdrop = overlayContainerElement.querySelector('.cdk-overlay-backdrop') as HTMLElement;

    backdrop.click();
    expect(spy).toHaveBeenCalledTimes(1);

    fixture.detectChanges();
    await fixture.whenStable();

    // Additional clicks after the bottom sheet was closed should not be emitted
    backdrop.click();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should emit the keyboardEvent stream when key events target the overlay', async () => {
    const fixture = createViewContainerFixture();
    const bottomSheetRef = bottomSheet.open(PizzaMsg, {viewContainerRef: testViewContainerRef});
    const spy = jasmine.createSpy('keyboardEvent spy');

    bottomSheetRef.keydownEvents().subscribe(spy);
    fixture.detectChanges();
    await fixture.whenStable();

    const backdrop = overlayContainerElement.querySelector('.cdk-overlay-backdrop') as HTMLElement;
    const container = overlayContainerElement.querySelector(
      'mat-bottom-sheet-container',
    ) as HTMLElement;
    dispatchKeyboardEvent(document.body, 'keydown', A);
    dispatchKeyboardEvent(backdrop, 'keydown', A);
    dispatchKeyboardEvent(container, 'keydown', A);

    expect(spy).toHaveBeenCalledTimes(3);
  });

  it('should allow setting the layout direction', () => {
    const fixture = createViewContainerFixture();
    bottomSheet.open(PizzaMsg, {direction: 'rtl'});

    fixture.detectChanges();

    const overlayPane = overlayContainerElement.querySelector('.cdk-global-overlay-wrapper')!;

    expect(overlayPane.getAttribute('dir')).toBe('rtl');
  });

  it('should inject the correct direction in the instantiated component', () => {
    const fixture = createViewContainerFixture();
    const bottomSheetRef = bottomSheet.open(PizzaMsg, {direction: 'rtl'});

    fixture.detectChanges();

    expect(bottomSheetRef.instance.directionality.value).toBe('rtl');
  });

  it('should fall back to injecting the global direction if none is passed by the config', () => {
    const fixture = createViewContainerFixture();
    const bottomSheetRef = bottomSheet.open(PizzaMsg, {});

    fixture.detectChanges();

    expect(bottomSheetRef.instance.directionality.value).toBe('ltr');
  });

  it('should be able to set a custom panel class', () => {
    const fixture = createViewContainerFixture();
    bottomSheet.open(PizzaMsg, {
      panelClass: 'custom-panel-class',
      viewContainerRef: testViewContainerRef,
    });

    fixture.detectChanges();

    expect(overlayContainerElement.querySelector('.custom-panel-class')).toBeTruthy();
  });

  it('should be able to set a custom aria-label', () => {
    const fixture = createViewContainerFixture();
    bottomSheet.open(PizzaMsg, {
      ariaLabel: 'Hello there',
      viewContainerRef: testViewContainerRef,
    });
    fixture.detectChanges();

    const container = overlayContainerElement.querySelector('mat-bottom-sheet-container')!;
    expect(container.getAttribute('aria-label')).toBe('Hello there');
  });

  it('should be able to get dismissed through the service', async () => {
    const fixture = createViewContainerFixture();
    bottomSheet.open(PizzaMsg);
    fixture.detectChanges();
    expect(overlayContainerElement.childElementCount).toBeGreaterThan(0);

    bottomSheet.dismiss();
    fixture.detectChanges();
    await wait(0);
    fixture.detectChanges();

    expect(overlayContainerElement.childElementCount).toBe(0);
  });

  it('should dismiss the bottom sheet when the service is destroyed', async () => {
    const fixture = createViewContainerFixture();
    bottomSheet.open(PizzaMsg);
    fixture.detectChanges();
    expect(overlayContainerElement.childElementCount).toBeGreaterThan(0);

    bottomSheet.ngOnDestroy();
    fixture.detectChanges();
    await wait(0);
    fixture.detectChanges();

    expect(overlayContainerElement.childElementCount).toBe(0);
  });

  it('should open a new bottom sheet after dismissing a previous sheet', async () => {
    const fixture = createViewContainerFixture();
    const config: MatBottomSheetConfig = {viewContainerRef: testViewContainerRef};
    let bottomSheetRef: MatBottomSheetRef<any> = bottomSheet.open(PizzaMsg, config);

    fixture.detectChanges();

    bottomSheetRef.dismiss();
    fixture.detectChanges();

    // Wait for the dismiss animation to finish.
    await wait(0);
    fixture.detectChanges();
    bottomSheetRef = bottomSheet.open(TacoMsg, config);
    fixture.detectChanges();

    // Wait for the open animation to finish.
    await wait(0);
    fixture.detectChanges();
    expect(bottomSheetRef.containerInstance._animationState)
      .withContext(`Expected the animation state would be 'visible'.`)
      .toBe('visible');
  });

  it('should remove past bottom sheets when opening new ones', async () => {
    const fixture = createViewContainerFixture();
    bottomSheet.open(PizzaMsg);
    fixture.detectChanges();

    bottomSheet.open(TacoMsg);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(overlayContainerElement.textContent).toContain('Taco');
  });

  it('should not throw when opening multiple bottom sheet in quick succession', async () => {
    const fixture = createViewContainerFixture();
    for (let i = 0; i < 3; i++) {
      bottomSheet.open(PizzaMsg);
      fixture.detectChanges();
    }

    await fixture.whenStable();
  });

  it('should remove bottom sheet if another is shown while its still animating open', async () => {
    const fixture = createViewContainerFixture();
    bottomSheet.open(PizzaMsg);
    fixture.detectChanges();

    bottomSheet.open(TacoMsg);
    fixture.detectChanges();

    await fixture.whenStable();
    expect(overlayContainerElement.textContent).toContain('Taco');
  });

  it('should emit after being dismissed', async () => {
    const fixture = createViewContainerFixture();
    const bottomSheetRef = bottomSheet.open(PizzaMsg);
    const spy = jasmine.createSpy('afterDismissed spy');

    bottomSheetRef.afterDismissed().subscribe(spy);
    fixture.detectChanges();

    bottomSheetRef.dismiss();
    fixture.detectChanges();
    await wait(0);
    fixture.detectChanges();

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should be able to pass a result back to the dismissed stream', async () => {
    const fixture = createViewContainerFixture();
    const bottomSheetRef = bottomSheet.open<PizzaMsg, any, number>(PizzaMsg);
    const spy = jasmine.createSpy('afterDismissed spy');

    bottomSheetRef.afterDismissed().subscribe(spy);
    fixture.detectChanges();

    bottomSheetRef.dismiss(1337);
    fixture.detectChanges();
    await wait(0);
    fixture.detectChanges();

    expect(spy).toHaveBeenCalledWith(1337);
  });

  it('should be able to pass data when dismissing through the service', async () => {
    const fixture = createViewContainerFixture();
    const bottomSheetRef = bottomSheet.open<PizzaMsg, any, number>(PizzaMsg);
    const spy = jasmine.createSpy('afterDismissed spy');

    bottomSheetRef.afterDismissed().subscribe(spy);
    fixture.detectChanges();

    bottomSheet.dismiss(1337);
    fixture.detectChanges();
    await wait(0);
    fixture.detectChanges();

    expect(spy).toHaveBeenCalledWith(1337);
  });

  it('should close the bottom sheet when going forwards/backwards in history', async () => {
    const fixture = createViewContainerFixture();
    bottomSheet.open(PizzaMsg);

    expect(overlayContainerElement.querySelector('mat-bottom-sheet-container')).toBeTruthy();

    mockLocation.simulateUrlPop('');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(overlayContainerElement.querySelector('mat-bottom-sheet-container')).toBeFalsy();
  });

  it('should close the bottom sheet when the location hash changes', async () => {
    const fixture = createViewContainerFixture();
    bottomSheet.open(PizzaMsg);

    expect(overlayContainerElement.querySelector('mat-bottom-sheet-container')).toBeTruthy();

    mockLocation.simulateHashChange('');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(overlayContainerElement.querySelector('mat-bottom-sheet-container')).toBeFalsy();
  });

  it('should allow the consumer to disable closing a bottom sheet on navigation', async () => {
    const fixture = createViewContainerFixture();
    bottomSheet.open(PizzaMsg, {closeOnNavigation: false});

    expect(overlayContainerElement.querySelector('mat-bottom-sheet-container')).toBeTruthy();

    mockLocation.simulateUrlPop('');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(overlayContainerElement.querySelector('mat-bottom-sheet-container')).toBeTruthy();
  });

  it('should be able to attach a custom scroll strategy', () => {
    createViewContainerFixture();
    const scrollStrategy: ScrollStrategy = {
      attach: () => {},
      enable: jasmine.createSpy('scroll strategy enable spy'),
      disable: () => {},
    };

    bottomSheet.open(PizzaMsg, {scrollStrategy});
    expect(scrollStrategy.enable).toHaveBeenCalled();
  });

  it('should contain the height style properties on overlay pane', () => {
    const fixture = createViewContainerFixture();
    bottomSheet.open(PizzaMsg, {
      panelClass: 'height--pane',
      height: '300px',
      maxHeight: 400, // this is converted into pixels
      minHeight: 200, // this is converted into pixels
    });

    fixture.detectChanges();

    const paneElement = overlayContainerElement.querySelector('.height--pane') as HTMLElement;

    expect(paneElement).toBeTruthy();
    expect(paneElement.style.height).toBe('300px');
    expect(paneElement.style.maxHeight).toBe('400px');
    expect(paneElement.style.minHeight).toBe('200px');
  });

  describe('passing in data', () => {
    it('should be able to pass in data', () => {
      createViewContainerFixture();
      const config = {
        data: {
          stringParam: 'hello',
          dateParam: new Date(),
        },
      };

      const instance = bottomSheet.open(BottomSheetWithInjectedData, config).instance;

      expect(instance.data.stringParam).toBe(config.data.stringParam);
      expect(instance.data.dateParam).toBe(config.data.dateParam);
    });

    it('should default to null if no data is passed', () => {
      createViewContainerFixture();
      expect(() => {
        const bottomSheetRef = bottomSheet.open(BottomSheetWithInjectedData);
        expect(bottomSheetRef.instance.data).toBeNull();
      }).not.toThrow();
    });

    it('should be able to apply bindings', () => {
      const fixture = createViewContainerFixture();
      const bottomSheetRef = bottomSheet.open(PizzaMsg, {
        bindings: [inputBinding('flavor', () => 'pepperoni')],
      });
      fixture.detectChanges();

      expect(bottomSheetRef.instance.flavor).toBe('pepperoni');
    });
  });

  describe('disableClose option', () => {
    it('should prevent closing via clicks on the backdrop', async () => {
      const fixture = createViewContainerFixture();
      bottomSheet.open(PizzaMsg, {
        disableClose: true,
        viewContainerRef: testViewContainerRef,
      });

      fixture.detectChanges();

      const backdrop = overlayContainerElement.querySelector(
        '.cdk-overlay-backdrop',
      ) as HTMLElement;
      backdrop.click();
      fixture.detectChanges();
      await fixture.whenStable();

      expect(overlayContainerElement.querySelector('mat-bottom-sheet-container')).toBeTruthy();
    });

    it('should prevent closing via the escape key', async () => {
      const fixture = createViewContainerFixture();
      bottomSheet.open(PizzaMsg, {
        disableClose: true,
        viewContainerRef: testViewContainerRef,
      });

      fixture.detectChanges();
      dispatchKeyboardEvent(document.body, 'keydown', ESCAPE);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(overlayContainerElement.querySelector('mat-bottom-sheet-container')).toBeTruthy();
    });

    it('should allow for the disableClose option to be updated while open', async () => {
      const fixture = createViewContainerFixture();
      const bottomSheetRef = bottomSheet.open(PizzaMsg, {
        disableClose: true,
        viewContainerRef: testViewContainerRef,
      });

      fixture.detectChanges();

      const backdrop = overlayContainerElement.querySelector(
        '.cdk-overlay-backdrop',
      ) as HTMLElement;
      backdrop.click();

      expect(overlayContainerElement.querySelector('mat-bottom-sheet-container')).toBeTruthy();

      bottomSheetRef.disableClose = false;
      backdrop.click();
      fixture.detectChanges();
      await wait(0);
      fixture.detectChanges();

      expect(overlayContainerElement.querySelector('mat-bottom-sheet-container')).toBeFalsy();
    });
  });

  describe('hasBackdrop option', () => {
    it('should have a backdrop', () => {
      const fixture = createViewContainerFixture();
      bottomSheet.open(PizzaMsg, {
        hasBackdrop: true,
        viewContainerRef: testViewContainerRef,
      });

      fixture.detectChanges();

      expect(overlayContainerElement.querySelector('.cdk-overlay-backdrop')).toBeTruthy();
    });

    it('should not have a backdrop', () => {
      const fixture = createViewContainerFixture();
      bottomSheet.open(PizzaMsg, {
        hasBackdrop: false,
        viewContainerRef: testViewContainerRef,
      });

      fixture.detectChanges();

      expect(overlayContainerElement.querySelector('.cdk-overlay-backdrop')).toBeFalsy();
    });
  });

  describe('backdropClass option', () => {
    it('should have default backdrop class', () => {
      const fixture = createViewContainerFixture();
      bottomSheet.open(PizzaMsg, {
        backdropClass: '',
        viewContainerRef: testViewContainerRef,
      });

      fixture.detectChanges();

      expect(overlayContainerElement.querySelector('.cdk-overlay-dark-backdrop')).toBeTruthy();
    });

    it('should have custom backdrop class', () => {
      const fixture = createViewContainerFixture();
      bottomSheet.open(PizzaMsg, {
        backdropClass: 'custom-backdrop-class',
        viewContainerRef: testViewContainerRef,
      });

      fixture.detectChanges();

      expect(overlayContainerElement.querySelector('.custom-backdrop-class')).toBeTruthy();
    });
  });

  describe('focus management', () => {
    // When testing focus, all of the elements must be in the DOM.
    beforeEach(() => document.body.appendChild(overlayContainerElement));
    afterEach(() => overlayContainerElement.remove());

    it('should focus the first tabbable element by default', async () => {
      const fixture = createViewContainerFixture();
      bottomSheet.open(PizzaMsg, {
        viewContainerRef: testViewContainerRef,
      });

      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      expect(document.activeElement!.tagName).toBe('INPUT');
    });

    it('should create a focus trap if autoFocus is disabled', async () => {
      const fixture = createViewContainerFixture();
      bottomSheet.open(PizzaMsg, {
        viewContainerRef: testViewContainerRef,
        autoFocus: false,
      });

      fixture.detectChanges();
      await fixture.whenStable();

      const focusTrapAnchors = overlayContainerElement.querySelectorAll('.cdk-focus-trap-anchor');

      expect(focusTrapAnchors.length).toBeGreaterThan(0);
    });

    it('should focus the first tabbable element of the bottom sheet on open when autoFocus is set to "first-tabbable"', () => {
      const fixture = createViewContainerFixture();
      bottomSheet.open(PizzaMsg, {
        viewContainerRef: testViewContainerRef,
        autoFocus: 'first-tabbable',
      });

      fixture.detectChanges();

      expect(document.activeElement!.tagName)
        .withContext('Expected first tabbable element (input) in the dialog to be focused.')
        .toBe('INPUT');
    });

    it('should focus the bottom sheet element on open when autoFocus is set to "dialog"', async () => {
      const fixture = createViewContainerFixture();
      bottomSheet.open(PizzaMsg, {
        viewContainerRef: testViewContainerRef,
        autoFocus: 'dialog',
      });

      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      let container = overlayContainerElement.querySelector(
        '.mat-bottom-sheet-container',
      ) as HTMLInputElement;

      expect(document.activeElement)
        .withContext('Expected container to be focused on open')
        .toBe(container);
    });

    it('should focus the bottom sheet element on open when autoFocus is set to "first-heading"', async () => {
      const fixture = createViewContainerFixture();
      bottomSheet.open(ContentElementDialog, {
        viewContainerRef: testViewContainerRef,
        autoFocus: 'first-heading',
      });

      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      let firstHeader = overlayContainerElement.querySelector(
        'h1[tabindex="-1"]',
      ) as HTMLInputElement;

      expect(document.activeElement)
        .withContext('Expected first header to be focused on open')
        .toBe(firstHeader);
    });

    it('should focus the first element that matches the css selector on open when autoFocus is set to a css selector', async () => {
      const fixture = createViewContainerFixture();
      bottomSheet.open(ContentElementDialog, {
        viewContainerRef: testViewContainerRef,
        autoFocus: 'p',
      });

      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      let firstParagraph = overlayContainerElement.querySelector(
        'p[tabindex="-1"]',
      ) as HTMLInputElement;

      expect(document.activeElement)
        .withContext('Expected first paragraph to be focused on open')
        .toBe(firstParagraph);
    });

    it('should re-focus trigger element when bottom sheet closes', async () => {
      const fixture = createViewContainerFixture();
      const button = document.createElement('button');
      button.id = 'bottom-sheet-trigger';
      document.body.appendChild(button);
      button.focus();

      const bottomSheetRef = bottomSheet.open(PizzaMsg, {viewContainerRef: testViewContainerRef});

      await wait(0);
      fixture.detectChanges();

      expect(document.activeElement!.id).not.toBe(
        'bottom-sheet-trigger',
        'Expected the focus to change when sheet was opened.',
      );

      bottomSheetRef.dismiss();
      expect(document.activeElement!.id).not.toBe(
        'bottom-sheet-trigger',
        'Expcted the focus not to have changed before the animation finishes.',
      );

      await wait(0);
      fixture.detectChanges();

      expect(document.activeElement!.id)
        .withContext('Expected that the trigger was refocused after the sheet is closed.')
        .toBe('bottom-sheet-trigger');

      button.remove();
    });

    it('should be able to disable focus restoration', async () => {
      const fixture = createViewContainerFixture();
      const button = document.createElement('button');
      button.id = 'bottom-sheet-trigger';
      document.body.appendChild(button);
      button.focus();

      const bottomSheetRef = bottomSheet.open(PizzaMsg, {
        viewContainerRef: testViewContainerRef,
        restoreFocus: false,
      });

      await wait(0);
      fixture.detectChanges();

      expect(document.activeElement!.id).not.toBe(
        'bottom-sheet-trigger',
        'Expected the focus to change when sheet was opened.',
      );

      bottomSheetRef.dismiss();
      expect(document.activeElement!.id).not.toBe(
        'bottom-sheet-trigger',
        'Expcted the focus not to have changed before the animation finishes.',
      );

      await wait(0);
      fixture.detectChanges();

      expect(document.activeElement!.id).not.toBe(
        'bottom-sheet-trigger',
        'Expected the trigger not to be refocused on close.',
      );

      button.remove();
    });

    it('should not move focus if it was moved outside the sheet while animating', async () => {
      const fixture = createViewContainerFixture();
      // Create a element that has focus before the bottom sheet is opened.
      const button = document.createElement('button');
      const otherButton = document.createElement('button');
      const body = document.body;
      button.id = 'bottom-sheet-trigger';
      otherButton.id = 'other-button';
      body.appendChild(button);
      body.appendChild(otherButton);
      button.focus();

      const bottomSheetRef = bottomSheet.open(PizzaMsg, {viewContainerRef: testViewContainerRef});

      await wait(0);
      fixture.detectChanges();

      expect(document.activeElement!.id).not.toBe(
        'bottom-sheet-trigger',
        'Expected the focus to change when the bottom sheet was opened.',
      );

      // Start the closing sequence and move focus out of bottom sheet.
      bottomSheetRef.dismiss();
      otherButton.focus();

      expect(document.activeElement!.id)
        .withContext('Expected focus to be on the alternate button.')
        .toBe('other-button');

      await wait(0);
      fixture.detectChanges();

      expect(document.activeElement!.id)
        .withContext('Expected focus to stay on the alternate button.')
        .toBe('other-button');

      button.remove();
      otherButton.remove();
    });

    it('should re-focus trigger element inside the shadow DOM when the bottom sheet is dismissed', async () => {
      if (!_supportsShadowDom()) {
        return;
      }

      const fixture = TestBed.createComponent(ShadowDomComponent);
      fixture.detectChanges();
      const button = fixture.debugElement.query(By.css('button'))!.nativeElement;

      button.focus();

      const ref = bottomSheet.open(PizzaMsg);
      await wait(0);
      fixture.detectChanges();

      const spy = spyOn(button, 'focus').and.callThrough();
      ref.dismiss();
      await wait(0);
      fixture.detectChanges();

      expect(spy).toHaveBeenCalled();
    });
  });

  function createViewContainerFixture(): ComponentFixture<ComponentWithChildViewContainer> {
    const fixture = TestBed.createComponent(ComponentWithChildViewContainer);
    fixture.detectChanges();
    testViewContainerRef = fixture.componentInstance.childViewContainer;
    return fixture;
  }
});

describe('MatBottomSheet with parent MatBottomSheet', () => {
  let parentBottomSheet: MatBottomSheet;
  let childBottomSheet: MatBottomSheet;
  let overlayContainerElement: HTMLElement;
  let fixture: ComponentFixture<ComponentThatProvidesMatBottomSheet>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [{provide: MATERIAL_ANIMATIONS, useValue: {animationsDisabled: true}}],
    });

    parentBottomSheet = TestBed.inject(MatBottomSheet);
    overlayContainerElement = TestBed.inject(OverlayContainer).getContainerElement();
    fixture = TestBed.createComponent(ComponentThatProvidesMatBottomSheet);
    childBottomSheet = fixture.componentInstance.bottomSheet;
    fixture.detectChanges();
  });

  it('should close bottom sheets opened by parent when opening from child', async () => {
    parentBottomSheet.open(PizzaMsg);
    fixture.detectChanges();
    await wait(0);
    fixture.detectChanges();

    expect(overlayContainerElement.textContent)
      .withContext('Expected a bottom sheet to be opened')
      .toContain('Pizza');

    childBottomSheet.open(TacoMsg);
    fixture.detectChanges();
    await wait(0);
    fixture.detectChanges();

    expect(overlayContainerElement.textContent)
      .withContext('Expected parent bottom sheet to be dismissed by opening from child')
      .toContain('Taco');
  });

  it('should close bottom sheets opened by child when opening from parent', async () => {
    childBottomSheet.open(PizzaMsg);
    fixture.detectChanges();
    await wait(0);
    fixture.detectChanges();

    expect(overlayContainerElement.textContent)
      .withContext('Expected a bottom sheet to be opened')
      .toContain('Pizza');

    parentBottomSheet.open(TacoMsg);
    fixture.detectChanges();
    await wait(0);
    fixture.detectChanges();

    expect(overlayContainerElement.textContent)
      .withContext('Expected child bottom sheet to be dismissed by opening from parent')
      .toContain('Taco');
  });

  it('should not close parent bottom sheet when child is destroyed', async () => {
    parentBottomSheet.open(PizzaMsg);
    fixture.detectChanges();
    await wait(0);
    fixture.detectChanges();

    expect(overlayContainerElement.textContent)
      .withContext('Expected a bottom sheet to be opened')
      .toContain('Pizza');

    childBottomSheet.ngOnDestroy();
    fixture.detectChanges();
    await wait(0);
    fixture.detectChanges();

    expect(overlayContainerElement.textContent)
      .withContext('Expected a bottom sheet to stay open')
      .toContain('Pizza');
  });
});

describe('MatBottomSheet with default options', () => {
  let bottomSheet: MatBottomSheet;
  let overlayContainerElement: HTMLElement;

  let testViewContainerRef: ViewContainerRef;
  let viewContainerFixture: ComponentFixture<ComponentWithChildViewContainer>;

  beforeEach(async () => {
    const defaultConfig: MatBottomSheetConfig = {
      hasBackdrop: false,
      disableClose: true,
      autoFocus: 'dialog',
    };

    TestBed.configureTestingModule({
      providers: [
        {provide: MAT_BOTTOM_SHEET_DEFAULT_OPTIONS, useValue: defaultConfig},
        {provide: MATERIAL_ANIMATIONS, useValue: {animationsDisabled: true}},
      ],
    });

    bottomSheet = TestBed.inject(MatBottomSheet);
    overlayContainerElement = TestBed.inject(OverlayContainer).getContainerElement();
    viewContainerFixture = TestBed.createComponent(ComponentWithChildViewContainer);
    viewContainerFixture.detectChanges();
    testViewContainerRef = viewContainerFixture.componentInstance.childViewContainer;
  });

  it('should use the provided defaults', () => {
    bottomSheet.open(PizzaMsg, {viewContainerRef: testViewContainerRef});

    viewContainerFixture.detectChanges();

    expect(overlayContainerElement.querySelector('.cdk-overlay-backdrop')).toBeFalsy();

    dispatchKeyboardEvent(document.body, 'keydown', ESCAPE);

    expect(overlayContainerElement.querySelector('mat-bottom-sheet-container')).toBeTruthy();
    expect(document.activeElement!.tagName).not.toBe('INPUT');
  });

  it('should be overridable by open() options', async () => {
    bottomSheet.open(PizzaMsg, {
      hasBackdrop: true,
      disableClose: false,
      viewContainerRef: testViewContainerRef,
    });

    viewContainerFixture.detectChanges();

    expect(overlayContainerElement.querySelector('.cdk-overlay-backdrop')).toBeTruthy();

    dispatchKeyboardEvent(document.body, 'keydown', ESCAPE);
    viewContainerFixture.detectChanges();
    await wait(0);
    viewContainerFixture.detectChanges();

    expect(overlayContainerElement.querySelector('mat-bottom-sheet-container')).toBeFalsy();
  });
});

describe('MatBottomSheet with explicit injector provided', () => {
  let overlayContainerElement: HTMLElement;
  let fixture: ComponentFixture<ModuleBoundBottomSheetParentComponent>;

  beforeEach(async () => {
    overlayContainerElement = TestBed.inject(OverlayContainer).getContainerElement();
    fixture = TestBed.createComponent(ModuleBoundBottomSheetParentComponent);
  });

  it('should use the standalone injector and render the bottom sheet successfully', () => {
    fixture.componentInstance.openBottomSheet();
    fixture.detectChanges();

    expect(
      overlayContainerElement.querySelector('module-bound-bottom-sheet-child-component')!.innerHTML,
    ).toEqual('<p>Pasta</p>');
  });
});

function wait(milliseconds: number) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

@Directive({
  selector: 'dir-with-view-container',
})
class DirectiveWithViewContainer {
  viewContainerRef = inject(ViewContainerRef);
}

@Component({
  template: `<dir-with-view-container></dir-with-view-container>`,
  imports: [DirectiveWithViewContainer],
  changeDetection: ChangeDetectionStrategy.Eager,
})
class ComponentWithChildViewContainer {
  @ViewChild(DirectiveWithViewContainer) childWithViewContainer!: DirectiveWithViewContainer;

  get childViewContainer() {
    return this.childWithViewContainer.viewContainerRef;
  }
}

@Component({
  selector: 'arbitrary-component-with-template-ref',
  template: `<ng-template let-data let-bottomSheetRef="bottomSheetRef">
      Cheese {{localValue}} {{data?.value}}{{setRef(bottomSheetRef)}}</ng-template>`,
  changeDetection: ChangeDetectionStrategy.Eager,
})
class ComponentWithTemplateRef {
  localValue!: string;
  bottomSheetRef!: MatBottomSheetRef<any>;

  @ViewChild(TemplateRef) templateRef!: TemplateRef<any>;

  setRef(bottomSheetRef: MatBottomSheetRef<any>): string {
    this.bottomSheetRef = bottomSheetRef;
    return '';
  }
}

@Component({
  template: '<p>Pizza</p> <input> <button>Close</button>',
  changeDetection: ChangeDetectionStrategy.Eager,
})
class PizzaMsg {
  @Input() flavor = 'unknown';
  bottomSheetRef = inject<MatBottomSheetRef<PizzaMsg>>(MatBottomSheetRef);
  injector = inject(Injector);
  directionality = inject(Directionality);
}

@Component({
  template: '<p>Taco</p>',
  changeDetection: ChangeDetectionStrategy.Eager,
})
class TacoMsg {}

@Component({
  template: `
    <h1>This is the title</h1>
    <p>This is the paragraph</p>
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
})
class ContentElementDialog {}

@Component({
  template: '',
  providers: [MatBottomSheet],
  imports: [MatBottomSheetModule],
  changeDetection: ChangeDetectionStrategy.Eager,
})
class ComponentThatProvidesMatBottomSheet {
  bottomSheet = inject(MatBottomSheet);
}

@Component({
  template: '',
  changeDetection: ChangeDetectionStrategy.Eager,
})
class BottomSheetWithInjectedData {
  data = inject(MAT_BOTTOM_SHEET_DATA);
}

@Component({
  template: `<button>I'm a button</button>`,
  encapsulation: ViewEncapsulation.ShadowDom,
  changeDetection: ChangeDetectionStrategy.Eager,
})
class ShadowDomComponent {}

@Component({
  template: '',
  changeDetection: ChangeDetectionStrategy.Eager,
})
class ModuleBoundBottomSheetParentComponent {
  private _injector = inject(Injector);
  private _bottomSheet = inject(MatBottomSheet);

  openBottomSheet(): void {
    const ngModuleRef = createNgModule(
      ModuleBoundBottomSheetModule,
      /* parentInjector */ this._injector,
    );

    this._bottomSheet.open(ModuleBoundBottomSheetComponent, {injector: ngModuleRef.injector});
  }
}

@Service({autoProvided: false})
class ModuleBoundBottomSheetService {
  name = 'Pasta';
}

@Component({
  template:
    '<module-bound-bottom-sheet-child-component></module-bound-bottom-sheet-child-component>',
  imports: [forwardRef(() => ModuleBoundBottomSheetChildComponent)],
  changeDetection: ChangeDetectionStrategy.Eager,
})
class ModuleBoundBottomSheetComponent {}

@Component({
  selector: 'module-bound-bottom-sheet-child-component',
  template: '<p>{{service.name}}</p>',
  changeDetection: ChangeDetectionStrategy.Eager,
})
class ModuleBoundBottomSheetChildComponent {
  service = inject(ModuleBoundBottomSheetService);
}

@NgModule({
  imports: [ModuleBoundBottomSheetComponent, ModuleBoundBottomSheetChildComponent],
  providers: [ModuleBoundBottomSheetService],
})
class ModuleBoundBottomSheetModule {}

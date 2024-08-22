import {createMouseEvent, dispatchEvent} from '@angular/cdk/testing/private';
import {ApplicationRef, Component} from '@angular/core';
import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {ThemePalette} from '@angular/material/core';
import {By} from '@angular/platform-browser';
import {
  MAT_BUTTON_CONFIG,
  MAT_FAB_DEFAULT_OPTIONS,
  MatButtonModule,
  MatFabDefaultOptions,
} from './index';

describe('MatButton', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [MatButtonModule, TestApp],
    });
  }));

  // General button tests
  it('should apply class based on color attribute', () => {
    let fixture = TestBed.createComponent(TestApp);

    let testComponent = fixture.debugElement.componentInstance;
    let buttonDebugElement = fixture.debugElement.query(By.css('button'))!;
    let aDebugElement = fixture.debugElement.query(By.css('a'))!;

    testComponent.buttonColor = 'primary';
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    expect(buttonDebugElement.nativeElement.classList.contains('mat-primary')).toBe(true);
    expect(aDebugElement.nativeElement.classList.contains('mat-primary')).toBe(true);

    testComponent.buttonColor = 'accent';
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    expect(buttonDebugElement.nativeElement.classList.contains('mat-accent')).toBe(true);
    expect(aDebugElement.nativeElement.classList.contains('mat-accent')).toBe(true);

    testComponent.buttonColor = null;
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();

    expect(buttonDebugElement.nativeElement.classList).not.toContain('mat-accent');
    expect(aDebugElement.nativeElement.classList).not.toContain('mat-accent');
  });

  it('should apply class based on the disabled state', () => {
    const fixture = TestBed.createComponent(TestApp);
    const button = fixture.debugElement.query(By.css('button'))!.nativeElement;
    const anchor = fixture.debugElement.query(By.css('a'))!.nativeElement;

    expect(button.classList).not.toContain('mat-mdc-button-disabled');
    expect(anchor.classList).not.toContain('mat-mdc-button-disabled');

    fixture.componentInstance.isDisabled = true;
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();

    expect(button.classList).toContain('mat-mdc-button-disabled');
    expect(anchor.classList).toContain('mat-mdc-button-disabled');
  });

  it('should not clear previous defined classes', () => {
    let fixture = TestBed.createComponent(TestApp);
    let testComponent = fixture.debugElement.componentInstance;
    let buttonDebugElement = fixture.debugElement.query(By.css('button'))!;

    buttonDebugElement.nativeElement.classList.add('custom-class');

    testComponent.buttonColor = 'primary';
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();

    expect(buttonDebugElement.nativeElement.classList.contains('mat-primary')).toBe(true);
    expect(buttonDebugElement.nativeElement.classList.contains('custom-class')).toBe(true);

    testComponent.buttonColor = 'accent';
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();

    expect(buttonDebugElement.nativeElement.classList.contains('mat-primary')).toBe(false);
    expect(buttonDebugElement.nativeElement.classList.contains('mat-accent')).toBe(true);
    expect(buttonDebugElement.nativeElement.classList.contains('custom-class')).toBe(true);
  });

  describe('button[mat-fab]', () => {
    it('should have accent palette by default', () => {
      const fixture = TestBed.createComponent(TestApp);
      const fabButtonDebugEl = fixture.debugElement.query(By.css('button[mat-fab]'))!;

      fixture.detectChanges();

      expect(fabButtonDebugEl.nativeElement.classList)
        .withContext('Expected fab buttons to use accent palette by default')
        .toContain('mat-accent');
    });
  });

  describe('button[mat-mini-fab]', () => {
    it('should have accent palette by default', () => {
      const fixture = TestBed.createComponent(TestApp);
      const miniFabButtonDebugEl = fixture.debugElement.query(By.css('button[mat-mini-fab]'))!;

      fixture.detectChanges();

      expect(miniFabButtonDebugEl.nativeElement.classList)
        .withContext('Expected mini-fab buttons to use accent palette by default')
        .toContain('mat-accent');
    });
  });

  describe('button[mat-fab] extended', () => {
    it('should be extended', () => {
      const fixture = TestBed.createComponent(TestApp);
      fixture.detectChanges();
      const extendedFabButtonDebugEl = fixture.debugElement.query(By.css('.extended-fab-test'))!;

      expect(
        extendedFabButtonDebugEl.nativeElement.classList.contains('mat-mdc-extended-fab'),
      ).toBeFalse();

      fixture.componentInstance.extended = true;
      fixture.changeDetectorRef.markForCheck();

      fixture.detectChanges();
      expect(extendedFabButtonDebugEl.nativeElement.classList).toContain('mat-mdc-extended-fab');
    });
  });

  // Regular button tests
  describe('button[mat-button]', () => {
    it('should handle a click on the button', () => {
      let fixture = TestBed.createComponent(TestApp);
      let testComponent = fixture.debugElement.componentInstance;
      let buttonDebugElement = fixture.debugElement.query(By.css('button'))!;

      buttonDebugElement.nativeElement.click();
      expect(testComponent.clickCount).toBe(1);
    });

    it('should not increment if disabled', () => {
      let fixture = TestBed.createComponent(TestApp);
      let testComponent = fixture.debugElement.componentInstance;
      let buttonDebugElement = fixture.debugElement.query(By.css('button'))!;

      testComponent.isDisabled = true;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      buttonDebugElement.nativeElement.click();

      expect(testComponent.clickCount).toBe(0);
    });

    it('should disable the native button element', () => {
      let fixture = TestBed.createComponent(TestApp);
      let buttonNativeElement = fixture.nativeElement.querySelector('button');
      expect(buttonNativeElement.disabled)
        .withContext('Expected button not to be disabled')
        .toBeFalsy();

      fixture.componentInstance.isDisabled = true;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      expect(buttonNativeElement.disabled)
        .withContext('Expected button to be disabled')
        .toBeTruthy();
    });
  });

  // Anchor button tests
  describe('a[mat-button]', () => {
    it('should not redirect if disabled', () => {
      let fixture = TestBed.createComponent(TestApp);
      let testComponent = fixture.debugElement.componentInstance;
      let buttonDebugElement = fixture.debugElement.query(By.css('a'))!;

      testComponent.isDisabled = true;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      buttonDebugElement.nativeElement.click();
    });

    it('should remove tabindex if disabled', () => {
      let fixture = TestBed.createComponent(TestApp);
      let testComponent = fixture.debugElement.componentInstance;
      let buttonDebugElement = fixture.debugElement.query(By.css('a'))!;
      fixture.detectChanges();

      expect(buttonDebugElement.nativeElement.hasAttribute('tabindex')).toBe(false);

      testComponent.isDisabled = true;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      expect(buttonDebugElement.nativeElement.getAttribute('tabindex')).toBe('-1');
    });

    it('should add aria-disabled attribute if disabled', () => {
      let fixture = TestBed.createComponent(TestApp);
      let testComponent = fixture.debugElement.componentInstance;
      let buttonDebugElement = fixture.debugElement.query(By.css('a'))!;
      fixture.detectChanges();
      expect(buttonDebugElement.nativeElement.hasAttribute('aria-disabled')).toBe(false);

      testComponent.isDisabled = true;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      expect(buttonDebugElement.nativeElement.getAttribute('aria-disabled')).toBe('true');
    });

    it('should not add aria-disabled attribute if disabled is false', () => {
      let fixture = TestBed.createComponent(TestApp);
      let testComponent = fixture.debugElement.componentInstance;
      let buttonDebugElement = fixture.debugElement.query(By.css('a'))!;
      fixture.detectChanges();
      expect(buttonDebugElement.nativeElement.hasAttribute('aria-disabled')).toBe(false);
      expect(buttonDebugElement.nativeElement.getAttribute('disabled')).toBeNull();

      testComponent.isDisabled = false;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      expect(buttonDebugElement.nativeElement.hasAttribute('aria-disabled')).toBe(false);
      expect(buttonDebugElement.nativeElement.getAttribute('disabled')).toBeNull();
    });

    it('should be able to set a custom tabindex', () => {
      let fixture = TestBed.createComponent(TestApp);
      let testComponent = fixture.debugElement.componentInstance;
      let buttonElement = fixture.debugElement.query(By.css('a'))!.nativeElement;

      fixture.componentInstance.tabIndex = 3;
      fixture.detectChanges();

      expect(buttonElement.getAttribute('tabindex'))
        .withContext('Expected custom tabindex to be set')
        .toBe('3');

      testComponent.isDisabled = true;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      expect(buttonElement.getAttribute('tabindex'))
        .withContext('Expected custom tabindex to be overwritten when disabled.')
        .toBe('-1');
    });

    it('should not set a default tabindex on enabled links', () => {
      const fixture = TestBed.createComponent(TestApp);
      const buttonElement = fixture.debugElement.query(By.css('a'))!.nativeElement;
      fixture.detectChanges();

      expect(buttonElement.hasAttribute('tabindex')).toBe(false);
    });

    describe('change detection behavior', () => {
      it('should not run change detection for disabled anchor but should prevent the default behavior and stop event propagation', () => {
        const appRef = TestBed.inject(ApplicationRef);
        const fixture = TestBed.createComponent(TestApp);
        fixture.componentInstance.isDisabled = true;
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();
        const anchorElement = fixture.debugElement.query(By.css('a'))!.nativeElement;

        spyOn(appRef, 'tick');

        const event = createMouseEvent('click');
        spyOn(event, 'preventDefault').and.callThrough();
        spyOn(event, 'stopImmediatePropagation').and.callThrough();

        dispatchEvent(anchorElement, event);

        expect(appRef.tick).not.toHaveBeenCalled();
        expect(event.preventDefault).toHaveBeenCalled();
        expect(event.stopImmediatePropagation).toHaveBeenCalled();
      });
    });
  });

  it('should have a focus indicator', () => {
    const fixture = TestBed.createComponent(TestApp);
    const buttonNativeElements = [
      ...fixture.debugElement.nativeElement.querySelectorAll('a, button'),
    ];

    expect(
      buttonNativeElements.every(element => !!element.querySelector('.mat-mdc-focus-indicator')),
    ).toBe(true);
  });

  it('should be able to configure the default color of buttons', () => {
    @Component({
      template: `<button mat-button>Click me</button>`,
      standalone: true,
      imports: [MatButtonModule],
    })
    class ConfigTestApp {}

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [MatButtonModule, ConfigTestApp],
      providers: [
        {
          provide: MAT_BUTTON_CONFIG,
          useValue: {color: 'warn'},
        },
      ],
    });
    const fixture = TestBed.createComponent(ConfigTestApp);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button');
    expect(button.classList).toContain('mat-warn');
  });

  describe('interactive disabled buttons', () => {
    let fixture: ComponentFixture<TestApp>;
    let button: HTMLButtonElement;

    beforeEach(() => {
      fixture = TestBed.createComponent(TestApp);
      fixture.componentInstance.isDisabled = true;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();
      button = fixture.debugElement.query(By.css('button'))!.nativeElement;
    });

    it('should set a class when allowing disabled interactivity', () => {
      expect(button.classList).not.toContain('mat-mdc-button-disabled-interactive');

      fixture.componentInstance.disabledInteractive = true;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      expect(button.classList).toContain('mat-mdc-button-disabled-interactive');
    });

    it('should set aria-disabled when allowing disabled interactivity', () => {
      expect(button.hasAttribute('aria-disabled')).toBe(false);

      fixture.componentInstance.disabledInteractive = true;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      expect(button.getAttribute('aria-disabled')).toBe('true');
    });

    it('should not set the disabled attribute when allowing disabled interactivity', () => {
      expect(button.getAttribute('disabled')).toBe('true');

      fixture.componentInstance.disabledInteractive = true;
      fixture.changeDetectorRef.markForCheck();
      fixture.detectChanges();

      expect(button.hasAttribute('disabled')).toBe(false);
    });
  });
});

describe('MatFabDefaultOptions', () => {
  function configure(defaults: MatFabDefaultOptions) {
    TestBed.configureTestingModule({
      imports: [MatButtonModule, TestApp],
      providers: [{provide: MAT_FAB_DEFAULT_OPTIONS, useValue: defaults}],
    });
  }

  it('should override default color in component', () => {
    configure({color: 'primary'});
    const fixture: ComponentFixture<TestApp> = TestBed.createComponent(TestApp);
    fixture.detectChanges();
    const fabButtonDebugEl = fixture.debugElement.query(By.css('button[mat-fab]'))!;
    expect(fabButtonDebugEl.nativeElement.classList).toContain('mat-primary');
  });

  it('should default to accent if config does not specify color', () => {
    configure({});
    const fixture: ComponentFixture<TestApp> = TestBed.createComponent(TestApp);
    fixture.detectChanges();
    const fabButtonDebugEl = fixture.debugElement.query(By.css('button[mat-fab]'))!;
    expect(fabButtonDebugEl.nativeElement.classList).toContain('mat-accent');
  });
});

/** Test component that contains an MatButton. */
@Component({
  selector: 'test-app',
  template: `
    <button [tabIndex]="tabIndex" mat-button type="button" (click)="increment()"
      [disabled]="isDisabled" [color]="buttonColor" [disableRipple]="rippleDisabled"
      [disabledInteractive]="disabledInteractive">
      Go
    </button>
    <a [tabIndex]="tabIndex" href="https://www.google.com" mat-button [disabled]="isDisabled"
      [color]="buttonColor" [disabledInteractive]="disabledInteractive">
      Link
    </a>
    <button mat-fab>Fab Button</button>
    <button mat-fab [extended]="extended" class="extended-fab-test">Extended</button>
    <button mat-mini-fab>Mini Fab Button</button>
  `,
  standalone: true,
  imports: [MatButtonModule],
})
class TestApp {
  clickCount = 0;
  isDisabled = false;
  rippleDisabled = false;
  buttonColor: ThemePalette;
  tabIndex: number;
  extended = false;
  disabledInteractive = false;

  increment() {
    this.clickCount++;
  }
}

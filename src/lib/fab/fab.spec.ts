import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {Component, DebugElement} from '@angular/core';
import {By} from '@angular/platform-browser';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {MatRipple} from '@angular/material/core';
import {MatFabModule} from './index';


describe('MatFab', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MatFabModule,
        NoopAnimationsModule
      ],
      declarations: [TestApp]
    });

    TestBed.compileComponents();
  }));

  describe('MatFab', () => {
    let fixture: ComponentFixture<TestApp>;
    let testComponent: TestApp;
    let fabDebugElement: DebugElement;
    beforeEach(() => {
      fixture = TestBed.createComponent(TestApp);
      fixture.detectChanges();

      testComponent = fixture.componentInstance;

      fabDebugElement = fixture.debugElement.query(By.css('button'));
    });


    it('should apply class based on color attribute', () => {
      testComponent.buttonColor = 'primary';
      fixture.detectChanges();
      expect(fabDebugElement.nativeElement.classList.contains('mat-primary')).toBe(true);

      testComponent.buttonColor = 'accent';
      fixture.detectChanges();
      expect(fabDebugElement.nativeElement.classList.contains('mat-accent')).toBe(true);

      testComponent.buttonColor = null;
      fixture.detectChanges();

      expect(fabDebugElement.nativeElement.classList).toContain('mat-accent');
    });

    it('should should not clear previous defined classes', () => {
      fabDebugElement.nativeElement.classList.add('custom-class');

      testComponent.buttonColor = 'primary';
      fixture.detectChanges();

      expect(fabDebugElement.nativeElement.classList.contains('mat-primary')).toBe(true);
      expect(fabDebugElement.nativeElement.classList.contains('custom-class')).toBe(true);

      testComponent.buttonColor = 'accent';
      fixture.detectChanges();

      expect(fabDebugElement.nativeElement.classList.contains('mat-primary')).toBe(false);
      expect(fabDebugElement.nativeElement.classList.contains('mat-accent')).toBe(true);
      expect(fabDebugElement.nativeElement.classList.contains('custom-class')).toBe(true);
    });

    it('should handle a click on the FAB', () => {
      fabDebugElement.nativeElement.click();
      expect(testComponent.clickCount).toBe(1);
    });

    it('should not increment if disabled', () => {
      testComponent.isDisabled = true;
      fixture.detectChanges();

      fabDebugElement.nativeElement.click();

      expect(testComponent.clickCount).toBe(0);
    });

    it('should disable the native button element', () => {
      let buttonNativeElement = fixture.nativeElement.querySelector('button');
      expect(buttonNativeElement.disabled).toBeFalsy('Expected FAB not to be disabled');

      fixture.componentInstance.isDisabled = true;
      fixture.detectChanges();
      expect(buttonNativeElement.disabled).toBeTruthy('Expected FAB to be disabled');
    });

    describe('with a label', () => {
      beforeEach(() => {
        testComponent.hasLabel = true;
        fixture.detectChanges();
      });

      it('should extend', () => {
        expect(fabDebugElement.classes['mat-fab-extended']).toBeFalsy();
        testComponent.extended = true;
        fixture.detectChanges();
        expect(fabDebugElement.classes['mat-fab-extended']).toBeTruthy();
      });

      it('should extend on focus', () => {
        expect(fabDebugElement.classes['mat-fab-extended']).toBeFalsy();
        fabDebugElement.triggerEventHandler('focus', {});
        fixture.detectChanges();
        expect(fabDebugElement.classes['mat-fab-extended']).toBeTruthy();

        testComponent.extendOnFocus = false;
        fixture.detectChanges();
        expect(fabDebugElement.classes['mat-fab-extended']).toBeFalsy();
      });

      it('should extend on hover', () => {
        expect(fabDebugElement.classes['mat-fab-extended']).toBeFalsy();
        fabDebugElement.triggerEventHandler('mouseover', {});
        fixture.detectChanges();
        expect(fabDebugElement.classes['mat-fab-extended']).toBeTruthy();

        fabDebugElement.triggerEventHandler('mouseleave', {});
        fixture.detectChanges();
        expect(fabDebugElement.classes['mat-fab-extended']).toBeFalsy();

        fabDebugElement.triggerEventHandler('mouseover', {});
        fixture.detectChanges();

        testComponent.extendOnHover = false;
        fixture.detectChanges();
        expect(fabDebugElement.classes['mat-fab-extended']).toBeFalsy();
      });

      it('should extend in the correct direction', () => {
        testComponent.extended = true;
        fixture.detectChanges();
        let fabLabelElement = fixture.debugElement.query(By.css('.mat-fab-label'));

        expect(fabLabelElement.styles.order).toBe('1');

        testComponent.labelLocation = 'before';
        fixture.detectChanges();
        expect(fabLabelElement.styles.order).toBe('-1');
      });
    });

    describe('without a label', () => {
      beforeEach(() => {
        testComponent.hasLabel = false;
        fixture.detectChanges();
      });

      it('should extend', () => {
        expect(fabDebugElement.classes['mat-fab-extended']).toBeFalsy();
        testComponent.extended = true;
        fixture.detectChanges();
        expect(fabDebugElement.classes['mat-fab-extended']).toBeFalsy();
      });

      it('should extend on focus', () => {
        expect(fabDebugElement.classes['mat-fab-extended']).toBeFalsy();
        fabDebugElement.triggerEventHandler('focus', {});
        fixture.detectChanges();
        expect(fabDebugElement.classes['mat-fab-extended']).toBeFalsy();

        testComponent.extendOnFocus = false;
        fixture.detectChanges();
        expect(fabDebugElement.classes['mat-fab-extended']).toBeFalsy();
      });

      it('should extend on hover', () => {
        expect(fabDebugElement.classes['mat-fab-extended']).toBeFalsy();
        fabDebugElement.triggerEventHandler('mouseover', {});
        fixture.detectChanges();
        expect(fabDebugElement.classes['mat-fab-extended']).toBeFalsy();

        fabDebugElement.triggerEventHandler('mouseleave', {});
        fixture.detectChanges();
        expect(fabDebugElement.classes['mat-fab-extended']).toBeFalsy();

        fabDebugElement.triggerEventHandler('mouseover', {});
        fixture.detectChanges();

        testComponent.extendOnHover = false;
        fixture.detectChanges();
        expect(fabDebugElement.classes['mat-fab-extended']).toBeFalsy();
      });
    });
  });



  describe('fab ripples', () => {
    let fixture: ComponentFixture<TestApp>;
    let testComponent: TestApp;
    let fabDebugElement: DebugElement;
    let fabRippleDebugElement: DebugElement;
    let fabRippleInstance: MatRipple;
    beforeEach(() => {
      fixture = TestBed.createComponent(TestApp);
      fixture.detectChanges();

      testComponent = fixture.componentInstance;

      fabDebugElement = fixture.debugElement.query(By.css('button'));
      fabRippleDebugElement = fabDebugElement.query(By.directive(MatRipple));
      fabRippleInstance = fabRippleDebugElement.injector.get<MatRipple>(MatRipple);
    });

    it('should disable the ripple if matRippleDisabled input is set', () => {
      expect(fabRippleInstance.disabled).toBeFalsy();

      testComponent.rippleDisabled = true;
      fixture.detectChanges();

      expect(fabRippleInstance.disabled).toBeTruthy();
    });

    it('should disable the ripple when the FAB is disabled', () => {
      expect(fabRippleInstance.disabled).toBeFalsy(
        'Expected an enabled button[mat-fab] to have an enabled ripple'
      );

      testComponent.isDisabled = true;
      fixture.detectChanges();

      expect(fabRippleInstance.disabled).toBeTruthy(
        'Expected a disabled button[mat-fab] not to have an enabled ripple'
      );
    });
  });
});

/** Test component that contains an MatFab. */
@Component({
  selector: 'test-app',
  template: `
    <button [color]="buttonColor" mat-fab [extendOnFocus]="extendOnFocus" (click)="increment()"
            [disabled]="isDisabled" [disableRipple]="rippleDisabled" [labelLocation]="labelLocation"
            [extendOnHover]="extendOnHover" [extended]="extended">
      Go
      <ng-template *ngIf="hasLabel" #label>This is a label</ng-template>
    </button>
  `
})
class TestApp {
  buttonColor: string|null;
  hasLabel = false;
  clickCount: number = 0;
  isDisabled: boolean = false;
  rippleDisabled: boolean = false;
  extendOnFocus: boolean = true;
  extendOnHover: boolean = true;
  labelLocation: string;
  extended: boolean = false;

  increment() {
    this.clickCount++;
  }
}

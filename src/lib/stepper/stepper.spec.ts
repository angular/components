import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {Component, DebugElement} from '@angular/core';
import {MdStepperModule} from './index';
import {By} from '@angular/platform-browser';
import {MdHorizontalStepper} from './stepper-horizontal';
import {MdVerticalStepper} from './stepper-vertical';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MdStepperNext, MdStepperPrevious} from './stepper-button';
import {dispatchKeyboardEvent} from '@angular/cdk/testing';
import {ENTER, LEFT_ARROW, RIGHT_ARROW, SPACE} from '@angular/cdk/keycodes';

fdescribe('MdHorizontalStepper', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MdStepperModule, NoopAnimationsModule, FormsModule, ReactiveFormsModule],
      declarations: [
        SimpleMdHorizontalStepperApp,
        LinearMdHorizontalStepperApp
      ]
    });

    TestBed.compileComponents();
  }));

  describe('basic horizontal stepper', () => {
    let fixture: ComponentFixture<SimpleMdHorizontalStepperApp>;
    let stepperComponent: MdHorizontalStepper;
    let stepperEl: HTMLElement;

    beforeEach(() => {
      fixture = TestBed.createComponent(SimpleMdHorizontalStepperApp);
      fixture.detectChanges();

      stepperComponent = fixture.debugElement
          .query(By.css('md-horizontal-stepper')).componentInstance;
    });

    it('should default to the first step', () => {
      expect(stepperComponent.selectedIndex).toBe(0);
    });

    it('should change selected index on header click', () => {
      let stepHeader = fixture.debugElement.queryAll(By.css('.mat-horizontal-stepper-header'));
      checkSelectionChangeOnHeaderClick(stepperComponent, fixture, stepHeader);

    });

    it('should set the "tablist" role on stepper', () => {
      stepperEl = fixture.debugElement.query(By.css('md-horizontal-stepper')).nativeElement;
      expect(stepperEl.getAttribute('role')).toBe('tablist');
    });

    it('should expand the right content', () => {
      let stepContent = fixture.debugElement.queryAll(By.css(`.mat-horizontal-stepper-content`));
      checkExpandedContent(stepperComponent, fixture, stepContent);
    });

    it('should display the correct label', () => {
      checkCorrectLabel(stepperComponent, fixture);
    });

    it('should go to next available step when the next button is clicked', () => {
      checkNextStepperButton(stepperComponent, fixture);
    });

    it('should go to previous available step when the previous button is clicked', () => {
      checkPreviousStepperButton(stepperComponent, fixture);
    });

    it('should set the correct step position for animation', () => {
      checkStepPosition(stepperComponent, fixture);
    });

    it('should support keyboard events to move and select focus', () => {
      let stepHeader = fixture.debugElement.queryAll(By.css('.mat-horizontal-stepper-header'));
      checkKeyboardEvent(stepperComponent, fixture, stepHeader);
    });
  });

  describe('linear horizontal stepper', () => {
    let fixture: ComponentFixture<LinearMdHorizontalStepperApp>;
    let testComponent: LinearMdHorizontalStepperApp;
    let stepperComponent: MdHorizontalStepper;

    beforeEach(() => {
      fixture = TestBed.createComponent(LinearMdHorizontalStepperApp);
      fixture.detectChanges();

      testComponent = fixture.componentInstance;
      stepperComponent = fixture.debugElement
          .query(By.css('md-horizontal-stepper')).componentInstance;
    });

    it('should have true linear attribute', () => {
      expect(stepperComponent.linear).toBe(true);
    });

    it('should not move to next step if current step is not valid', () => {
      expect(testComponent.oneGroup.get('oneCtrl')!.value).toBe('');
      expect(testComponent.oneGroup.valid).toBe(false);
      expect(stepperComponent.selectedIndex).toBe(0);

      let stepHeaderEl = fixture.debugElement
          .queryAll(By.css('.mat-horizontal-stepper-header'))[1].nativeElement;
      checkLinearStepperValidity(stepHeaderEl, stepperComponent, testComponent, fixture);
    });
  });
});

fdescribe('MdVerticalStepper', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MdStepperModule, NoopAnimationsModule, FormsModule, ReactiveFormsModule],
      declarations: [
        SimpleMdVerticalStepperApp,
        LinearMdVerticalStepperApp
      ]
    });

    TestBed.compileComponents();
  }));

  describe('basic vertical stepper', () => {
    let fixture: ComponentFixture<SimpleMdVerticalStepperApp>;
    let stepperComponent: MdVerticalStepper;
    let stepperEl: HTMLElement;

    beforeEach(() => {
      fixture = TestBed.createComponent(SimpleMdVerticalStepperApp);
      fixture.detectChanges();

      stepperComponent = fixture.debugElement
          .query(By.css('md-vertical-stepper')).componentInstance;
    });

    it('should default to the first step', () => {
      expect(stepperComponent.selectedIndex).toBe(0);
    });

    it('should change selected index on header click', () => {
      let stepHeader = fixture.debugElement.queryAll(By.css('.mat-vertical-stepper-header'));
      checkSelectionChangeOnHeaderClick(stepperComponent, fixture, stepHeader);

    });

    it('should set the "tablist" role on stepper', () => {
      stepperEl = fixture.debugElement.query(By.css('md-vertical-stepper')).nativeElement;
      expect(stepperEl.getAttribute('role')).toBe('tablist');
    });

    it('should expand the right content', () => {
      let stepContent = fixture.debugElement.queryAll(By.css(`.mat-vertical-stepper-content`));
      checkExpandedContent(stepperComponent, fixture, stepContent);
    });

    it('should display the correct label', () => {
      checkCorrectLabel(stepperComponent, fixture);
    });

    it('should go to next available step when the next button is clicked', () => {
      checkNextStepperButton(stepperComponent, fixture);
    });

    it('should go to previous available step when the previous button is clicked', () => {
      checkPreviousStepperButton(stepperComponent, fixture);
    });

    it('should set the correct step position for animation', () => {
      checkStepPosition(stepperComponent, fixture);
    });

    it('should support keyboard events to move and select focus', () => {
      let stepHeader = fixture.debugElement.queryAll(By.css('.mat-vertical-stepper-header'));
      checkKeyboardEvent(stepperComponent, fixture, stepHeader);
    });
  });

  describe('linear vertical stepper', () => {
    let fixture: ComponentFixture<LinearMdVerticalStepperApp>;
    let testComponent: LinearMdVerticalStepperApp;
    let stepperComponent: MdVerticalStepper;

    beforeEach(() => {
      fixture = TestBed.createComponent(LinearMdVerticalStepperApp);
      fixture.detectChanges();

      testComponent = fixture.componentInstance;
      stepperComponent = fixture.debugElement
          .query(By.css('md-vertical-stepper')).componentInstance;
    });

    it('should have true linear attribute', () => {
      expect(stepperComponent.linear).toBe(true);
    });

    it('should not move to next step if current step is not valid', () => {
      expect(testComponent.oneGroup.get('oneCtrl')!.value).toBe('');
      expect(testComponent.oneGroup.valid).toBe(false);
      expect(stepperComponent.selectedIndex).toBe(0);

      let stepHeaderEl = fixture.debugElement
          .queryAll(By.css('.mat-vertical-stepper-header'))[1].nativeElement;

      checkLinearStepperValidity(stepHeaderEl, stepperComponent, testComponent, fixture);
    });
  });
});

function checkSelectionChangeOnHeaderClick(stepperComponent:
                                               MdHorizontalStepper | MdVerticalStepper,
                                           fixture: ComponentFixture<any>,
                                           stepHeader: DebugElement[]) {
  expect(stepperComponent.selectedIndex).toBe(0);

  // select the second step
  let stepHeaderEl = stepHeader[1].nativeElement;
  stepHeaderEl.click();
  fixture.detectChanges();

  expect(stepperComponent.selectedIndex).toBe(1);

  // select the third step
  stepHeaderEl = stepHeader[2].nativeElement;
  stepHeaderEl.click();
  fixture.detectChanges();

  expect(stepperComponent.selectedIndex).toBe(2);
}

function checkExpandedContent(stepperComponent: MdHorizontalStepper | MdVerticalStepper,
                              fixture: ComponentFixture<any>,
                              stepContent: DebugElement[]) {
  let stepContentEl = stepContent[0].nativeElement;
  expect(stepContentEl.getAttribute('aria-expanded')).toBe('true');

  stepperComponent.selectedIndex = 1;
  fixture.detectChanges();

  expect(stepContentEl.getAttribute('aria-expanded')).toBe('false');
  stepContentEl = stepContent[1].nativeElement;
  expect(stepContentEl.getAttribute('aria-expanded')).toBe('true');
}

function checkCorrectLabel(stepperComponent: MdHorizontalStepper | MdVerticalStepper,
                           fixture: ComponentFixture<any>) {
  let selectedLabel = fixture.nativeElement.querySelector('[aria-selected="true"]');
  expect(selectedLabel.textContent).toMatch('Step 1');

  stepperComponent.selectedIndex = 2;
  fixture.detectChanges();

  selectedLabel = fixture.nativeElement.querySelector('[aria-selected="true"]');
  expect(selectedLabel.textContent).toMatch('Step 3');

  fixture.componentInstance.inputLabel = 'New Label';
  fixture.detectChanges();

  selectedLabel = fixture.nativeElement.querySelector('[aria-selected="true"]');
  expect(selectedLabel.textContent).toMatch('New Label');
}

function checkNextStepperButton(stepperComponent: MdHorizontalStepper | MdVerticalStepper,
                                fixture: ComponentFixture<any>) {
  expect(stepperComponent.selectedIndex).toBe(0);

  let nextButtonNativeEl = fixture.debugElement
      .queryAll(By.directive(MdStepperNext))[0].nativeElement;
  nextButtonNativeEl.click();
  fixture.detectChanges();

  expect(stepperComponent.selectedIndex).toBe(1);

  nextButtonNativeEl = fixture.debugElement
      .queryAll(By.directive(MdStepperNext))[1].nativeElement;
  nextButtonNativeEl.click();
  fixture.detectChanges();

  expect(stepperComponent.selectedIndex).toBe(2);

  nextButtonNativeEl = fixture.debugElement
      .queryAll(By.directive(MdStepperNext))[2].nativeElement;
  nextButtonNativeEl.click();
  fixture.detectChanges();

  expect(stepperComponent.selectedIndex).toBe(2);
}

function checkPreviousStepperButton(stepperComponent: MdHorizontalStepper | MdVerticalStepper,
                                    fixture: ComponentFixture<any>) {
  expect(stepperComponent.selectedIndex).toBe(0);

  stepperComponent.selectedIndex = 2;
  let previousButtonNativeEl = fixture.debugElement
      .queryAll(By.directive(MdStepperPrevious))[2].nativeElement;
  previousButtonNativeEl.click();
  fixture.detectChanges();

  expect(stepperComponent.selectedIndex).toBe(1);

  previousButtonNativeEl = fixture.debugElement
      .queryAll(By.directive(MdStepperPrevious))[1].nativeElement;
  previousButtonNativeEl.click();
  fixture.detectChanges();

  expect(stepperComponent.selectedIndex).toBe(0);

  previousButtonNativeEl = fixture.debugElement
      .queryAll(By.directive(MdStepperPrevious))[0].nativeElement;
  previousButtonNativeEl.click();
  fixture.detectChanges();

  expect(stepperComponent.selectedIndex).toBe(0);
}

function checkStepPosition(stepperComponent: MdHorizontalStepper | MdVerticalStepper,
                           fixture: ComponentFixture<any>) {
  expect(stepperComponent._getAnimationDirection(0)).toBe('current');
  expect(stepperComponent._getAnimationDirection(1)).toBe('next');
  expect(stepperComponent._getAnimationDirection(2)).toBe('next');

  stepperComponent.selectedIndex = 1;
  fixture.detectChanges();

  expect(stepperComponent._getAnimationDirection(0)).toBe('previous');
  expect(stepperComponent._getAnimationDirection(1)).toBe('current');
  expect(stepperComponent._getAnimationDirection(2)).toBe('next');

  stepperComponent.selectedIndex = 2;
  fixture.detectChanges();

  expect(stepperComponent._getAnimationDirection(0)).toBe('previous');
  expect(stepperComponent._getAnimationDirection(1)).toBe('previous');
  expect(stepperComponent._getAnimationDirection(2)).toBe('current');
}

function checkKeyboardEvent(stepperComponent: MdHorizontalStepper | MdVerticalStepper,
                            fixture: ComponentFixture<any>,
                            stepHeader: DebugElement[]) {
  expect(stepperComponent._focusIndex).toBe(0);
  expect(stepperComponent.selectedIndex).toBe(0);

  let stepHeaderEl = stepHeader[0].nativeElement;
  dispatchKeyboardEvent(stepHeaderEl, 'keydown', RIGHT_ARROW);
  fixture.detectChanges();

  expect(stepperComponent._focusIndex).toBe(1);
  expect(stepperComponent.selectedIndex).toBe(0);

  stepHeaderEl = stepHeader[1].nativeElement;
  dispatchKeyboardEvent(stepHeaderEl, 'keydown', ENTER);
  fixture.detectChanges();

  expect(stepperComponent._focusIndex).toBe(1);
  expect(stepperComponent.selectedIndex).toBe(1);

  stepHeaderEl = stepHeader[1].nativeElement;
  dispatchKeyboardEvent(stepHeaderEl, 'keydown', LEFT_ARROW);
  fixture.detectChanges();

  expect(stepperComponent._focusIndex).toBe(0);
  expect(stepperComponent.selectedIndex).toBe(1);

  // When the focus is on the last step and right arrow key is pressed, the focus should cycle
  // through to the first step.
  stepperComponent._focusIndex = 2;
  stepHeaderEl = stepHeader[2].nativeElement;
  dispatchKeyboardEvent(stepHeaderEl, 'keydown', RIGHT_ARROW);
  fixture.detectChanges();

  expect(stepperComponent._focusIndex).toBe(0);
  expect(stepperComponent.selectedIndex).toBe(1);

  stepHeaderEl = stepHeader[0].nativeElement;
  dispatchKeyboardEvent(stepHeaderEl, 'keydown', SPACE);
  fixture.detectChanges();

  expect(stepperComponent._focusIndex).toBe(0);
  expect(stepperComponent.selectedIndex).toBe(0);
}

function checkLinearStepperValidity(stepHeaderEl: HTMLElement,
                                    stepperComponent: MdHorizontalStepper | MdVerticalStepper,
                                    testComponent:
                                        LinearMdHorizontalStepperApp | LinearMdVerticalStepperApp,
                                    fixture: ComponentFixture<any>) {
  stepHeaderEl.click();
  fixture.detectChanges();

  expect(stepperComponent.selectedIndex).toBe(0);

  let nextButtonNativeEl = fixture.debugElement
      .queryAll(By.directive(MdStepperNext))[0].nativeElement;
  nextButtonNativeEl.click();
  fixture.detectChanges();

  expect(stepperComponent.selectedIndex).toBe(0);

  testComponent.oneGroup.get('oneCtrl')!.setValue('answer');
  stepHeaderEl.click();
  fixture.detectChanges();

  expect(testComponent.oneGroup.valid).toBe(true);
  expect(stepperComponent.selectedIndex).toBe(1);
}

@Component({
  template: `
    <md-horizontal-stepper>
      <md-step>
        <ng-template mdStepLabel>Step 1</ng-template>
        Content 1
        <div>
          <button md-button mdStepperPrevious>Back</button>
          <button md-button mdStepperNext>Next</button>
        </div>
      </md-step>
      <md-step>
        <ng-template mdStepLabel>Step 2</ng-template>
        Content 2
        <div>
          <button md-button mdStepperPrevious>Back</button>
          <button md-button mdStepperNext>Next</button>
        </div>
      </md-step>
      <md-step [label]="inputLabel">
        Content 3
        <div>
          <button md-button mdStepperPrevious>Back</button>
          <button md-button mdStepperNext>Next</button>
        </div>
      </md-step>
    </md-horizontal-stepper>
  `
})
class SimpleMdHorizontalStepperApp {
  inputLabel = 'Step 3';
}

@Component({
  template: `
    <md-horizontal-stepper linear>
      <md-step [stepControl]="oneGroup">
        <form [formGroup]="oneGroup">
          <ng-template mdStepLabel>Step one</ng-template>
          <md-input-container>
            <input mdInput formControlName="oneCtrl" required>
          </md-input-container>
          <div>
            <button md-button mdStepperPrevious>Back</button>
            <button md-button mdStepperNext>Next</button>
          </div>
        </form>
      </md-step>
      <md-step [stepControl]="twoGroup">
        <form [formGroup]="twoGroup">
          <ng-template mdStepLabel>Step two</ng-template>
          <md-input-container>
            <input mdInput formControlName="twoCtrl" required>
          </md-input-container>
          <div>
            <button md-button mdStepperPrevious>Back</button>
            <button md-button mdStepperNext>Next</button>
          </div>
        </form>
      </md-step>
    </md-horizontal-stepper>
  `
})
class LinearMdHorizontalStepperApp {
  oneGroup: FormGroup;
  twoGroup: FormGroup;

  ngOnInit() {
    this.oneGroup = new FormGroup({
      oneCtrl: new FormControl('', Validators.required)
    });
    this.twoGroup = new FormGroup({
      twoCtrl: new FormControl('', Validators.required)
    });
  }
}

@Component({
  template: `
    <md-vertical-stepper>
      <md-step>
        <ng-template mdStepLabel>Step 1</ng-template>
        Content 1
        <div>
          <button md-button mdStepperPrevious>Back</button>
          <button md-button mdStepperNext>Next</button>
        </div>
      </md-step>
      <md-step>
        <ng-template mdStepLabel>Step 2</ng-template>
        Content 2
        <div>
          <button md-button mdStepperPrevious>Back</button>
          <button md-button mdStepperNext>Next</button>
        </div>
      </md-step>
      <md-step [label]="inputLabel">
        Content 3
        <div>
          <button md-button mdStepperPrevious>Back</button>
          <button md-button mdStepperNext>Next</button>
        </div>
      </md-step>
    </md-vertical-stepper>
  `
})
class SimpleMdVerticalStepperApp {
  inputLabel = 'Step 3';
}

@Component({
  template: `
    <md-vertical-stepper linear>
      <md-step [stepControl]="oneGroup">
        <form [formGroup]="oneGroup">
          <ng-template mdStepLabel>Step one</ng-template>
          <md-input-container>
            <input mdInput formControlName="oneCtrl" required>
          </md-input-container>
          <div>
            <button md-button mdStepperPrevious>Back</button>
            <button md-button mdStepperNext>Next</button>
          </div>
        </form>
      </md-step>
      <md-step [stepControl]="twoGroup">
        <form [formGroup]="twoGroup">
          <ng-template mdStepLabel>Step two</ng-template>
          <md-input-container>
            <input mdInput formControlName="twoCtrl" required>
          </md-input-container>
          <div>
            <button md-button mdStepperPrevious>Back</button>
            <button md-button mdStepperNext>Next</button>
          </div>
        </form>
      </md-step>
    </md-vertical-stepper>
  `
})
class LinearMdVerticalStepperApp {
  oneGroup: FormGroup;
  twoGroup: FormGroup;

  ngOnInit() {
    this.oneGroup = new FormGroup({
      oneCtrl: new FormControl('', Validators.required)
    });
    this.twoGroup = new FormGroup({
      twoCtrl: new FormControl('', Validators.required)
    });
  }
}

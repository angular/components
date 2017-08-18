import {MdStepperModule} from './index';
import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {Component, ViewChild} from '@angular/core';
import {MdStep, MdStepper} from './stepper';
import {MdStepIcon} from './step-icon';
import {By} from '@angular/platform-browser';

describe('MdStepIcon', () => {

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MdStepperModule],
      declarations: [SimpleStepIconApp],
      providers: [
        {provide: MdStepper, useClass: MdStepper}
      ]
    });
    TestBed.compileComponents();
  }));

  describe('setting icon', () => {
    let stepIconComponent: MdStepIcon;
    let fixture: ComponentFixture<SimpleStepIconApp>;
    let testComponent: SimpleStepIconApp;

    beforeEach(() => {
      fixture = TestBed.createComponent(SimpleStepIconApp);
      fixture.detectChanges();

      stepIconComponent = fixture.debugElement.query(By.css('md-step-icon')).componentInstance;
      testComponent = fixture.componentInstance;
    });

    it('should set done icon if step is non-editable and completed', () => {
      stepIconComponent.selected = true;
      fixture.detectChanges();

      expect(stepIconComponent._getIndicatorType()).toBe('number');

      testComponent.mdStep.completed = true;
      testComponent.mdStep.editable = false;
      stepIconComponent.selected = false;
      fixture.detectChanges();

      expect(stepIconComponent._getIndicatorType()).toBe('done');
    });

    it('should set create icon if step is editable and completed', () => {
      stepIconComponent.selected = true;
      fixture.detectChanges();

      expect(stepIconComponent._getIndicatorType()).toBe('number');

      testComponent.mdStep.completed = true;
      testComponent.mdStep.editable = true;
      stepIconComponent.selected = false;
      fixture.detectChanges();

      expect(stepIconComponent._getIndicatorType()).toBe('edit');
    });

    it('should set "mat-step-icon-not-touched" class if the step ', () => {
      let stepIconEl = fixture.debugElement.query(By.css('md-step-icon')).nativeElement;

      testComponent.mdStep.completed = false;
      stepIconComponent.selected = false;
      fixture.detectChanges();

      expect(stepIconComponent._getIndicatorType()).toBe('number');
      expect(stepIconEl.classList).toContain('mat-step-icon-not-touched');
    });
  });
});

@Component({
  template: `
    <md-step>step</md-step>
    <md-step-icon [step]="mdStep"></md-step-icon>
  `
})
class SimpleStepIconApp {
  @ViewChild(MdStep) mdStep: MdStep;
}

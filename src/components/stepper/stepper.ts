import {
  Component,
  Input,
  ViewEncapsulation,
} from '@angular/core';
import { BooleanFieldValue } from '@angular2-material/core/annotations/field-value';
import { MdIcon, MdIconRegistry } from '@angular2-material/icon/icon';

@Component({
  selector: 'md-stepper',
  templateUrl: 'stepper.html',
  styleUrls: ['stepper.css'],
  providers: [MdIconRegistry],
  directives: [MdIcon],
  encapsulation: ViewEncapsulation.None
})
export class MdStepper {

  steps: MdStep[] = [];

  @Input() mode: 'linear' | 'nonlinear' = 'nonlinear';

  addStep(step: MdStep): void {
    if (this.steps.length === 0) {
      step.active = true;
    }
    this.steps.push(step);
  }

  // To check if all steps are completed before a specific step
  allStepsBeforeCompleted(step: MdStep): boolean {
    for (var i = this.steps.indexOf(this.currentStep); i < this.steps.indexOf(step); i++) {
      if (!this.steps[i].completed && !this.steps[i].optional) { return false; }
    }
    return true;
  }

  selectStep(step: MdStep): void {
    this.currentStep.completed = this.currentStep.valid ? true : false;
    if (this.mode === 'linear') {
      if (!this.currentStep.valid) { return; }
      if (!this.allStepsBeforeCompleted) { return; }
    }
    if (step.completed && !step.editable) { return; }
    this.steps.forEach((step1) => {
      step1.active = false;
    });
    step.active = true;
  }

  get currentStep(): MdStep {
    return this.steps.filter(step => step.active)[0];
  }

  selectNextStep(step: MdStep): void {
    var nextEditableStep = this.getNextEditableStep(step);
    if (nextEditableStep) {
      this.selectStep(nextEditableStep);
    }
  }

  selectPreviousStep(step: MdStep): void {
    var previousEditableStep = this.getPreviousEditableStep(step);
    if (previousEditableStep) {
      this.selectStep(previousEditableStep);
    }
  }


  getNextEditableStep(step: MdStep): MdStep {
    if (this.steps.indexOf(this.currentStep) === this.steps.length - 1) { return; }
    for (var i = this.steps.indexOf(this.currentStep) + 1; i < this.steps.length; i++) {
      if (this.steps[i].isTargetable) {
        return this.steps[i];
      }
    }
    return;
  }

  getPreviousEditableStep(step: MdStep): MdStep {
    if (this.steps.indexOf(this.currentStep) === 0) { return; }
    for (var i = this.steps.indexOf(this.currentStep) - 1; i >= 0; i--) {
      if (this.steps[i].isTargetable) {
        return this.steps[i];
      }
    }
    return;
  }
}

@Component({
  selector: 'md-step',
  templateUrl: 'step.html',
  styleUrls: ['step.css'],
  encapsulation: ViewEncapsulation.None
})
export class MdStep {

  active: boolean = false;
  completed: boolean = false;

  @Input() @BooleanFieldValue() optional: boolean = false;
  @Input() @BooleanFieldValue() editable: boolean = true;
  @Input() @BooleanFieldValue() valid: boolean = true;
  @Input() label: string = '';

  constructor(private steps: MdStepper) {
    steps.addStep(this);
  }

  get isLeft(): boolean {
    return this.steps.steps.indexOf(this) < this.steps.steps.indexOf(this.steps.currentStep);
  }

  get isRight(): boolean {
    return this.steps.steps.indexOf(this) > this.steps.steps.indexOf(this.steps.currentStep);
  }

  get isTargetable(): boolean {
    return !this.editable && this.completed ? false : true;
  }

  private get _stepperIconLigature(): string {
    return (!this.active && this.completed) ? 'done' : 'create';
  }
}

export const MD_STEPPER_DIRECTIVES: any[] = [
  MdStepper,
  MdStep
];

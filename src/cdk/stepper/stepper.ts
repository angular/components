/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {_IdGenerator, FocusableOption, FocusKeyManager} from '@angular/cdk/a11y';
import {Direction, Directionality} from '@angular/cdk/bidi';
import {ENTER, hasModifierKey, SPACE} from '@angular/cdk/keycodes';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  ContentChildren,
  Directive,
  ElementRef,
  EventEmitter,
  InjectionToken,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  QueryList,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
  AfterContentInit,
  booleanAttribute,
  numberAttribute,
  inject,
} from '@angular/core';
import {
  ControlContainer,
  type AbstractControl,
  type NgForm,
  type FormGroupDirective,
} from '@angular/forms';
import {_getFocusedElementPierceShadowDom} from '@angular/cdk/platform';
import {Observable, of as observableOf, Subject} from 'rxjs';
import {startWith, takeUntil} from 'rxjs/operators';

import {CdkStepHeader} from './step-header';
import {CdkStepLabel} from './step-label';

/**
 * Position state of the content of each step in stepper that is used for transitioning
 * the content into correct position upon step selection change.
 */
export type StepContentPositionState = 'previous' | 'current' | 'next';

/** Possible orientation of a stepper. */
export type StepperOrientation = 'horizontal' | 'vertical';

/** Change event emitted on selection changes. */
export class StepperSelectionEvent {
  /** Index of the step now selected. */
  selectedIndex: number;

  /** Index of the step previously selected. */
  previouslySelectedIndex: number;

  /** The step instance now selected. */
  selectedStep: CdkStep;

  /** The step instance previously selected. */
  previouslySelectedStep: CdkStep;
}

/** The state of each step. */
export type StepState = 'number' | 'edit' | 'done' | 'error' | string;

/** Enum to represent the different states of the steps. */
export const STEP_STATE = {
  NUMBER: 'number',
  EDIT: 'edit',
  DONE: 'done',
  ERROR: 'error',
};

/** InjectionToken that can be used to specify the global stepper options. */
export const STEPPER_GLOBAL_OPTIONS = new InjectionToken<StepperOptions>('STEPPER_GLOBAL_OPTIONS');

/** Configurable options for stepper. */
export interface StepperOptions {
  /**
   * Whether the stepper should display an error state or not.
   * Default behavior is assumed to be false.
   */
  showError?: boolean;

  /**
   * Whether the stepper should display the default indicator type
   * or not.
   * Default behavior is assumed to be true.
   */
  displayDefaultIndicatorType?: boolean;
}

@Component({
  selector: 'cdk-step',
  exportAs: 'cdkStep',
  template: '<ng-template><ng-content/></ng-template>',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CdkStep implements OnChanges {
  private _stepperOptions: StepperOptions;
  _stepper = inject(CdkStepper);
  _displayDefaultIndicatorType: boolean;

  /** Template for step label if it exists. */
  @ContentChild(CdkStepLabel) stepLabel: CdkStepLabel;

  /** Forms that have been projected into the step. */
  @ContentChildren(
    // Note: we look for `ControlContainer` here, because both `NgForm` and `FormGroupDirective`
    // provides themselves as such, but we don't want to have a concrete reference to both of
    // the directives. The type is marked as `Partial` in case we run into a class that provides
    // itself as `ControlContainer` but doesn't have the same interface as the directives.
    ControlContainer,
    {
      descendants: true,
    },
  )
  protected _childForms: QueryList<Partial<NgForm | FormGroupDirective>> | undefined;

  /** Template for step content. */
  @ViewChild(TemplateRef, {static: true}) content: TemplateRef<any>;

  /** The top level abstract control of the step. */
  @Input() stepControl: AbstractControl;

  /** Whether user has attempted to move away from the step. */
  interacted = false;

  /** Emits when the user has attempted to move away from the step. */
  @Output('interacted')
  readonly interactedStream: EventEmitter<CdkStep> = new EventEmitter<CdkStep>();

  /** Plain text label of the step. */
  @Input() label: string;

  /** Error message to display when there's an error. */
  @Input() errorMessage: string;

  /** Aria label for the tab. */
  @Input('aria-label') ariaLabel: string;

  /**
   * Reference to the element that the tab is labelled by.
   * Will be cleared if `aria-label` is set at the same time.
   */
  @Input('aria-labelledby') ariaLabelledby: string;

  /** State of the step. */
  @Input() state: StepState;

  /** Whether the user can return to this step once it has been marked as completed. */
  @Input({transform: booleanAttribute}) editable: boolean = true;

  /** Whether the completion of step is optional. */
  @Input({transform: booleanAttribute}) optional: boolean = false;

  /** Whether step is marked as completed. */
  @Input({transform: booleanAttribute})
  get completed(): boolean {
    return this._completedOverride == null ? this._getDefaultCompleted() : this._completedOverride;
  }
  set completed(value: boolean) {
    this._completedOverride = value;
  }
  _completedOverride: boolean | null = null;

  private _getDefaultCompleted() {
    return this.stepControl ? this.stepControl.valid && this.interacted : this.interacted;
  }

  /** Whether step has an error. */
  @Input({transform: booleanAttribute})
  get hasError(): boolean {
    return this._customError == null ? this._getDefaultError() : this._customError;
  }
  set hasError(value: boolean) {
    this._customError = value;
  }
  private _customError: boolean | null = null;

  private _getDefaultError() {
    return this.stepControl && this.stepControl.invalid && this.interacted;
  }

  constructor(...args: unknown[]);

  constructor() {
    const stepperOptions = inject<StepperOptions>(STEPPER_GLOBAL_OPTIONS, {optional: true});
    this._stepperOptions = stepperOptions ? stepperOptions : {};
    this._displayDefaultIndicatorType = this._stepperOptions.displayDefaultIndicatorType !== false;
  }

  /** Selects this step component. */
  select(): void {
    this._stepper.selected = this;
  }

  /** Resets the step to its initial state. Note that this includes resetting form data. */
  reset(): void {
    this.interacted = false;

    if (this._completedOverride != null) {
      this._completedOverride = false;
    }

    if (this._customError != null) {
      this._customError = false;
    }

    if (this.stepControl) {
      // Reset the forms since the default error state matchers will show errors on submit and we
      // want the form to be back to its initial state (see #29781). Submitted state is on the
      // individual directives, rather than the control, so we need to reset them ourselves.
      this._childForms?.forEach(form => form.resetForm?.());
      this.stepControl.reset();
    }
  }

  ngOnChanges() {
    // Since basically all inputs of the MatStep get proxied through the view down to the
    // underlying MatStepHeader, we have to make sure that change detection runs correctly.
    this._stepper._stateChanged();
  }

  _markAsInteracted() {
    if (!this.interacted) {
      this.interacted = true;
      this.interactedStream.emit(this);
    }
  }

  /** Determines whether the error state can be shown. */
  _showError(): boolean {
    // We want to show the error state either if the user opted into/out of it using the
    // global options, or if they've explicitly set it through the `hasError` input.
    return this._stepperOptions.showError ?? this._customError != null;
  }
}

@Directive({
  selector: '[cdkStepper]',
  exportAs: 'cdkStepper',
})
export class CdkStepper implements AfterContentInit, AfterViewInit, OnDestroy {
  private _dir = inject(Directionality, {optional: true});
  private _changeDetectorRef = inject(ChangeDetectorRef);
  protected _elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  /** Emits when the component is destroyed. */
  protected readonly _destroyed = new Subject<void>();

  /** Used for managing keyboard focus. */
  private _keyManager: FocusKeyManager<FocusableOption>;

  /** Full list of steps inside the stepper, including inside nested steppers. */
  @ContentChildren(CdkStep, {descendants: true}) _steps: QueryList<CdkStep>;

  /** Steps that belong to the current stepper, excluding ones from nested steppers. */
  readonly steps: QueryList<CdkStep> = new QueryList<CdkStep>();

  /** The list of step headers of the steps in the stepper. */
  @ContentChildren(CdkStepHeader, {descendants: true}) _stepHeader: QueryList<CdkStepHeader>;

  /** List of step headers sorted based on their DOM order. */
  private _sortedHeaders = new QueryList<CdkStepHeader>();

  /** Whether the validity of previous steps should be checked or not. */
  @Input({transform: booleanAttribute}) linear: boolean = false;

  /** The index of the selected step. */
  @Input({transform: numberAttribute})
  get selectedIndex(): number {
    return this._selectedIndex;
  }
  set selectedIndex(index: number) {
    if (this.steps && this._steps) {
      // Ensure that the index can't be out of bounds.
      if (!this._isValidIndex(index) && (typeof ngDevMode === 'undefined' || ngDevMode)) {
        throw Error('cdkStepper: Cannot assign out-of-bounds value to `selectedIndex`.');
      }

      this.selected?._markAsInteracted();

      if (
        this._selectedIndex !== index &&
        !this._anyControlsInvalidOrPending(index) &&
        (index >= this._selectedIndex || this.steps.toArray()[index].editable)
      ) {
        this._updateSelectedItemIndex(index);
      }
    } else {
      this._selectedIndex = index;
    }
  }
  private _selectedIndex = 0;

  /** The step that is selected. */
  @Input()
  get selected(): CdkStep | undefined {
    return this.steps ? this.steps.toArray()[this.selectedIndex] : undefined;
  }
  set selected(step: CdkStep | undefined) {
    this.selectedIndex = step && this.steps ? this.steps.toArray().indexOf(step) : -1;
  }

  /** Event emitted when the selected step has changed. */
  @Output() readonly selectionChange = new EventEmitter<StepperSelectionEvent>();

  /** Output to support two-way binding on `[(selectedIndex)]` */
  @Output() readonly selectedIndexChange: EventEmitter<number> = new EventEmitter<number>();

  /** Used to track unique ID for each stepper component. */
  private _groupId = inject(_IdGenerator).getId('cdk-stepper-');

  /** Orientation of the stepper. */
  @Input()
  get orientation(): StepperOrientation {
    return this._orientation;
  }
  set orientation(value: StepperOrientation) {
    // This is a protected method so that `MatStepper` can hook into it.
    this._orientation = value;

    if (this._keyManager) {
      this._keyManager.withVerticalOrientation(value === 'vertical');
    }
  }
  private _orientation: StepperOrientation = 'horizontal';

  constructor(...args: unknown[]);
  constructor() {}

  ngAfterContentInit() {
    this._steps.changes
      .pipe(startWith(this._steps), takeUntil(this._destroyed))
      .subscribe((steps: QueryList<CdkStep>) => {
        this.steps.reset(steps.filter(step => step._stepper === this));
        this.steps.notifyOnChanges();
      });
  }

  ngAfterViewInit() {
    // If the step headers are defined outside of the `ngFor` that renders the steps, like in the
    // Material stepper, they won't appear in the `QueryList` in the same order as they're
    // rendered in the DOM which will lead to incorrect keyboard navigation. We need to sort
    // them manually to ensure that they're correct. Alternatively, we can change the Material
    // template to inline the headers in the `ngFor`, but that'll result in a lot of
    // code duplication. See #23539.
    this._stepHeader.changes
      .pipe(startWith(this._stepHeader), takeUntil(this._destroyed))
      .subscribe((headers: QueryList<CdkStepHeader>) => {
        this._sortedHeaders.reset(
          headers.toArray().sort((a, b) => {
            const documentPosition = a._elementRef.nativeElement.compareDocumentPosition(
              b._elementRef.nativeElement,
            );

            // `compareDocumentPosition` returns a bitmask so we have to use a bitwise operator.
            // https://developer.mozilla.org/en-US/docs/Web/API/Node/compareDocumentPosition
            // tslint:disable-next-line:no-bitwise
            return documentPosition & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
          }),
        );
        this._sortedHeaders.notifyOnChanges();
      });

    // Note that while the step headers are content children by default, any components that
    // extend this one might have them as view children. We initialize the keyboard handling in
    // AfterViewInit so we're guaranteed for both view and content children to be defined.
    this._keyManager = new FocusKeyManager<FocusableOption>(this._sortedHeaders)
      .withWrap()
      .withHomeAndEnd()
      .withVerticalOrientation(this._orientation === 'vertical');

    (this._dir ? (this._dir.change as Observable<Direction>) : observableOf<Direction>())
      .pipe(startWith(this._layoutDirection()), takeUntil(this._destroyed))
      .subscribe(direction => this._keyManager.withHorizontalOrientation(direction));

    this._keyManager.updateActiveItem(this._selectedIndex);

    // No need to `takeUntil` here, because we're the ones destroying `steps`.
    this.steps.changes.subscribe(() => {
      if (!this.selected) {
        this._selectedIndex = Math.max(this._selectedIndex - 1, 0);
      }
    });

    // The logic which asserts that the selected index is within bounds doesn't run before the
    // steps are initialized, because we don't how many steps there are yet so we may have an
    // invalid index on init. If that's the case, auto-correct to the default so we don't throw.
    if (!this._isValidIndex(this._selectedIndex)) {
      this._selectedIndex = 0;
    }
  }

  ngOnDestroy() {
    this._keyManager?.destroy();
    this.steps.destroy();
    this._sortedHeaders.destroy();
    this._destroyed.next();
    this._destroyed.complete();
  }

  /** Selects and focuses the next step in list. */
  next(): void {
    this.selectedIndex = Math.min(this._selectedIndex + 1, this.steps.length - 1);
  }

  /** Selects and focuses the previous step in list. */
  previous(): void {
    this.selectedIndex = Math.max(this._selectedIndex - 1, 0);
  }

  /** Resets the stepper to its initial state. Note that this includes clearing form data. */
  reset(): void {
    this._updateSelectedItemIndex(0);
    this.steps.forEach(step => step.reset());
    this._stateChanged();
  }

  /** Returns a unique id for each step label element. */
  _getStepLabelId(i: number): string {
    return `${this._groupId}-label-${i}`;
  }

  /** Returns unique id for each step content element. */
  _getStepContentId(i: number): string {
    return `${this._groupId}-content-${i}`;
  }

  /** Marks the component to be change detected. */
  _stateChanged() {
    this._changeDetectorRef.markForCheck();
  }

  /** Returns position state of the step with the given index. */
  _getAnimationDirection(index: number): StepContentPositionState {
    const position = index - this._selectedIndex;
    if (position < 0) {
      return this._layoutDirection() === 'rtl' ? 'next' : 'previous';
    } else if (position > 0) {
      return this._layoutDirection() === 'rtl' ? 'previous' : 'next';
    }
    return 'current';
  }

  /** Returns the type of icon to be displayed. */
  _getIndicatorType(index: number, state: StepState = STEP_STATE.NUMBER): StepState {
    const step = this.steps.toArray()[index];
    const isCurrentStep = this._isCurrentStep(index);

    return step._displayDefaultIndicatorType
      ? this._getDefaultIndicatorLogic(step, isCurrentStep)
      : this._getGuidelineLogic(step, isCurrentStep, state);
  }

  private _getDefaultIndicatorLogic(step: CdkStep, isCurrentStep: boolean): StepState {
    if (step._showError() && step.hasError && !isCurrentStep) {
      return STEP_STATE.ERROR;
    } else if (!step.completed || isCurrentStep) {
      return STEP_STATE.NUMBER;
    } else {
      return step.editable ? STEP_STATE.EDIT : STEP_STATE.DONE;
    }
  }

  private _getGuidelineLogic(
    step: CdkStep,
    isCurrentStep: boolean,
    state: StepState = STEP_STATE.NUMBER,
  ): StepState {
    if (step._showError() && step.hasError && !isCurrentStep) {
      return STEP_STATE.ERROR;
    } else if (step.completed && !isCurrentStep) {
      return STEP_STATE.DONE;
    } else if (step.completed && isCurrentStep) {
      return state;
    } else if (step.editable && isCurrentStep) {
      return STEP_STATE.EDIT;
    } else {
      return state;
    }
  }

  private _isCurrentStep(index: number) {
    return this._selectedIndex === index;
  }

  /** Returns the index of the currently-focused step header. */
  _getFocusIndex() {
    return this._keyManager ? this._keyManager.activeItemIndex : this._selectedIndex;
  }

  private _updateSelectedItemIndex(newIndex: number): void {
    const stepsArray = this.steps.toArray();
    this.selectionChange.emit({
      selectedIndex: newIndex,
      previouslySelectedIndex: this._selectedIndex,
      selectedStep: stepsArray[newIndex],
      previouslySelectedStep: stepsArray[this._selectedIndex],
    });

    // If focus is inside the stepper, move it to the next header, otherwise it may become
    // lost when the active step content is hidden. We can't be more granular with the check
    // (e.g. checking whether focus is inside the active step), because we don't have a
    // reference to the elements that are rendering out the content.
    this._containsFocus()
      ? this._keyManager.setActiveItem(newIndex)
      : this._keyManager.updateActiveItem(newIndex);

    this._selectedIndex = newIndex;
    this.selectedIndexChange.emit(this._selectedIndex);
    this._stateChanged();
  }

  _onKeydown(event: KeyboardEvent) {
    const hasModifier = hasModifierKey(event);
    const keyCode = event.keyCode;
    const manager = this._keyManager;

    if (
      manager.activeItemIndex != null &&
      !hasModifier &&
      (keyCode === SPACE || keyCode === ENTER)
    ) {
      this.selectedIndex = manager.activeItemIndex;
      event.preventDefault();
    } else {
      manager.setFocusOrigin('keyboard').onKeydown(event);
    }
  }

  private _anyControlsInvalidOrPending(index: number): boolean {
    if (this.linear && index >= 0) {
      return this.steps
        .toArray()
        .slice(0, index)
        .some(step => {
          const control = step.stepControl;
          const isIncomplete = control
            ? control.invalid || control.pending || !step.interacted
            : !step.completed;
          return isIncomplete && !step.optional && !step._completedOverride;
        });
    }

    return false;
  }

  private _layoutDirection(): Direction {
    return this._dir && this._dir.value === 'rtl' ? 'rtl' : 'ltr';
  }

  /** Checks whether the stepper contains the focused element. */
  private _containsFocus(): boolean {
    const stepperElement = this._elementRef.nativeElement;
    const focusedElement = _getFocusedElementPierceShadowDom();
    return stepperElement === focusedElement || stepperElement.contains(focusedElement);
  }

  /** Checks whether the passed-in index is a valid step index. */
  private _isValidIndex(index: number): boolean {
    return index > -1 && (!this.steps || index < this.steps.length);
  }
}

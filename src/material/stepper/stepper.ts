/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {CdkStep, CdkStepper, StepContentPositionState} from '@angular/cdk/stepper';
import {AnimationEvent} from '@angular/animations';
import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  ContentChildren,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnDestroy,
  Output,
  QueryList,
  TemplateRef,
  ViewChildren,
  ViewContainerRef,
  ViewEncapsulation,
} from '@angular/core';
import {AbstractControl, FormGroupDirective, NgForm} from '@angular/forms';
import {ErrorStateMatcher, ThemePalette} from '@angular/material/core';
import {CdkPortalOutlet, TemplatePortal} from '@angular/cdk/portal';
import {Subject, Subscription} from 'rxjs';
import {takeUntil, map, startWith, switchMap} from 'rxjs/operators';

import {MatStepHeader} from './step-header';
import {MatStepLabel} from './step-label';
import {
  DEFAULT_HORIZONTAL_ANIMATION_DURATION,
  DEFAULT_VERTICAL_ANIMATION_DURATION,
  matStepperAnimations,
} from './stepper-animations';
import {MatStepperIcon, MatStepperIconContext} from './stepper-icon';
import {MatStepContent} from './step-content';
import {NgTemplateOutlet} from '@angular/common';
import {Platform} from '@angular/cdk/platform';

@Component({
  selector: 'mat-step',
  templateUrl: 'step.html',
  providers: [
    {provide: ErrorStateMatcher, useExisting: MatStep},
    {provide: CdkStep, useExisting: MatStep},
  ],
  encapsulation: ViewEncapsulation.None,
  exportAs: 'matStep',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CdkPortalOutlet],
  host: {
    'hidden': '', // Hide the steps so they don't affect the layout.
  },
})
export class MatStep extends CdkStep implements ErrorStateMatcher, AfterContentInit, OnDestroy {
  private _errorStateMatcher = inject(ErrorStateMatcher, {skipSelf: true});
  private _viewContainerRef = inject(ViewContainerRef);
  private _isSelected = Subscription.EMPTY;

  /** Content for step label given by `<ng-template matStepLabel>`. */
  // We need an initializer here to avoid a TS error.
  @ContentChild(MatStepLabel) override stepLabel: MatStepLabel = undefined!;

  /**
   * Theme color for the particular step. This API is supported in M2 themes
   * only, it has no effect in M3 themes.
   *
   * For information on applying color variants in M3, see
   * https://material.angular.io/guide/theming#using-component-color-variants.
   */
  @Input() color: ThemePalette;

  /** Content that will be rendered lazily. */
  @ContentChild(MatStepContent, {static: false}) _lazyContent: MatStepContent;

  /** Currently-attached portal containing the lazy content. */
  _portal: TemplatePortal;

  ngAfterContentInit() {
    this._isSelected = this._stepper.steps.changes
      .pipe(
        switchMap(() => {
          return this._stepper.selectionChange.pipe(
            map(event => event.selectedStep === this),
            startWith(this._stepper.selected === this),
          );
        }),
      )
      .subscribe(isSelected => {
        if (isSelected && this._lazyContent && !this._portal) {
          this._portal = new TemplatePortal(this._lazyContent._template, this._viewContainerRef!);
        }
      });
  }

  ngOnDestroy() {
    this._isSelected.unsubscribe();
  }

  /** Custom error state matcher that additionally checks for validity of interacted form. */
  isErrorState(control: AbstractControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const originalErrorState = this._errorStateMatcher.isErrorState(control, form);

    // Custom error state checks for the validity of form that is not submitted or touched
    // since user can trigger a form change by calling for another step without directly
    // interacting with the current form.
    const customErrorState = !!(control && control.invalid && this.interacted);

    return originalErrorState || customErrorState;
  }
}

@Component({
  selector: 'mat-stepper, mat-vertical-stepper, mat-horizontal-stepper, [matStepper]',
  exportAs: 'matStepper, matVerticalStepper, matHorizontalStepper',
  templateUrl: 'stepper.html',
  styleUrl: 'stepper.css',
  host: {
    '[class.mat-stepper-horizontal]': 'orientation === "horizontal"',
    '[class.mat-stepper-vertical]': 'orientation === "vertical"',
    '[class.mat-stepper-label-position-end]':
      'orientation === "horizontal" && labelPosition == "end"',
    '[class.mat-stepper-label-position-bottom]':
      'orientation === "horizontal" && labelPosition == "bottom"',
    '[class.mat-stepper-header-position-bottom]': 'headerPosition === "bottom"',
    '[attr.aria-orientation]': 'orientation',
    'role': 'tablist',
  },
  animations: [
    matStepperAnimations.horizontalStepTransition,
    matStepperAnimations.verticalStepTransition,
  ],
  providers: [{provide: CdkStepper, useExisting: MatStepper}],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet, MatStepHeader],
})
export class MatStepper extends CdkStepper implements AfterContentInit {
  /** The list of step headers of the steps in the stepper. */
  // We need an initializer here to avoid a TS error.
  @ViewChildren(MatStepHeader) override _stepHeader: QueryList<MatStepHeader> =
    undefined as unknown as QueryList<MatStepHeader>;

  /** Full list of steps inside the stepper, including inside nested steppers. */
  // We need an initializer here to avoid a TS error.
  @ContentChildren(MatStep, {descendants: true}) override _steps: QueryList<MatStep> =
    undefined as unknown as QueryList<MatStep>;

  /** Steps that belong to the current stepper, excluding ones from nested steppers. */
  override readonly steps: QueryList<MatStep> = new QueryList<MatStep>();

  /** Custom icon overrides passed in by the consumer. */
  @ContentChildren(MatStepperIcon, {descendants: true}) _icons: QueryList<MatStepperIcon>;

  /** Event emitted when the current step is done transitioning in. */
  @Output() readonly animationDone: EventEmitter<void> = new EventEmitter<void>();

  /** Whether ripples should be disabled for the step headers. */
  @Input() disableRipple: boolean;

  /**
   * Theme color for all of the steps in stepper. This API is supported in M2
   * themes only, it has no effect in M3 themes.
   *
   * For information on applying color variants in M3, see
   * https://material.angular.io/guide/theming#using-component-color-variants.
   */
  @Input() color: ThemePalette;

  /**
   * Whether the label should display in bottom or end position.
   * Only applies in the `horizontal` orientation.
   */
  @Input()
  labelPosition: 'bottom' | 'end' = 'end';

  /**
   * Position of the stepper's header.
   * Only applies in the `horizontal` orientation.
   */
  @Input()
  headerPosition: 'top' | 'bottom' = 'top';

  /** Consumer-specified template-refs to be used to override the header icons. */
  _iconOverrides: Record<string, TemplateRef<MatStepperIconContext>> = {};

  /** Stream of animation `done` events when the body expands/collapses. */
  readonly _animationDone = new Subject<AnimationEvent>();

  /** Duration for the animation. Will be normalized to milliseconds if no units are set. */
  @Input()
  get animationDuration(): string {
    return this._animationDuration;
  }
  set animationDuration(value: string) {
    this._animationDuration = /^\d+$/.test(value) ? value + 'ms' : value;
  }
  private _animationDuration = '';

  /** Whether the stepper is rendering on the server. */
  protected _isServer: boolean = !inject(Platform).isBrowser;

  constructor(...args: unknown[]);

  constructor() {
    super();

    const elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    const nodeName = elementRef.nativeElement.nodeName.toLowerCase();
    this.orientation = nodeName === 'mat-vertical-stepper' ? 'vertical' : 'horizontal';
  }

  override ngAfterContentInit() {
    super.ngAfterContentInit();
    this._icons.forEach(({name, templateRef}) => (this._iconOverrides[name] = templateRef));

    // Mark the component for change detection whenever the content children query changes
    this.steps.changes.pipe(takeUntil(this._destroyed)).subscribe(() => {
      this._stateChanged();
    });

    this._animationDone.pipe(takeUntil(this._destroyed)).subscribe(event => {
      if ((event.toState as StepContentPositionState) === 'current') {
        this.animationDone.emit();
      }
    });
  }

  _stepIsNavigable(index: number, step: MatStep): boolean {
    return step.completed || this.selectedIndex === index || !this.linear;
  }

  _getAnimationDuration() {
    if (this.animationDuration) {
      return this.animationDuration;
    }

    return this.orientation === 'horizontal'
      ? DEFAULT_HORIZONTAL_ANIMATION_DURATION
      : DEFAULT_VERTICAL_ANIMATION_DURATION;
  }
}

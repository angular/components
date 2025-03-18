/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {CdkStep, CdkStepper} from '@angular/cdk/stepper';
import {
  AfterContentInit,
  AfterViewInit,
  ANIMATION_MODULE_TYPE,
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  ContentChildren,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  NgZone,
  OnDestroy,
  Output,
  QueryList,
  Renderer2,
  signal,
  TemplateRef,
  ViewChildren,
  ViewContainerRef,
  ViewEncapsulation,
} from '@angular/core';
import {NgTemplateOutlet} from '@angular/common';
import {AbstractControl, FormGroupDirective, NgForm} from '@angular/forms';
import {ErrorStateMatcher, ThemePalette} from '../core';
import {Platform} from '@angular/cdk/platform';
import {CdkPortalOutlet, TemplatePortal} from '@angular/cdk/portal';
import {Subscription} from 'rxjs';
import {takeUntil, map, startWith, switchMap} from 'rxjs/operators';

import {MatStepHeader} from './step-header';
import {MatStepLabel} from './step-label';
import {MatStepperIcon, MatStepperIconContext} from './stepper-icon';
import {MatStepContent} from './step-content';

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
   * only, it has no effect in M3 themes. For color customization in M3, see https://material.angular.io/components/stepper/styling.
   *
   * For information on applying color variants in M3, see
   * https://material.angular.io/guide/material-2-theming#optional-add-backwards-compatibility-styles-for-color-variants
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
    '[class.mat-stepper-animating]': '_isAnimating()',
    '[style.--mat-stepper-animation-duration]': '_getAnimationDuration()',
    '[attr.aria-orientation]': 'orientation',
    'role': 'tablist',
  },
  providers: [{provide: CdkStepper, useExisting: MatStepper}],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet, MatStepHeader],
})
export class MatStepper extends CdkStepper implements AfterViewInit, AfterContentInit, OnDestroy {
  private _ngZone = inject(NgZone);
  private _renderer = inject(Renderer2);
  private _animationsModule = inject(ANIMATION_MODULE_TYPE, {optional: true});
  private _cleanupTransition: (() => void) | undefined;
  protected _isAnimating = signal(false);

  /** The list of step headers of the steps in the stepper. */
  @ViewChildren(MatStepHeader) override _stepHeader: QueryList<MatStepHeader> = undefined!;

  /** Elements hosting the step animations. */
  @ViewChildren('animatedContainer') _animatedContainers: QueryList<ElementRef>;

  /** Full list of steps inside the stepper, including inside nested steppers. */
  @ContentChildren(MatStep, {descendants: true}) override _steps: QueryList<MatStep> = undefined!;

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
   * themes only, it has no effect in M3 themes. For color customization in M3, see https://material.angular.io/components/stepper/styling.
   *
   * For information on applying color variants in M3, see
   * https://material.angular.io/guide/material-2-theming#optional-add-backwards-compatibility-styles-for-color-variants
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
    this.steps.changes.pipe(takeUntil(this._destroyed)).subscribe(() => this._stateChanged());

    // Transition events won't fire if animations are disabled so we simulate them.
    this.selectedIndexChange.pipe(takeUntil(this._destroyed)).subscribe(() => {
      const duration = this._getAnimationDuration();
      if (duration === '0ms' || duration === '0s') {
        this._onAnimationDone();
      } else {
        this._isAnimating.set(true);
      }
    });

    this._ngZone.runOutsideAngular(() => {
      if (this._animationsModule !== 'NoopAnimations') {
        setTimeout(() => {
          // Delay enabling the animations so we don't animate the initial state.
          this._elementRef.nativeElement.classList.add('mat-stepper-animations-enabled');

          // Bind this outside the zone since it fires for all transitions inside the stepper.
          this._cleanupTransition = this._renderer.listen(
            this._elementRef.nativeElement,
            'transitionend',
            this._handleTransitionend,
          );
        }, 200);
      }
    });
  }

  override ngAfterViewInit(): void {
    super.ngAfterViewInit();

    // Prior to #30314 the stepper had animation `done` events bound to each animated container.
    // The animations module was firing them on initialization and for each subsequent animation.
    // Since the events were bound in the template, it had the unintended side-effect of triggering
    // change detection as well. It appears that this side-effect ended up being load-bearing,
    // because it was ensuring that the content elements (e.g. `matStepLabel`) that are defined
    // in sub-components actually get picked up in a timely fashion. This subscription simulates
    // the same change detection by using `queueMicrotask` similarly to the animations module.
    if (typeof queueMicrotask === 'function') {
      let hasEmittedInitial = false;
      this._animatedContainers.changes
        .pipe(startWith(null), takeUntil(this._destroyed))
        .subscribe(() =>
          queueMicrotask(() => {
            // Simulate the initial `animationDone` event
            // that gets emitted by the animations module.
            if (!hasEmittedInitial) {
              hasEmittedInitial = true;
              this.animationDone.emit();
            }

            this._stateChanged();
          }),
        );
    }
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
    this._cleanupTransition?.();
  }

  _stepIsNavigable(index: number, step: MatStep): boolean {
    return step.completed || this.selectedIndex === index || !this.linear;
  }

  _getAnimationDuration() {
    if (this._animationsModule === 'NoopAnimations') {
      return '0ms';
    }

    if (this.animationDuration) {
      return this.animationDuration;
    }

    return this.orientation === 'horizontal' ? '500ms' : '225ms';
  }

  private _handleTransitionend = (event: TransitionEvent) => {
    const target = event.target as HTMLElement | null;

    if (!target) {
      return;
    }

    // Because we bind a single `transitionend` handler on the host node and because transition
    // events bubble, we have to filter down to only the active step so don't emit events too
    // often. We check the orientation and `property` name first to reduce the amount of times
    // we need to check the DOM.
    const isHorizontalActiveElement =
      this.orientation === 'horizontal' &&
      event.propertyName === 'transform' &&
      target.classList.contains('mat-horizontal-stepper-content-current');
    const isVerticalActiveElement =
      this.orientation === 'vertical' &&
      event.propertyName === 'grid-template-rows' &&
      target.classList.contains('mat-vertical-content-container-active');

    // Finally we need to ensure that the animated element is a direct descendant,
    // rather than one coming from a nested stepper.
    const shouldEmit =
      (isHorizontalActiveElement || isVerticalActiveElement) &&
      this._animatedContainers.find(ref => ref.nativeElement === target);

    if (shouldEmit) {
      this._onAnimationDone();
    }
  };

  private _onAnimationDone() {
    this._isAnimating.set(false);
    this.animationDone.emit();
  }
}

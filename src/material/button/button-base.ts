/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {FocusMonitor, FocusOrigin} from '@angular/cdk/a11y';
import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {Platform} from '@angular/cdk/platform';
import {
  AfterViewInit,
  Directive,
  ElementRef,
  inject,
  NgZone,
  OnChanges,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {
  CanColor,
  CanDisable,
  CanDisableRipple,
  MatRipple,
  mixinColor,
  mixinDisabled,
  mixinDisableRipple,
  MatRippleLoader,
} from '@angular/material/core';

/** Inputs common to all buttons. */
export const MAT_BUTTON_INPUTS = ['disabled', 'disableRipple', 'color'];

/** Shared host configuration for all buttons */
export const MAT_BUTTON_HOST = {
  '[attr.disabled]': 'disabled || null',
  '[class._mat-animation-noopable]': '_animationMode === "NoopAnimations"',
  // MDC automatically applies the primary theme color to the button, but we want to support
  // an unthemed version. If color is undefined, apply a CSS class that makes it easy to
  // select and style this "theme".
  '[class.mat-unthemed]': '!color',
  // Add a class that applies to all buttons. This makes it easier to target if somebody
  // wants to target all Material buttons.
  '[class.mat-mdc-button-base]': 'true',
};

/** List of classes to add to buttons instances based on host attribute selector. */
const HOST_SELECTOR_MDC_CLASS_PAIR: {selector: string; mdcClasses: string[]}[] = [
  {
    selector: 'mat-button',
    mdcClasses: ['mdc-button', 'mat-mdc-button'],
  },
  {
    selector: 'mat-flat-button',
    mdcClasses: ['mdc-button', 'mdc-button--unelevated', 'mat-mdc-unelevated-button'],
  },
  {
    selector: 'mat-raised-button',
    mdcClasses: ['mdc-button', 'mdc-button--raised', 'mat-mdc-raised-button'],
  },
  {
    selector: 'mat-stroked-button',
    mdcClasses: ['mdc-button', 'mdc-button--outlined', 'mat-mdc-outlined-button'],
  },
  {
    selector: 'mat-fab',
    mdcClasses: ['mdc-fab', 'mat-mdc-fab'],
  },
  {
    selector: 'mat-mini-fab',
    mdcClasses: ['mdc-fab', 'mdc-fab--mini', 'mat-mdc-mini-fab'],
  },
  {
    selector: 'mat-icon-button',
    mdcClasses: ['mdc-icon-button', 'mat-mdc-icon-button'],
  },
];

// Boilerplate for applying mixins to MatButton.
/** @docs-private */
export const _MatButtonMixin = mixinColor(
  mixinDisabled(
    mixinDisableRipple(
      class {
        constructor(public _elementRef: ElementRef) {}
      },
    ),
  ),
);

/** Base class for all buttons.  */
@Directive()
export class MatButtonBase
  extends _MatButtonMixin
  implements CanDisable, CanColor, CanDisableRipple, AfterViewInit, OnDestroy
{
  private readonly _focusMonitor = inject(FocusMonitor);

  /**
   * Handles the lazy creation of the MatButton ripple.
   * Used to improve initial load time of large applications.
   */
  _rippleLoader: MatRippleLoader = inject(MatRippleLoader);

  /** Whether this button is a FAB. Used to apply the correct class on the ripple. */
  _isFab = false;

  /**
   * Reference to the MatRipple instance of the button.
   * @deprecated Considered an implementation detail. To be removed.
   * @breaking-change 17.0.0
   */
  get ripple(): MatRipple {
    return this._rippleLoader?.getRipple(this._elementRef.nativeElement)!;
  }
  set ripple(v: MatRipple) {
    this._rippleLoader?.attachRipple(this._elementRef.nativeElement, v);
  }

  // We override `disableRipple` and `disabled` so we can hook into
  // their setters and update the ripple disabled state accordingly.

  /** Whether the ripple effect is disabled or not. */
  override get disableRipple(): boolean {
    return this._disableRipple;
  }
  override set disableRipple(value: any) {
    this._disableRipple = coerceBooleanProperty(value);
    this._updateRippleDisabled();
  }
  private _disableRipple: boolean = false;

  override get disabled(): boolean {
    return this._disabled;
  }
  override set disabled(value: any) {
    this._disabled = coerceBooleanProperty(value);
    this._updateRippleDisabled();
  }
  private _disabled: boolean = false;

  constructor(
    elementRef: ElementRef,
    public _platform: Platform,
    public _ngZone: NgZone,
    public _animationMode?: string,
  ) {
    super(elementRef);

    this._rippleLoader?.configureRipple(this._elementRef.nativeElement, {
      className: 'mat-mdc-button-ripple',
    });

    const classList = (elementRef.nativeElement as HTMLElement).classList;

    // For each of the variant selectors that is present in the button's host
    // attributes, add the correct corresponding MDC classes.
    for (const pair of HOST_SELECTOR_MDC_CLASS_PAIR) {
      if (this._hasHostAttributes(pair.selector)) {
        pair.mdcClasses.forEach((className: string) => {
          classList.add(className);
        });
      }
    }
  }

  ngAfterViewInit() {
    this._focusMonitor.monitor(this._elementRef, true);
  }

  ngOnDestroy() {
    this._focusMonitor.stopMonitoring(this._elementRef);
  }

  /** Focuses the button. */
  focus(_origin: FocusOrigin = 'program', options?: FocusOptions): void {
    if (_origin) {
      this._focusMonitor.focusVia(this._elementRef.nativeElement, _origin, options);
    } else {
      this._elementRef.nativeElement.focus(options);
    }
  }

  /** Gets whether the button has one of the given attributes. */
  private _hasHostAttributes(...attributes: string[]) {
    return attributes.some(attribute => this._elementRef.nativeElement.hasAttribute(attribute));
  }

  private _updateRippleDisabled(): void {
    this._rippleLoader?.setDisabled(
      this._elementRef.nativeElement,
      this.disableRipple || this.disabled,
    );
  }
}

/** Shared inputs by buttons using the `<a>` tag */
export const MAT_ANCHOR_INPUTS = ['disabled', 'disableRipple', 'color', 'tabIndex'];

/** Shared host configuration for buttons using the `<a>` tag. */
export const MAT_ANCHOR_HOST = {
  '[attr.disabled]': 'disabled || null',
  '[class._mat-animation-noopable]': '_animationMode === "NoopAnimations"',

  // Note that we ignore the user-specified tabindex when it's disabled for
  // consistency with the `mat-button` applied on native buttons where even
  // though they have an index, they're not tabbable.
  '[attr.tabindex]': 'disabled ? -1 : tabIndex',
  '[attr.aria-disabled]': 'disabled.toString()',
  // MDC automatically applies the primary theme color to the button, but we want to support
  // an unthemed version. If color is undefined, apply a CSS class that makes it easy to
  // select and style this "theme".
  '[class.mat-unthemed]': '!color',
  // Add a class that applies to all buttons. This makes it easier to target if somebody
  // wants to target all Material buttons.
  '[class.mat-mdc-button-base]': 'true',
};

/**
 * Anchor button base.
 */
@Directive()
export class MatAnchorBase extends MatButtonBase implements OnInit, OnDestroy {
  tabIndex: number;

  constructor(elementRef: ElementRef, platform: Platform, ngZone: NgZone, animationMode?: string) {
    super(elementRef, platform, ngZone, animationMode);
  }

  ngOnInit(): void {
    this._ngZone.runOutsideAngular(() => {
      this._elementRef.nativeElement.addEventListener('click', this._haltDisabledEvents);
    });
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
    this._elementRef.nativeElement.removeEventListener('click', this._haltDisabledEvents);
  }

  _haltDisabledEvents = (event: Event): void => {
    // A disabled button shouldn't apply any actions
    if (this.disabled) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  };
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {FocusMonitor, FocusOrigin} from '@angular/cdk/a11y';
import {Platform} from '@angular/cdk/platform';
import {
  AfterViewInit,
  booleanAttribute,
  Directive,
  ElementRef,
  inject,
  Input,
  NgZone,
  numberAttribute,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {MatRipple, MatRippleLoader} from '@angular/material/core';

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
  '[class]': 'color ? "mat-" + color : ""',
};

/** List of classes to add to buttons instances based on host attribute selector. */
const HOST_SELECTOR_MDC_CLASS_PAIR: {attribute: string; mdcClasses: string[]}[] = [
  {
    attribute: 'mat-button',
    mdcClasses: ['mdc-button', 'mat-mdc-button'],
  },
  {
    attribute: 'mat-flat-button',
    mdcClasses: ['mdc-button', 'mdc-button--unelevated', 'mat-mdc-unelevated-button'],
  },
  {
    attribute: 'mat-raised-button',
    mdcClasses: ['mdc-button', 'mdc-button--raised', 'mat-mdc-raised-button'],
  },
  {
    attribute: 'mat-stroked-button',
    mdcClasses: ['mdc-button', 'mdc-button--outlined', 'mat-mdc-outlined-button'],
  },
  {
    attribute: 'mat-fab',
    mdcClasses: ['mdc-fab', 'mat-mdc-fab'],
  },
  {
    attribute: 'mat-mini-fab',
    mdcClasses: ['mdc-fab', 'mdc-fab--mini', 'mat-mdc-mini-fab'],
  },
  {
    attribute: 'mat-icon-button',
    mdcClasses: ['mdc-icon-button', 'mat-mdc-icon-button'],
  },
];

/** Base class for all buttons.  */
@Directive()
export class MatButtonBase implements AfterViewInit, OnDestroy {
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

  /** Theme color palette of the button */
  @Input() color?: string | null;

  /** Whether the ripple effect is disabled or not. */
  @Input({transform: booleanAttribute})
  get disableRipple(): boolean {
    return this._disableRipple;
  }
  set disableRipple(value: any) {
    this._disableRipple = value;
    this._updateRippleDisabled();
  }
  private _disableRipple: boolean = false;

  @Input({transform: booleanAttribute})
  get disabled(): boolean {
    return this._disabled;
  }
  set disabled(value: any) {
    this._disabled = value;
    this._updateRippleDisabled();
  }
  private _disabled: boolean = false;

  constructor(
    public _elementRef: ElementRef,
    public _platform: Platform,
    public _ngZone: NgZone,
    public _animationMode?: string,
  ) {
    this._rippleLoader?.configureRipple(this._elementRef.nativeElement, {
      className: 'mat-mdc-button-ripple',
    });

    const element = this._elementRef.nativeElement;
    const classList = (element as HTMLElement).classList;

    // For each of the variant selectors that is present in the button's host
    // attributes, add the correct corresponding MDC classes.
    for (const {attribute, mdcClasses} of HOST_SELECTOR_MDC_CLASS_PAIR) {
      if (element.hasAttribute(attribute)) {
        classList.add(...mdcClasses);
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

  private _updateRippleDisabled(): void {
    this._rippleLoader?.setDisabled(
      this._elementRef.nativeElement,
      this.disableRipple || this.disabled,
    );
  }
}

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
  '[class]': 'color ? "mat-" + color : ""',
};

/**
 * Anchor button base.
 */
@Directive()
export class MatAnchorBase extends MatButtonBase implements OnInit, OnDestroy {
  @Input({
    transform: (value: unknown) => {
      return value == null ? undefined : numberAttribute(value);
    },
  })
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

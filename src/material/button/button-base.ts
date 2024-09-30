/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {FocusMonitor, FocusOrigin} from '@angular/cdk/a11y';
import {Platform} from '@angular/cdk/platform';
import {
  AfterViewInit,
  ANIMATION_MODULE_TYPE,
  booleanAttribute,
  Directive,
  ElementRef,
  inject,
  InjectionToken,
  Input,
  NgZone,
  numberAttribute,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {_StructuralStylesLoader, MatRippleLoader, ThemePalette} from '@angular/material/core';
import {_CdkPrivateStyleLoader} from '@angular/cdk/private';

/** Object that can be used to configure the default options for the button component. */
export interface MatButtonConfig {
  /** Whether disabled buttons should be interactive. */
  disabledInteractive?: boolean;

  /** Default palette color to apply to buttons. */
  color?: ThemePalette;
}

/** Injection token that can be used to provide the default options the button component. */
export const MAT_BUTTON_CONFIG = new InjectionToken<MatButtonConfig>('MAT_BUTTON_CONFIG');

/** Shared host configuration for all buttons */
export const MAT_BUTTON_HOST = {
  '[attr.disabled]': '_getDisabledAttribute()',
  '[attr.aria-disabled]': '_getAriaDisabled()',
  '[class.mat-mdc-button-disabled]': 'disabled',
  '[class.mat-mdc-button-disabled-interactive]': 'disabledInteractive',
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
    mdcClasses: ['mdc-fab', 'mat-mdc-fab-base', 'mat-mdc-fab'],
  },
  {
    attribute: 'mat-mini-fab',
    mdcClasses: ['mdc-fab', 'mat-mdc-fab-base', 'mdc-fab--mini', 'mat-mdc-mini-fab'],
  },
  {
    attribute: 'mat-icon-button',
    mdcClasses: ['mdc-icon-button', 'mat-mdc-icon-button'],
  },
];

/** Base class for all buttons.  */
@Directive()
export class MatButtonBase implements AfterViewInit, OnDestroy {
  _elementRef = inject(ElementRef);
  _platform = inject(Platform);
  _ngZone = inject(NgZone);
  _animationMode = inject(ANIMATION_MODULE_TYPE, {optional: true});

  private readonly _focusMonitor = inject(FocusMonitor);

  /**
   * Handles the lazy creation of the MatButton ripple.
   * Used to improve initial load time of large applications.
   */
  protected _rippleLoader: MatRippleLoader = inject(MatRippleLoader);

  /** Whether this button is a FAB. Used to apply the correct class on the ripple. */
  protected _isFab = false;

  /**
   * Theme color of the button. This API is supported in M2 themes only, it has
   * no effect in M3 themes.
   *
   * For information on applying color variants in M3, see
   * https://material.angular.io/guide/theming#using-component-color-variants.
   */
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

  /** Whether the button is disabled. */
  @Input({transform: booleanAttribute})
  get disabled(): boolean {
    return this._disabled;
  }
  set disabled(value: any) {
    this._disabled = value;
    this._updateRippleDisabled();
  }
  private _disabled: boolean = false;

  /** `aria-disabled` value of the button. */
  @Input({transform: booleanAttribute, alias: 'aria-disabled'})
  ariaDisabled: boolean | undefined;

  /**
   * Natively disabled buttons prevent focus and any pointer events from reaching the button.
   * In some scenarios this might not be desirable, because it can prevent users from finding out
   * why the button is disabled (e.g. via tooltip).
   *
   * Enabling this input will change the button so that it is styled to be disabled and will be
   * marked as `aria-disabled`, but it will allow the button to receive events and focus.
   *
   * Note that by enabling this, you need to set the `tabindex` yourself if the button isn't
   * meant to be tabbable and you have to prevent the button action (e.g. form submissions).
   */
  @Input({transform: booleanAttribute})
  disabledInteractive: boolean;

  constructor(...args: unknown[]);

  constructor() {
    inject(_CdkPrivateStyleLoader).load(_StructuralStylesLoader);
    const config = inject(MAT_BUTTON_CONFIG, {optional: true});
    const element = this._elementRef.nativeElement;
    const classList = (element as HTMLElement).classList;

    this.disabledInteractive = config?.disabledInteractive ?? false;
    this.color = config?.color ?? null;
    this._rippleLoader?.configureRipple(element, {className: 'mat-mdc-button-ripple'});

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
    this._rippleLoader?.destroyRipple(this._elementRef.nativeElement);
  }

  /** Focuses the button. */
  focus(origin: FocusOrigin = 'program', options?: FocusOptions): void {
    if (origin) {
      this._focusMonitor.focusVia(this._elementRef.nativeElement, origin, options);
    } else {
      this._elementRef.nativeElement.focus(options);
    }
  }

  protected _getAriaDisabled() {
    if (this.ariaDisabled != null) {
      return this.ariaDisabled;
    }

    return this.disabled && this.disabledInteractive ? true : null;
  }

  protected _getDisabledAttribute() {
    return this.disabledInteractive || !this.disabled ? null : true;
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
  '[attr.disabled]': '_getDisabledAttribute()',
  '[class.mat-mdc-button-disabled]': 'disabled',
  '[class.mat-mdc-button-disabled-interactive]': 'disabledInteractive',
  '[class._mat-animation-noopable]': '_animationMode === "NoopAnimations"',

  // Note that we ignore the user-specified tabindex when it's disabled for
  // consistency with the `mat-button` applied on native buttons where even
  // though they have an index, they're not tabbable.
  '[attr.tabindex]': 'disabled && !disabledInteractive ? -1 : tabIndex',
  '[attr.aria-disabled]': '_getDisabledAttribute()',
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

  protected override _getAriaDisabled() {
    return this.ariaDisabled == null ? this.disabled : this.ariaDisabled;
  }
}

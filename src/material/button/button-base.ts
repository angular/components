/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {FocusMonitor, FocusOrigin} from '@angular/cdk/a11y';
import {
  AfterViewInit,
  booleanAttribute,
  Directive,
  ElementRef,
  inject,
  InjectionToken,
  Input,
  NgZone,
  numberAttribute,
  OnDestroy,
  Renderer2,
} from '@angular/core';
import {_animationsDisabled, _StructuralStylesLoader, MatRippleLoader, ThemePalette} from '../core';
import {_CdkPrivateStyleLoader} from '@angular/cdk/private';

/**
 * Possible appearances for a `MatButton`.
 * See https://m3.material.io/components/buttons/overview
 */
export type MatButtonAppearance = 'text' | 'filled' | 'elevated' | 'outlined' | 'tonal';

/** Object that can be used to configure the default options for the button component. */
export interface MatButtonConfig {
  /** Whether disabled buttons should be interactive. */
  disabledInteractive?: boolean;

  /** Default palette color to apply to buttons. */
  color?: ThemePalette;

  /** Default appearance for plain buttons (not icon buttons or FABs). */
  defaultAppearance?: MatButtonAppearance;
}

/** Injection token that can be used to provide the default options the button component. */
export const MAT_BUTTON_CONFIG = new InjectionToken<MatButtonConfig>('MAT_BUTTON_CONFIG');

function transformTabIndex(value: unknown): number | undefined {
  return value == null ? undefined : numberAttribute(value);
}

/** Base class for all buttons. */
@Directive({
  host: {
    // Add a class that applies to all buttons. This makes it easier to target if somebody
    // wants to target all Material buttons.
    'class': 'mat-mdc-button-base',
    '[class]': 'color ? "mat-" + color : ""',
    '[attr.disabled]': '_getDisabledAttribute()',
    '[attr.aria-disabled]': '_getAriaDisabled()',
    '[attr.tabindex]': '_getTabIndex()',
    '[class.mat-mdc-button-disabled]': 'disabled',
    '[class.mat-mdc-button-disabled-interactive]': 'disabledInteractive',
    '[class.mat-unthemed]': '!color',
    '[class._mat-animation-noopable]': '_animationsDisabled',
  },
})
export class MatButtonBase implements AfterViewInit, OnDestroy {
  _elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  protected _ngZone = inject(NgZone);
  protected _animationsDisabled = _animationsDisabled();

  protected readonly _config = inject(MAT_BUTTON_CONFIG, {optional: true});
  private readonly _focusMonitor = inject(FocusMonitor);
  private _cleanupClick: (() => void) | undefined;
  private _renderer = inject(Renderer2);

  /**
   * Handles the lazy creation of the MatButton ripple.
   * Used to improve initial load time of large applications.
   */
  protected _rippleLoader: MatRippleLoader = inject(MatRippleLoader);

  /** Whether the button is set on an anchor node. */
  protected _isAnchor: boolean;

  /** Whether this button is a FAB. Used to apply the correct class on the ripple. */
  protected _isFab = false;

  /**
   * Theme color of the button. This API is supported in M2 themes only, it has
   * no effect in M3 themes. For color customization in M3, see https://material.angular.dev/components/button/styling.
   *
   * For information on applying color variants in M3, see
   * https://material.angular.dev/guide/material-2-theming#optional-add-backwards-compatibility-styles-for-color-variants
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
   * why the button is disabled (e.g. via tooltip). This is also useful for buttons that may
   * become disabled when activated, which would cause focus to be transferred to the document
   * body instead of remaining on the button.
   *
   * Enabling this input will change the button so that it is styled to be disabled and will be
   * marked as `aria-disabled`, but it will allow the button to receive events and focus.
   *
   * Note that by enabling this, you need to set the `tabindex` yourself if the button isn't
   * meant to be tabbable and you have to prevent the button action (e.g. form submissions).
   */
  @Input({transform: booleanAttribute})
  disabledInteractive: boolean;

  /** Tab index for the button. */
  @Input({transform: transformTabIndex})
  tabIndex: number;

  /**
   * Backwards-compatibility input that handles pre-existing `[tabindex]` bindings.
   * @docs-private
   */
  @Input({alias: 'tabindex', transform: transformTabIndex})
  set _tabindex(value: number) {
    this.tabIndex = value;
  }

  constructor(...args: unknown[]);

  constructor() {
    inject(_CdkPrivateStyleLoader).load(_StructuralStylesLoader);
    const element = this._elementRef.nativeElement;

    this._isAnchor = element.tagName === 'A';
    this.disabledInteractive = this._config?.disabledInteractive ?? false;
    this.color = this._config?.color ?? null;
    this._rippleLoader?.configureRipple(element, {className: 'mat-mdc-button-ripple'});
  }

  ngAfterViewInit() {
    this._focusMonitor.monitor(this._elementRef, true);

    // Some internal tests depend on the timing of this,
    // otherwise we could bind it in the constructor.
    if (this._isAnchor) {
      this._setupAsAnchor();
    }
  }

  ngOnDestroy() {
    this._cleanupClick?.();
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

    if (this._isAnchor) {
      return this.disabled || null;
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

  protected _getTabIndex() {
    if (this._isAnchor) {
      return this.disabled && !this.disabledInteractive ? -1 : this.tabIndex;
    }
    return this.tabIndex;
  }

  private _setupAsAnchor() {
    this._cleanupClick = this._ngZone.runOutsideAngular(() =>
      this._renderer.listen(this._elementRef.nativeElement, 'click', (event: Event) => {
        if (this.disabled) {
          event.preventDefault();
          event.stopImmediatePropagation();
        }
      }),
    );
  }
}

// tslint:disable:variable-name
/**
 * Anchor button base.
 */
export const MatAnchorBase = MatButtonBase;
export type MatAnchorBase = MatButtonBase;
// tslint:enable:variable-name

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {FocusMonitor} from '@angular/cdk/a11y';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Inject,
  InjectionToken,
  Input,
  OnDestroy,
  Optional,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {
  CanColor,
  CanColorCtor,
  CanDisable,
  CanDisableCtor,
  CanDisableRipple,
  CanDisableRippleCtor,
  MatRipple,
  mixinColor,
  mixinDisabled,
  mixinDisableRipple,
} from '@angular/material/core';
import {ANIMATION_MODULE_TYPE} from '@angular/platform-browser/animations';

/** Default color palette for round buttons (mat-fab and mat-mini-fab) */
const DEFAULT_ROUND_BUTTON_COLOR = 'accent';

/* Default Button Type that can be overridden*/
export interface MatButtonDefaultOptions {
  /** Default Button Type */
  type: 'submit' | 'reset' | 'button';

  [key: string]: string;
}

/** Injection token to be used to override the default options for `mat-button`. */
export const MAT_BUTTON_DEFAULT_OPTIONS =
    new InjectionToken<MatButtonDefaultOptions>('mat-autocomplete-default-options', {
      providedIn: 'root',
      factory: MAT_BUTTON_DEFAULT_OPTIONS_FACTORY,
    });

/** @docs-private */
export function MAT_BUTTON_DEFAULT_OPTIONS_FACTORY(): MatButtonDefaultOptions {
  return {type: 'submit'};
}


/**
 * List of classes to add to MatButton instances based on host attributes to
 * style as different variants.
 */
const BUTTON_HOST_ATTRIBUTES = [
  'mat-button',
  'mat-flat-button',
  'mat-icon-button',
  'mat-raised-button',
  'mat-stroked-button',
  'mat-mini-fab',
  'mat-fab',
];

// Boilerplate for applying mixins to MatButton.
/** @docs-private */
class MatButtonBase {
  constructor(public _elementRef: ElementRef) {}
}

const _MatButtonMixinBase: CanDisableRippleCtor & CanDisableCtor & CanColorCtor &
    typeof MatButtonBase = mixinColor(mixinDisabled(mixinDisableRipple(MatButtonBase)));

/**
 * Material design button.
 */
@Component({
  moduleId: module.id,
  selector: `button[mat-button], button[mat-raised-button], button[mat-icon-button],
             button[mat-fab], button[mat-mini-fab], button[mat-stroked-button],
             button[mat-flat-button]`,
  exportAs: 'matButton',
  host: {
    '[attr.disabled]': 'disabled || null',
    '[class._mat-animation-noopable]': '_animationMode === "NoopAnimations"',
  },
  templateUrl: 'button.html',
  styleUrls: ['button.css'],
  inputs: ['disabled', 'disableRipple', 'color'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatButton extends _MatButtonMixinBase
    implements OnDestroy, CanDisable, CanColor, CanDisableRipple {

  /** Whether the button is round. */
  readonly isRoundButton: boolean = this._hasHostAttributes('mat-fab', 'mat-mini-fab');

  /** Whether the button is icon button. */
  readonly isIconButton: boolean = this._hasHostAttributes('mat-icon-button');

  /** Reference to the MatRipple instance of the button. */
  @ViewChild(MatRipple, {static: false}) ripple: MatRipple;

  constructor(elementRef: ElementRef,
              private _focusMonitor: FocusMonitor,
              @Inject(MAT_BUTTON_DEFAULT_OPTIONS) defaults: MatButtonDefaultOptions,
              @Optional() @Inject(ANIMATION_MODULE_TYPE) public _animationMode: string) {
    super(elementRef);

    for (const key in defaults) {
      (elementRef.nativeElement as HTMLElement).setAttribute(key, defaults[key]);
    }
    // For each of the variant selectors that is prevent in the button's host
    // attributes, add the correct corresponding class.
    for (const attr of BUTTON_HOST_ATTRIBUTES) {
      if (this._hasHostAttributes(attr)) {
        (elementRef.nativeElement as HTMLElement).classList.add(attr);
      }
    }

    this._focusMonitor.monitor(this._elementRef, true);

    if (this.isRoundButton) {
      this.color = DEFAULT_ROUND_BUTTON_COLOR;
    }
  }

  ngOnDestroy() {
    this._focusMonitor.stopMonitoring(this._elementRef);
  }

  /** Focuses the button. */
  focus(): void {
    this._getHostElement().focus();
  }

  _getHostElement() {
    return this._elementRef.nativeElement;
  }

  _isRippleDisabled() {
    return this.disableRipple || this.disabled;
  }

  /** Gets whether the button has one of the given attributes. */
  _hasHostAttributes(...attributes: string[]) {
    return attributes.some(attribute => this._getHostElement().hasAttribute(attribute));
  }
}

/**
 * Material design anchor button.
 */
@Component({
  moduleId: module.id,
  selector: `a[mat-button], a[mat-raised-button], a[mat-icon-button], a[mat-fab],
             a[mat-mini-fab], a[mat-stroked-button], a[mat-flat-button]`,
  exportAs: 'matButton, matAnchor',
  host: {
    // Note that we ignore the user-specified tabindex when it's disabled for
    // consistency with the `mat-button` applied on native buttons where even
    // though they have an index, they're not tabbable.
    '[attr.tabindex]': 'disabled ? -1 : (tabIndex || 0)',
    '[attr.disabled]': 'disabled || null',
    '[attr.aria-disabled]': 'disabled.toString()',
    '(click)': '_haltDisabledEvents($event)',
    '[class._mat-animation-noopable]': '_animationMode === "NoopAnimations"',
  },
  inputs: ['disabled', 'disableRipple', 'color'],
  templateUrl: 'button.html',
  styleUrls: ['button.css'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatAnchor extends MatButton {
  /** Tabindex of the button. */
  @Input() tabIndex: number;

  constructor(
      focusMonitor: FocusMonitor,
      elementRef: ElementRef,
      @Inject(MAT_BUTTON_DEFAULT_OPTIONS) defaults: MatButtonDefaultOptions,
      @Optional() @Inject(ANIMATION_MODULE_TYPE) animationMode: string) {
    super(elementRef, focusMonitor, defaults, animationMode);
  }

  _haltDisabledEvents(event: Event) {
    // A disabled button shouldn't apply any actions
    if (this.disabled) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }
}

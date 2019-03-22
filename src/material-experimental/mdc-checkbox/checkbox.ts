/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {Platform} from '@angular/cdk/platform';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  Inject,
  Input,
  NgZone,
  OnDestroy,
  Optional,
  Output,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {
  MAT_CHECKBOX_CLICK_ACTION,
  MatCheckboxClickAction,
  RippleRenderer,
  RippleTarget,
  ThemePalette
} from '@angular/material';
import {ANIMATION_MODULE_TYPE} from '@angular/platform-browser/animations';
import {MDCCheckboxAdapter, MDCCheckboxFoundation} from '@material/checkbox';
import {MDCFormFieldAdapter, MDCFormFieldFoundation} from '@material/form-field';
import {MDCRippleFoundation} from '@material/ripple';

let nextUniqueId = 0;

export const MAT_MDC_CHECKBOX_CONTROL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => MatCheckbox),
  multi: true
};

/** Change event object emitted by MatCheckbox. */
export class MatCheckboxChange {
  /** The source MatCheckbox of the event. */
  source: MatCheckbox;
  /** The new `checked` value of the checkbox. */
  checked: boolean;
}

@Component({
  moduleId: module.id,
  selector: 'mat-checkbox',
  templateUrl: 'checkbox.html',
  styleUrls: ['checkbox.css'],
  host: {
    'class': 'mat-mdc-checkbox',
    '[class.mat-primary]': 'color == "primary"',
    '[class.mat-accent]': 'color == "accent"',
    '[class.mat-warn]': 'color == "warn"',
    '[class._mat-animation-noopable]': `_animationMode === 'NoopAnimations'`,
    '(animationend)': '_checkboxFoundation.handleAnimationEnd()',
  },
  providers: [MAT_MDC_CHECKBOX_CONTROL_VALUE_ACCESSOR],
  exportAs: 'matCheckbox',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatCheckbox implements AfterViewInit, OnDestroy, ControlValueAccessor {
  @Input('aria-label') ariaLabel: string = '';

  @Input('aria-labelledby') ariaLabelledby: string|null = null;

  @Input() color: ThemePalette = 'accent';

  @Input() disableRipple: boolean = false;

  @Input() labelPosition: 'before'|'after' = 'after';

  @Input() name: string|null = null;

  @Input() tabIndex = 0;

  @Input() value: string;

  private _uniqueId = `mat-mdc-checkbox-${++nextUniqueId}`;
  @Input() id: string = this._uniqueId;

  @Input()
  get checked(): boolean {
    return this._checked;
  }
  set checked(checked) {
    this._checked = coerceBooleanProperty(checked);
  }
  private _checked = false;

  @Input()
  get indeterminate(): boolean {
    return this._indeterminate;
  }
  set indeterminate(indeterminate) {
    this._indeterminate = coerceBooleanProperty(indeterminate);
  }
  private _indeterminate = false;

  @Input()
  get disabled(): boolean {
    return this._disabled;
  }
  set disabled(disabled) {
    this._disabled = coerceBooleanProperty(disabled);
  }
  private _disabled = false;

  @Input()
  get required(): boolean {
    return this._required;
  }
  set required(required) {
    this._required = coerceBooleanProperty(required);
  }
  private _required = false;

  @Output()
  readonly change: EventEmitter<MatCheckboxChange> = new EventEmitter<MatCheckboxChange>();

  @Output() readonly indeterminateChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  @ViewChild('checkbox') _checkbox: ElementRef<HTMLElement>;

  @ViewChild('nativeCheckbox') _nativeCheckbox: ElementRef<HTMLInputElement>;

  @ViewChild('label') _label: ElementRef<HTMLElement>;

  readonly inputId: string = `${this.id || this._uniqueId}-input`;

  _checkboxFoundation: MDCCheckboxFoundation;

  _classes: {[key: string]: boolean} = {'mdc-checkbox__native-control': true};

  private _formFieldFoundation: MDCFormFieldFoundation;

  private _cvaOnChange = (_: boolean) => {};

  private _cvaOnTouch = () => {};

  private _rippleTarget: RippleTarget;

  private _rippleRenderer: RippleRenderer;

  private _checkboxAdapter: MDCCheckboxAdapter = {
    addClass: (className) => this._setClass(className, true),
    removeClass: (className) => this._setClass(className, false),
    forceLayout: () => this._platform.isBrowser && this._checkbox.nativeElement.offsetWidth,
    hasNativeControl: () => !!this._nativeCheckbox.nativeElement,
    isAttachedToDOM: () => !!this._checkbox.nativeElement.parentNode,
    isChecked: () => this.checked,
    isIndeterminate: () => this.indeterminate,
    removeNativeControlAttr: (attr) => this._nativeCheckbox.nativeElement.removeAttribute(attr),
    setNativeControlAttr: (attr, value) =>
        this._nativeCheckbox.nativeElement.setAttribute(attr, value),
    setNativeControlDisabled: (disabled) => this.disabled = disabled,
  };

  private _formFieldAdapter: Partial<MDCFormFieldAdapter> = {
    registerInteractionHandler: (type, handler) =>
        this._label.nativeElement.addEventListener(type, handler),
    deregisterInteractionHandler: (type, handler) =>
        this._label.nativeElement.removeEventListener(type, handler),
  };

  constructor(
      private _cdr: ChangeDetectorRef, private _platform: Platform, private _ngZone: NgZone,
      @Optional() @Inject(MAT_CHECKBOX_CLICK_ACTION) private _clickAction: MatCheckboxClickAction,
      @Optional() @Inject(ANIMATION_MODULE_TYPE) public _animationMode?: string) {
    this._checkboxFoundation = new MDCCheckboxFoundation(this._checkboxAdapter);
    this._formFieldFoundation = new MDCFormFieldFoundation(this._formFieldAdapter);
  }

  ngAfterViewInit() {
    this._rippleTarget = {
      rippleConfig: {
        radius: 20,
        centered: true,
        animation: {
          enterDuration: MDCRippleFoundation.numbers.DEACTIVATION_TIMEOUT_MS,
          exitDuration: MDCRippleFoundation.numbers.FG_DEACTIVATION_MS,
        },
      },
      rippleDisabled: true
    };
    this._rippleRenderer =
        new RippleRenderer(this._rippleTarget, this._ngZone, this._checkbox, this._platform);

    this._checkboxFoundation.init();
    this._formFieldFoundation.init();
  }

  ngOnDestroy() {
    this._checkboxFoundation.destroy();
    this._formFieldFoundation.destroy();
  }

  registerOnChange(fn: (checked: boolean) => void) {
    this._cvaOnChange = fn;
  }

  registerOnTouched(fn: () => void) {
    this._cvaOnTouch = fn;
  }

  setDisabledState(isDisabled: boolean) {
    this.disabled = isDisabled;
  }

  writeValue(value: any) {
    this.checked = !!value;
    this._cdr.markForCheck();
  }

  focus() {
    this._nativeCheckbox.nativeElement.focus();
  }

  toggle() {
    this.checked = !this.checked;
  }

  _activateRipple() {
    if (!this.disableRipple && this._animationMode != 'NoopAnimations') {
      this._rippleRenderer.fadeInRipple(0, 0, this._rippleTarget.rippleConfig);
    }
  }

  _onBlur() {
    this._cvaOnTouch();
  }

  _onChange(event: Event) {
    // Prevent the native change event from escaping the component boundary
    event.stopPropagation();

    if (this._clickAction === 'noop') {
      this._nativeCheckbox.nativeElement.checked = this.checked;
      this._nativeCheckbox.nativeElement.indeterminate = this.indeterminate;
      return;
    }

    if (this.indeterminate && this._clickAction !== 'check') {
      this.indeterminate = false;
      Promise.resolve().then(() => this.indeterminateChange.next(this.indeterminate));
    } else {
      this._nativeCheckbox.nativeElement.indeterminate = this.indeterminate;
    }

    this.checked = this._nativeCheckbox.nativeElement.checked;
    this._checkboxFoundation.handleChange();

    // Dispatch our own event instead
    const newEvent = new MatCheckboxChange();
    newEvent.source = this as any;
    newEvent.checked = this.checked;
    this._cvaOnChange(this.checked);
    this.change.next(newEvent);
  }

  private _setClass(cssClass: string, active: boolean) {
    this._classes = {...this._classes, [cssClass]: active};
    this._cdr.markForCheck();
  }
}

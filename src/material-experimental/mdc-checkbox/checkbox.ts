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
  Input,
  OnDestroy,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import {MDCCheckboxAdapter, MDCCheckboxFoundation} from '@material/checkbox';
import {MDCFormFieldAdapter, MDCFormFieldFoundation} from '@material/form-field';

@Component({
  moduleId: module.id,
  selector: 'mat-checkbox',
  templateUrl: 'checkbox.html',
  styleUrls: ['checkbox.css'],
  host: {
    '(animationend)': '_checkboxFoundation.handleAnimationEnd()',
  },
  exportAs: 'matCheckbox',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatCheckbox implements AfterViewInit, OnDestroy {
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

  @ViewChild('checkbox') _checkbox: ElementRef<HTMLElement>;

  @ViewChild('nativeCheckbox') _nativeCheckbox: ElementRef<HTMLInputElement>;

  @ViewChild('label') _label: ElementRef<HTMLElement>;

  _checkboxFoundation: MDCCheckboxFoundation;

  _classes: {[key: string]: boolean} = {'mdc-checkbox__native-control': true};

  private _formFieldFoundation: MDCFormFieldFoundation;

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

  constructor(private _cdr: ChangeDetectorRef, private _platform: Platform) {
    this._checkboxFoundation = new MDCCheckboxFoundation(this._checkboxAdapter);
    this._formFieldFoundation = new MDCFormFieldFoundation(this._formFieldAdapter);
  }

  ngAfterViewInit() {
    this._checkboxFoundation.init();
    this._formFieldFoundation.init();
  }

  ngOnDestroy() {
    this._checkboxFoundation.destroy();
    this._formFieldFoundation.destroy();
  }

  private _setClass(cssClass: string, active: boolean) {
    this._classes = {...this._classes, [cssClass]: active};
    this._cdr.markForCheck();
  }
}

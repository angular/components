/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Directive, ElementRef, Input, OnInit, inject} from '@angular/core';
import {AriaHasPopupValue, CDK_COMBOBOX, CdkCombobox} from './combobox';

let nextId = 0;

@Directive({
  selector: '[cdkComboboxPopup]',
  exportAs: 'cdkComboboxPopup',
  host: {
    'class': 'cdk-combobox-popup',
    '[attr.role]': 'role',
    '[id]': 'id',
    'tabindex': '-1',
    '(focus)': 'focusFirstElement()',
  },
})
export class CdkComboboxPopup<T = unknown> implements OnInit {
  private readonly _elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly _combobox = inject<CdkCombobox>(CDK_COMBOBOX);

  @Input()
  get role(): AriaHasPopupValue {
    return this._role;
  }
  set role(value: AriaHasPopupValue) {
    this._role = value;
  }
  private _role: AriaHasPopupValue = 'dialog';

  @Input()
  get firstFocus(): HTMLElement {
    return this._firstFocusElement;
  }
  set firstFocus(id: HTMLElement) {
    this._firstFocusElement = id;
  }
  private _firstFocusElement: HTMLElement;

  @Input() id = `cdk-combobox-popup-${nextId++}`;

  ngOnInit() {
    this.registerWithPanel();
  }

  registerWithPanel(): void {
    this._combobox._registerContent(this.id, this._role);
  }

  focusFirstElement() {
    if (this._firstFocusElement) {
      this._firstFocusElement.focus();
    } else {
      this._elementRef.nativeElement.focus();
    }
  }
}

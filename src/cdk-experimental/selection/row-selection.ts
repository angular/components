/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, HostBinding, Input} from '@angular/core';

import {CdkSelection} from './selection';

/**
 * Applies `cdk-selected` class and `aria-selected` to an element.
 *
 * Must be used within a parent `CdkSelection` directive.
 * Must be provided with the value. The index is required if `trackBy` is used on the `CdkSelection`
 * directive.
 */
@Directive({
  selector: '[cdkRowSelection]',
})
export class CdkRowSelection<T> {
  @Input()
  get cdkRowSelectionValue(): T {
    return this._value;
  }
  set cdkRowSelectionValue(value: T) {
    this._value = value;
  }
  _value: T;

  @Input()
  get cdkRowSelectionIndex(): number|undefined {
    return this._index;
  }
  set cdkRowSelectionIndex(index: number|undefined) {
    this._index = index;
  }
  _index?: number;

  constructor(private readonly _selection: CdkSelection<T>) {}

  @HostBinding('class.cdk-selected')
  @HostBinding('attr.aria-selected')
  get isSelected() {
    return this._selection.isSelected(this._value, this._index);
  }
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {coerceNumberProperty, NumberInput} from '@angular/cdk/coercion';
import {Directive, Input, inject} from '@angular/core';

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
  host: {
    '[class.cdk-selected]': '_selection.isSelected(this.value, this.index)',
    '[attr.aria-selected]': '_selection.isSelected(this.value, this.index)',
  },
})
export class CdkRowSelection<T> {
  readonly _selection = inject<CdkSelection<T>>(CdkSelection);

  // We need an initializer here to avoid a TS error.
  @Input('cdkRowSelectionValue') value: T = undefined!;

  @Input('cdkRowSelectionIndex')
  get index(): number | undefined {
    return this._index;
  }
  set index(index: NumberInput) {
    this._index = coerceNumberProperty(index);
  }
  protected _index?: number;
}

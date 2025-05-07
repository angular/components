/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Directive, ElementRef, Input, booleanAttribute, inject} from '@angular/core';
import {InkBarItem} from './ink-bar';

/**
 * Used in the `mat-tab-group` view to display tab labels.
 * @nodoc
 */
@Directive({
  selector: '[matTabLabelWrapper]',
  host: {
    '[class.mat-mdc-tab-disabled]': 'disabled',
    '[attr.aria-disabled]': '!!disabled',
  },
})
export class MatTabLabelWrapper extends InkBarItem {
  elementRef = inject(ElementRef);

  /** Whether the tab is disabled. */
  @Input({transform: booleanAttribute})
  disabled: boolean = false;

  /** Sets focus on the wrapper element */
  focus(): void {
    this.elementRef.nativeElement.focus();
  }

  getOffsetLeft(): number {
    return this.elementRef.nativeElement.offsetLeft;
  }

  getOffsetWidth(): number {
    return this.elementRef.nativeElement.offsetWidth;
  }
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Directive} from '@angular/core';
import {CdkVirtualScrollable, VIRTUAL_SCROLLABLE} from './virtual-scrollable';

/**
 * Provides a virtual scrollable for the element it is attached to.
 */
@Directive({
  selector: '[cdkVirtualScrollingElement]',
  providers: [{provide: VIRTUAL_SCROLLABLE, useExisting: CdkVirtualScrollableElement}],
  standalone: true,
  host: {
    'class': 'cdk-virtual-scrollable',
  },
})
export class CdkVirtualScrollableElement extends CdkVirtualScrollable {
  constructor(...args: unknown[]);

  constructor() {
    super();
  }

  override measureBoundingClientRectWithScrollOffset(
    from: 'left' | 'top' | 'right' | 'bottom',
  ): number {
    return (
      this.getElementRef().nativeElement.getBoundingClientRect()[from] -
      this.measureScrollOffset(from)
    );
  }
}

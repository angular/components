/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Directive, OnDestroy, Input, InjectionToken, booleanAttribute} from '@angular/core';

/**
 * Injection token that can be used to reference instances of `CdkDropListGroup`. It serves as
 * alternative token to the actual `CdkDropListGroup` class which could cause unnecessary
 * retention of the class and its directive metadata.
 */
export const CDK_DROP_LIST_GROUP = new InjectionToken<CdkDropListGroup<unknown>>(
  'CdkDropListGroup',
);

/**
 * Declaratively connects sibling `cdkDropList` instances together. All of the `cdkDropList`
 * elements that are placed inside a `cdkDropListGroup` will be connected to each other
 * automatically. Can be used as an alternative to the `cdkDropListConnectedTo` input
 * from `cdkDropList`.
 */
@Directive({
  selector: '[cdkDropListGroup]',
  exportAs: 'cdkDropListGroup',
  providers: [{provide: CDK_DROP_LIST_GROUP, useExisting: CdkDropListGroup}],
})
export class CdkDropListGroup<T> implements OnDestroy {
  /** Drop lists registered inside the group. */
  readonly _items = new Set<T>();

  /** Whether starting a dragging sequence from inside this group is disabled. */
  @Input({alias: 'cdkDropListGroupDisabled', transform: booleanAttribute})
  disabled: boolean = false;

  ngOnDestroy() {
    this._items.clear();
  }
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  Directive,
  ElementRef,
  computed,
  inject,
  input,
  signal,
  OnInit,
  OnDestroy,
} from '@angular/core';
import {TreeItemPattern, DeferredContent} from '../private';
import type {TreeItem} from './tree-item';
import {sortDirectives} from './utils';

/**
 * Group that contains children tree items.
 *
 * The `ngTreeItemGroup` structural directive should be applied to an `ng-template` that
 * wraps the child `ngTreeItem` elements. It is used to define a group of children for an
 * expandable `ngTreeItem`. The `ownedBy` input links the group to its parent `ngTreeItem`.
 *
 * ```html
 * <li ngTreeItem [value]="'parent-id'">
 *   Parent Item
 *   <ul role="group">
 *     <ng-template ngTreeItemGroup [ownedBy]="parentTreeItemRef">
 *       <li ngTreeItem [value]="'child-id'">Child Item</li>
 *     </ng-template>
 *   </ul>
 * </li>
 * ```
 *
 * @developerPreview 21.0
 *
 * @see [Tree](guide/aria/tree)
 */
@Directive({
  selector: 'ng-template[ngTreeItemGroup]',
  exportAs: 'ngTreeItemGroup',
  hostDirectives: [DeferredContent],
})
export class TreeItemGroup<V> implements OnInit, OnDestroy {
  /** A reference to the host element. */
  private readonly _elementRef = inject(ElementRef);

  /** A reference to the host element. */
  readonly element = this._elementRef.nativeElement as HTMLElement;

  /** The DeferredContent host directive. */
  private readonly _deferredContent = inject(DeferredContent);

  /** All groupable items that are descendants of the group. */
  private readonly _unorderedItems = signal(new Set<TreeItem<V>>());

  /** Child items within this group. */
  readonly _childPatterns = computed<TreeItemPattern<V>[]>(() =>
    [...this._unorderedItems()].sort(sortDirectives).map(c => c._pattern),
  );

  /** Tree item that owns the group. */
  readonly ownedBy = input.required<TreeItem<V>>();

  ngOnInit() {
    this._deferredContent.deferredContentAware.set(this.ownedBy());
    this.ownedBy()._register(this);
  }

  ngOnDestroy() {
    this.ownedBy()._unregister();
  }

  _register(child: TreeItem<V>) {
    this._unorderedItems().add(child);
    this._unorderedItems.set(new Set(this._unorderedItems()));
  }

  _unregister(child: TreeItem<V>) {
    this._unorderedItems().delete(child);
    this._unorderedItems.set(new Set(this._unorderedItems()));
  }
}

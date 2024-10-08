/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  ChangeDetectionStrategy,
  Component,
  Input,
  ContentChildren,
  ElementRef,
  QueryList,
  ViewChild,
  ViewEncapsulation,
  InjectionToken,
} from '@angular/core';
import {MatListBase, MatListItemBase} from './list-base';
import {MatListItemLine, MatListItemMeta, MatListItemTitle} from './list-item-sections';
import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {CdkObserveContent} from '@angular/cdk/observers';

/**
 * Injection token that can be used to inject instances of `MatList`. It serves as
 * alternative token to the actual `MatList` class which could cause unnecessary
 * retention of the class and its component metadata.
 */
export const MAT_LIST = new InjectionToken<MatList>('MatList');

@Component({
  selector: 'mat-list',
  exportAs: 'matList',
  template: '<ng-content></ng-content>',
  host: {
    'class': 'mat-mdc-list mat-mdc-list-base mdc-list',
  },
  styleUrl: 'list.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{provide: MatListBase, useExisting: MatList}],
  standalone: true,
})
export class MatList extends MatListBase {}

@Component({
  selector: 'mat-list-item, a[mat-list-item], button[mat-list-item]',
  exportAs: 'matListItem',
  host: {
    'class': 'mat-mdc-list-item mdc-list-item',
    '[class.mdc-list-item--activated]': 'activated',
    '[class.mdc-list-item--with-leading-avatar]': '_avatars.length !== 0',
    '[class.mdc-list-item--with-leading-icon]': '_icons.length !== 0',
    '[class.mdc-list-item--with-trailing-meta]': '_meta.length !== 0',
    // Utility class that makes it easier to target the case where there's both a leading
    // and a trailing icon. Avoids having to write out all the combinations.
    '[class.mat-mdc-list-item-both-leading-and-trailing]': '_hasBothLeadingAndTrailing()',
    '[class._mat-animation-noopable]': '_noopAnimations',
    '[attr.aria-current]': '_getAriaCurrent()',
  },
  templateUrl: 'list-item.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CdkObserveContent],
})
export class MatListItem extends MatListItemBase {
  @ContentChildren(MatListItemLine, {descendants: true}) _lines: QueryList<MatListItemLine>;
  @ContentChildren(MatListItemTitle, {descendants: true}) _titles: QueryList<MatListItemTitle>;
  @ContentChildren(MatListItemMeta, {descendants: true}) _meta: QueryList<MatListItemMeta>;
  @ViewChild('unscopedContent') _unscopedContent: ElementRef<HTMLSpanElement>;
  @ViewChild('text') _itemText: ElementRef<HTMLElement>;

  /** Indicates whether an item in a `<mat-nav-list>` is the currently active page. */
  @Input()
  get activated(): boolean {
    return this._activated;
  }
  set activated(activated) {
    this._activated = coerceBooleanProperty(activated);
  }
  _activated = false;

  /**
   * Determine the value of `aria-current`. Return 'page' if this item is an activated anchor tag.
   * Otherwise, return `null`. This method is safe to use with server-side rendering.
   */
  _getAriaCurrent(): string | null {
    return this._hostElement.nodeName === 'A' && this._activated ? 'page' : null;
  }

  protected _hasBothLeadingAndTrailing(): boolean {
    return this._meta.length !== 0 && (this._avatars.length !== 0 || this._icons.length !== 0);
  }
}

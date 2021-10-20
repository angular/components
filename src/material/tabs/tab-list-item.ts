/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  ChangeDetectionStrategy,
  Component,
  Input,
  TemplateRef,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import {mixinDisabled} from '@angular/material/core';

// Boilerplate for applying mixins to MatTabListItem.
/** @docs-private */
const _MatTabListItemMixinBase = mixinDisabled(class {});

/** Directive for passing tab list items to tab list. */
@Component({
  selector: 'mat-tab-list-item',
  templateUrl: 'tab-list-item.html',
  inputs: ['disabled'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class MatTabListItem extends _MatTabListItemMixinBase {
  /** Template inside the MatTabListItem view that contains an `<ng-content>`. */
  @ViewChild(TemplateRef, {static: true}) _template: TemplateRef<void>;

  /** Aria label for the tab list item. */
  @Input() ariaLabel: string;

  /**
   * Reference to the element that the tab list item is labelled by.
   */
  @Input() ariaLabelledby: string;
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, Input, TemplateRef} from '@angular/core';
import {mixinDisabled} from '@angular/material/core';

// Boilerplate for applying mixins to MatTabListItem.
/** @docs-private */
const _MatTabListItemMixinBase = mixinDisabled(class {});

/** Directive for passing tab list items to tab list. */
@Directive({
  selector: '[mat-tab-list-item], [matTabListItem]',
  inputs: ['disabled'],
})
export class MatTabListItem extends _MatTabListItemMixinBase {
  /** Aria label for the tab list item. */
  @Input() ariaLabel: string;

  /**
   * Reference to the element that the tab list item is labelled by.
   */
  @Input() ariaLabelledby: string;

  constructor(public _template: TemplateRef<void>) {
    super();
  }
}

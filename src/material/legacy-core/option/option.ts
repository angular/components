/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  Optional,
  ViewEncapsulation,
} from '@angular/core';
import {
  MAT_OPTION_PARENT_COMPONENT,
  _MatOptionBase,
  MatOptionParentComponent,
  MAT_OPTGROUP,
} from '@angular/material/core';
import {MatLegacyOptgroup} from './optgroup';

/**
 * Single option inside of a `<mat-select>` element.
 * @deprecated Use `MatOption` from `@angular/material/core` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
 * @breaking-change 17.0.0
 *
 * The aria-selected attribute applied to the option conforms to WAI ARIA best practices for listbox
 * interaction patterns.
 *
 * From [WAI ARIA Listbox authoring practices guide](
 * https://www.w3.org/WAI/ARIA/apg/patterns/listbox/):
 *  "If any options are selected, each selected option has either aria-selected or aria-checked
 *  set to true. All options that are selectable but not selected have either aria-selected or
 *  aria-checked set to false."
 *
 * Set `aria-selected="false"` on not-selected listbox options that are selectable to fix
 * VoiceOver reading every option as "selected" (#25736). Also fixes chromevox not announcing
 * options as selectable.
 */
@Component({
  selector: 'mat-option',
  exportAs: 'matOption',
  host: {
    'role': 'option',
    '[attr.tabindex]': '_getTabIndex()',
    '[class.mat-selected]': 'selected',
    '[class.mat-option-multiple]': 'multiple',
    '[class.mat-active]': 'active',
    '[id]': 'id',
    '[attr.aria-selected]': 'selected',
    '[attr.aria-disabled]': 'disabled.toString()',
    '[class.mat-option-disabled]': 'disabled',
    '(click)': '_selectViaInteraction()',
    '(keydown)': '_handleKeydown($event)',
    'class': 'mat-option mat-focus-indicator',
  },
  styleUrls: ['option.css'],
  templateUrl: 'option.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatLegacyOption<T = any> extends _MatOptionBase<T> {
  constructor(
    element: ElementRef<HTMLElement>,
    changeDetectorRef: ChangeDetectorRef,
    @Optional() @Inject(MAT_OPTION_PARENT_COMPONENT) parent: MatOptionParentComponent,
    @Optional() @Inject(MAT_OPTGROUP) group: MatLegacyOptgroup,
  ) {
    super(element, changeDetectorRef, parent, group);
  }
}

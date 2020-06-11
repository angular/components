/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, Output, EventEmitter} from '@angular/core';
import {CdkMenuItem} from './menu-item';

/**
 * Directive which provides grouping logic for CdkMenuItem components marked with role
 * menuitemradio.
 * Siblings within the element are part of the same RadioGroup and behave as such.
 */
@Directive({
  selector: '[cdkMenuGroup]',
  exportAs: 'cdkMenuGroup',
  host: {
    'role': 'group',
  },
})
export class CdkMenuGroup {
  /** Emits the element when checkbox or radiobutton state changed  */
  @Output() change: EventEmitter<CdkMenuItem> = new EventEmitter();
}

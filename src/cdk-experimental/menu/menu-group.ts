/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, Output, OnDestroy} from '@angular/core';
import {Subject} from 'rxjs';
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
    // as per aria spec
    role: 'group',
  },
})
export class CdkMenuGroup implements OnDestroy {
  /** Emits the element when checkbox or radiobutton state changed  */
  @Output() change: Subject<CdkMenuItem> = new Subject();

  /** Cleanup event emitters */
  ngOnDestroy() {
    this.change.complete();
  }
}

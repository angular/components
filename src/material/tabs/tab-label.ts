/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Directive, InjectionToken, inject} from '@angular/core';
import {CdkPortal} from '@angular/cdk/portal';
import {MAT_TAB} from './tab-token';

/**
 * Injection token that can be used to reference instances of `MatTabLabel`. It serves as
 * alternative token to the actual `MatTabLabel` class which could cause unnecessary
 * retention of the class and its directive metadata.
 */
export const MAT_TAB_LABEL = new InjectionToken<MatTabLabel>('MatTabLabel');

/** Used to flag tab labels for use with the portal directive */
@Directive({
  selector: '[mat-tab-label], [matTabLabel]',
  providers: [{provide: MAT_TAB_LABEL, useExisting: MatTabLabel}],
})
export class MatTabLabel extends CdkPortal {
  _closestTab = inject(MAT_TAB, {optional: true});
}

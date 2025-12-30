/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Directive, ElementRef, inject, forwardRef} from '@angular/core';
import {GRID_ROW} from './tokens';

/**
 * Directive that provides GRID_ROW token for CDK table rows.
 * Apply this to tr elements that use ngGridRow in CDK tables.
 *
 * Usage:
 * <tr ngGridRow cdkGridRowProvider cdk-row *cdkRowDef="let row; columns: columns">
 */
@Directive({
  selector: '[cdkGridRowProvider]',
  providers: [{provide: GRID_ROW, useExisting: forwardRef(() => CdkGridRowProvider)}],
})
export class CdkGridRowProvider {
  private _elementRef = inject(ElementRef);

  constructor() {}
}

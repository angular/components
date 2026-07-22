/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injectable, Provider} from '@angular/core';

import {
  ResizeStrategy,
  CdkFlexTableResizeStrategy,
  TABLE_LAYOUT_FIXED_RESIZE_STRATEGY_PROVIDER,
} from '@angular/cdk-experimental/column-resize';

export {TABLE_LAYOUT_FIXED_RESIZE_STRATEGY_PROVIDER};

/**
 * Overrides CdkFlexTableResizeStrategy to match mat-column elements.
 */
@Injectable()
export class MatFlexTableResizeStrategy extends CdkFlexTableResizeStrategy {
  protected override getColumnCssClass(cssFriendlyColumnName: string): string {
    return `mat-column-${cssFriendlyColumnName}`;
  }
}

export const FLEX_RESIZE_STRATEGY_PROVIDER: Provider = {
  provide: ResizeStrategy,
  useClass: MatFlexTableResizeStrategy,
};

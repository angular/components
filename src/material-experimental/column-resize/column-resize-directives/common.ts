/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Provider} from '@angular/core';

import {
  _COALESCED_STYLE_SCHEDULER,
  _CoalescedStyleScheduler,
  ColumnResize,
  ColumnResizeNotifier,
  ColumnResizeNotifierSource,
  HeaderRowEventDispatcher,
} from '@angular/cdk-experimental/column-resize';

import {
  TABLE_LAYOUT_FIXED_RESIZE_STRATEGY_PROVIDER,
  FLEX_RESIZE_STRATEGY_PROVIDER,
} from '../resize-strategy';

const PROVIDERS: Provider[] = [
  ColumnResizeNotifier,
  HeaderRowEventDispatcher,
  ColumnResizeNotifierSource,
  {provide: _COALESCED_STYLE_SCHEDULER, useClass: _CoalescedStyleScheduler},
];
export const TABLE_PROVIDERS: Provider[] = [
  ...PROVIDERS,
  TABLE_LAYOUT_FIXED_RESIZE_STRATEGY_PROVIDER,
];
export const FLEX_PROVIDERS: Provider[] = [...PROVIDERS, FLEX_RESIZE_STRATEGY_PROVIDER];

export const TABLE_HOST_BINDINGS = {
  'class': 'mat-column-resize-table',
};
export const FLEX_HOST_BINDINGS = {
  'class': 'mat-column-resize-flex',
};

export abstract class AbstractMatColumnResize extends ColumnResize {
  getTableHeight() {
    return this.elementRef.nativeElement!.offsetHeight;
  }
}

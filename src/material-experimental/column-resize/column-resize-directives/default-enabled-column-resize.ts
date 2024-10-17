/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Directive, ElementRef, NgZone, inject} from '@angular/core';
import {
  ColumnResize,
  ColumnResizeNotifier,
  ColumnResizeNotifierSource,
  HeaderRowEventDispatcher,
} from '@angular/cdk-experimental/column-resize';

import {AbstractMatColumnResize, TABLE_HOST_BINDINGS, TABLE_PROVIDERS} from './common';

/**
 * Implicitly enables column resizing for a table-based mat-table.
 * Individual columns will be resizable unless opted out.
 */
@Directive({
  selector: 'table[mat-table]',
  host: TABLE_HOST_BINDINGS,
  providers: [
    ...TABLE_PROVIDERS,
    {provide: ColumnResize, useExisting: MatDefaultEnabledColumnResize},
  ],
})
export class MatDefaultEnabledColumnResize extends AbstractMatColumnResize {
  readonly columnResizeNotifier = inject(ColumnResizeNotifier);
  readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  protected readonly eventDispatcher = inject(HeaderRowEventDispatcher);
  protected readonly ngZone = inject(NgZone);
  protected readonly notifier = inject(ColumnResizeNotifierSource);
}

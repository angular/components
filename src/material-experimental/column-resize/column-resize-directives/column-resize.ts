/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
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
 * Explicitly enables column resizing for a table-based mat-table.
 * Individual columns must be annotated specifically.
 */
@Directive({
  selector: 'table[mat-table][columnResize]',
  host: TABLE_HOST_BINDINGS,
  providers: [...TABLE_PROVIDERS, {provide: ColumnResize, useExisting: MatColumnResize}],
  standalone: true,
})
export class MatColumnResize extends AbstractMatColumnResize {
  readonly columnResizeNotifier = inject(ColumnResizeNotifier);
  readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  protected readonly eventDispatcher = inject(HeaderRowEventDispatcher);
  protected readonly ngZone = inject(NgZone);
  protected readonly notifier = inject(ColumnResizeNotifierSource);
}

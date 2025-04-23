/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  Directive,
  ElementRef,
  Injector,
  NgZone,
  ViewContainerRef,
  ChangeDetectorRef,
  inject,
  DOCUMENT,
} from '@angular/core';

import {Directionality} from '@angular/cdk/bidi';
import {
  CdkColumnDef,
  _CoalescedStyleScheduler,
  _COALESCED_STYLE_SCHEDULER,
} from '@angular/cdk/table';
import {
  ColumnResize,
  ColumnResizeNotifierSource,
  HeaderRowEventDispatcher,
  ResizeStrategy,
} from '@angular/cdk-experimental/column-resize';

import {AbstractMatResizable, RESIZABLE_HOST_BINDINGS, RESIZABLE_INPUTS} from './common';

/**
 * Implicitly enables column resizing for a mat-header-cell unless the disableResize attribute
 * is present.
 */
@Directive({
  selector: 'mat-header-cell:not([disableResize]), th[mat-header-cell]:not([disableResize])',
  host: RESIZABLE_HOST_BINDINGS,
  inputs: RESIZABLE_INPUTS,
})
export class MatDefaultResizable extends AbstractMatResizable {
  protected readonly columnDef = inject(CdkColumnDef);
  protected readonly columnResize = inject(ColumnResize);
  protected readonly directionality = inject(Directionality);
  protected readonly elementRef = inject(ElementRef);
  protected readonly eventDispatcher = inject(HeaderRowEventDispatcher);
  protected readonly injector = inject(Injector);
  protected readonly ngZone = inject(NgZone);
  protected readonly resizeNotifier = inject(ColumnResizeNotifierSource);
  protected readonly resizeStrategy = inject(ResizeStrategy);
  protected readonly styleScheduler = inject<_CoalescedStyleScheduler>(_COALESCED_STYLE_SCHEDULER);
  protected readonly viewContainerRef = inject(ViewContainerRef);
  protected readonly changeDetectorRef = inject(ChangeDetectorRef);
  protected readonly document = inject(DOCUMENT);
}

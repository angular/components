/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  NgZone,
  ViewChild,
  ViewEncapsulation,
  inject,
} from '@angular/core';
import {DOCUMENT} from '@angular/common';
import {
  CdkColumnDef,
  _CoalescedStyleScheduler,
  _COALESCED_STYLE_SCHEDULER,
} from '@angular/cdk/table';
import {Directionality} from '@angular/cdk/bidi';
import {
  ColumnResize,
  ColumnResizeNotifierSource,
  HeaderRowEventDispatcher,
  ResizeOverlayHandle,
  ResizeRef,
} from '@angular/cdk-experimental/column-resize';

import {AbstractMatColumnResize} from './column-resize-directives/common';

/**
 * Component shown over the edge of a resizable column that is responsible
 * for handling column resize mouse events and displaying a vertical line along the column edge.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {'class': 'mat-column-resize-overlay-thumb'},
  template: '<div #top class="mat-column-resize-overlay-thumb-top"></div>',
})
export class MatColumnResizeOverlayHandle extends ResizeOverlayHandle {
  protected readonly columnDef = inject(CdkColumnDef);
  protected readonly columnResize = inject(ColumnResize);
  protected readonly directionality = inject(Directionality);
  protected readonly elementRef = inject(ElementRef);
  protected readonly eventDispatcher = inject(HeaderRowEventDispatcher);
  protected readonly ngZone = inject(NgZone);
  protected readonly resizeNotifier = inject(ColumnResizeNotifierSource);
  protected readonly resizeRef = inject(ResizeRef);
  protected readonly styleScheduler = inject<_CoalescedStyleScheduler>(_COALESCED_STYLE_SCHEDULER);
  protected readonly document = inject(DOCUMENT);

  @ViewChild('top', {static: true}) topElement: ElementRef<HTMLElement>;

  protected override updateResizeActive(active: boolean): void {
    super.updateResizeActive(active);

    const originHeight = this.resizeRef.origin.nativeElement.offsetHeight;
    this.topElement.nativeElement.style.height = `${originHeight}px`;
    this.resizeRef.overlayRef.updateSize({
      height: active
        ? (this.columnResize as AbstractMatColumnResize).getTableHeight()
        : originHeight,
    });
  }
}

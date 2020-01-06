/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AfterViewInit, ElementRef, NgZone, OnDestroy} from '@angular/core';
import {Directionality} from '@angular/cdk/bidi';
import {fromEvent, merge, ReplaySubject} from 'rxjs';
import {filter, map, mapTo, pairwise, startWith, take, takeUntil} from 'rxjs/operators';

import {_closest, _matches} from '@angular/cdk-experimental/popover-edit';

import {ColumnResizeNotifier, ColumnResizeNotifierSource} from './column-resize-notifier';
import {HEADER_CELL_SELECTOR, RESIZE_OVERLAY_SELECTOR} from './constants';
import {HeaderRowEventDispatcher} from './event-dispatcher';

const HOVER_OR_ACTIVE_CLASS = 'cdk-column-resize-hover-or-active';
const WITH_RESIZED_COLUMN_CLASS = 'cdk-column-resize-with-resized-column';

let nextId = 0;

/**
 * Base class for ColumnResize directives which attach to mat-table elements to
 * provide common events and services for column resizing.
 */
export abstract class ColumnResize implements AfterViewInit, OnDestroy {
  protected readonly destroyed = new ReplaySubject<void>();

  /* Publicly accessible interface for triggering and being notified of resizes. */
  abstract readonly columnResizeNotifier: ColumnResizeNotifier;

  abstract readonly directionality: Directionality;
  protected abstract readonly elementRef: ElementRef;
  protected abstract readonly eventDispatcher: HeaderRowEventDispatcher;
  protected abstract readonly ngZone: NgZone;
  protected abstract readonly notifier: ColumnResizeNotifierSource;

  protected readonly selectorId = `${++nextId}`;

  id?: string;

  ngAfterViewInit() {
    this.elementRef.nativeElement!.classList.add(this.getUniqueCssClass());

    this._listenForRowHoverEvents();
    this._listenForResizeActivity();
    this._listenForHoverActivity();
  }

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

  getUniqueCssClass() {
    return `cdk-column-resize-${this.selectorId}`;
  }

  private _listenForRowHoverEvents() {
    this.ngZone.runOutsideAngular(() => {
      const element = this.elementRef.nativeElement!;

      fromEvent<MouseEvent>(element, 'mouseover').pipe(
          takeUntil(this.destroyed),
          map(event => _closest(event.target, HEADER_CELL_SELECTOR)),
          ).subscribe(this.eventDispatcher.headerCellHovered);
      fromEvent<MouseEvent>(element, 'mouseleave').pipe(
          takeUntil(this.destroyed),
          filter(event => !!event.relatedTarget &&
              !_matches(event.relatedTarget as Element, RESIZE_OVERLAY_SELECTOR)),
          mapTo(null),
          ).subscribe(this.eventDispatcher.headerCellHovered);
    });
  }

  private _listenForResizeActivity() {
    merge(
        this.eventDispatcher.overlayHandleActiveForCell.pipe(mapTo(undefined)),
        this.notifier.triggerResize.pipe(mapTo(undefined)),
        this.notifier.resizeCompleted.pipe(mapTo(undefined))
    ).pipe(
        takeUntil(this.destroyed),
        take(1),
    ).subscribe(() => {
      this.elementRef.nativeElement!.classList.add(WITH_RESIZED_COLUMN_CLASS);
    });
  }

  private _listenForHoverActivity() {
    this.eventDispatcher.headerRowHoveredOrActiveDistinct.pipe(
        takeUntil(this.destroyed),
        startWith(null),
        pairwise(),
    ).subscribe(([previousRow, hoveredRow]) => {
      if (hoveredRow) {
        hoveredRow.classList.add(HOVER_OR_ACTIVE_CLASS);
      }
      if (previousRow) {
        previousRow.classList.remove(HOVER_OR_ACTIVE_CLASS);
      }
    });
  }
}

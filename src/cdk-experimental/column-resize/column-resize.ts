/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  AfterViewInit,
  Directive,
  ElementRef,
  inject,
  InjectionToken,
  Input,
  NgZone,
  OnDestroy,
  Renderer2,
} from '@angular/core';
import {_IdGenerator} from '@angular/cdk/a11y';
import {merge, Subject} from 'rxjs';
import {mapTo, pairwise, startWith, take, takeUntil} from 'rxjs/operators';

import {_closest} from '@angular/cdk-experimental/popover-edit';

import {ColumnResizeNotifier, ColumnResizeNotifierSource} from './column-resize-notifier';
import {HEADER_CELL_SELECTOR, RESIZE_OVERLAY_SELECTOR} from './selectors';
import {HeaderRowEventDispatcher} from './event-dispatcher';

const HOVER_OR_ACTIVE_CLASS = 'cdk-column-resize-hover-or-active';
const WITH_RESIZED_COLUMN_CLASS = 'cdk-column-resize-with-resized-column';

/** Configurable options for column resize. */
export interface ColumnResizeOptions {
  liveResizeUpdates?: boolean; // Defaults to true.
}

export const COLUMN_RESIZE_OPTIONS = new InjectionToken<ColumnResizeOptions>(
  'CdkColumnResizeOptions',
);

/**
 * Base class for ColumnResize directives which attach to mat-table elements to
 * provide common events and services for column resizing.
 */
@Directive()
export abstract class ColumnResize implements AfterViewInit, OnDestroy {
  private _renderer = inject(Renderer2);
  private _eventCleanups: (() => void)[] | undefined;
  protected readonly destroyed = new Subject<void>();

  /* Publicly accessible interface for triggering and being notified of resizes. */
  abstract readonly columnResizeNotifier: ColumnResizeNotifier;

  /* ElementRef that this directive is attached to. Exposed For use by column-level directives */
  abstract readonly elementRef: ElementRef<HTMLElement>;

  protected abstract readonly eventDispatcher: HeaderRowEventDispatcher;
  protected abstract readonly ngZone: NgZone;
  protected abstract readonly notifier: ColumnResizeNotifierSource;

  /** Unique ID for this table instance. */
  protected readonly selectorId = inject(_IdGenerator).getId('cdk-column-resize-');

  /** The id attribute of the table, if specified. */
  id?: string;

  /** @docs-private Whether a call to updateStickyColumnStyles is pending after a resize. */
  _flushPending = false;

  /**
   * Whether to update the column's width continuously as the mouse position
   * changes, or to wait until mouseup to apply the new size.
   */
  @Input() liveResizeUpdates =
    inject(COLUMN_RESIZE_OPTIONS, {optional: true})?.liveResizeUpdates ?? true;

  ngAfterViewInit() {
    this.elementRef.nativeElement!.classList.add(this.getUniqueCssClass());

    this._listenForRowHoverEvents();
    this._listenForResizeActivity();
    this._listenForHoverActivity();
  }

  ngOnDestroy() {
    this._eventCleanups?.forEach(cleanup => cleanup());
    this.destroyed.next();
    this.destroyed.complete();
  }

  /** Gets the unique CSS class name for this table instance. */
  getUniqueCssClass() {
    return this.selectorId;
  }

  /** Gets the ID for this table used for column size persistance. */
  getTableId(): string {
    return String(this.elementRef.nativeElement.id);
  }

  /** Called when a column in the table is resized. Applies a css class to the table element. */
  setResized() {
    this.elementRef.nativeElement!.classList.add(WITH_RESIZED_COLUMN_CLASS);
  }

  private _listenForRowHoverEvents() {
    this.ngZone.runOutsideAngular(() => {
      const element = this.elementRef.nativeElement;

      this._eventCleanups = [
        this._renderer.listen(element, 'mouseover', (event: MouseEvent) => {
          this.eventDispatcher.headerCellHovered.next(_closest(event.target, HEADER_CELL_SELECTOR));
        }),
        this._renderer.listen(element, 'mouseleave', (event: MouseEvent) => {
          if (
            event.relatedTarget &&
            !(event.relatedTarget as Element).matches(RESIZE_OVERLAY_SELECTOR)
          ) {
            this.eventDispatcher.headerCellHovered.next(null);
          }
        }),
      ];
    });
  }

  private _listenForResizeActivity() {
    merge(
      this.eventDispatcher.overlayHandleActiveForCell.pipe(mapTo(undefined)),
      this.notifier.triggerResize.pipe(mapTo(undefined)),
      this.notifier.resizeCompleted.pipe(mapTo(undefined)),
    )
      .pipe(take(1), takeUntil(this.destroyed))
      .subscribe(() => {
        this.setResized();
      });
  }

  private _listenForHoverActivity() {
    this.eventDispatcher.headerRowHoveredOrActiveDistinct
      .pipe(startWith(null), pairwise(), takeUntil(this.destroyed))
      .subscribe(([previousRow, hoveredRow]) => {
        if (hoveredRow) {
          hoveredRow.classList.add(HOVER_OR_ACTIVE_CLASS);
        }
        if (previousRow) {
          previousRow.classList.remove(HOVER_OR_ACTIVE_CLASS);
        }
      });
  }
}

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
  OnDestroy,
  NgZone,
  Renderer2,
  inject,
} from '@angular/core';
import {coerceCssPixelValue} from '@angular/cdk/coercion';
import {Directionality} from '@angular/cdk/bidi';
import {ESCAPE} from '@angular/cdk/keycodes';
import {CdkColumnDef, _CoalescedStyleScheduler} from '@angular/cdk/table';
import {Subject, merge, Observable} from 'rxjs';
import {
  distinctUntilChanged,
  filter,
  map,
  mapTo,
  pairwise,
  startWith,
  takeUntil,
} from 'rxjs/operators';

import {_closest} from '@angular/cdk-experimental/popover-edit';

import {HEADER_CELL_SELECTOR} from './selectors';
import {ColumnResizeNotifierSource} from './column-resize-notifier';
import {HeaderRowEventDispatcher} from './event-dispatcher';
import {ResizeRef} from './resize-ref';

// TODO: Take another look at using cdk drag drop. IIRC I ran into a couple
// good reasons for not using it but I don't remember what they were at this point.
/**
 * Base class for a component shown over the edge of a resizable column that is responsible
 * for handling column resize mouse events and displaying any visible UI on the column edge.
 */
@Directive()
export abstract class ResizeOverlayHandle implements AfterViewInit, OnDestroy {
  private _renderer = inject(Renderer2);
  protected readonly destroyed = new Subject<void>();

  protected abstract readonly columnDef: CdkColumnDef;
  protected abstract readonly document: Document;
  protected abstract readonly directionality: Directionality;
  protected abstract readonly elementRef: ElementRef;
  protected abstract readonly eventDispatcher: HeaderRowEventDispatcher;
  protected abstract readonly ngZone: NgZone;
  protected abstract readonly resizeNotifier: ColumnResizeNotifierSource;
  protected abstract readonly resizeRef: ResizeRef;
  protected abstract readonly styleScheduler: _CoalescedStyleScheduler;

  private _cumulativeDeltaX = 0;

  ngAfterViewInit() {
    this._listenForMouseEvents();
  }

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

  private _listenForMouseEvents() {
    this.ngZone.runOutsideAngular(() => {
      this._observableFromEvent<MouseEvent>(this.elementRef.nativeElement!, 'mouseenter')
        .pipe(mapTo(this.resizeRef.origin.nativeElement!), takeUntil(this.destroyed))
        .subscribe(cell => this.eventDispatcher.headerCellHovered.next(cell));

      this._observableFromEvent<MouseEvent>(this.elementRef.nativeElement!, 'mouseleave')
        .pipe(
          map(
            event =>
              event.relatedTarget && _closest(event.relatedTarget as Element, HEADER_CELL_SELECTOR),
          ),
          takeUntil(this.destroyed),
        )
        .subscribe(cell => this.eventDispatcher.headerCellHovered.next(cell));

      this._observableFromEvent<MouseEvent>(this.elementRef.nativeElement!, 'mousedown')
        .pipe(takeUntil(this.destroyed))
        .subscribe(mousedownEvent => {
          this._dragStarted(mousedownEvent);
        });
    });
  }

  private _dragStarted(mousedownEvent: MouseEvent) {
    // Only allow dragging using the left mouse button.
    if (mousedownEvent.button !== 0) {
      return;
    }

    const mouseup = this._observableFromEvent<MouseEvent>(this.document, 'mouseup');
    const mousemove = this._observableFromEvent<MouseEvent>(this.document, 'mousemove');
    const escape = this._observableFromEvent<KeyboardEvent>(this.document, 'keyup').pipe(
      filter(event => event.keyCode === ESCAPE),
    );

    const startX = mousedownEvent.screenX;

    const initialSize = this._getOriginWidth();
    let overlayOffset = 0;
    let originOffset = this._getOriginOffset();
    let size = initialSize;
    let overshot = 0;
    this._cumulativeDeltaX = 0;

    this.updateResizeActive(true);

    mouseup.pipe(takeUntil(merge(escape, this.destroyed))).subscribe(({screenX}) => {
      this.styleScheduler.scheduleEnd(() => {
        this._notifyResizeEnded(size, screenX !== startX);
      });
    });

    escape.pipe(takeUntil(merge(mouseup, this.destroyed))).subscribe(() => {
      this._notifyResizeEnded(initialSize);
    });

    mousemove
      .pipe(
        map(({screenX}) => screenX),
        startWith(startX),
        distinctUntilChanged(),
        pairwise(),
        takeUntil(merge(mouseup, escape, this.destroyed)),
      )
      .subscribe(([prevX, currX]) => {
        let deltaX = currX - prevX;

        if (!this.resizeRef.liveUpdates) {
          this._cumulativeDeltaX += deltaX;
          const sizeDelta = this._computeNewSize(size, this._cumulativeDeltaX) - size;
          this._updateOverlayOffset(sizeDelta);

          return;
        }

        // If the mouse moved further than the resize was able to match, limit the
        // movement of the overlay to match the actual size and position of the origin.
        if (overshot !== 0) {
          if ((overshot < 0 && deltaX < 0) || (overshot > 0 && deltaX > 0)) {
            overshot += deltaX;
            return;
          } else {
            const remainingOvershot = overshot + deltaX;
            overshot =
              overshot > 0 ? Math.max(remainingOvershot, 0) : Math.min(remainingOvershot, 0);
            deltaX = remainingOvershot - overshot;

            if (deltaX === 0) {
              return;
            }
          }
        }

        this._triggerResize(size, deltaX);

        this.styleScheduler.scheduleEnd(() => {
          const originNewSize = this._getOriginWidth();
          const originNewOffset = this._getOriginOffset();
          const originOffsetDeltaX = originNewOffset - originOffset;
          const originSizeDeltaX = originNewSize - size;
          size = originNewSize;
          originOffset = originNewOffset;

          overshot += deltaX + (this._isLtr() ? -originSizeDeltaX : originSizeDeltaX);
          overlayOffset += originOffsetDeltaX + (this._isLtr() ? originSizeDeltaX : 0);

          this._updateOverlayOffset(overlayOffset);
        });
      });
  }

  protected updateResizeActive(active: boolean): void {
    this.eventDispatcher.overlayHandleActiveForCell.next(
      active ? this.resizeRef.origin.nativeElement! : null,
    );
  }

  private _triggerResize(startSize: number, deltaX: number): void {
    this.resizeNotifier.triggerResize.next({
      columnId: this.columnDef.name,
      size: this._computeNewSize(startSize, deltaX),
      previousSize: startSize,
      isStickyColumn: this.columnDef.sticky || this.columnDef.stickyEnd,
    });
  }

  private _computeNewSize(startSize: number, deltaX: number): number {
    let computedNewSize: number = startSize + (this._isLtr() ? deltaX : -deltaX);
    computedNewSize = Math.min(
      Math.max(computedNewSize, this.resizeRef.minWidthPx, 0),
      this.resizeRef.maxWidthPx,
    );
    return computedNewSize;
  }

  private _getOriginWidth(): number {
    return this.resizeRef.origin.nativeElement!.offsetWidth;
  }

  private _getOriginOffset(): number {
    return this.resizeRef.origin.nativeElement!.offsetLeft;
  }

  private _updateOverlayOffset(offset: number): void {
    this.resizeRef.overlayRef.overlayElement.style.transform = `translateX(${coerceCssPixelValue(
      offset,
    )})`;
  }

  private _isLtr(): boolean {
    return this.directionality.value === 'ltr';
  }

  private _notifyResizeEnded(size: number, completedSuccessfully = false): void {
    this.updateResizeActive(false);

    this.ngZone.run(() => {
      const sizeMessage = {
        columnId: this.columnDef.name,
        size: this._computeNewSize(size, this._cumulativeDeltaX),
      };
      if (completedSuccessfully) {
        if (!this.resizeRef.liveUpdates) {
          this._triggerResize(size, this._cumulativeDeltaX);
        }

        this.resizeNotifier.resizeCompleted.next(sizeMessage);
      } else {
        this.resizeNotifier.resizeCanceled.next(sizeMessage);
      }
    });
  }

  private _observableFromEvent<T extends Event>(element: Element | Document, name: string) {
    return new Observable<T>(subscriber => {
      const handler = (event: T) => subscriber.next(event);
      const cleanup = this._renderer.listen(element, name, handler);
      return () => {
        cleanup();
        subscriber.complete();
      };
    });
  }
}

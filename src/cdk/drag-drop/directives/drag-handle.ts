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
  InjectionToken,
  Input,
  OnDestroy,
  booleanAttribute,
  inject,
} from '@angular/core';
import {Subject} from 'rxjs';
import type {CdkDrag} from './drag';
import {CDK_DRAG_PARENT} from '../drag-parent';
import {assertElementNode} from './assertions';
import {DragDropRegistry} from '../drag-drop-registry';

/**
 * Injection token that can be used to reference instances of `CdkDragHandle`. It serves as
 * alternative token to the actual `CdkDragHandle` class which could cause unnecessary
 * retention of the class and its directive metadata.
 */
export const CDK_DRAG_HANDLE = new InjectionToken<CdkDragHandle>('CdkDragHandle');

/** Handle that can be used to drag a CdkDrag instance. */
@Directive({
  selector: '[cdkDragHandle]',
  host: {
    'class': 'cdk-drag-handle',
  },
  providers: [{provide: CDK_DRAG_HANDLE, useExisting: CdkDragHandle}],
})
export class CdkDragHandle implements AfterViewInit, OnDestroy {
  element = inject<ElementRef<HTMLElement>>(ElementRef);

  private _parentDrag = inject<CdkDrag>(CDK_DRAG_PARENT, {optional: true, skipSelf: true});
  private _dragDropRegistry = inject(DragDropRegistry);

  /** Emits when the state of the handle has changed. */
  readonly _stateChanges = new Subject<CdkDragHandle>();

  /** Whether starting to drag through this handle is disabled. */
  @Input({alias: 'cdkDragHandleDisabled', transform: booleanAttribute})
  get disabled(): boolean {
    return this._disabled;
  }
  set disabled(value: boolean) {
    this._disabled = value;
    this._stateChanges.next(this);
  }
  private _disabled = false;

  constructor(...args: unknown[]);

  constructor() {
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      assertElementNode(this.element.nativeElement, 'cdkDragHandle');
    }

    this._parentDrag?._addHandle(this);
  }

  ngAfterViewInit() {
    if (!this._parentDrag) {
      let parent = this.element.nativeElement.parentElement;
      while (parent) {
        const ref = this._dragDropRegistry.getDragDirectiveForNode(parent);
        if (ref) {
          this._parentDrag = ref;
          ref._addHandle(this);
          break;
        }
        parent = parent.parentElement;
      }
    }
  }

  ngOnDestroy() {
    this._parentDrag?._removeHandle(this);
    this._stateChanges.complete();
  }
}

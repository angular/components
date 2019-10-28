/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, ElementRef, Inject, Input, OnDestroy, OnInit} from '@angular/core';
import {DOCUMENT} from '@angular/common';
import {MatTabLabelWrapper as BaseMatTabLabelWrapper} from '@angular/material/tabs';
import {MatInkBarFoundation, MatInkBarItem} from './ink-bar';
import {coerceBooleanProperty} from '@angular/cdk/coercion';

/**
 * Used in the `mat-tab-group` view to display tab labels.
 * @docs-private
 */
@Directive({
  selector: '[matTabLabelWrapper]',
  inputs: ['disabled'],
  host: {
    '[class.mat-mdc-tab-disabled]': 'disabled',
    '[attr.aria-disabled]': '!!disabled',
  }
})
export class MatTabLabelWrapper extends BaseMatTabLabelWrapper
    implements MatInkBarItem, OnInit, OnDestroy {
  private _document: Document;

  _foundation = new MatInkBarFoundation(this.elementRef.nativeElement, this._document);

  /** Whether the ink bar should fit its width to the size of the tab label content. */
  @Input()
  get fitInkBarToContent(): boolean { return this._foundation.fitToContent; }
  set fitInkBarToContent(v: boolean) { this._foundation.fitToContent = coerceBooleanProperty(v); }

  constructor(public elementRef: ElementRef, @Inject(DOCUMENT) _document: any) {
    super(elementRef);
  }

  ngOnInit() {
    this._foundation.init();
  }

  ngOnDestroy() {
    this._foundation.destroy();
  }

  /** Sets focus on the wrapper element */
  focus(): void {
    this.elementRef.nativeElement.focus();
  }
}

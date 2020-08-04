/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  Component,
  Directive,
  AfterViewInit,
  Input,
  Output,
  ElementRef,
  ChangeDetectorRef,
  EventEmitter,
  OnDestroy
} from '@angular/core';
import {
  MDCSegmentedButtonSegmentAdapter,
  MDCSegmentedButtonSegmentFoundation
} from '@material/segmented-button';
import {SegmentDetail} from '@material/segmented-button/types';
import {BooleanInput, coerceBooleanProperty} from '@angular/cdk/coercion';


@Directive({
  selector: 'mat-toggle-button-segment',
  host: {'class': 'mdc-segmented-button__segment'}
})
export class MatToggleButtonSegmentCssInternalOnly { }

@Component({
  selector: 'mat-toggle-button-segment',
  templateUrl: `
    <button class="mdc-segmented-button__segment">
      <div class="mdc-segmented-button__ripple></div>
      <ng-content select="[matToggleButtonSegmentIcon]"></ng-content>
      <ng-content select="[matToggleButtonSegmentLabel]"></ng-content>
    </button>
  `,
  exportAs: 'matToggleButtonSegment'
})
export class MatToggleButtonSegment implements AfterViewInit, OnDestroy {
  @Input()
  get isSelected(): boolean {
    return this._selected;
  }
  set isSelected(value: boolean) {
    this._selected = coerceBooleanProperty(value);
  }

  @Input() segmentId: string;

  @Output() readonly selected: EventEmitter<SegmentDetail> = new EventEmitter<SegmentDetail>();

  private _index: number;
  private _selected: boolean = false;
  private _foundation: MDCSegmentedButtonSegmentFoundation;
  private _adapter: MDCSegmentedButtonSegmentAdapter = {
    isSingleSelect: () => false,
    getAttr: (_attrName) => null,
    setAttr: (_attrName, _value) => undefined,
    addClass: (_className) => undefined,
    removeClass: (_className) => undefined,
    hasClass: (_className) => false,
    notifySelectedChange: (_selected) => undefined
  };

  constructor(
    public _changeDetectorRef: ChangeDetectorRef,
    readonly _elementRef: ElementRef
  ) { }

  ngAfterViewInit() {
    this._foundation = new MDCSegmentedButtonSegmentFoundation(this._adapter);
  }

  ngOnDestroy() {
    if (this._foundation) {
      this._foundation.destroy();
    }
  }

  handleClick() {
    this._foundation.handleClick();
  }

  setIndex(index: number) {
    this._index = index;
  }

  setSelected() {
    this._foundation.setSelected();
  }

  setUnselected() {
    this._foundation.setUnselected();
  }

  static ngAcceptInputType_isSelected: BooleanInput;
}

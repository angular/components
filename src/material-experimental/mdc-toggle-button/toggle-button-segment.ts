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
  OnDestroy,
  ViewEncapsulation,
  ChangeDetectionStrategy
} from '@angular/core';
import {BooleanInput, coerceBooleanProperty} from '@angular/cdk/coercion';


@Directive({
  selector: 'mat-toggle-button-segment',
  host: {'class': 'mdc-segmented-button__segment'}
})
export class MatToggleButtonSegmentCssInternalOnly { }

@Component({
  selector: 'mat-toggle-button-segment',
  templateUrl: 'toggle-button-segment.html',
  exportAs: 'matToggleButtonSegment',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
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

  @Output() readonly selected: EventEmitter<any> = new EventEmitter<any>();

  // tslint:disable:no-unused-variable
  private _index: number;
  private _selected: boolean = false;
  // tslint:disable:no-unused-variable
  private _foundation: any;
  // tslint:disable:no-unused-variable
  private _adapter = {
    isSingleSelect: () => false,
    getAttr: (_attrName: string) => null,
    setAttr: (_attrName: string, _value: string) => undefined,
    addClass: (_className: string) => undefined,
    removeClass: (_className: string) => undefined,
    hasClass: (_className: string) => false,
    notifySelectedChange: (_selected: boolean) => undefined
  };

  constructor(
    private readonly _changeDetectorRef: ChangeDetectorRef,
    private readonly _elementRef: ElementRef
  ) { }

  ngAfterViewInit() {
    // this._foundation = new MDCSegmentedButtonSegmentFoundation(this._adapter);
  }

  ngOnDestroy() {
    // if (this._foundation) {
    //   this._foundation.destroy();
    // }
  }

  handleClick() {
    // this._foundation.handleClick();
  }

  setIndex(index: number) {
    this._index = index;
  }

  setSelected() {
    // this._foundation.setSelected();
  }

  setUnselected() {
    // this._foundation.setUnselected();
  }

  static ngAcceptInputType_isSelected: BooleanInput;
}

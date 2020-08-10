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
// import {
//   MDCSegmentedButtonSegmentAdapter,
//   MDCSegmentedButtonSegmentFoundation
// } from '@material/segmented-button';
// import {SegmentDetail} from '@material/segmented-button/types';
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
  // private _foundation: MDCSegmentedButtonSegmentFoundation;
  private _foundation: any;
  // tslint:disable:no-unused-variable
  // private _adapter: MDCSegmentedButtonSegmentAdapter = {
  private _adapter: any = {
    isSingleSelect: () => false,
    getAttr: (attrName: string) => this._elementRef.nativeElement.getAttr(attrName),
    setAttr: (attrName: string, value: string) =>
      this._elementRef.nativeElement.setAttr(attrName, value),
    addClass: (className: string) => this._elementRef.nativeElement.addClass(className),
    removeClass: (className: string) => this._elementRef.nativeElement.removeClass(className),
    hasClass: (className: string) => this._elementRef.nativeElement.classList.contains(className),
    notifySelectedChange: (selected: boolean) => {
      this.selected.emit({
        index: this._index,
        selected,
        segmentId: this.segmentId
      });
    },
    getRootBoundingClientRect: () => this._elementRef.nativeElement.getBoundingCientRect()
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

  handleClick(event: any) {
    // this._foundation.handleClick();
    console.log(event);
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

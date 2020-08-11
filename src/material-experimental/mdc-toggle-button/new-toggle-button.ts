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
  ChangeDetectionStrategy,
  ContentChildren,
  QueryList
} from '@angular/core';
// import {
//   MDCSegmentedButtonSegmentAdapter,
//   MDCSegmentedButtonSegmentFoundation
// } from '@material/segmented-button';
// import {SegmentDetail} from '@material/segmented-button/types';
import {BooleanInput, coerceBooleanProperty} from '@angular/cdk/coercion';


@Component({
  selector: 'mat-new-toggle-button-segment',
  templateUrl: 'toggle-button-segment.html',
  exportAs: 'matNewToggleButtonSegment',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MatNewToggleButtonSegment implements AfterViewInit, OnDestroy {
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
    console.log(this._index);
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


@Directive({
  selector: 'mat-new-toggle-button',
  exportAs: 'matNewToggleButton',
  host: {
    'class': 'mdc-segmented-button'
  }
})
export class MatNewToggleButton implements AfterViewInit, OnDestroy {
  @Input()
  get singleSelect(): boolean {
    return this._singleSelect;
  }
  set singleSelect(value: boolean) {
    this._singleSelect = coerceBooleanProperty(value);
  }

  @Output() readonly change: EventEmitter<any> = new EventEmitter<any>();

  @ContentChildren(MatNewToggleButtonSegment, {
    descendants: true
  }) _segments: QueryList<MatNewToggleButtonSegment>;

  private _singleSelect: boolean = false;
  private _foundation: any;
  private _adapter: any = {
    hasClass: (className: string) => this._elementRef.nativeElement.classList.contains(className),
    getSegments: () => this._segments.map((segment: any) => {
      return {
        index: segment.setIndex,
        selected: segment.idSelected,
        segmentId: segment.segmentId
      };
    }),
    selectSegment: (indexOrSegmentId: string | number) => {
      const foundSegment = this._segments.find((segment: any) => {
        return segment.index === indexOrSegmentId || segment.segmentId === indexOrSegmentId;
      });
      if (foundSegment) {
        foundSegment.setSelected();
      }
    },
    unselectSegment: (indexOrSegmentId: string | number) => {
      const foundSegment = this._segments.find((segment: any) => {
        return segment.index === indexOrSegmentId || segment.segmentId === indexOrSegmentId;
      });
      if (foundSegment) {
        foundSegment.setUnselected();
      }
    },
    notifySelectedChange: (detail: any) => this.change.emit(detail)
  };

  constructor(
    private readonly _elementRef: ElementRef
  ) { }

  ngAfterViewInit() {
    // this._foundation = new MDCSegmentedButtonFoundation(this._adapter);
    this._segments.forEach((segment, index) => segment.setIndex(index));
  }

  ngOnDestroy() {
    // if (this._foundation) {
    //   this._foundation.destroy();
    // }
  }

  static ngAcceptInputType_singleSelect: BooleanInput;
}

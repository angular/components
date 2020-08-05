/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  ViewEncapsulation,
  Component,
  Directive,
  ChangeDetectionStrategy,
  AfterViewInit,
  OnDestroy,
  Input,
  Output,
  ElementRef,
  ChangeDetectorRef,
  EventEmitter,
  ContentChildren,
  QueryList
} from '@angular/core';
// import {
//   MDCSegmentedButtonAdapter,
//   MDCSegmentedButtonFoundation
// } from '@material/segmented-button';
// import {SegmentDetail} from '@material/segmented-button/types';
import {MatToggleButtonSegment} from './toggle-button-segment';
import {BooleanInput, coerceBooleanProperty} from '@angular/cdk/coercion';


@Directive({
  selector: 'mat-toggle-button',
  host: {'class': 'mdc-segmented-button'}
})
export class MatToggleButtonCssInternalOnly { }

@Component({
  selector: 'mat-toggle-button',
  templateUrl: 'toggle-button.html',
  styleUrls: ['toggle-button.css'],
  host: { },
  exportAs: 'matToggleButton',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: []
})
export class MatToggleButton implements AfterViewInit, OnDestroy {
  private _singleSelect: boolean = false;
  // tslint:disable:no-unused-variable
  private _foundation: any;
  // tslint:disable:no-unused-variable
  private _adapter = {
    hasClass: (_className: string) => false,
    getSegments: () => [],
    selectSegment: (_indexOrSegmentId: string | number) => undefined,
    unselectSegment: (_indexOrSegmentId: string | number) => undefined,
    notifySelectedChange: (_detail: any) => undefined
  };

  @Input()
  get singleSelect(): boolean {
    return this._singleSelect;
  }
  set singleSelect(value: boolean) {
    this._singleSelect = coerceBooleanProperty(value);
  }

  @Output() readonly change: EventEmitter<any> = new EventEmitter<any>();

  @ContentChildren(MatToggleButtonSegment, {
    descendants: true
  }) _segments: QueryList<MatToggleButtonSegment>;

  constructor(
    readonly _elementRef: ElementRef,
    public _changeDetectorRef: ChangeDetectorRef
  ) { }

  ngAfterViewInit() {
    // this._foundation = new MDCSegmentedButtonFoundation(this._adapter);
  }

  ngOnDestroy() {
    // if (this._foundation) {
      // this._foundation.destroy();
    // }
  }

  static ngAcceptInputType_singleSelect: BooleanInput;
}

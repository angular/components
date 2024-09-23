/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  Directive,
  OnDestroy,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
  ViewEncapsulation,
  inject,
} from '@angular/core';
import {TemplatePortal} from '@angular/cdk/portal';
import {MatDatepickerBase, MatDatepickerControl} from './datepicker-base';

/** Button that will close the datepicker and assign the current selection to the data model. */
@Directive({
  selector: '[matDatepickerApply], [matDateRangePickerApply]',
  host: {'(click)': '_applySelection()'},
  standalone: true,
})
export class MatDatepickerApply {
  private _datepicker =
    inject<MatDatepickerBase<MatDatepickerControl<any>, unknown>>(MatDatepickerBase);

  constructor(...args: unknown[]);

  constructor() {}

  _applySelection() {
    this._datepicker._applyPendingSelection();
    this._datepicker.close();
  }
}

/** Button that will close the datepicker and discard the current selection. */
@Directive({
  selector: '[matDatepickerCancel], [matDateRangePickerCancel]',
  host: {'(click)': '_datepicker.close()'},
  standalone: true,
})
export class MatDatepickerCancel {
  _datepicker = inject<MatDatepickerBase<MatDatepickerControl<any>, unknown>>(MatDatepickerBase);

  constructor(...args: unknown[]);
  constructor() {}
}

/**
 * Container that can be used to project a row of action buttons
 * to the bottom of a datepicker or date range picker.
 */
@Component({
  selector: 'mat-datepicker-actions, mat-date-range-picker-actions',
  styleUrl: 'datepicker-actions.css',
  template: `
    <ng-template>
      <div class="mat-datepicker-actions">
        <ng-content></ng-content>
      </div>
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  standalone: true,
})
export class MatDatepickerActions implements AfterViewInit, OnDestroy {
  private _datepicker =
    inject<MatDatepickerBase<MatDatepickerControl<any>, unknown>>(MatDatepickerBase);
  private _viewContainerRef = inject(ViewContainerRef);

  @ViewChild(TemplateRef) _template: TemplateRef<unknown>;
  private _portal: TemplatePortal;

  constructor(...args: unknown[]);
  constructor() {}

  ngAfterViewInit() {
    this._portal = new TemplatePortal(this._template, this._viewContainerRef);
    this._datepicker.registerActions(this._portal);
  }

  ngOnDestroy() {
    this._datepicker.removeActions(this._portal);

    // Needs to be null checked since we initialize it in `ngAfterViewInit`.
    if (this._portal && this._portal.isAttached) {
      this._portal?.detach();
    }
  }
}

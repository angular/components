/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  Directive,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ElementRef,
  Inject,
} from '@angular/core';
import {MatDialog} from './dialog';
import {_closeDialogVia, MatDialogRef} from './dialog-ref';

/** Counter used to generate unique IDs for dialog elements. */
let dialogElementUid = 0;

/**
 * Button that will close the current dialog.
 */
@Directive({
  selector: '[mat-dialog-close], [matDialogClose]',
  exportAs: 'matDialogClose',
  host: {
    '(click)': '_onButtonClick($event)',
    '[attr.aria-label]': 'ariaLabel || null',
    '[attr.type]': 'type',
  }
})
export class MatDialogClose implements OnInit, OnChanges {
  /** Screenreader label for the button. */
  @Input('aria-label') ariaLabel: string;

  /** Default to "button" to prevents accidental form submits. */
  @Input() type: 'submit' | 'button' | 'reset' = 'button';

  /** Dialog close input. */
  @Input('mat-dialog-close') dialogResult: any;

  @Input('matDialogClose') _matDialogClose: any;

  /**
   * Reference to the containing dialog.
   * @deprecated `dialogRef` property to become private.
   * @breaking-change 13.0.0
   */
  dialogRef: MatDialogRef<any>;

  constructor(
    /**
     * @deprecated `_dialogRef` parameter to be removed.
     * @breaking-change 12.0.0
     */
    @Inject(ElementRef) _dialogRef: any,
    private _elementRef: ElementRef<HTMLElement>,
    private _dialog: MatDialog) {}

  ngOnInit() {
    // Always resolve the closest dialog using the DOM, rather than DI, because DI won't work for
    // `TemplateRef`-based dialogs and it may give us wrong results for stacked ones (see #21554).
    this.dialogRef = getClosestDialog(this._elementRef, this._dialog.openDialogs)!;
  }

  ngOnChanges(changes: SimpleChanges) {
    const proxiedChange = changes['_matDialogClose'] || changes['_matDialogCloseResult'];

    if (proxiedChange) {
      this.dialogResult = proxiedChange.currentValue;
    }
  }

  _onButtonClick(event: MouseEvent) {
    // Determinate the focus origin using the click event, because using the FocusMonitor will
    // result in incorrect origins. Most of the time, close buttons will be auto focused in the
    // dialog, and therefore clicking the button won't result in a focus change. This means that
    // the FocusMonitor won't detect any origin change, and will always output `program`.
    _closeDialogVia(this.dialogRef,
        event.screenX === 0 && event.screenY === 0 ? 'keyboard' : 'mouse', this.dialogResult);
  }
}

/**
 * Title of a dialog element. Stays fixed to the top of the dialog when scrolling.
 */
@Directive({
  selector: '[mat-dialog-title], [matDialogTitle]',
  exportAs: 'matDialogTitle',
  host: {
    'class': 'mat-dialog-title',
    '[id]': 'id',
  },
})
export class MatDialogTitle implements OnInit {
  /** Unique id for the dialog title. If none is supplied, it will be auto-generated. */
  @Input() id: string = `mat-dialog-title-${dialogElementUid++}`;

  private _dialogRef: MatDialogRef<unknown>;

  constructor(
      /**
       * @deprecated `_dialogRef` parameter to be removed.
       * @breaking-change 12.0.0
       */
      @Inject(ElementRef) _dialogRef: any,
      private _elementRef: ElementRef<HTMLElement>,
      private _dialog: MatDialog) {}

  ngOnInit() {
    this._dialogRef = getClosestDialog(this._elementRef, this._dialog.openDialogs)!;

    if (this._dialogRef) {
      Promise.resolve().then(() => {
        const container = this._dialogRef._containerInstance;

        if (container && !container._ariaLabelledBy) {
          container._ariaLabelledBy = this.id;
        }
      });
    }
  }
}


/**
 * Scrollable content container of a dialog.
 */
@Directive({
  selector: `[mat-dialog-content], mat-dialog-content, [matDialogContent]`,
  host: {'class': 'mat-dialog-content'}
})
export class MatDialogContent {}


/**
 * Container for the bottom action buttons in a dialog.
 * Stays fixed to the bottom when scrolling.
 */
@Directive({
  selector: `[mat-dialog-actions], mat-dialog-actions, [matDialogActions]`,
  host: {'class': 'mat-dialog-actions'}
})
export class MatDialogActions {}


/**
 * Finds the closest MatDialogRef to an element by looking at the DOM.
 * @param element Element relative to which to look for a dialog.
 * @param openDialogs References to the currently-open dialogs.
 */
function getClosestDialog(element: ElementRef<HTMLElement>, openDialogs: MatDialogRef<any>[]) {
  let parent: HTMLElement | null = element.nativeElement.parentElement;

  while (parent && !parent.classList.contains('mat-dialog-container')) {
    parent = parent.parentElement;
  }

  return parent ? openDialogs.find(dialog => dialog.id === parent!.id) : null;
}

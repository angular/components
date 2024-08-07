/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {IdGenerator} from '@angular/cdk/a11y';
import {CdkScrollable} from '@angular/cdk/scrolling';
import {
  Directive,
  ElementRef,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Optional,
  SimpleChanges,
} from '@angular/core';

import {MatDialog} from './dialog';
import {_closeDialogVia, MatDialogRef} from './dialog-ref';

/**
 * Button that will close the current dialog.
 */
@Directive({
  selector: '[mat-dialog-close], [matDialogClose]',
  exportAs: 'matDialogClose',
  standalone: true,
  host: {
    '(click)': '_onButtonClick($event)',
    '[attr.aria-label]': 'ariaLabel || null',
    '[attr.type]': 'type',
  },
})
export class MatDialogClose implements OnInit, OnChanges {
  /** Screen-reader label for the button. */
  @Input('aria-label') ariaLabel: string;

  /** Default to "button" to prevents accidental form submits. */
  @Input() type: 'submit' | 'button' | 'reset' = 'button';

  /** Dialog close input. */
  @Input('mat-dialog-close') dialogResult: any;

  @Input('matDialogClose') _matDialogClose: any;

  constructor(
    // The dialog title directive is always used in combination with a `MatDialogRef`.
    // tslint:disable-next-line: lightweight-tokens
    @Optional() public dialogRef: MatDialogRef<any>,
    private _elementRef: ElementRef<HTMLElement>,
    private _dialog: MatDialog,
  ) {}

  ngOnInit() {
    if (!this.dialogRef) {
      // When this directive is included in a dialog via TemplateRef (rather than being
      // in a Component), the DialogRef isn't available via injection because embedded
      // views cannot be given a custom injector. Instead, we look up the DialogRef by
      // ID. This must occur in `onInit`, as the ID binding for the dialog container won't
      // be resolved at constructor time.
      this.dialogRef = getClosestDialog(this._elementRef, this._dialog.openDialogs)!;
    }
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
    _closeDialogVia(
      this.dialogRef,
      event.screenX === 0 && event.screenY === 0 ? 'keyboard' : 'mouse',
      this.dialogResult,
    );
  }
}

@Directive({standalone: true})
export abstract class MatDialogLayoutSection implements OnInit, OnDestroy {
  constructor(
    // The dialog title directive is always used in combination with a `MatDialogRef`.
    // tslint:disable-next-line: lightweight-tokens
    @Optional() protected _dialogRef: MatDialogRef<any>,
    private _elementRef: ElementRef<HTMLElement>,
    private _dialog: MatDialog,
  ) {}

  protected abstract _onAdd(): void;
  protected abstract _onRemove(): void;

  ngOnInit() {
    if (!this._dialogRef) {
      this._dialogRef = getClosestDialog(this._elementRef, this._dialog.openDialogs)!;
    }

    if (this._dialogRef) {
      Promise.resolve().then(() => {
        this._onAdd();
      });
    }
  }

  ngOnDestroy() {
    // Note: we null check because there are some internal
    // tests that are mocking out `MatDialogRef` incorrectly.
    const instance = this._dialogRef?._containerInstance;

    if (instance) {
      Promise.resolve().then(() => {
        this._onRemove();
      });
    }
  }
}

/**
 * Title of a dialog element. Stays fixed to the top of the dialog when scrolling.
 */
@Directive({
  selector: '[mat-dialog-title], [matDialogTitle]',
  exportAs: 'matDialogTitle',
  standalone: true,
  host: {
    'class': 'mat-mdc-dialog-title mdc-dialog__title',
    '[id]': 'id',
  },
})
export class MatDialogTitle extends MatDialogLayoutSection {
  /** Generator for assigning unique IDs to DOM elements. */
  private _idGenerator = inject(IdGenerator);

  @Input() id: string = this._idGenerator.getId('mat-mdc-dialog-title-');

  protected _onAdd() {
    // Note: we null check the queue, because there are some internal
    // tests that are mocking out `MatDialogRef` incorrectly.
    this._dialogRef._containerInstance?._addAriaLabelledBy?.(this.id);
  }

  protected override _onRemove(): void {
    this._dialogRef?._containerInstance?._removeAriaLabelledBy?.(this.id);
  }
}

/**
 * Scrollable content container of a dialog.
 */
@Directive({
  selector: `[mat-dialog-content], mat-dialog-content, [matDialogContent]`,
  host: {'class': 'mat-mdc-dialog-content mdc-dialog__content'},
  standalone: true,
  hostDirectives: [CdkScrollable],
})
export class MatDialogContent {}

/**
 * Container for the bottom action buttons in a dialog.
 * Stays fixed to the bottom when scrolling.
 */
@Directive({
  selector: `[mat-dialog-actions], mat-dialog-actions, [matDialogActions]`,
  standalone: true,
  host: {
    'class': 'mat-mdc-dialog-actions mdc-dialog__actions',
    '[class.mat-mdc-dialog-actions-align-start]': 'align === "start"',
    '[class.mat-mdc-dialog-actions-align-center]': 'align === "center"',
    '[class.mat-mdc-dialog-actions-align-end]': 'align === "end"',
  },
})
export class MatDialogActions extends MatDialogLayoutSection {
  /**
   * Horizontal alignment of action buttons.
   */
  @Input() align?: 'start' | 'center' | 'end';

  protected _onAdd() {
    this._dialogRef._containerInstance?._updateActionSectionCount?.(1);
  }

  protected override _onRemove(): void {
    this._dialogRef._containerInstance?._updateActionSectionCount?.(-1);
  }
}

/**
 * Finds the closest MatDialogRef to an element by looking at the DOM.
 * @param element Element relative to which to look for a dialog.
 * @param openDialogs References to the currently-open dialogs.
 */
function getClosestDialog(element: ElementRef<HTMLElement>, openDialogs: MatDialogRef<any>[]) {
  let parent: HTMLElement | null = element.nativeElement.parentElement;

  while (parent && !parent.classList.contains('mat-mdc-dialog-container')) {
    parent = parent.parentElement;
  }

  return parent ? openDialogs.find(dialog => dialog.id === parent!.id) : null;
}

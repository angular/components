import {
  Component,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  ViewContainerRef,
  Optional,
  ElementRef, OnDestroy
} from '@angular/core';
import {Overlay} from '../core/overlay/overlay';
import {OverlayRef} from '../core/overlay/overlay-ref';
import {TemplatePortal} from '../core/portal/portal';
import {OverlayState} from '../core/overlay/overlay-state';
import {Dir} from '../core/rtl/dir';
import {MdError} from '../core/errors/error';
import {MdDialog} from '../dialog/dialog';
import {MdDialogRef} from '../dialog/dialog-ref';


/** Component responsible for managing the datepicker popup/dialog. */
@Component({
  moduleId: module.id,
  selector: 'md-datepicker',
  templateUrl: 'datepicker.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MdDatepicker implements OnDestroy {
  /** Whether the calendar is in UI is in touch mode. */
  touchUi: boolean;

  /** The calendar template. */
  @ViewChild(TemplateRef) calendarTemplate: TemplateRef<any>;

  /** A reference to the overlay when the calendar is opened as a popup. */
  private _popupRef: OverlayRef;

  /** A reference to the dialog when the calendar is opened as a dialog. */
  private _dialogRef: MdDialogRef<any>;

  /** A portal containing the calendar for this datepicker. */
  private _calendarPortal: TemplatePortal;

  /** The input element this datepicker is associated with. */
  private _inputElementRef: ElementRef;

  constructor(private _dialog: MdDialog, private _overlay: Overlay,
              private _viewContainerRef: ViewContainerRef, @Optional() private _dir: Dir) {}

  ngOnDestroy() {
    this.close();
    this._popupRef.dispose();
  }

  /**
   * Register an input with this datepicker.
   * @param inputElementRef An ElementRef for the input.
   */
  registerInput(inputElementRef: ElementRef) {
    if (this._inputElementRef) {
      throw new MdError('An MdDatepicker can only be associated with a single input.');
    }
    this._inputElementRef = inputElementRef;
  }

  /**
   * Open the calendar.
   * @param touchUi Whether to use the touch UI.
   */
  open(touchUi = false) {
    if (!this._inputElementRef) {
      throw new MdError('Attempted to open an MdDatepicker with no associated input.')
    }

    if (!this._calendarPortal) {
      this._calendarPortal = new TemplatePortal(this.calendarTemplate, this._viewContainerRef);
    }

    this.touchUi = touchUi;
    touchUi ? this._openAsDialog() : this._openAsPopup();
  }

  /** Close the calendar. */
  close () {
    this._popupRef && this._popupRef.hasAttached() && this._popupRef.detach();
    this._dialogRef && this._dialogRef.close();
    this._dialogRef = null;
    this._calendarPortal.isAttached && this._calendarPortal.detach();
  }

  /** Open the calendar as a dialog. */
  private _openAsDialog() {
    this._dialogRef = this._dialog.open(this.calendarTemplate);
  }

  /** Open the calendar as a popup. */
  private _openAsPopup() {
    if (!this._popupRef) {
      this._createPopup();
    }

    if (!this._popupRef.hasAttached()) {
      this._popupRef.attach(this._calendarPortal);
    }

    this._popupRef.backdropClick().first().subscribe(() => this.close());
  }

  /** Create the popup. */
  private _createPopup(): void {
    const positionStrategy = this._overlay.position().connectedTo(this._inputElementRef,
        {originX: 'start', originY: 'bottom'}, {overlayX: 'start', overlayY: 'top'});

    const overlayState = new OverlayState();
    overlayState.positionStrategy = positionStrategy;
    overlayState.width = 300;
    overlayState.hasBackdrop = true;
    overlayState.backdropClass = 'md-overlay-transparent-backdrop';
    overlayState.direction = this._dir ? this._dir.value : 'ltr';

    this._popupRef = this._overlay.create(overlayState);
  }
}

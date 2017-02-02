import {
  Component,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  ViewContainerRef,
  Optional,
  ElementRef
} from '@angular/core';
import {Overlay} from '../core/overlay/overlay';
import {OverlayRef} from '../core/overlay/overlay-ref';
import {TemplatePortal} from '../core/portal/portal';
import {OverlayState} from '../core/overlay/overlay-state';
import {Dir} from '../core/rtl/dir';
import {MdError} from '../core/errors/error';


@Component({
  moduleId: module.id,
  selector: 'md-datepicker',
  templateUrl: 'datepicker.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MdDatepicker {
  private _overlayRef: OverlayRef;

  private _portal: TemplatePortal;

  private _inputElementRef: ElementRef;

  touch: string;

  @ViewChild(TemplateRef) template: TemplateRef<any>;

  constructor(private _overlay: Overlay, private _viewContainerRef: ViewContainerRef,
              @Optional() private _dir: Dir) {}

  registerInput(inputElementRef: ElementRef) {
    if (this._inputElementRef) {
      throw new MdError('An MdDatepicker can only be associated with a single input.');
    }
    this._inputElementRef = inputElementRef;
  }

  open(touchUi = false) {
    if (!this._inputElementRef) {
      throw new MdError('Attempted to open an MdDatepicker with no associated input.')
    }

    touchUi ? this._openTouch() : this._openNoTouch();
  }

  close () {
    this._overlayRef && this._overlayRef.hasAttached() && this._overlayRef.detach();
  }

  private _openTouch() {
    // TODO(mmalerba): Add support for opening TemplateRef as dialog.
  }

  private _openNoTouch() {
    this.touch = 'no';

    if (!this._overlayRef) {
      this._createOverlay();
    }

    if (!this._overlayRef.hasAttached()) {
      this._overlayRef.attach(this._portal);
    }

    this._overlayRef.backdropClick().subscribe(() => this.close());
  }

  private _createOverlay(): void {
    const positionStrategy = this._overlay.position().connectedTo(this._inputElementRef,
        {originX: 'start', originY: 'bottom'}, {overlayX: 'start', overlayY: 'top'});

    const overlayState = new OverlayState();
    overlayState.positionStrategy = positionStrategy;
    overlayState.width = 300;
    overlayState.hasBackdrop = true;
    overlayState.backdropClass = 'md-overlay-transparent-backdrop';
    overlayState.direction = this._dir ? this._dir.value : 'ltr';

    this._portal = new TemplatePortal(this.template, this._viewContainerRef);
    this._overlayRef = this._overlay.create(overlayState);
  }
}

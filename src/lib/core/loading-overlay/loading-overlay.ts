import {
  NgModule,
  ModuleWithProviders,
  Component,
  Directive,
  Input,
  ElementRef,
  ViewContainerRef,
  NgZone
} from '@angular/core';
import {
  Overlay,
  OverlayState,
  OverlayModule,
  OverlayRef,
  ComponentPortal,
  OVERLAY_PROVIDERS
} from '../core';
import {MdProgressCircleModule} from '../../progress-circle/progress-circle';
import {OriginConnectionPosition, OverlayConnectionPosition} from '../overlay/position/connected-position';


/**
 * Directive that attaches a material design loading screen to the host element.
 */
@Directive({
  selector: '[md-loading-overlay]',
  exportAs: 'mdLoadingOverlay'
})
export class MdLoadingOverlay {
  _overlayRef: OverlayRef;
  _loadingOverlayInstance: LoadingOverlayComponent;

  private _isLoading: boolean;
  @Input('md-loading-overlay') get loading() {
    return this._isLoading;
  }
  set loading(value: boolean) {
    this._isLoading = value;
    if (this._isLoading === true) {
      this.show();
    } else {
      this.ngOnDestroy();
    }
  }

  constructor(private _overlay: Overlay, private _elementRef: ElementRef,
              private _viewContainerRef: ViewContainerRef, private _ngZone: NgZone) {}

  /** Dispose the loading overlay when destroyed */
  ngOnDestroy() {
    if (this._loadingOverlayInstance) {
      this._disposeLoadingOverlay();
    }
  }

  /** Shows the tooltip */
  show(): void {
    if (!this._loadingOverlayInstance) {
      this._createTooltip();
    }
  }

  private setSize(): void {
    this._loadingOverlayInstance.width = this._elementRef.nativeElement.clientWidth;
    this._loadingOverlayInstance.height = this._elementRef.nativeElement.clientHeight;
  }

  /** Create the tooltip to display */
  private _createTooltip(): void {
    this._createOverlay();
    let portal = new ComponentPortal(LoadingOverlayComponent, this._viewContainerRef);
    this._loadingOverlayInstance = this._overlayRef.attach(portal).instance;
    this.setSize();
  }

  /** Create the overlay config and position strategy */
  private _createOverlay(): void {
    let origin: OriginConnectionPosition = { originX: 'start',  originY: 'top' };
    let position: OverlayConnectionPosition = { overlayX: 'start',    overlayY: 'top' };
    let strategy = this._overlay.position().connectedTo(this._elementRef, origin, position);
    let config = new OverlayState();
    config.positionStrategy = strategy;

    this._overlayRef = this._overlay.create(config);
  }

  /** Disposes the current loading and the overlay it is attached to */
  private _disposeLoadingOverlay(): void {
    this._overlayRef.dispose();
    this._overlayRef = null;
    this._loadingOverlayInstance = null;
  }
}

@Component({
  moduleId: module.id,
  selector: 'md-loading-overlay-component',
  templateUrl: 'loading-overlay.html',
  styleUrls: ['loading-overlay.css']
})
export class LoadingOverlayComponent {

  width: number;
  height: number;

}


@NgModule({
  imports: [OverlayModule, MdProgressCircleModule],
  exports: [MdLoadingOverlay, LoadingOverlayComponent],
  declarations: [MdLoadingOverlay, LoadingOverlayComponent],
  entryComponents: [LoadingOverlayComponent],
})
export class MdLoadingOverlayModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: MdLoadingOverlayModule,
      providers: OVERLAY_PROVIDERS,
    };
  }
}

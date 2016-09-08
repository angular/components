import {NgModule, ModuleWithProviders, Injector, ComponentRef, Injectable} from '@angular/core';
import {
  Overlay,
  OverlayModule,
  PortalModule,
  OverlayRef,
  OverlayState,
  ComponentPortal,
  OVERLAY_PROVIDERS,
} from '@angular2-material/core';
import {ComponentType} from '@angular2-material/core';
import {MatDialogConfig} from './dialog-config';
import {MatDialogRef} from './dialog-ref';
import {DialogInjector} from './dialog-injector';
import {MatDialogContainer} from './dialog-container';

export {MatDialogConfig} from './dialog-config';
export {MatDialogRef} from './dialog-ref';


// TODO(jelbourn): add shortcuts for `alert` and `confirm`.
// TODO(jelbourn): add support for opening with a TemplateRef
// TODO(jelbourn): add `closeAll` method
// TODO(jelbourn): add backdrop
// TODO(jelbourn): default dialog config
// TODO(jelbourn): focus trapping
// TODO(jelbourn): potentially change API from accepting component constructor to component factory.



/**
 * Service to open Material Design modal dialogs.
 */
@Injectable()
export class MatDialog {
  constructor(private _overlay: Overlay, private _injector: Injector) { }

  /**
   * Opens a modal dialog containing the given component.
   * @param component Type of the component to load into the load.
   * @param config
   */
  open<T>(component: ComponentType<T>, config: MatDialogConfig): MatDialogRef<T> {
    let overlayRef = this._createOverlay(config);
    let dialogContainer = this._attachDialogContainer(overlayRef, config);

    return this._attachDialogContent(component, dialogContainer, overlayRef);
  }

  /**
   * Creates the overlay into which the dialog will be loaded.
   * @param dialogConfig The dialog configuration.
   * @returns A promise resolving to the OverlayRef for the created overlay.
   */
  private _createOverlay(dialogConfig: MatDialogConfig): OverlayRef {
    let overlayState = this._getOverlayState(dialogConfig);
    return this._overlay.create(overlayState);
  }

  /**
   * Attaches an MatDialogContainer to a dialog's already-created overlay.
   * @param overlay Reference to the dialog's underlying overlay.
   * @param config The dialog configuration.
   * @returns A promise resolving to a ComponentRef for the attached container.
   */
  private _attachDialogContainer(overlay: OverlayRef, config: MatDialogConfig): MatDialogContainer {
    let containerPortal = new ComponentPortal(MatDialogContainer, config.viewContainerRef);

    let containerRef: ComponentRef<MatDialogContainer> = overlay.attach(containerPortal);
    containerRef.instance.dialogConfig = config;

    return containerRef.instance;
  }

  /**
   * Attaches the user-provided component to the already-created MatDialogContainer.
   * @param component The type of component being loaded into the dialog.
   * @param dialogContainer Reference to the wrapping MatDialogContainer.
   * @param overlayRef Reference to the overlay in which the dialog resides.
   * @returns A promise resolving to the MatDialogRef that should be returned to the user.
   */
  private _attachDialogContent<T>(
      component: ComponentType<T>,
      dialogContainer: MatDialogContainer,
      overlayRef: OverlayRef): MatDialogRef<T> {
    // Create a reference to the dialog we're creating in order to give the user a handle
    // to modify and close it.
    let dialogRef = <MatDialogRef<T>> new MatDialogRef(overlayRef);

    // We create an injector specifically for the component we're instantiating so that it can
    // inject the MatDialogRef. This allows a component loaded inside of a dialog to close itself
    // and, optionally, to return a value.
    let dialogInjector = new DialogInjector(dialogRef, this._injector);

    let contentPortal = new ComponentPortal(component, null, dialogInjector);

    let contentRef = dialogContainer.attachComponentPortal(contentPortal);
    dialogRef.componentInstance = contentRef.instance;

    return dialogRef;
  }

  /**
   * Creates an overlay state from a dialog config.
   * @param dialogConfig The dialog configuration.
   * @returns The overlay configuration.
   */
  private _getOverlayState(dialogConfig: MatDialogConfig): OverlayState {
    let state = new OverlayState();

    state.positionStrategy = this._overlay.position()
        .global()
        .centerHorizontally()
        .centerVertically();

    return state;
  }
}


@NgModule({
  imports: [OverlayModule, PortalModule],
  exports: [MatDialogContainer],
  declarations: [MatDialogContainer],
  entryComponents: [MatDialogContainer],
})
export class MatDialogModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: MatDialogModule,
      providers: [MatDialog, OVERLAY_PROVIDERS],
    };
  }
}

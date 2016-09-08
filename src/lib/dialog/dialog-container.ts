import {Component, ComponentRef, ViewChild} from '@angular/core';
import {
  BasePortalHost,
  ComponentPortal,
  PortalHostDirective,
  TemplatePortal
} from '@angular2-material/core';
import {MatDialogConfig} from './dialog-config';
import {MatDialogContentAlreadyAttachedError} from './dialog-errors';


/**
 * Internal component that wraps user-provided dialog content.
 */
@Component({
  moduleId: module.id,
  selector: 'mat-dialog-container',
  templateUrl: 'dialog-container.html',
  styleUrls: ['dialog-container.css'],
  host: {
    'class': 'mat-dialog-container',
    '[attr.role]': 'dialogConfig?.role'
  }
})
export class MatDialogContainer extends BasePortalHost {
  /** The portal host inside of this container into which the dialog content will be loaded. */
  @ViewChild(PortalHostDirective) _portalHost: PortalHostDirective;

  /** The dialog configuration. */
  dialogConfig: MatDialogConfig;

  /** Attach a portal as content to this dialog container. */
  attachComponentPortal<T>(portal: ComponentPortal<T>): ComponentRef<T> {
    if (this._portalHost.hasAttached()) {
      throw new MatDialogContentAlreadyAttachedError();
    }

    return this._portalHost.attachComponentPortal(portal);
  }

  attachTemplatePortal(portal: TemplatePortal): Map<string, any> {
    throw Error('Not yet implemented');
  }
}

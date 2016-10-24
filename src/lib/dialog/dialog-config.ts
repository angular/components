import {ViewContainerRef} from '@angular/core';

/** Valid ARIA roles for a dialog element. */
export type DialogRole = 'dialog' | 'alertdialog'



/**
 * Configuration for opening a modal dialog with the MdDialog service.
 */
export class MdDialogConfig {
  viewContainerRef: ViewContainerRef;

  /** The ARIA role of the dialog element. */
  role: DialogRole = 'dialog';

  /** Optional custom class to be added to dialog's overlay pane. */
  overlayClass: string | string[];

  // TODO(jelbourn): add configuration for size, clickOutsideToClose, lifecycle hooks,
  // ARIA labelling.
}

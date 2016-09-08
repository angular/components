import {MatError} from '@angular2-material/core';

/** Exception thrown when a ComponentPortal is attached to a DomPortalHost without an origin. */
export class MatDialogContentAlreadyAttachedError extends MatError {
  constructor() {
      super('Attempting to attach dialog content after content is already attached');
  }
}

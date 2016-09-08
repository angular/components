import {MatError} from '../errors/error';

/** Exception thrown when a ComponentPortal is attached to a DomPortalHost without an origin. */
export class MatComponentPortalAttachedToDomWithoutOriginError extends MatError {
  constructor() {
      super(
          'A ComponentPortal must have an origin set when attached to a DomPortalHost ' +
          'because the DOM element is not part of the Angular application context.');
  }
}

/** Exception thrown when attempting to attach a null portal to a host. */
export class MatNullPortalError extends MatError {
  constructor() {
      super('Must provide a portal to attach');
  }
}

/** Exception thrown when attempting to attach a portal to a host that is already attached. */
export class MatPortalAlreadyAttachedError extends MatError {
  constructor() {
      super('Host already has a portal attached');
  }
}

/** Exception thrown when attempting to attach a portal to an already-disposed host. */
export class MatPortalHostAlreadyDisposedError extends MatError {
  constructor() {
      super('This PortalHost has already been disposed');
  }
}

/** Exception thrown when attempting to attach an unknown portal type. */
export class MatUnknownPortalTypeError extends MatError {
  constructor() {
      super(
        'Attempting to attach an unknown Portal type. ' +
        'BasePortalHost accepts either a ComponentPortal or a TemplatePortal.');
  }
}

/** Exception thrown when attempting to attach a portal to a null host. */
export class MatNullPortalHostError extends MatError {
  constructor() {
      super('Attempting to attach a portal to a null PortalHost');
  }
}

/** Exception thrown when attempting to detach a portal that is not attached. */
export class MatNoPortalAttachedError extends MatError {
  constructor() {
      super('Attempting to detach a portal that is not attached to a host');
  }
}

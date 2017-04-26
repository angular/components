import {MdError} from '../core/errors/error';


/** @docs-private */
export class MdDatepickerMissingDateImplError extends MdError {
  constructor(provider: string) {
    super(`MdDatepicker: No provider found for ${provider}. You must import one of the following` +
          ` modules at your application root: MdNativeDateModule, or provide a custom` +
          ` implementation.`);
  }
}

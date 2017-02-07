import {MdError} from '../core';

/**
 * Exception thrown when trying to assign a non-array value
 * to a button toggle group in multiple selection mode.
 * @docs-private
 */
export class MdButtonToggleGroupNonArrayValueError extends MdError {
  constructor() {
    super('Cannot assign non-array value to button toggle group in `multiple` mode.');
  }
}

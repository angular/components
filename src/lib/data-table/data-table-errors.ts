import {MdError} from '../core/errors/error';

/**
 * Exception thrown when a tooltip has an invalid position.
 * @docs-private
 */
export class MdTableInvalidDataSourceError extends MdError {
  constructor() {
    super('MdDataTable: No dataSource provided.');
  }
}
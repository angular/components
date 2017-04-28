// TODO(kara): Revisit why error messages are not being properly set.

/**
 * Wrapper around Error that sets the error message.
 * @docs-private
 * @deprecated
 */
export class MdError extends Error {
  constructor(value: string) {
    super();
    this.message = value;
  }
}

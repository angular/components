import {MdError} from '../core/errors/error';


export class MdInputWrapperPlaceholderConflictError extends MdError {
  constructor() {
    super('Placeholder attribute and child element were both specified.');
  }
}


export class MdInputWrapperUnsupportedTypeError extends MdError {
  constructor(type: string) {
    super(`Input type "${type}" isn't supported by md-input-wrapper.`);
  }
}


export class MdInputWrapperDuplicatedHintError extends MdError {
  constructor(align: string) {
    super(`A hint was already declared for 'align="${align}"'.`);
  }
}
